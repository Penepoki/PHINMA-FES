from django.db import models
from .schedules_models import Schedule
from .custom_manager import *
from .user_models import *
from django.utils import timezone



# Evaluations
class Evaluation(models.Model):
    schedule = models.ForeignKey('Schedule', on_delete=models.CASCADE, blank=True, null=True)
    observation_date = models.DateField()
    evaluation_type = models.CharField(max_length=100)
    additional_comments = models.TextField(blank=True, null=True)
    student_comments = models.JSONField(blank=True, null=True)
    instructor_comments = models.JSONField(blank=True, null=True)
    student_activities = models.JSONField(blank=True, null=True)
    instructor_activities = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    evaluators = models.ManyToManyField(User, through='EvaluationEvaluator', related_name='evaluations_done')
    instructors = models.ManyToManyField(User, through='EvaluationInstructor', related_name='evaluations_received')


    def delete(self, using=None, keep_parents=False):
        self.deleted_at = timezone.now()
        self.is_deleted = True
        self.save()

    def __str__(self):
        return f"Evaluation #{self.id} on {self.observation_date}"

    def restore(self):
        self.deleted_at = None
        self.save()



#Junction Table Many to Many for User and Evaluations
class EvaluationEvaluator(models.Model):
        evaluation = models.ForeignKey(Evaluation, on_delete=models.CASCADE)
        evaluator = models.ForeignKey(User, on_delete=models.CASCADE)


# Role can be derived at runtime using the user's groups.
@property
def role(self):
    return self.evaluator.groups.first().name if self.evaluator.groups.exists() else None


class EvaluationInstructor(models.Model):
    evaluation = models.ForeignKey(Evaluation, on_delete=models.CASCADE)
    instructor = models.ForeignKey(User, on_delete=models.CASCADE)

    # Similarly, you can also fetch the role dynamically if needed.
    @property
    def role(self):
        return self.instructor.groups.first().name if self.instructor.groups.exists() else None

# Student Evaluations Table
class StudentEvaluation(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    user_professor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    import_questions = models.ManyToManyField("StudentEvaluationQuestion", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = CustomStudentEvaluation()

    def __str__(self):
        return f"{self.title} - {self.description}"

    def restore(self):
        self.deleted_at = None
        self.save()

    def delete(self):
        self.deleted_at = True
        self.save()

#STUDENT EVALUATION QUESTION TABLE
class StudentEvaluationQuestion(models.Model):
    TYPE_CHOICES = [
        ("MCQ", "Multiple Choice"),
        ("TEXT", "Text Response"),
        ("RATING", "Rating Scale"),
    ]

    student_evaluation = models.ForeignKey(StudentEvaluation, on_delete=models.SET_NULL, null=True, blank=True)
    question = models.TextField()
    type = models.CharField(max_length=15, choices=TYPE_CHOICES)  # Limited choices
    options = models.JSONField(null=True, blank=True)
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
    student_evaluation = models.ForeignKey(StudentEvaluation, on_delete=models.SET_NULL, null=True)  # Links response to evaluation
    student_eval_question = models.ForeignKey(StudentEvaluationQuestion,
                                              on_delete=models.SET_NULL, null=True)  # Links response to question
    schedule = models.ForeignKey(Schedule, on_delete=models.SET_NULL, null=True)  # Links response to schedule
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)  # Student who provided the response
    answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)



    def __str__(self):
        return f"{self.student_evaluation} - {self.schedule} - {self.user} - {self.answer} "

    def restore(self):
        self.deleted_at = None
        self.save()



