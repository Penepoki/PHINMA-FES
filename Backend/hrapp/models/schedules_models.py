from django.db import models
from .user_models import User
from .custom_manager import *
# Courses
class Course(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    code = models.CharField(max_length=50, unique=True)
    professors = models.ManyToManyField("User", through="CourseProfessor")
    is_active = models.BooleanField(default=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f'{self.name} - {self.code} - {self.slug} - {self.is_active} '

    def restore(self):
        self.deleted_at = None
        self.save()

class CourseProfessor(models.Model):
    professor = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)
    objects = models.Manager()
    active = ActiveCourseProfessorManager()

    def __str__(self):
        return f'{self.professor} - {self.course} - {self.assigned_at}'


# Subjects
class Subject(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    is_active = models.BooleanField(default=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)



    def __str__(self):
        return f'{self.name} - {self.slug} - {self.is_active} '

    def restore(self):
        self.deleted_at = None
        self.save()


# Rooms
class Room(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    is_active = models.BooleanField(default=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)



    def __str__(self):
        return f'{self.name} - {self.slug} - {self.is_active}'

    def restore(self):
        self.deleted_at = None
        self.save()

# Schedules
class Schedule(models.Model):
    section = models.ForeignKey("Section", on_delete=models.CASCADE, null=True, blank=True, related_name="schedules")  # 🔗 Add this
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, null=True, blank=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    SEMESTER_CHOICES = [('First', 'First'), ('Second', 'Second'), ('Summer', 'Summer')]
    semester = models.CharField(max_length=10, choices=SEMESTER_CHOICES)
    year = models.CharField(max_length=10)
    course = models.ForeignKey(Course, on_delete=models.CASCADE,null=True )
    is_active = models.BooleanField(default=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f' {self.section} - {self.subject} - {self.room} - {self.name} - {self.start_time} - {self.end_time} - {self.semester} - {self.year} - {self.is_active}'

    def restore(self):
        self.deleted_at = None
        self.save()


# Section
class Section(models.Model):
    YEAR_LEVELS = [
        ('1', '1st Year'),
        ('2', '2nd Year'),
        ('3', '3rd Year'),
        ('4', '4th Year'),
    ]
    name = models.CharField(max_length=100, unique=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="sections")
    year_level = models.CharField(max_length=1, choices=YEAR_LEVELS, null=True)  # ✅ here!
    students = models.ManyToManyField(User, related_name="sections")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f' Year {self.year_level} - {self.name}  - {self.course.name} '



# Faculty Assignments
class FacultyAssignment(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    schedules = models.ManyToManyField('Schedule', through='FacultySchedule')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'{self.user}'

    def restore(self):
        self.deleted_at = None
        self.save()




class FacultySchedule(models.Model):
    faculty_assignment = models.ForeignKey(FacultyAssignment, on_delete=models.CASCADE)
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.faculty_assignment.user} -> {self.schedule.name} at {self.assigned_at}'