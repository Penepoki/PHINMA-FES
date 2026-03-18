from email.policy import default

from django.db import models
from .schedules_models import Schedule
from .custom_manager import *
from .user_models import *
from django.utils import timezone
from datetime import datetime, timedelta
from django.core.exceptions import ValidationError
import uuid


class Timestamp(models.Model):
    STUDENT_ACTIVITY_CHOICES = [
        ("listening", "Listening"), #0
        ("individual_thinking", "Individual Thinking"), #1
        ("group", "Group"), #1
        ("answer_question", "Answer Question"), #1
        ("ask_question", "Ask Question"), #1
        ("whole_class_discussion", "Whole Class Discussion"), #1
        ("student_presentations", "Student Presentations"), #1
        ("test/quiz", "Test/Quiz"), #1
        ("waiting", "Waiting"), #0
        ("other", "Other"), #0
    ]

    INSTRUCTOR_ACTIVITY_CHOICES = [
        ("lecture", "Lecture"), #0
        ("realtime_writing", "Realtime Writing"), #0
        ("moving/guiding", "Moving/Guiding"), #1
        ("answer_questions", "Answer Questions"), #1
        ("pose_question", "Pose Question"), #1
        ("follow_up_question", "Follow-up Question"), #1
        ("1_on_1_discussion", "1-on-1 discussion"), #1
        ("demonstrative", "Demonstrate/Video"), #1
        ("administrative", "Administrative"), #0
        ("waiting", "Waiting"), #0
        ("other", "Other"), #0
    ]
    evaluation = models.ForeignKey("Evaluation", on_delete=models.CASCADE, related_name="timestamps", default=None)

    student_activities = models.JSONField(default=list, blank=True, null=True)
    instructor_activities = models.JSONField(default=list, blank=True, null=True)
    student_comments = models.JSONField(default=dict, blank=True, null=True)
    instructor_comments = models.JSONField(default=dict, blank=True, null=True)
    time_record = models.TimeField()

    def clean(self):
        valid_student_keys = [choice[0] for choice in self.STUDENT_ACTIVITY_CHOICES]
        valid_instructor_keys = [choice[0] for choice in self.INSTRUCTOR_ACTIVITY_CHOICES]

        if self.student_activities:
            invalid_keys = [
                key for key in self.student_activities.keys()
                if key not in valid_student_keys
            ]
            if invalid_keys:
                raise ValidationError(f"Invalid student activity keys: {', '.join(invalid_keys)}")

            if self.instructor_activities:
                invalid_keys = [
                    key for key in self.instructor_activities.keys()
                    if key not in valid_instructor_keys
                ]
                if invalid_keys:
                    raise ValidationError(f"Invalid instructor activity keys: {', '.join(invalid_keys)}")

        super().clean()

# Evaluations
class Evaluation(models.Model):

    COPUS_TYPE_CHOICES = [
        ("copus_1", "COPUS 1" ),
        ("copus_2", "COPUS 2"),
        ("copus_3", "COPUS 3"),
    ]

    name = models.CharField(max_length=255, blank=True, null=True)
    schedule = models.ForeignKey('Schedule', on_delete=models.CASCADE, blank=True, null=True)
    observation_date = models.DateField()
    evaluation_type = models.CharField(default=list,max_length=20)
    additional_comments = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    help_text = "THIS IS FOR COPUS EVALUATION ONLY"
    ai_feedback = models.JSONField(null=True, blank=True)
    evaluator = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True,
                                  help_text = "THE USER WHO IS CONDUCTING THE EVALUATION")
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True,
                                   related_name='primary_evaluations')

    constraints = [
        models.UniqueConstraint(
            fields=['schedule', 'evaluation_type', 'instructor', 'observation_date'],
            name='unique_schedule_type_instructor_date'
        ),
    ]

    @property
    def professor(self):
        return self.schedule.instructor if self.schedule else None

    def save(self, *args, **kwargs):
        # Check if this is a new object (no primary key yet)
        is_new = not self.pk

        # Set the name before saving
        if self.schedule:
            instructor_name = str(self.professor) if self.professor else "No instructor"
            self.name = f"{self.schedule.name} - {instructor_name} - {self.observation_date} - {self.evaluation_type}"

        # Save only once
        super().save(*args, **kwargs)

    def get_duration(self):
        """
        RETURNS THE DURATION OF THE EVALUATION AS A TIMEDELTA,
        BASED ON THE START AND END_TIME OF SCHEDULE
        """
        if self.schedule and self.schedule.start_time and self.schedule.end_time:
            today = datetime.today().date()
            start_datetime = datetime.combine(today, self.schedule.start_time)
            end_datetime = datetime.combine(today, self.schedule.end_time)
            return end_datetime - start_datetime
        return None


    def __str__(self):
        return f"Evaluation #{self.id} on {self.observation_date}"

    def restore(self):
        self.deleted_at = None
        self.save()

