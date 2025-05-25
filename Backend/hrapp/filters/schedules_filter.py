import django_filters
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

class CourseFilter(filters.FilterSet):
    name = filters.CharFilter(lookup_expr='icontains')
    is_active = filters.BooleanFilter()
    created_at = filters.DateFromToRangeFilter()

    class Meta:
        model = Course
        fields = ['name', 'is_active']