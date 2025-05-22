from django.db import models
from .user_models import User
from .custom_manager import *
# Courses
class BaseModel(models.Model):
    is_active = models.BooleanField(default=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def restore(self):
        """Restore a soft-deleted record."""
        self.deleted_at = None
        self.is_active = True
        self.save()

    class Meta:
        abstract = True  # This ensures no database table is created for this model.


class Course(BaseModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    code = models.CharField(max_length=50, unique=True)
    professors = models.ManyToManyField("User", through="CourseProfessor")

    def __str__(self):
        return f'{self.name} - {self.code}'




class CourseProfessor(models.Model):
    professor = models.ForeignKey("User", on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.professor} - {self.course}'



# Subjects
class Subject(BaseModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return f"{self.name} ({'Active' if self.is_active else 'Inactive'})"



# Rooms
class Room(BaseModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return f"{self.name} ({'Active' if self.is_active else 'Inactive'})"

class Section(BaseModel):
    YEAR_LEVELS = [
        ('1', '1st Year'),
        ('2', '2nd Year'),
        ('3', '3rd Year'),
        ('4', '4th Year'),
    ]

    name = models.CharField(max_length=100, unique=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="sections")
    year_level = models.CharField(max_length=1, choices=YEAR_LEVELS, null=True)
    students = models.ManyToManyField("User", related_name="sections")



    class Meta:
        unique_together = ('name', 'course', 'year_level')

    def __str__(self):
        return f'{self.name} ({self.year_level}) - {self.course.name}'


# Schedules
class Schedule(BaseModel):
    SEMESTER_CHOICES = [
        ('First', 'First Semester'),
        ('Second', 'Second Semester'),
        ('Summer', 'Summer Semester'),
    ]

    section = models.ForeignKey("Section", on_delete=models.CASCADE, null=True, blank=True, related_name="schedules")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, null=True, blank=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    semester = models.CharField(max_length=10, choices=SEMESTER_CHOICES)
    year = models.DateField()
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True)

    def save(self, *args, **kwargs):
        # Automatically combine year and semester to create academic_period
        self.academic_period = f"{self.year} - {self.semester}"
        super().save(*args, **kwargs)


    class Meta:
        unique_together = ('year', 'semester', 'start_time', 'end_time')  # Enforce uniqueness



    def __str__(self):
        return (f"Schedule: {self.subject.name} ({self.semester} {self.year}), "
                f"{self.room.name}, {self.start_time} - {self.end_time}")







# Faculty Assignments
class FacultyAssignment(BaseModel):
    user = models.ForeignKey("User", on_delete=models.SET_NULL, null=True)
    schedules = models.ManyToManyField(Schedule, through="FacultySchedule")

    def __str__(self):
        return f"Faculty Assignment: {self.user}"





class FacultySchedule(models.Model):
    faculty_assignment = models.ForeignKey(FacultyAssignment, on_delete=models.CASCADE)
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Faculty: {self.faculty_assignment.user}, Schedule: {self.schedule.name} at {self.assigned_at}"
