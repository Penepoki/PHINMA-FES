"""""
from django.shortcuts import get_object_or_404
from hrapp.models.schedules_models import *
from django.utils.timezone import now

# THE CRUD
# C# FOR CREATE
def create_course(data):
    #Create a new Course.

    course = Course(
        name=data['name'],
        code=data['code'],
        is_active=data.get('is_active', True)
    )
    course.save()
    # Manually handles prof that uses an intermediate model
    professors = data.get('professors', [])
    for professor in professors:
        CourseProfessor.objects.create(course=course, professor=professor)
    return course

# HARD R FOR RETRIEVE OR READ
def get_all_courses(include_deleted=False):
    if include_deleted:
        return Course.objects.all()
    return Course.objects.filter(deleted_at__isnull=True)

def get_course_by_name(course_name):
    course = get_object_or_404(Course, name=course_name)
    #Fetch professor for the course
    professors = CourseProfessor.objects.filter(course=course).select_related('professor')
    professor_list = [{"id": cp.professor.id, "name": cp.professor.name} for cp in professors]

    return {
        "course": course,
        "professors": professor_list
    }

# U UPDATE
def update_course(course_id, data):
    # Update Func including prof
    course = get_object_or_404(Course, id=course_id)

    # Update basic course fields
    course.name = data.get['name', course.name]
    course.code = data.get['code', course.code]
    course.is_active = data.get('is_active', course.is_active)
    course.save()

def delete_course(course_id):
    #Soft-delete a specific course
    course = get_object_or_404(Course, id=course_id)
    course.deleted_at = now()
    course.save()
    return course

# RESTORE SOFT DELETED
def restore_course(course_id):
    course = get_object_or_404(Course, id=course_id, deleted_at__isnull=False)
    course.deleted_at = None
    course.is_active = True
    course.save()"""