from hrapp.models import Evaluation
from django_filters import rest_framework as filters


class EvaluationFilter(filters.FilterSet):
    name = filters.CharFilter(lookup_expr='icontains')
    observation_date = filters.DateFromToRangeFilter(lookup_expr="gte")
    instructors = filters.CharFilter(field_name="instructors__last_name",lookup_expr='icontains')
    Program = filters.CharFilter(field_name="schedule__program__name",lookup_expr='icontains')

    class Meta:
        model = Evaluation
        fields = ['name', 'observation_date', 'instructors', 'Program']

#class StudentEvaluationFilter(filters.FilterSet):