# Student Evaluations Table
class StudentEvaluation(models.Model):
    title = models.CharField(max_length=255, null=True ,blank=True)
    description = models.TextField(null=True, blank=True)
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, null=True)
    import_questions = models.ManyToManyField("StudentEvaluationQuestion", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = CustomStudentEvaluation()


    def save(self, *args, **kwargs):
        if self.title:
            if not self.title.startswith("Student Evaluation: "):
                self.title = f"Student Evaluation: {self.schedule.instructor} Subject: {self.schedule.subject} Section & Year: {self.schedule.section.name}"

        elif self.schedule.instructor and self.schedule.subject:
            self.title = f"Student Evaluation: {self.schedule.instructor.full_name} Subject: {self.schedule.subject} Section & Year: {self.schedule.section.name}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - {self.description}"




#STUDENT EVALUATION QUESTION TABLE
class StudentEvaluationQuestion(models.Model):
    TYPE_CHOICES = [
        ("MCQ", "Multiple Choice"),
        ("TEXT", "Text Response"),
        ("RATING", "Rating Scale"),
    ]
    question = models.TextField()
    type = models.CharField(max_length=15, choices=TYPE_CHOICES)  # Limited choices
    options = models.JSONField(null=True, blank=True)
    canonical_id = models.UUIDField(default=uuid.uuid4, editable=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = CustomStudentEvaluation()


    def __str__(self):
        return f"{self.question} - {self.type} "

    def restore(self):
        self.deleted_at = None
        self.save()

#STUDENT EVALUATION RESPONSE TABLE
class StudentEvaluationResponse(models.Model):
    student_evaluation = models.ForeignKey(StudentEvaluation, on_delete=models.CASCADE,
                                           null=True)  # Links response to evaluation
    student_eval_question = models.ForeignKey(StudentEvaluationQuestion,
                                              on_delete=models.CASCADE, null=True)  # Links response to question
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)  # Student who provided the response
    answer = models.TextField()
    sentiment_score = models.JSONField(null=True, blank=True, help_text="DistilBERT sentiment analysis results: {label, score, points}")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "student_evaluation", "student_eval_question")

    def __str__(self):
        return f"{self.student_evaluation} - {self.user} - {self.answer} "

    def restore(self):
        self.deleted_at = None
        self.save()


class ScatterPlotAnalytics(models.Model):
    YEAR_CHOICES = [("1st","1st Year"), ("2nd","2nd Year"), ("3rd","3rd Year"), ("4th","4th Year")]
    SEMESTER_CHOICES = [("1st","1st Semester"), ("2nd","2nd Semester"), ("Summer","Summer")]
    retention_rate = models.FloatField(null=True, blank=True)
    year = models.CharField(max_length=20, choices=YEAR_CHOICES)
    semester = models.CharField(max_length=20, choices=SEMESTER_CHOICES)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("year", "semester", "retention_rate")
