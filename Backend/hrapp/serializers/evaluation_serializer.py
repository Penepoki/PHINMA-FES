from rest_framework import serializers
from hrapp.models.evaluation_models import Evaluation


class EvaluationSerializer(serializers.ModelSerializer):
    evaluator = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    instructor = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    class Meta:
        model = Evaluation
        fields = '__all__'
        read_only_fields = ['is_deleted','deleted_at', 'created_at', 'updated_at']

    def validate(self, attrs):
        return super().validate(attrs)

