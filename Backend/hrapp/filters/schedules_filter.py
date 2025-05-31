from django_filters import rest_framework as filters
from hrapp.models.schedules_models import *


# CREATE A FILTER FOR SUBJECT
class SubjectFilter(filters.FilterSet):
    # Example fields for filtering
    name = filters.CharFilter(lookup_expr='icontains') # Makes it Case-insensitive 'contains'
    is_active = filters.BooleanFilter()
    created_at = filters.DateFromToRangeFilter()

    class Meta:
        model = Subject
        fields = ['name', 'is_active'] # Fields you want to filter

class RoomFilter(filters.FilterSet):
    name = filters.CharFilter(lookup_expr='icontains') # Search Variable
    is_active = filters.BooleanFilter() # Filter by is_active column
    created_at = filters.DateFromToRangeFilter()


    class Meta:
        model = Room
        fields = ['name', 'is_active']

class ProgramFilter(filters.FilterSet):
    name = filters.CharFilter(lookup_expr='icontains')
    is_active = filters.BooleanFilter()
    created_at = filters.DateFromToRangeFilter()

    class Meta:
        model = Program
        fields = ['id','name', 'is_active']

class ScheduleFilter(filters.FilterSet):
    name = filters.CharFilter(lookup_expr='icontains')
    section = filters.CharFilter(field_name="section__name",lookup_expr='icontains')
    is_active = filters.BooleanFilter()
    start_time = filters.TimeRangeFilter(lookup_expr='gte')

    class Meta:
        model = Schedule
        fields = ['name', 'section', 'is_active', 'start_time']
