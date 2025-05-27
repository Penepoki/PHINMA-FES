from hrapp.models.evaluation_models import Evaluation
from rest_framework import serializers
from .schedules_serializer import ScheduleSerializer


class EvaluationSerializer(serializers.ModelSerializer):

    schedule = ScheduleSerializer()
    evaluator = serializers.StringRelatedField()

    class Meta:
        model = Evaluation
        fields = [
            'schedule', 'observation_date', 'evaluation_type',
            'student_activities', 'student_comments', 'instructor_activities',
            'instructor_comments'
        ]

    def validate_student_activities(self, value):
        """VALIDATION FOR STUDENT ACTIVITIES, ALLOW BOTH DISPLAY NAMES AND INTERNAL KEYS INPUT"""
        valid_choices = dict(self.Evaluation.STUDENT_ACTIVITY_CHOICES)
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
            Evaluation.INSTRUCTOR_ACTIVITY_CHOICES)
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


    def create(self, validated_data):
        schedule = validated_data.pop('schedule_id')
        evaluation = Evaluation.objects.create(schedule=schedule, **validated_data)
        return evaluation


