from django.db import models
from .user_models import User
from .custom_manager import *
# Programs
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


class Program(BaseModel):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(blank=True, null=True)
    code = models.CharField(max_length=50, blank=True, null=True)
    professors = models.ManyToManyField("User", through="ProgramProfessor", blank=True)

    def __str__(self):
        return f'{self.name} - {self.code}'




class ProgramProfessor(models.Model):
    professor = models.ForeignKey("User", on_delete=models.CASCADE, blank=True, null=True)
    program = models.ForeignKey(Program, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.professor} - {self.program}'



# Subjects
class Subject(BaseModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return f"{self.name} ({'Active' if self.is_active else 'Inactive'})"



# Rooms
class Room(BaseModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({'Active' if self.is_active else 'Inactive'})"

class Section(BaseModel):
    YEAR_LEVELS = [
        ('1', '1st Year'),
        ('2', '2nd Year'),
        ('3', '3rd Year'),
        ('4', '4th Year'),
    ]

    name = models.CharField(max_length=100)
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name="sections", blank=True, null=True)
    year_level = models.CharField(max_length=1, choices=YEAR_LEVELS, null=True)
    students = models.ManyToManyField("User", related_name="sections")



    class Meta:
        unique_together = ('name', 'program', 'year_level')



# Schedules
class Schedule(BaseModel):
    SEMESTER_CHOICES = [
        ('First', 'First Semester'),
        ('Second', 'Second Semester'),
        ('Summer', 'Summer Semester'),
    ]
    instructor = models.ForeignKey("User", on_delete=models.CASCADE, null=True, blank=True, related_name="schedules")
    section = models.ForeignKey("Section", on_delete=models.CASCADE, null=True, blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, null=True, blank=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    semester = models.CharField(max_length=10, choices=SEMESTER_CHOICES)
    year = models.DateField(null=True, blank=True)
    program = models.ForeignKey(Program, on_delete=models.CASCADE, null=True, blank=True)


    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['program','section','subject'], name='unique_section_subject'),


        ]



    def __str__(self):
        return f"{self.year.year}" if self.year else "No year"


    def save(self, *args, **kwargs):
        # Automatically combine year and semester to create academic_period
        self.name = f"{self.section.name} - {self.subject.name}"
        self.academic_period = f"{self.year} - {self.semester}"
        super().save(*args, **kwargs)





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

"""class Faculty(models.Model):
    course = models.ForeignKey(Program, on_delete=models.CASCADE)
    professor = models.ManyToManyField(
        settings.AUTH
    )"""