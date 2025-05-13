from rest_framework import serializers
from hrapp.models.evaluation_models import Evaluation


class EvaluationSerializer(serializers.ModelSerializer):
    evaluator = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    instructor = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    class Meta:
        model = Evaluation
        fields = '__all__'

    def validate(self, attrs):
        if 'is_deleted' in attrs and not attrs['is_deleted'] and attrs.get('deleted_at'):
            raise serializers.ValidationError("Cannot set deleted_at without is_deleted")
        return attrs

