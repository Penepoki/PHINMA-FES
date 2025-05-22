from hrapp.models.evaluation_models import Evaluation
from rest_framework import serializers
from .schedules_serializer import ScheduleSerializer


class EvaluationSerializer(serializers.ModelSerializer):

    schedule = ScheduleSerializer()

    STUDENT_ACTIVITY_CHOICES = [
        "Listening",
        "Individual Thinking",
        "Group",
        "Answer Question",
        "Ask Question",
        "Whole Class Discussion",
        "Student Presentations",
        "Test/Quiz",
        "Waiting",
        "Other",
    ]

    INSTRUCTOR_ACTIVITY_CHOICES = [
        "Lecture",
        "Realtime Writing",
        "Moving/Guiding",
        "Answer Questions",
        "Pose Question",
        "Follow-up Question",
        "1-on-1 discussion",
        "Demonstrate/Video",
        "Administrative",
        "Waiting",
        "Other",
    ]

    class Meta:
        model = Evaluation
        fields = [
            'schedule', 'observation_date', 'evaluation_type',
            'student_activities', 'student_comments', 'instructor_activities',
            'instructor_comments'
        ]

    def validate_student_activities(self, value):
        if value:
            invalid_keys = [
                key for key in value.keys()
                if key not in self.STUDENT_ACTIVITY_CHOICES
            ]
            if invalid_keys:
                raise serializers.ValidationError(
                    f"Invalid student activity keys: {', '.join(invalid_keys)}")
        return value

    def validate_instructor_activities(self, value):
        if value:
            invalid_keys = [
                key for key in value.keys()
                if key not in self.INSTRUCTOR_ACTIVITY_CHOICES
            ]
            if invalid_keys:
                raise serializers.ValidationError(
                    f"Invalid instructor activity keys: {', '.join(invalid_keys)}")
        return value


    def create(self, validated_data):
        schedule = validated_data.pop('schedule_id')
        evaluation = Evaluation.objects.create(schedule=schedule, **validated_data)
        return evaluation


