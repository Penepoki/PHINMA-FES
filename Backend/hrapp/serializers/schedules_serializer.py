from django.db.models import Q
from rest_framework.exceptions import ValidationError
from rest_framework import serializers
from hrapp.models.schedules_models import *
from hrapp.serializers import UserSerializer, UserCourseProfessorSerializer


# COURSE SERIALIZER
class CourseSerializer(serializers.ModelSerializer):
    # Write-only field for input: list of professor IDs
    professors = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
    )
    # Read-only field for output: list of professor names
    professor_names = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Course
        fields = ['name', 'code', 'professors', 'professor_names', 'is_active']
        read_only_fields = ['deleted_at', 'created_at', 'updated_at']

    # Overriding create to bulk-create intermediate relationships in the CourseProfessor table
    def create(self, validated_data):
        professors = validated_data.pop('professors', [])  # Extract professor IDs
        course = super().create(validated_data)  # Create the Course object

        # Create relationships in the CourseProfessor table
        course_professor_instances = [
            CourseProfessor(course=course, professor_id=professor_id)
            for professor_id in professors
        ]
        CourseProfessor.objects.bulk_create(course_professor_instances)
        return course

    # Overriding update to handle changes to professor relationships
    def update(self, instance, validated_data):
        professors = validated_data.pop('professors', None)  # Extract professor IDs
        course = super().update(instance, validated_data)  # Update the Course object

        if professors is not None:
            # Remove existing relationships in the CourseProfessor table for this course
            CourseProfessor.objects.filter(course=course).delete()
            # Create new relationships
            course_professor_instances = [
                CourseProfessor(course=course, professor_id=professor_id)
                for professor_id in professors
            ]
            CourseProfessor.objects.bulk_create(course_professor_instances)
        return course

    # Adding a read-only field to return professor names
    def get_professor_names(self, obj):
        # Fetch related professors for the course
        course_professors = CourseProfessor.objects.filter(course=obj).select_related('professor')
        # Extract professor names and return
        return [course_prof.professor.full_name for course_prof in course_professors]

    # Validation for professor IDs
    def validate_professors(self, value):
        # Ensure all provided professor IDs exist
        invalid_users = []
        for professor_id in value:
            try:
                user = User.objects.get(id=professor_id)
            except User.DoesNotExist:
                invalid_users.append(professor_id)
                continue

        allowed_roles = ['professor', 'Program Head']
        if not user.groups.filter(
            name__in=allowed_roles).exists():
            invalid_users.append(professor_id)

        if invalid_users:
            raise serializers.ValidationError(
            f"The following IDs are not valid or do not have the required roles: {invalid_users}"
        )

        return value

class CourseProfessorSerializer(serializers.ModelSerializer):
    professor = UserCourseProfessorSerializer()

    class Meta:
        model = CourseProfessor
        fields = ['course', 'professor', 'assigned_at']
        read_only_fields = ['assigned_at']

    def get_professors(self, obj):
        return {
            "id": obj.professors.id,
            "name": f"{obj.professors.first_name} {obj.professors.last_name}".strip(),
        }
# END OF COURSE SERIAL

# SUBJECT SERIALIZER
class SubjectSerializer(serializers.ModelSerializer):

    class Meta:
        model = Subject
        fields = ['name', 'is_active']
        read_only_fields = ['deleted_at', 'created_at', 'updated_at']

# ROOM SERIALIZER
class RoomSerializer(serializers.ModelSerializer):


    class Meta:
        model = Room
        fields = ['name', 'is_active']
        read_only_fields = ['deleted_at', 'created_at', 'updated_at']

# SECTION SERIALIZER
class SectionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Section
        fields = ['name', 'year_level' ,'is_active']
        read_only_fields = ['created_at', 'updated_at', 'deleted_at']

# SCHEDULE SERIALIZER
class ScheduleSerializer(serializers.ModelSerializer):
    course_name = serializers.SlugRelatedField(
        queryset=Course.objects.all(),
        slug_field='name',
        source='course'
    )
    subject_name = serializers.SlugRelatedField(
        queryset=Subject.objects.all(),
        slug_field='name',
        source='subject'
    )
    room_name = serializers.SlugRelatedField(
        queryset=Room.objects.all(),
        slug_field='name',
        source='room'
    )
    section_name = serializers.SlugRelatedField(
        queryset=Section.objects.all(),
        slug_field='name',
        source='section'
    )
    class Meta:
        model = Schedule
        fields = ['section_name', 'subject_name', 'room_name', 'course_name', 'name' ,'start_time','end_time', 'semester']
        read_only_fields = ['deleted_at', 'created_at', 'updated_at']

    def validate_start_time(self, value):
            # Get end_time input
        end_time = self.initial_data.get('end_time')

        if end_time:
            try:
                from datetime import time
                end_time = time.fromisoformat(end_time)
            except ValueError:
                raise serializers.ValidationError("Invalid end time format. Use HH:MM:SS.")

            if value >= end_time:
                raise serializers.ValidationError("Start time must be before end time.")

        return value

    def validate_end_time(self, value):
        start_time = self.initial_data.get('start_time')

        if start_time:
            try:
                from datetime import time
                start_time = time.fromisoformat(start_time)
            except ValueError:
                raise serializers.ValidationError("Invalid start time format. Use HH:MM:SS.")

            if value <= start_time:
                raise serializers.ValidationError("End time must be after start time.")

        return value

    # DATA VALIDATION FOR CONFLICTING TIME SCHEDULES
    def validate(self, attrs):
        section = attrs.get('section')
        room = attrs.get('room')
        start_time = attrs.get('start_time')
        end_time = attrs.get('end_time')

        conflicting_schedules = Schedule.objects.filter(
            Q(section=section) & Q(room=room) &
            Q(start_time__lt=end_time) & # checker for overlaps with end time
            Q(end_time__gt=start_time)# checker for overlaps with start time
            )
        if self.instance:
            conflicting_schedules = conflicting_schedules.exclude(id=self.instance.id)

        if conflicting_schedules.exists():
            raise serializers.ValidationError(
                f"Schedule conflict detected for section '{section.name}' and room '{room.name}' "
                f"from {start_time} to {end_time}."
            )

        return attrs





