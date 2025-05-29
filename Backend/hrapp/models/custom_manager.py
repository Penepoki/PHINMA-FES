
from .user_models import *


#EVALUATION(STUDENT EVALUATION, EVALUATION QUESTIONS) CUSTOM MANAGERS
class CustomStudentEvaluation(models.Manager):
    """Returns student evaluation with selected fields"""
    def get_query_studentevaluation(self):
        return self.values("title", "description", "created_at", "updated_at", "deleted_at")


class CustomStudentEvaluationQuestions(models.Manager):
    """Returns student evaluation with selected fields"""
    def get_query_studentevaluation(self):
        return self.values("student_evaluation", "questions", "type","options", "created_at", "updated_at", "deleted_at")


class CustomEvaluation(models.Manager):
    """Returns evaluation with selected fields"""
    def get_query_evaluation(self):
        return self.values("evaluator", "schedule", "observation_date", "evaluation_type", "additional_comments", "instructor_comments", "student_comments", "student_activities", "instructor_activities", "created_at", "updated_at", "deleted_at")

#SCHEDULE(ROOMS, PROGRAM, SUBJECT, FACULTY ASSIGNMENTS) CUSTOM MANAGER
class CustomScheduleManager(models.Manager):
    """Returns schedule with selected fields"""
    def get_query_schedule(self):
        return self.values("program", "subject", "room", "name", "start_time", "end_time", "semester", "year", "is_active", "deleted_at", "created_at", "updated_at")

class CustomSubjectManager(models.Manager):
    """Returns subject with selected fields"""
    def get_query_subject(self):
        return self.values("name", "slug", "is_active", "deleted_at", "created_at", "updated_at")

class CustomProgramManager(models.Manager):
    """Returns program with selected fields"""
    def get_query_program(self):
        return self.values("name", "slug", "code" ,"is_active", "deleted_at", "created_at", "updated_at")

class CustomRoomManager(models.Manager):
    """Returns room with selected fields"""
    def get_query_room(self):
        return self.values("name", "slug", "is_active", "deleted_at", "created_at", "updated_at")

class CustomFacultyAssingment(models.Manager):
    """Returns faculty assingment with selected fields"""
    def get_query_facultyassingment(self):
        return self.values("user", "schedule", "created_at", "updated_at", "deleted_at")


class ActiveProgramProfessorManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(program__is_active=True, professor__is_deleted=False)


class CustomProgramProfessorManager(models.Manager):
    """Returns program professor with selected fields"""
    def get_queryset(self):
        return self.values("professor", "program", "assigned_at")