from hrapp.models.evaluation_models import Evaluation, Timestamp
from rest_framework import serializers
from .schedules_serializer import ScheduleSerializer
from ..models import Schedule
from hrapp.models.user_models import User


class TimestampSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timestamp
        fields = ('id', 'evaluation', 'student_activities', 'student_comments',
                 'instructor_activities', 'instructor_comments', 'time_record')
    def validate_student_activities(self, value):
        """VALIDATION FOR STUDENT ACTIVITIES, ALLOW BOTH DISPLAY NAMES AND INTERNAL KEYS INPUT"""
        valid_choices = dict(Timestamp.STUDENT_ACTIVITY_CHOICES)
        display_to_key = {v: k for k, v in valid_choices.items()}

        validated_activities = {}
        if isinstance(value, dict):
            for key, activity_value in value.items():
                #checker if key is valid either display name or internal key
                if key in valid_choices:
                    validated_activities[key] = activity_value
                elif key in display_to_key:
                    #Converstion of display name
                    validated_activities[display_to_key[key]] = activity_value
                else:
                    raise serializers.ValidationError(f"Invalid student activity key: {key}")
        else:
            raise serializers.ValidationError("Student activities must be a dictionary.")
        # Return updated data with internal keys
        return validated_activities


    def validate_instructor_activities(self, value):
        """VALIDATION FOR INSTRUCTOR ACTIVITIES, ALLOW BOTH DISPLAY NAMES AND INTERNAL KEYS INPUT"""
        valid_choices = dict(
            Timestamp.INSTRUCTOR_ACTIVITY_CHOICES)
            #Convert to dict
        display_to_key = {v: k for k, v in valid_choices.items()} #Reverse Mapping

        validated_activities = {}
        if isinstance(value, dict):
            for key, activity_value in value.items():
                # Check if the key is valid as either a display name or internal key
                if key in valid_choices:
                    validated_activities[key] = activity_value
                elif key in display_to_key:
                    # Convert the display name if passed
                    validated_activities[display_to_key[key]] = activity_value
                else:
                    raise serializers.ValidationError(f"Invalid instructor activity key: {key}")
        else:
            raise serializers.ValidationError(f"Instructor activities must be a dictionary.")

        return validated_activities


class EvaluationSerializer(serializers.ModelSerializer):
    # Serializer fields
    schedule = serializers.PrimaryKeyRelatedField(queryset=Schedule.objects.all())
    evaluator = serializers.StringRelatedField(read_only=True)
    instructor = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    timestamps = TimestampSerializer(many=True, read_only=True)

    class Meta:
            model = Evaluation
            fields = [
                'id', 'schedule', 'observation_date', 'evaluation_type', 'timestamps',
                'evaluator', 'instructor', 'additional_comments'
            ]


    def validate_instructor(self, value):
        """
        Validate and adapt the instructor field.
        """
        if isinstance(value, str):
            # Try to look up the instructor by name
            try:
                # Assuming names are unique or there's a way to retrieve IDs reliably
                first_name, last_name = value.split(" ", 1)
                instructor = User.objects.get(first_name=first_name, last_name=last_name)
                return instructor.id
            except (ValueError, User.DoesNotExist):
                raise serializers.ValidationError("Instructor must be a valid user ID or a recognized name.")

        # If it's already an integer ID, return it as is
        return value

    def create(self, validated_data):
        print("DEBUG: Serializer Create Method Called")
        print("DEBUG: Validated Data:", validated_data)  # Print validated data

        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['evaluator'] = request.user

        schedule = validated_data.get('schedule')
        if 'instructor' not in validated_data and schedule and hasattr(schedule, 'instructor'):
            validated_data['instructor'] = schedule.instructor

        try:
            evaluation = Evaluation.objects.create(**validated_data)
            print("DEBUG: Evaluation Object Created:", evaluation)  # Confirmation of creation
            return evaluation
        except Exception as e:
            print("DEBUG: Error During Evaluation Save:", str(e))  # Log save errors
            raise e



