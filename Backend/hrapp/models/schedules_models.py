from django.db import models
from .user_models import *

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
    faculty = models.ForeignKey("Faculty", on_delete=models.CASCADE, related_name="programs", null=True, blank=True)

    def __str__(self):
        return f'{self.name}'




class ProgramProfessor(models.Model):
    professor = models.ForeignKey("User", on_delete=models.CASCADE, blank=True, null=True)
    program = models.ForeignKey(Program, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.professor}'



# Subjects
class Subject(BaseModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(blank=True, null=True)

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

    name = models.CharField(max_length=255, blank=True, null=True)
    slug = models.SlugField(unique=True, blank=True, null=True)
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name="sections", blank=True, null=True)
    year_level = models.CharField(max_length=1, choices=YEAR_LEVELS, null=True)
    students = models.ManyToManyField("User", related_name="sections")

    constraints = [
        models.UniqueConstraint(fields=['name', 'program', 'year_level'], name='unique_section_program_year'), ]

    def save(self, *args, **kwargs):
        # Safely get the label for the current choice
        year_display = self.get_year_level_display() if self.year_level else None

        if self.name:
            # Keep your existing guard to avoid double-prefixing
            if not self.name.startswith("Section"):
                self.name = f"Section {self.name} - {self.program} - {year_display}"
        elif self.program and self.year_level:
            self.name = f"Section {self.program.name} - {year_display}"

        super().save(*args, **kwargs)

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
    name = models.CharField(max_length=255, null=True, blank=True)
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
        return f"{self.name}" if self.year else "No year"


    def save(self, *args, **kwargs):
        # Automatically combine year and semester to create academic_period
        self.name = f"{self.section.name} - {self.subject.name} - {self.section.year_level} - {self.semester}"
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

class Faculty(models.Model):
    name = models.CharField(max_length=255, unique=True)
    dean = models.ForeignKey(
        "User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="faculties_as_dean"
        # REMOVE limit_choices_to
    )
    professors = models.ManyToManyField(
        "User",
        related_name="faculties_as_professor",
        blank=True
        # REMOVE limit_choices_to
    )
    evaluations = models.ManyToManyField(
        "Evaluation",
        related_name="faculties",
        blank=True
    )
    student_evaluations = models.ManyToManyField(
        "StudentEvaluation",
        related_name="faculties",
        blank=True
    )

    def clean(self):
        # Extra validation if needed
        if self.dean and self.dean.role != 'Dean':
            raise ValidationError("Selected user is not a Dean.")
        # You can add more validation for professors if needed

    def __str__(self):
        return self.name