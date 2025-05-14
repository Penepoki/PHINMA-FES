from rest_framework import serializers
from hrapp.models.schedules_models import *
from hrapp.utils import role_required


class CourseSerializer(serializers.ModelSerializer):
    professors = serializers.PrimaryKeyRelatedField(many=True, write_only=True,
                                                    queryset=CourseProfessor.objects.all())

    class Meta:
        model = Course
        fields = ['id', 'name', 'code', 'professors', 'is_active']
        read_only_fields = ['deleted_at', 'created_at', 'updated_at']

    def get_professors(self, obj):
        professors = CourseProfessor.objects.filter(
            course=obj).select_related('professor')
        return [{"id": cp.professor.id, "name": cp.professor.get_full_name()} for cp in professors]

class CourseProfessorSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseProfessor
        fields = ['id', 'course', 'professor', 'assigned_at']
        read_only_fields = ['assigned_at']

