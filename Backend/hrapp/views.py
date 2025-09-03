from collections import defaultdict
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.db.models import Count, Q
from hrapp.models.schedules_models import *
from hrapp.serializers import *
from hrapp.utils.user_utils import *
from hrapp.utils.auth import *
from hrapp.utils.decorators import *
from hrapp.utils.generate_insight_online import generate_ai_feedback_for_evaluation
from hrapp.serializers.user_serializer import *
from hrapp.serializers.schedules_serializer import *
from hrapp.filters.schedules_filter import *
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.exceptions import ValidationError, PermissionDenied, NotFound
from django.shortcuts import get_object_or_404
# --- S3 / MinIO presign helpers ---
import os, re, uuid, mimetypes
from urllib.parse import urljoin
import boto3

def _s3_client():
    return boto3.client(
        "s3",
        region_name=os.getenv("AWS_REGION", "us-east-1"),
        endpoint_url=os.getenv("S3_ENDPOINT"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )
# from rest_framework.filter import Search
import pandas as pd
from datetime import datetime, timedelta, time
from hrapp.models.evaluation_models import StudentEvaluationResponse, StudentEvaluationQuestion, ScatterPlotAnalytics
# Optional import of scoring helpers; safe import even if heavy model is present.
try:
    from hrapp.utils.sentiment_analysis_test import score_mcq_answer, analyze_text_sentiment
except Exception:
    score_mcq_answer = None  # type: ignore
    analyze_text_sentiment = None  # type: ignore

User = get_user_model()

"""User View"""


# Login Func look @ utils/Auth.py for the logic
@api_view(['POST'])
def login_view(request):
    result = authenticate_user(request.data)

    if 'error' in result:
        return Response(
            {"detail": result["error"]},
            status=status.HTTP_401_UNAUTHORIZED
        )

    return Response(result, status=status.HTTP_200_OK)


@api_view(['POST'])
@login_required
def logout_view(request):
    try:
        token = Token.objects.get(user=request.user)  # Fetch token
        token.delete()  # Delete the token
        return JsonResponse({"message": "Logged out successfully."}, status=200)
    except Token.DoesNotExist:
        return JsonResponse({"error": "No active token found for user."}, status=400)


@api_view(['POST'])
def forgot_password_view(request):
    email = request.data.get('email')
    try:
        user = User.objects.get(email=email)
        send_otp_via_email(user)
        return Response({'message': 'OTP sent successfully'}, status=200)
    except User.DoesNotExist:
        return Response({'message': 'User does not exist'}, status=404)


@api_view(['POST'])
def verify_otp_view(request):
    email = request.data.get('email')
    input_code = request.data.get('otp')

    print(f"Received email: {email}")  # Check if the email is being sent from the frontend
    print(f"Received input_code: {input_code}")  # Check if the OTP is being received

    try:
        user = User.objects.get(email=email)
        if verify_otp(user, input_code):
            return Response({'message': 'OTP verified successfully'}, status=200)
        return Response({'message': 'Invalid OTP'}, status=400)
    except User.DoesNotExist:
        return Response({'message': 'User does not exist'}, status=404)


@api_view(['POST'])
def set_new_password_view(request):
    email = request.data.get('email')
    new_password = request.data.get('new_password')
    try:
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        return Response({'message': 'password reset successful'}, status=200)
    except User.DoesNotExist:
        return Response({'message': 'User does not exist'}, status=404)


# User Creation and Pass Reset look @ user_utils.py
@api_view(['POST'])
def signup_view(request):
    result = user_signup(request.data)

    if 'error' in result:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)

    return Response(result, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_view_dashboard(request):
    # Returns the basic info of the currently logged user
    user = request.user
    serializer = UserDashboardSerializer(user, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_view_profile(request):
    user = request.user
    serializer = UserSerializer(user, context={'request': request})
    return Response(serializer.data)


# Evaluation View
# CRUD BELOW FOR TIMESTAMP(COPUS EVALUATION RELATED)
class TimestampViewSet(viewsets.ModelViewSet):
    queryset = Timestamp.objects.all()
    serializer_class = TimestampSerializer
    filter_backends = [DjangoFilterBackend]
    permission_classes = [IsAuthenticated]
    filterset_fields = ['evaluation']

    def get_queryset(self):
        """
        Filter timestamps by evaluation ID
        - List:   GET    /timestamps/
        - Create: POST   /timestamps/
        - Retrieve: GET  /timestamps/<id>/
        - Update: PUT/PATCH /timestamps/<id>/
        - Delete: DELETE /timestamps/<id>/
        """
        queryset = super().get_queryset()
        evaluation_id = self.request.query_params.get('evaluation')

        if evaluation_id:
            queryset = queryset.filter(evaluation_id=evaluation_id)
            try:
                evaluation = Evaluation.objects.get(id=evaluation_id)
                allowed = user_can_access_evaluation(self.request.user, evaluation)
                print("DEBUG TimestampViewSet:", self.request.user, "→ allowed?", allowed)
                if not allowed:
                    return Timestamp.objects.none()
            except Evaluation.DoesNotExist:
                return Timestamp.objects.none()
        return queryset

    @action(detail=False, methods=['get'], url_path='options')
    def get_options(self, request, **kwargs):
        """RETURNS THE CHOICES FOR INSTRUC AND STUDENTS"""
        student_activities = [choice[1] for choice in Timestamp.STUDENT_ACTIVITY_CHOICES]
        instructor_activities = [choice[1] for choice in Timestamp.INSTRUCTOR_ACTIVITY_CHOICES]

        return Response({'student_activities': student_activities,
                         'instructor_activities': instructor_activities})

    def destroy(self, request, *args, **kwargs):
        """DELETE TIMTEMSTALMP"""
        return super().destroy(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """
        Create a new timestamp with validation.
        """
        # Ensure the user has permission to add timestamps to this evaluation
        evaluation_id = request.data.get('evaluation')
        if evaluation_id:
            try:
                evaluation = Evaluation.objects.get(id=evaluation_id)
                if not user_can_access_evaluation(request.user, evaluation):
                    return Response(
                        {"detail": "You do not have permission to add timestamps to this evaluation."},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Evaluation.DoesNotExist:
                return Response(
                    {"detail": "Evaluation not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Update an existing timestamp with validation"""
        instance = self.get_object()
        # Check if user has permission to update this timestamp
        if not user_can_access_evaluation(request.user, instance.evaluation):
            return Response(
                {"detail": "You do not have permission to access this evaluation."}, status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)


def get_copus_bulk_tallies_data(eval_ids):
    from .models import Timestamp  # or import at the top if not in utils.py

    result = {}
    STUDENT_CHOICES = Timestamp.STUDENT_ACTIVITY_CHOICES
    INSTRUCTOR_CHOICES = Timestamp.INSTRUCTOR_ACTIVITY_CHOICES

    STUDENT_ACTIVITY_MAP_REVERSE = dict((key, display) for key, display in STUDENT_CHOICES)
    INSTRUCTOR_ACTIVITY_MAP_REVERSE = dict((key, display) for key, display in INSTRUCTOR_CHOICES)
    STUDENT_OPTIONS = [display for key, display in STUDENT_CHOICES]
    INSTRUCTOR_OPTIONS = [display for key, display in INSTRUCTOR_CHOICES]

    total_active_timestamps = 0
    total_timestamps_all = 0
    for eval_id in eval_ids:
        timestamps = Timestamp.objects.filter(evaluation_id=eval_id)
        student_tallies = {opt: {"count": 0, "percentage": 0.0} for opt in STUDENT_OPTIONS}
        instructor_tallies = {opt: {"count": 0, "percentage": 0.0} for opt in INSTRUCTOR_OPTIONS}
        total_students = 0
        total_instructors = 0

        for ts in timestamps:
            for key, display in STUDENT_ACTIVITY_MAP_REVERSE.items():
                student_acts = getattr(ts, 'student_activities', {})
                if isinstance(student_acts, dict):
                    found = student_acts.get(key, False)
                elif isinstance(student_acts, list):
                    found = key in student_acts
                else:
                    found = False
                if found:
                    student_tallies[display]["count"] += 1
                    total_students += 1

            for key, display in INSTRUCTOR_ACTIVITY_MAP_REVERSE.items():
                instructor_acts = getattr(ts, 'instructor_activities', {})
                if isinstance(instructor_acts, dict):
                    found = instructor_acts.get(key, False)
                elif isinstance(instructor_acts, list):
                    found = key in instructor_acts
                else:
                    found = False
                if found:
                    instructor_tallies[display]["count"] += 1
                    total_instructors += 1

        for display in STUDENT_OPTIONS:
            if total_students > 0:
                student_tallies[display]["percentage"] = (
                        student_tallies[display]["count"] / total_students * 100
                )
        for display in INSTRUCTOR_OPTIONS:
            if total_instructors > 0:
                instructor_tallies[display]["percentage"] = (
                        instructor_tallies[display]["count"] / total_instructors * 100
                )

        ACTIVE_TEACHER_KEYS = {
            "moving/guiding", "answer_questions", "pose_question", "follow_up_question",
            "1_on_1_discussion", "demonstrative",
        }
        ACTIVE_STUDENT_KEYS = {
            "individual_thinking", "group", "answer_question", "ask_question",
            "whole_class_discussion", "student_presentations", "test/quiz",
        }
        total_timestamps = timestamps.count()
        active_timestamps = 0
        for ts in timestamps:
            instructor_acts = getattr(ts, 'instructor_activities', {})
            student_acts = getattr(ts, 'student_activities', {})
            if isinstance(instructor_acts, dict):
                teacher_keys = [k for k, v in instructor_acts.items() if v]
            elif isinstance(instructor_acts, list):
                teacher_keys = instructor_acts
            else:
                teacher_keys = []
            if isinstance(student_acts, dict):
                student_keys = [k for k, v in student_acts.items() if v]
            elif isinstance(student_acts, list):
                student_keys = student_acts
            else:
                student_keys = []
            teacher_active = any(k in ACTIVE_TEACHER_KEYS for k in teacher_keys)
            student_active = any(k in ACTIVE_STUDENT_KEYS for k in student_keys)
            if teacher_active or student_active:
                active_timestamps += 1
        if total_timestamps > 0:
            active_learning_percentage = round((active_timestamps / total_timestamps) * 100, 2)
        else:
            active_learning_percentage = 0.0

        total_active_timestamps += active_timestamps
        total_timestamps_all += total_timestamps

        result[eval_id] = {
            "studentTallies": student_tallies,
            "teacherTallies": instructor_tallies,
            "activeLearningPercentage": active_learning_percentage
        }
    # Add total active learning percentage across all evaluations
    if total_timestamps_all > 0:
        total_active_learning_percentage = round((total_active_timestamps / total_timestamps_all) * 100, 2)
    else:
        total_active_learning_percentage = 0.0
    result["totalActiveLearningPercentage"] = total_active_learning_percentage
    return result


@api_view(["GET"])
def copus_bulk_tallies(request):
    eval_ids = request.GET.get('evaluation_ids')
    if not eval_ids:
        return Response({"Error": "evaluation_ids required"}, status=status.HTTP_400_BAD_REQUEST)
    ids = [int(i) for i in eval_ids.split(',') if i.strip().isdigit()]
    result = get_copus_bulk_tallies_data(ids)
    return Response(result)

# CRUD BELOW FOR EVALUATION (COPUS)----------------------------------------------
# Create
class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.filter(deleted_at__isnull=True).select_related('schedule', 'evaluator')
    serializer_class = EvaluationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        # Scope by role/faculty first
        if hasattr(user, "Dean") and user.Dean:
            pass  # Dean can see all in qs
        else:
            # HR: check for temp faculty context
            if user.groups.filter(name='HR').exists():
                temp_faculty_id = cache.get(f"hr_temp_faculty_{user.id}")
                if temp_faculty_id:
                    qs = qs.filter(schedule__program__faculty_id=temp_faculty_id)
                elif hasattr(user, 'faculty') and user.faculty:
                    qs = qs.filter(schedule__program__faculty=user.faculty)
            elif hasattr(user, 'faculty') and user.faculty:
                qs = qs.filter(schedule__program__faculty=user.faculty)
        # Optional filters by semester and year (from related Schedule)
        semester = self.request.query_params.get('semester')
        year = self.request.query_params.get('year')
        if semester:
            qs = qs.filter(schedule__semester=semester)
        if year:
            try:
                qs = qs.filter(schedule__year__year=int(year))
            except (ValueError, TypeError):
                # Ignore invalid year values
                pass
        return qs

    # AI SUMMARY GENERATOR

    @action(detail=True, methods=["post"], url_path="generate_feedback")
    def generate_feedback(self, request, pk=None):
        print("DEBUG: Entered generate_feedback endpoint")
        force = request.query_params.get('force', "false").lower() == "true"
        print(f"DEBUG: force param value: {force}")
        evaluation = self.get_object()
        print(f"DEBUG: Evaluation object: {evaluation}")
        print(f"DEBUG: Current ai_feedback: {evaluation.ai_feedback}")
        if evaluation.ai_feedback and not force:
            print("DEBUG: Feedback already exists, returning existing feedback.")
            return Response(
                {"message": "AI feedback already exists for this evaluation.", "ai_feedback": evaluation.ai_feedback},
                status=status.HTTP_200_OK
            )
        try:
            print("DEBUG: Generating AI feedback...")
            feedback = generate_ai_feedback_for_evaluation(evaluation)
            print(f"DEBUG: AI feedback generated: {feedback}")
            evaluation.ai_feedback = feedback
            evaluation.save()
            print("DEBUG: Feedback saved to evaluation.")
            return Response(
                {"message": "AI feedback generated successfully.", "ai_feedback": feedback},
                status=status.HTTP_200_OK
            )
        except Exception as exc:
            print(f"DEBUG: Exception occurred: {exc}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        print("DEBUG: Received Evaluation Creation Request")
        print("DEBUG: Request Data:", request.data)  # Print the incoming request data

        serializer = self.get_serializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            print("DEBUG: Serializer Validation Errors:", serializer.errors)  # Print serializer validation errors
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            evaluation = serializer.save()
            print("DEBUG: Successfully Saved Evaluation:", evaluation)  # Confirm successful creation

            # In EvaluationViewSet.create (replace the timestamp creation loop)
            timestamps = []
            for i in range(30):
                minute = 2 + i * 2
                t = time(hour=minute // 60, minute=minute % 60, second=0)
                timestamps.append(Timestamp(evaluation=evaluation, time_record=t))
            Timestamp.objects.bulk_create(timestamps)
            print("DEBUG: Timestamps Created Successfully")  # Log timestamp creation

            return Response(
                {"message": "Evaluation created successfully", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            print("DEBUG: Exception Occurred During Creation:", str(e))  # Capture unexpected errors
            return Response({"error": "An error occurred during evaluation creation."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def destroy(self, request, *args, **kwargs):
        """Custom Soft Delete"""
        evaluation = self.get_object()

        if evaluation.is_deleted:
            return Response({"Message": "Evaluation already deleted"}, status=status.HTTP_400_BAD_REQUEST)

        evaluation.is_deleted = True
        evaluation.deleted_at = timezone.now()
        evaluation.save()

        return Response(
            {"Message": "Evaluation deleted successfully"},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["POST"], url_path="restore")
    def restore(self, request, pk=None):
        """Custom Restore"""
        evaluation = get_object_or_404(Evaluation, pk=pk, deleted_at__isnull=False)

        evaluation.is_deleted = False
        evaluation.deleted_at = None
        evaluation.save()

        serializer = self.get_serializer(evaluation)
        return Response(
            {"Message": "Evaluation has been restored", "data": serializer.data}, status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["GET"], url_path="latest")
    def latest_evaluation(self, request):
        """
        Get the latest evaluation for a specific program
        """
        try:
            evaluation = Evaluation.object.filter(
                is_deleted=False).latest('id')
            serializer = self.get_serializer(evaluation)
            return Response(
                {"data": serializer.data}, status=status.HTTP_200_OK,
            )
        except Evaluation.DoesNotExist:
            return Response(
                {"error": "No evaluation found"}, status=status.HTTP_404_NOT_FOUND,
            )

    @action(detail=False, methods=['get'], url_path='copus-summary-by-faculty')
    def copus_summary_by_faculty(self, request):
        faculty_id = request.query_params.get('faculty')
        if not faculty_id:
            return Response({'error': 'faculty is required'}, status=status.HTTP_400_BAD_REQUEST)
        evals = Evaluation.objects.filter(schedule__program__faculty_id=faculty_id, deleted_at__isnull=True)
        eval_ids = [e.id for e in evals]
        if not eval_ids:
            return Response({'error': 'No evaluations found for this faculty'}, status=status.HTTP_404_NOT_FOUND)
        result = get_copus_bulk_tallies_data(eval_ids)
        return Response(result)

    @action(detail=False, methods=['get'], url_path='copus-summary-by-program')
    def copus_summary_by_program(self, request):
        program_id = request.query_params.get('program')
        if not program_id:
            return Response({'error': "program is required"}, status=status.HTTP_400_BAD_REQUEST)
        evals = Evaluation.objects.filter(schedule__program_id=program_id, deleted_at__isnull=True)
        eval_ids = [e.id for e in evals]
        if not eval_ids:
            return Response({'error': 'No evaluations found for this program'}, status=status.HTTP_404_BAD_REQUEST)
        result = get_copus_bulk_tallies_data(eval_ids)
        return Response(result)

    @action(detail=False, methods=['get'], url_path='by-faculty')
    def by_faculty(self, request):
        """Return evaluations for a faculty with professor names for mapping.
        Endpoint: /evaluation/evaluations/by-faculty?faculty=<faculty_id>
        """
        faculty_id = request.query_params.get('faculty')
        if not faculty_id:
            return Response({'error': 'faculty is required'}, status=status.HTTP_400_BAD_REQUEST)
        evals = Evaluation.objects.filter(
            schedule__program__faculty_id=faculty_id,
            deleted_at__isnull=True
        ).select_related('schedule__instructor')
        data = []
        for e in evals:
            instructor = getattr(e.schedule, 'instructor', None)
            if instructor:
                first = getattr(instructor, 'first_name', '') or ''
                last = getattr(instructor, 'last_name', '') or ''
                name = (first + ' ' + last).strip() or 'Unknown Professor'
            else:
                name = 'Unknown Professor'
            data.append({
                'id': e.id,
                'evaluation_id': e.id,
                'professor_name': name,
            })
        return Response(data)

    @action(detail=False, methods=["get"], url_path="latest-with-tallies")
    def latest_with_tallies(self, request):
        # Returns the latest evaluations with student & teacher tallies
        # ready for the pie chart.
        # Usage: /api/evaluation/evaluations/latest-with-tallies/?limit=3
        from .models import Timestamp

        user = request.user
        limit = int(request.query_params.get("limit", 3))

        # Filter by faculty or HR temp context if not superuser
        if user.is_superuser:
            latest_evals = Evaluation.objects.filter(deleted_at__isnull=True) \
                               .select_related("instructor") \
                               .order_by("-created_at")[:limit]
        elif user.groups.filter(name='HR').exists():
            temp_faculty_id = cache.get(f"hr_temp_faculty_{user.id}")
            if temp_faculty_id:
                latest_evals = Evaluation.objects.filter(
                    deleted_at__isnull=True,
                    schedule__program__faculty_id=temp_faculty_id
                ).select_related("instructor").order_by("-created_at")[:limit]
            elif hasattr(user, 'faculty') and user.faculty:
                latest_evals = Evaluation.objects.filter(
                    deleted_at__isnull=True,
                    schedule__program__faculty=user.faculty
                ).select_related("instructor").order_by("-created_at")[:limit]
            else:
                return Response([], status=200)
        elif hasattr(user, 'faculty') and user.faculty:
            latest_evals = Evaluation.objects.filter(
                deleted_at__isnull=True,
                schedule__program__faculty=user.faculty
            ).select_related("instructor").order_by("-created_at")[:limit]
        else:
            return Response([], status=200)

        if not latest_evals:
            return Response([], status=200)

        # Get tallies for these evaluations
        eval_ids = [e.id for e in latest_evals]
        tallies = get_copus_bulk_tallies_data(eval_ids)

        # Build the response
        data = []
        student_options = [choice[1] for choice in Timestamp.STUDENT_ACTIVITY_CHOICES]
        teacher_options = [choice[1] for choice in Timestamp.INSTRUCTOR_ACTIVITY_CHOICES]

        for e in latest_evals:
            data.append({
                "evaluation_number": e.id,
                "faculty_name": e.instructor.get_full_name() if e.instructor else "Unknown",
                "faculty_image": getattr(e.instructor, "profile_image", None),
                "student_tallies": [tallies[e.id]["studentTallies"][opt]["percentage"] for opt in student_options],
                "teacher_tallies": [tallies[e.id]["teacherTallies"][opt]["percentage"] for opt in teacher_options]
            })

        return Response(data, status=200)

    ### EVALUATION CUSTOMS FOR PROFESSOR VIEW BELOW
    @action(detail=False, methods=["get"], url_path='my-evaluations', permission_classes=[IsAuthenticated])
    def my_evaluations(self, request):
        """
        RETURN EVALUATIONS(COPUS) FOR THE LOGGED-IN USER
        """
        evals = Evaluation.objects.filter(
            instructor=request.user, deleted_at__isnull=True
        ).select_related('schedule')
        serializers = self.get_serializer(evals, many=True)
        return Response(serializers.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='copus-summary-by-professor', permission_classes=[IsAuthenticated])
    def copus_summary_by_professor(self, request):
        """
        RETURN TALLIES WITH AALP OF ALL EVALUATION(COPUS) FOR THE LOGGED-IN USER
        """
        prof_id = request.query_params.get('professor') or request.user.id
        evals = Evaluation.objects.filter(
            instructor_id=prof_id, deleted_at__isnull=True
        )
        ids = [e.id for e in evals]
        if not ids:
            return Response({"data": {}, "totalActiveLearningPercentage": 0}, status=status.HTTP_200_OK)
        data = get_copus_bulk_tallies_data(ids)
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='bulk-tallies', permission_classes=[IsAuthenticated])
    def bulk_tallies(self, request):
        """FALLBACK UTIL to request tallies by specific ids:
        /api/evaluation/evaluations/bulk-tallies?evaluation_ids=?,?,?"""
        eval_ids = request.query_params.get('evaluation_ids', '')
        ids = [int(x) for x in eval_ids.split(',') if x.strip().isdigit()]
        if not ids:
            return Response({"error": "evaluation_ids required"}, status=400)
        data = get_copus_bulk_tallies_data(ids)
        return Response(data, status=status.HTTP_200_OK)
    ### EVALUATION CUSTOMS FOR PROFESSOR VIEW ABOVE

# END OF CRUD EVALUATION -----------------------------------------
# Define your activity options (should match frontend)


### STUDENTEVALUATION(QUESTION, FORM AND ANSWER CRUD) ###

class StudentEvaluationViewSet(viewsets.ModelViewSet):
    queryset = StudentEvaluation.objects.filter(deleted_at__isnull=True)
    serializer_class = StudentEvaluationSerializer

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        # Scope by role/faculty
        if user.is_superuser:
            pass
        elif user.groups.filter(name='HR').exists():
            temp_faculty_id = cache.get(f"hr_temp_faculty_{user.id}")
            if temp_faculty_id:
                qs = qs.filter(schedule__program__faculty_id=temp_faculty_id)
            elif hasattr(user, 'faculty') and user.faculty:
                qs = qs.filter(schedule__program__faculty=user.faculty)
            else:
                return qs.none()
        elif hasattr(user, 'faculty') and user.faculty:
            qs = qs.filter(schedule__program__faculty=user.faculty)
        else:
            return qs.none()
        semester = self.request.query_params.get('semester')
        year = self.request.query_params.get('year')
        if semester:
            qs = qs.filter(schedule__semester=semester)
        if year:
            try:
                qs = qs.filter(schedule__year__year=int(year))
            except (ValueError, TypeError):
                pass
        return qs

    @action(detail=False, methods=['GET'], url_path='by-schedule/(?P<schedule_id>[^/.]+)')
    def by_schedule(self, request, schedule_id=None):
        """Get student evaluation for a specific schedule"""
        try:
            evaluation = StudentEvaluation.objects.get(
                schedule_id=schedule_id,
                deleted_at__isnull=True
            )
            serializer = self.get_serializer(evaluation)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except StudentEvaluation.DoesNotExist:
            return Response(
                {'error': 'No evaluation found for this schedule'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Returns all evaluations (as a list)

    @action(detail=False, methods=['get'], url_path='all-by-schedule/(?P<schedule_id>[^/.]+)')
    def all_by_schedule(self, request, schedule_id=None):
        evaluations = StudentEvaluation.objects.filter(
            schedule_id=schedule_id,
            deleted_at__isnull=True
        )
        if not evaluations.exists():
            return Response({'error': 'No evaluation found for this schedule'}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(evaluations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



    @action(detail=True, methods=['get'], url_path='responses')
    def responses(self, request, pk=None):
        """
        Returns all responses for this evaluation, optionally filtered by user.
        """
        user_id = request.query_params.get('user')
        responses = StudentEvaluationResponse.objects.filter(student_evaluation_id=pk)
        if user_id:
            responses = responses.filter(user_id=user_id)
        serializer = StudentEvaluationResponseSerializer(responses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='by-section/(?P<section_id>[^/.]+)')
    def by_section(self, request, section_id=None):
        """
        Get student evaluation for a specific section.
        """
        try:
            # This assumes each schedule is linked to a section
            evaluation = StudentEvaluation.objects.get(
                schedule__section_id=section_id,
                deleted_at__isnull=True
            )
            serializer = self.get_serializer(evaluation)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except StudentEvaluation.DoesNotExist:
            return Response(
                {'error': 'No evaluation found for this section'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'], url_path='by-program')
    def by_program(self, request):
        program_id = request.query_params.get('program')
        if not program_id:
            return Response({'error': 'program is required'}, status=status.HTTP_400_BAD_REQUEST)
        evaluations = StudentEvaluation.objects.filter(schedule__program_id=program_id, deleted_at__isnull=True)
        serializer = self.get_serializer(evaluations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='by-professor')
    def by_professor(self, request):
        professor_id = request.query_params.get('professor')
        if not professor_id:
            return Response({'error': 'professor is required'}, status=status.HTTP_400_BAD_REQUEST)
        evaluations = StudentEvaluation.objects.filter(schedule__instructor_id=professor_id, deleted_at__isnull=True)
        serializer = self.get_serializer(evaluations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='by-faculty')
    def by_faculty(self, request):
        faculty_id = request.query_params.get('faculty')
        if not faculty_id:
            return Response({'error': 'faculty is required'}, status=status.HTTP_400_BAD_REQUEST)
        evaluations = StudentEvaluation.objects.filter(schedule__program__faculty_id=faculty_id,
                                                       deleted_at__isnull=True)
        serializer = self.get_serializer(evaluations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class StudentEvaluationQuestionViewSet(viewsets.ModelViewSet):
    queryset = StudentEvaluationQuestion.objects.all()
    serializer_class = StudentEvaluationQuestionSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        semester = self.request.query_params.get('semester')
        year = self.request.query_params.get('year')
        if semester:
            qs = qs.filter(studentevaluation__schedule__semester=semester)
        if year:
            try:
                qs = qs.filter(studentevaluation__schedule__year__year=int(year))
            except (ValueError, TypeError):
                pass
        if semester or year:
            qs = qs.distinct()
        return qs

    @action(detail=False, methods=['get'], url_path='by-evaluation')
    def by_evaluation(self, request):
        """
        Returns all questions for a given student evaluation.
        Usage: /studentevaluationquestion/studentevaluationquestion/by-evaluation?student_evaluation=<eval_id>
        """
        evaluation_id = request.query_params.get('student_evaluation')
        if not evaluation_id:
            return Response({'error': 'student_evaluation is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            evaluation = StudentEvaluation.objects.get(id=evaluation_id)
        except StudentEvaluation.DoesNotExist:
            return Response({'error': 'StudentEvaluation not found'}, status=status.HTTP_404_NOT_FOUND)
        questions = evaluation.import_questions.all()
        serializer = self.get_serializer(questions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class StudentEvaluationResponseViewSet(viewsets.ModelViewSet):
    queryset = StudentEvaluationResponse.objects.all()
    serializer_class = StudentEvaluationResponseSerializer

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        # Scope by role/faculty
        if user.is_superuser:
            pass
        elif user.groups.filter(name='HR').exists():
            temp_faculty_id = cache.get(f"hr_temp_faculty_{user.id}")
            if temp_faculty_id:
                qs = qs.filter(student_evaluation__schedule__program__faculty_id=temp_faculty_id)
            elif hasattr(user, 'faculty') and user.faculty:
                qs = qs.filter(student_evaluation__schedule__program__faculty=user.faculty)
            else:
                return qs.none()
        elif hasattr(user, 'faculty') and user.faculty:
            qs = qs.filter(student_evaluation__schedule__program__faculty=user.faculty)
        else:
            return qs.none()
        semester = self.request.query_params.get('semester')
        year = self.request.query_params.get('year')
        if semester:
            qs = qs.filter(student_evaluation__schedule__semester=semester)
        if year:
            try:
                qs = qs.filter(student_evaluation__schedule__year__year=int(year))
            except (ValueError, TypeError):
                pass
        return qs

    # Add this to StudentEvaluationResponseViewSet class in views.py

    @action(detail=False, methods=['POST'], url_path='submit-responses')
    def submit_responses(self, request):
        """Submit multiple responses for a student evaluation"""
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        student_evaluation_id = request.data.get('student_evaluation_id')
        responses = request.data.get('responses', [])

        if not student_evaluation_id or not responses:
            return Response(
                {'error': 'student_evaluation_id and responses are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Check if student already submitted responses for this evaluation
            existing_responses = StudentEvaluationResponse.objects.filter(
                student_evaluation_id=student_evaluation_id,
                user=user
            )

            if existing_responses.exists():
                return Response(
                    {'error': 'You have already submitted responses for this evaluation'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create responses with sentiment analysis
            response_objects = []
            for response_data in responses:
                question_id = response_data.get('question_id')
                answer = response_data.get('answer')

                # Get the question to determine type and context
                try:
                    question = StudentEvaluationQuestion.objects.get(id=question_id)
                except StudentEvaluationQuestion.DoesNotExist:
                    question = None

                # Perform sentiment analysis based on question type
                sentiment_score = None
                if question and answer:
                    question_type = question.type.upper() if question.type else ""

                    if question_type == "MCQ":
                        # Score MCQ answer
                        points, meta = score_mcq_answer(question, answer)
                        sentiment_score = {
                            "type": "mcq",
                            "points": points,
                            "meta": meta,
                            "label": "POSITIVE" if points > 0 else "NEGATIVE" if points < 0 else "NEUTRAL"
                        }
                    elif question_type == "TEXT":
                        # Analyze text sentiment with question context
                        question_text = question.question if question.question else ""
                        text_input = f"Question: {question_text}\nAnswer: {answer}" if question_text else str(answer)
                        sentiment_result = analyze_text_sentiment(text_input)
                        sentiment_score = {
                            "type": "text",
                            "label": sentiment_result.get("label"),
                            "score": sentiment_result.get("score"),
                            "points": sentiment_result.get("points")
                        }
                    else:
                        # For RATING or other types, set neutral
                        sentiment_score = {
                            "type": question_type.lower(),
                            "label": "NEUTRAL",
                            "score": 0.0,
                            "points": 0
                        }

                # Create and save response with sentiment score
                response_obj = StudentEvaluationResponse(
                    student_evaluation_id=student_evaluation_id,
                    student_eval_question_id=question_id,
                    user=user,
                    answer=answer,
                    sentiment_score=sentiment_score
                )
                response_obj.save()
                response_objects.append(response_obj)

            return Response(
                {'message': 'Responses submitted successfully'},
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='unique-count-by-evaluation')
    def unique_count_by_evaluation(self,request):
        """RETURNS UNIQUE COUNT PER STUDENT
        usage or endpoint: /studentevaluationresponse/studentevaluationresponse/unique-count-by-evaluation"""
        student_evaluation_id = request.query_params.get('student_evaluation')
        if not student_evaluation_id:
            return Response({'error': 'student_evaluation is required'}, status=status.HTTP_400_BAD_REQUEST)
        unique_pairs=StudentEvaluationResponse.objects.filter(student_evaluation_id=student_evaluation_id).values(
            'user_id',
            'student_eval_question__canonical_id').distinct()
        unique_count = unique_pairs.count()
        return Response({'unique_response_count':unique_count}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='unique-count-by-program')
    def unique_count_by_program(self, request):
        """RETURNS UNIQUE COUNT PER STUDENT ACROSS ALL EVALUATIONS IN A PROGRAM
        usage or endpoint: /studentevaluationresponse/studentevaluationresponse/unique-count-by-program?program=<program_id>"""
        program_id = request.query_params.get('program')
        if not program_id:
            return Response({'error': 'program is required'}, status=status.HTTP_400_BAD_REQUEST)

        unique_pairs = StudentEvaluationResponse.objects.filter(
            student_evaluation__schedule__program_id=program_id
        ).values(
            'user_id',
            'student_eval_question__canonical_id'
        ).distinct()
        unique_count = unique_pairs.count()
        return Response({'unique_response_count': unique_count}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='unique-count-by-professor')
    def unique_count_by_professor(self, request):
        """RETURNS UNIQUE COUNT PER STUDENT ACROSS ALL EVALUATIONS BY A PROFESSOR
        usage or endpoint: /studentevaluationresponse/studentevaluationresponse/unique-count-by-professor?professor=<professor_id>"""
        professor_id = request.query_params.get('professor')
        if not professor_id:
            return Response({'error': 'professor is required'}, status=status.HTTP_400_BAD_REQUEST)

        unique_pairs = StudentEvaluationResponse.objects.filter(
            student_evaluation__schedule__instructor_id=professor_id
        ).values(
            'user_id',
            'student_eval_question__canonical_id'
        ).distinct()
        unique_count = unique_pairs.count()
        return Response({'unique_response_count': unique_count}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='unique-count-by-faculty')
    def unique_count_by_faculty(self, request):
        """RETURNS UNIQUE COUNT PER STUDENT ACROSS ALL EVALUATIONS IN A FACULTY
        usage or endpoint: /studentevaluationresponse/studentevaluationresponse/unique-count-by-faculty?faculty=<faculty_id>"""
        faculty_id = request.query_params.get('faculty')
        if not faculty_id:
            return Response({'error': 'faculty is required'}, status=status.HTTP_400_BAD_REQUEST)

        unique_pairs = StudentEvaluationResponse.objects.filter(
            student_evaluation__schedule__program__faculty_id=faculty_id
        ).values(
            'user_id',
            'student_eval_question__canonical_id'
        ).distinct()
        unique_count = unique_pairs.count()
        return Response({'unique_response_count': unique_count}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='by-evaluation-and-user')
    def by_evaluation_and_user(self, request):
        """Get all Response bt a speicific students(User)
        Usage or Endpoint: /studentevaluationresponse/studentevaluationresponse/by-evaluation-and-user"""
        student_evaluation_id = request.query_params.get('student_evaluation')
        user_id = request.query_params.get('user')

        if not student_evaluation_id or not user_id:
            return Response({'error': 'student_evaluation and user are required to query the parameter'}, status=status.HTTP_400_BAD_REQUEST)
        responses = StudentEvaluationResponse.objects.filter(student_evaluation_id=student_evaluation_id,user_id=user_id)
        serializer = self.get_serializer(responses, many=True)
        print("student_evaluation_id:", student_evaluation_id, "user_id:", user_id)
        print("Queryset count:", responses.count())
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path="by-evaluation-respondents")
    def by_evaluation_respondents(self, request):
        """RETURNS ALL STUDENTS RESPONSE TO A SPECIFIC EVALUATION
        usage or endpoint: /studentevaluationresponse/studentevaluationresponse/by-evaluation-respondents?student_evaluation=<eval_id"""
        student_evaluation_id=request.query_params.get('student_evaluation')
        if not student_evaluation_id:
            return Response({'error': 'student_evaluation is required'}, status=status.HTTP_400_BAD_REQUEST)
        # get student(user) id if they submitted a response
        user_ids = StudentEvaluationResponse.objects.filter(
            student_evaluation_id=student_evaluation_id).values_list('user_id', flat=True).distinct()
        users = User.objects.filter(id__in=user_ids)
        user_counts = StudentEvaluationResponse.objects.filter(student_evaluation_id=student_evaluation_id).values('user_id').annotate(response_count=Count('id'))
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='by-evaluation-and-section')
    def by_evaluation_and_section(self, request):
        """RETURNS ALL RESPONSES FOR A GIVEN EVALUATION, FILTERED BY SECTION
        usage or endpoint: /studentevaluationresponse/studentevaluationresponse/by-evaluation-and-section?student_evaluation=<eval_id>&section=<section_id>
        """
        student_evaluation_id = request.query_params.get('student_evaluation')
        section_id = request.query_params.get('section')
        if not student_evaluation_id or not section_id:
            return Response({'error': 'student_evaluation and section are required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            section = Section.objects.get(id=section_id)
            user_ids = section.students.values_list('id', flat=True)
        except Section.DoesNotExist:
            return Response({'error': 'section not found'}, status=status.HTTP_404_NOT_FOUND)

        responses = StudentEvaluationResponse.objects.filter(
            student_evaluation_id=student_evaluation_id,user_id__in=user_ids
            )
        serializer = StudentEvaluationResponseSerializer(responses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='by-professor')
    def by_professor(self, request):
        """RETURNS RESPONSES FOR A PROFESSOR BASED ON THEIR SCHEDULES
        usage or endpoint: /studentevaluationresponse/studentevaluationresponse/by-professor?professor=<professor_id>"""
        professor_id = request.query_params.get('professor')
        if not professor_id:
            return Response({'error': 'professor is required'}, status=status.HTTP_400_BAD_REQUEST)
        responses = StudentEvaluationResponse.objects.filter(
            student_evaluation__schedule__instructor_id=professor_id)
        serializer = self.get_serializer(responses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='by-program')
    def by_program(self, request):
        """RETURNS RESPONSES FOR A PROGRAM
        usage or endpoint: /studentevaluationresponse/studentevaluationresponse/by-program?program=<pogram_id>"""
        program_id = request.query_params.get('program')
        if not program_id:
            return Response({'error': 'program is required'}, status=status.HTTP_400_BAD_REQUEST)
        responses = StudentEvaluationResponse.objects.filter(
            student_evaluation__schedule__program_id=program_id)
        serializer = self.get_serializer(responses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='by-faculty')
    def by_faculty(self, request):
        """RETURNS RESPONSES FOR A FACULTY
        usage or endpoint: /studentevaluationresponse/studentevaluationresponse/by-faculty?faculty=<faculty_id>"""
        faculty_id = request.query_params.get('faculty')
        if not faculty_id:
            return Response({'error': 'faculty is required'}, status=status.HTTP_400_BAD_REQUEST)
        responses = StudentEvaluationResponse.objects.filter(
            student_evaluation__schedule__program__faculty_id=faculty_id)
        serializer = self.get_serializer(responses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='sentiment-summary')
    def sentiment_summary(self, request):
        """RETURNS SENTIMENT SCORE SUMMARY WITH FILTERING OPTIONS
        usage or endpoint: /studentevaluationresponse/studentevaluationresponse/sentiment-summary?semester=<semester>&year=<year>&program=<program_id>&faculty=<faculty_id>&professor=<professor_id>"""

        # Get filter parameters
        semester = request.query_params.get('semester')
        year = request.query_params.get('year')
        program_id = request.query_params.get('program')
        faculty_id = request.query_params.get('faculty')
        professor_id = request.query_params.get('professor')

        # Start with all responses that have sentiment scores
        responses = StudentEvaluationResponse.objects.filter(
            sentiment_score__isnull=False
        ).select_related(
            'student_evaluation__schedule__section',
            'student_evaluation__schedule__program',
            'student_evaluation__schedule__instructor',
            'student_eval_question'
        )

        # Apply filters
        if semester:
            responses = responses.filter(student_evaluation__schedule__semester=semester)
        if year:
            try:
                responses = responses.filter(student_evaluation__schedule__year__year=int(year))
            except (ValueError, TypeError):
                pass
        if program_id:
            responses = responses.filter(student_evaluation__schedule__program_id=program_id)
        if faculty_id:
            responses = responses.filter(student_evaluation__schedule__program__faculty_id=faculty_id)
        if professor_id:
            responses = responses.filter(student_evaluation__schedule__instructor_id=professor_id)

        # Calculate summary statistics
        total_responses = responses.count()
        if total_responses == 0:
            return Response({
                'total_responses': 0,
                'average_sentiment_score': 0,
                'sentiment_distribution': {'POSITIVE': 0, 'NEGATIVE': 0, 'NEUTRAL': 0},
                'question_type_breakdown': {},
                'filters_applied': {
                    'semester': semester,
                    'year': year,
                    'program': program_id,
                    'faculty': faculty_id,
                    'professor': professor_id
                }
            }, status=status.HTTP_200_OK)

        # Aggregate sentiment data
        sentiment_scores = []
        sentiment_labels = {'POSITIVE': 0, 'NEGATIVE': 0, 'NEUTRAL': 0}
        question_types = {'mcq': 0, 'text': 0, 'rating': 0}

        for response in responses:
            if response.sentiment_score and isinstance(response.sentiment_score, dict):
                points = response.sentiment_score.get('points', 0)
                label = response.sentiment_score.get('label', 'NEUTRAL')
                q_type = response.sentiment_score.get('type', 'unknown')

                sentiment_scores.append(float(points))
                sentiment_labels[label] = sentiment_labels.get(label, 0) + 1
                question_types[q_type] = question_types.get(q_type, 0) + 1

        average_score = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0

        return Response({
            'total_responses': total_responses,
            'average_sentiment_score': round(average_score, 3),
            'sentiment_distribution': sentiment_labels,
            'question_type_breakdown': question_types,
            'filters_applied': {
                'semester': semester,
                'year': year,
                'program': program_id,
                'faculty': faculty_id,
                'professor': professor_id
            }
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='sentiment-summary-by-semester')
    def sentiment_summary_by_semester(self, request):
        """RETURNS SENTIMENT SCORE SUMMARY GROUPED BY SEMESTER
        usage or endpoint: /studentevaluationresponse/studentevaluationresponse/sentiment-summary-by-semester?year=<year>&program=<program_id>&faculty=<faculty_id>&professor=<professor_id>"""

        # Get filter parameters (excluding semester since we're grouping by it)
        year = request.query_params.get('year')
        program_id = request.query_params.get('program')
        faculty_id = request.query_params.get('faculty')
        professor_id = request.query_params.get('professor')

        # Start with all responses that have sentiment scores
        responses = StudentEvaluationResponse.objects.filter(
            sentiment_score__isnull=False
        ).select_related(
            'student_evaluation__schedule__section',
            'student_evaluation__schedule__program',
            'student_evaluation__schedule__instructor'
        )

        # Apply filters
        if year:
            try:
                responses = responses.filter(student_evaluation__schedule__year__year=int(year))
            except (ValueError, TypeError):
                pass
        if program_id:
            responses = responses.filter(student_evaluation__schedule__program_id=program_id)
        if faculty_id:
            responses = responses.filter(student_evaluation__schedule__program__faculty_id=faculty_id)
        if professor_id:
            responses = responses.filter(student_evaluation__schedule__instructor_id=professor_id)

        # Group by semester
        semester_data = {}
        for response in responses:
            semester = response.student_evaluation.schedule.semester if response.student_evaluation.schedule else 'Unknown'

            if semester not in semester_data:
                semester_data[semester] = {
                    'responses': [],
                    'sentiment_labels': {'POSITIVE': 0, 'NEGATIVE': 0, 'NEUTRAL': 0},
                    'question_types': {'mcq': 0, 'text': 0, 'rating': 0}
                }

            if response.sentiment_score and isinstance(response.sentiment_score, dict):
                points = response.sentiment_score.get('points', 0)
                label = response.sentiment_score.get('label', 'NEUTRAL')
                q_type = response.sentiment_score.get('type', 'unknown')

                semester_data[semester]['responses'].append(float(points))
                semester_data[semester]['sentiment_labels'][label] += 1
                semester_data[semester]['question_types'][q_type] = semester_data[semester]['question_types'].get(q_type, 0) + 1

        # Calculate averages for each semester
        summary = {}
        for semester, data in semester_data.items():
            scores = data['responses']
            avg_score = sum(scores) / len(scores) if scores else 0
            summary[semester] = {
                'total_responses': len(scores),
                'average_sentiment_score': round(avg_score, 3),
                'sentiment_distribution': data['sentiment_labels'],
                'question_type_breakdown': data['question_types']
            }

        return Response({
            'semester_summary': summary,
            'filters_applied': {
                'year': year,
                'program': program_id,
                'faculty': faculty_id,
                'professor': professor_id
            }
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='sentiment-summary-by-year')
    def sentiment_summary_by_year(self, request):
        """RETURNS SENTIMENT SCORE SUMMARY GROUPED BY YEAR
        usage or endpoint: /studentevaluationresponse/studentevaluationresponse/sentiment-summary-by-year?semester=<semester>&program=<program_id>&faculty=<faculty_id>&professor=<professor_id>"""

        # Get filter parameters (excluding year since we're grouping by it)
        semester = request.query_params.get('semester')
        program_id = request.query_params.get('program')
        faculty_id = request.query_params.get('faculty')
        professor_id = request.query_params.get('professor')

        # Start with all responses that have sentiment scores
        responses = StudentEvaluationResponse.objects.filter(
            sentiment_score__isnull=False
        ).select_related(
            'student_evaluation__schedule__section',
            'student_evaluation__schedule__program',
            'student_evaluation__schedule__instructor'
        )

        # Apply filters
        if semester:
            responses = responses.filter(student_evaluation__schedule__semester=semester)
        if program_id:
            responses = responses.filter(student_evaluation__schedule__program_id=program_id)
        if faculty_id:
            responses = responses.filter(student_evaluation__schedule__program__faculty_id=faculty_id)
        if professor_id:
            responses = responses.filter(student_evaluation__schedule__instructor_id=professor_id)

        # Group by year
        year_data = {}
        for response in responses:
            year = response.student_evaluation.schedule.year.year if response.student_evaluation.schedule and response.student_evaluation.schedule.year else 'Unknown'

            if year not in year_data:
                year_data[year] = {
                    'responses': [],
                    'sentiment_labels': {'POSITIVE': 0, 'NEGATIVE': 0, 'NEUTRAL': 0},
                    'question_types': {'mcq': 0, 'text': 0, 'rating': 0}
                }

            if response.sentiment_score and isinstance(response.sentiment_score, dict):
                points = response.sentiment_score.get('points', 0)
                label = response.sentiment_score.get('label', 'NEUTRAL')
                q_type = response.sentiment_score.get('type', 'unknown')

                year_data[year]['responses'].append(float(points))
                year_data[year]['sentiment_labels'][label] += 1
                year_data[year]['question_types'][q_type] = year_data[year]['question_types'].get(q_type, 0) + 1

        # Calculate averages for each year
        summary = {}
        for year, data in year_data.items():
            scores = data['responses']
            avg_score = sum(scores) / len(scores) if scores else 0
            summary[year] = {
                'total_responses': len(scores),
                'average_sentiment_score': round(avg_score, 3),
                'sentiment_distribution': data['sentiment_labels'],
                'question_type_breakdown': data['question_types']
            }

        return Response({
            'year_summary': summary,
            'filters_applied': {
                'semester': semester,
                'program': program_id,
                'faculty': faculty_id,
                'professor': professor_id
            }
        }, status=status.HTTP_200_OK)

### END OF STUDENTEVALUATION VIEW ###
"""-------------------------------------------------------------"""


# THE CRUD UTILITY  FOR SCHEDULE(ROOMS, SUBJECTS, PROGRAM)

# START OF CRUD SUBJECT ------------------------------------------
class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.filter(deleted_at__isnull=True)
    serializer_class = SubjectSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = SubjectFilter

    def get_queryset(self):
        user = self.request.user
        base_qs = super().get_queryset()
        if user.is_superuser:
            return base_qs
        if hasattr(user, 'faculty') and user.faculty:
            schedule_subject_ids = Schedule.objects.filter(
                program__faculty=user.faculty
            ).values_list('subject_id', flat=True)
            return base_qs.filter(id__in=schedule_subject_ids)
        return base_qs.none()

    # SUBJECT CREATE
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data

        # Check if data is for batch creation
        if isinstance(data, list):  # If data is a list, handle multiple subject
            created_subject = []  # List to hold successful created subjects
            failed_subject = []  # List to track failed created subjects

            for subject_data in data:
                try:
                    serializer = self.get_serializer(data=subject_data)
                    serializer.is_valid(raise_exception=True)
                    created_subject = serializer.save()
                    created_subject.append(created_subject)
                except ValidationError as e:
                    failed_subject.append({
                        "error": e.detail,
                        "data": subject_data,
                    })

            if failed_subject:
                raise ValidationError({
                    "message": "Failed to create subjects.",
                    "error": failed_subject
                })

            return Response(
                {"message": f"Subjects created successfully "
                            f"{len(created_subject)} subjects"}, status=status.HTTP_201_CREATED,
            )

        # SINGLE  CREATION
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        subject = serializer.save()
        return Response(
            {"Message": "Subject created successfully", "data": serializer.data},
            status=status.HTTP_201_CREATED,
        )

    # READ/RETRIEVE BY NAME
    """def retrieve(self, request, *args, **kwargs):
        name = kwargs.get('name')

        try:
                subject = self.get_queryset().get(name=name)
        except Subject.DoesNotExist:
            raise NotFound({"Message": f"No subject found with name {name}"})

        serializer = self.get_serializer(subject)
        return Response(serializer.data, status=status.HTTP_200_OK)"""

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()  # GET THE INSTANCE TO UPDATE
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        subject = serializer.save()
        return Response({"Message": "Subject updated successfully",
                         "data": serializer.data}, status=status.HTTP_200_OK)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_deleted = False
        instance.deleted_at = timezone.now()
        instance.save()
        return Response({"Message": "Subject deleted successfully"}, status=status.HTTP_200_OK)


# END OF CRUD SUBJECT --------------------------------------------

# START OF CRUD ROOM --------------------------------------------

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.filter(deleted_at__isnull=True)
    serializer_class = RoomSerializer
    filter_backends = [DjangoFilterBackend]  # Enabling of DjangoFilter
    filterset_class = RoomFilter  # Call

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data

        # BATCH CREATION
        if isinstance(data, list):
            created_rooms = []
            failed_rooms = []
            for room_data in data:
                try:
                    serializer = self.get_serializer(data=room_data)
                    serializer.is_valid(raise_exception=True)
                    created_room = serializer.save()
                    created_rooms.append(created_room)
                except ValidationError as e:
                    failed_rooms.append({
                        "error": e.detail,
                        "data": room_data,
                    })

                if failed_rooms:
                    raise ValidationError({
                        "message": "Failed to create rooms.",
                        "error": failed_rooms
                    })

                return Response(
                    {"message": f"Rooms created successfully "
                                f"{len(created_rooms)} rooms"}, status=status.HTTP_201_CREATED,
                )

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        room = serializer.save()
        return Response(
            {"Message": "Room created successfully", "data": serializer.data},
            status=status.HTTP_201_CREATED, )

    def retrieve(self, request, *args, **kwargs):
        name = kwargs.get('name')
        if name:
            try:
                room = self.get_queryset().get(name=name)
            except Room.DoesNotExist:
                raise NotFound({"Message": f"No room found with name {name}"})
            serializer = self.get_serializer(room)
            return Response(serializer.data)
        return super().retrieve(request, *args, **kwargs)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data,
                                         partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            "Message": "Room updated successfully",
            "data": serializer.data}, status=status.HTTP_200_OK
        )

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.deleted_at = timezone.now()
        instance.save()
        return Response({
            "Message": "Room deleted successfully"}
            , status=status.HTTP_204_NO_CONTENT
        )


# END OF CRUD ROOM ----------------------------------------------

# START OF CRUD PROGRAM -------------------------------------------
# PROGRAM
class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    parser_classes = [JSONParser]
    filter_backends = [DjangoFilterBackend]
    filter_class = ProgramFilter

    def get_queryset(self):
        print("Debug: /program endpoint was called!" )
        user = self.request.user
        base_qs = super().get_queryset()  # This is Program.objects.all()
        if user.is_superuser:
            return base_qs
        if user.groups.filter(name='HR').exists():
            temp_faculty_id = cache.get(f"hr_temp_faculty_{user.id}")
            if temp_faculty_id:
                return base_qs.filter(faculty_id=temp_faculty_id)
            if hasattr(user, 'faculty') and user.faculty:
                return base_qs.filter(faculty=user.faculty)
            return base_qs.none()
        if hasattr(user, 'faculty') and user.faculty:
            return base_qs.filter(faculty=user.faculty)
        return base_qs.none()

    def get_parser_classes(self):
        if self.action == 'import_program_from_csv':
            return [MultiPartParser]
        return super().get_parser_classes()

    # Program Create
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """PROGRAMS"""
        user = request.user
        data = request.data

        data['faculty'] = user.faculty.id if hasattr(user, 'faculty') and user.faculty else None

        # HANDLE BULK CREATION
        if isinstance(data, list):
            program_to_create = []
            relationships = []

            for program_data in data:
                serializer = self.get_serializer(data=program_data)
                serializer.is_valid(raise_exception=True)
                validated_data = serializer.validated_data

            professors = validated_data.pop('professors', [])
            program = Program(**validated_data)
            program_to_create.append(program)

            for professor_id in professors:
                relationships.append(ProgramProfessor(program=program, professor_id=professor_id))
            # BULK CREATION FOR ALL PROGRAM
            created_programs = Program.objects.bulk_create(program_to_create)
            # UPDATE RELATIONSHIP WITH THE NEWLY CREATED Program
            for program, data in zip(created_programs, data):
                for professor_id in data.get('professors', []):
                    relationships.append(ProgramProfessor(program=program, professor_id=professor_id))
            # BULT CREATION FOR ALL RELATIONSHIPS IN THE PROGRAMPROFESSOR TABLE
            ProgramProfessor.objects.bulk_create(relationships)

            return Response(
                {"message": f"Programs created successfully "
                            f"{len(created_programs)} Programs"}, status=status.HTTP_201_CREATED,
            )
        return super().create(request, *args, **kwargs)

    # Program CSV Create
    @action(detail=False, methods=['post'],
            url_path='search')
    def import_program_from_csv(self, request, *args, **kwargs):
        """
            IMPORT Programs AND THEIR RELATIONSHIPS FROM A CSV FILE.
            EXPECTED CSV FORMAT:
            NAME, CODE, PROFESSORS
        """
        csv_file = request.FILES.get('file')
        if not csv_file:
            raise ValidationError({"No file was provided."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Load CSV file into the Pandas DataFrame
            df = pd.read_csv(csv_file)
            if "name" not in df.columns or "code" not in df.columns or "professor_idss" not in df.columns:
                return Response(
                    {"error": "CSV file must contain 'name', 'code', and 'professors' columns."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            programs_to_create = []
            relationships = []

            # Loop through the DataFrame rows to prepare data for bulk creation
            for _, row in df.iterrows():
                program = Program(name=row["name"], code=row["code"])
                programs_to_create.append(program)

            with transaction.atomic():
                # Bulk create programs
                created_program = Program.objects.bulk_create(programs_to_create)

                # Create relationships for each program
                for program, (_, row) in zip(created_program, df.iterrows()):
                    professor_ids = map(int, row["professor_ids"].split("|"))  # Parse professor IDs
                    for professor_id in professor_ids:
                        relationships.append(ProgramProfessor(program=program, professor_id=professor_id))

                # Bulk create relationships
                ProgramProfessor.objects.bulk_create(relationships)

            return Response(
                {"message": f"Successfully imported {len(created_program)} program from CSV."},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # PROGRAM Update
    # @action(detail=True, methods=['put', 'patch'])
    # @role_required(allowed_roles=["HR", "Dean", "Program Head"], required_permission="hrapp.change_program")
    def perform_update(self, serializer):
        # DRF UPDATE METHOD
        program = serializer.save()

        professors = self.request.data.get('professors', None)
        if professors is not None:
            ProgramProfessor.objects.filter(program=program).delete()
            ProgramProfessor.objects.bulk_create([
                ProgramProfessor(program=program,
                                 professor_id=prof_id)
                for prof_id in professors
            ])

    # Program Delete
    def destroy(self, request, *args, **kwargs):
        program = self.get_object()
        program.deleted_at = now()
        program.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # Program Retrieve list (All)
    # RETRIEVE OR READ data fetching for all Program including the deleted ones
    """"@action(detail=False, methods=['get'])
    def program_all(self, request, *args, **kwargs):
        include_deleted = request.query_params.get('include_deleted', 'false').lower() == 'true'
        if include_deleted:
            queryset = Program.objects.all()
        else:
            queryset = Program.objects.filter(deleted_at__isnull=True)
        serializer = ProgramSerializer(queryset, many=True)
        return Response(serializer.data)"""

    # program RESTORE
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        program = get_object_or_404(Program, pk=pk, deleted_at__isnull=False)
        program.restore()
        return Response(self.get_serializer(program).data, status=status.HTTP_200_OK)


# ProgramProfessor
class ProgramProfessorViewSet(viewsets.ModelViewSet):
    queryset = ProgramProfessor.objects.all()
    serializer_class = ProgramProfessorSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = ProgramProfessor.objects.select_related('professor', 'program')
        if user.is_superuser:
            pass  # Return all
        elif user.groups.filter(name='HR').exists():
            temp_faculty_id = cache.get(f"hr_temp_faculty_{user.id}")
            if temp_faculty_id:
                queryset = queryset.filter(program__faculty_id=temp_faculty_id)
            elif hasattr(user, 'faculty') and user.faculty:
                queryset = queryset.filter(program__faculty=user.faculty)
            else:
                return ProgramProfessor.objects.none()
        elif hasattr(user, 'faculty') and user.faculty:
            queryset = queryset.filter(program__faculty=user.faculty)
        else:
            return ProgramProfessor.objects.none()
        program_id = self.request.query_params.get('program_id')
        if program_id:
            queryset = queryset.filter(program_id=program_id)
        return queryset


# SCHEDULES CRUD BELOW v------------------------
class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.filter(is_active=True)
    serializer_class = ScheduleSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ScheduleFilter

    def get_queryset(self):
        user = self.request.user
        base_qs = super().get_queryset()
        if user.is_superuser:
            return base_qs
        if user.groups.filter(name='HR').exists():
            temp_faculty_id = cache.get(f"hr_temp_faculty_{user.id}")
            if temp_faculty_id:
                qs = base_qs.filter(program__faculty_id=temp_faculty_id)
                print("DEBUG: Schedule for HR user", user, "temp faculty", temp_faculty_id, ":", list(qs))
                return qs
            if hasattr(user, 'faculty') and user.faculty:
                qs = base_qs.filter(program__faculty=user.faculty)
                print("DEBUG: Schedule for HR user", user, ":", list(qs))
                return qs
            return base_qs.none()
        if hasattr(user, 'faculty') and user.faculty:
            qs = base_qs.filter(program__faculty=user.faculty)
            print("DEBUG: Schedule for user", user, ":", list(qs))
            return qs
        return base_qs.none()

    # SCHEDULE Create

    @permission_classes([IsAuthenticated])
    def create(self, request, *args, **kwargs):
        user = request.user

        if not user.groups.filter(name__in=["Dean", "HR", "Program Head"]).exists():
            raise PermissionDenied("You do not have permission to create schedules.")
        data = request.data
        # HANDLES BULK IF THE INPUT IS A LIST
        if isinstance(data, list):
            validated_schedules = []
            for schedule_data in data:
                serializer = self.serializer_class(data=schedule_data)
                serializer.is_valid(raise_exception=True)
                validated_schedules.append(Schedule(**serializer.validated_data))

            with transaction.atomic():
                Schedule.objects.bulk_create(validated_schedules)

            return Response(
                {"message": "Schedules created successfully",
                 "count": len(validated_schedules)}, status=status.HTTP_201_CREATED,
            )

        return super().create(request, *args, **kwargs)

    # SCHEDULE RETRIEVE (ID OR NAME)
    """def retrieve(self, request, *args, **kwargs):

        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)"""

    # SCHEDULE Update
    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """UPDATE AN EXISTING SCHEDULE"""
        partial = kwargs.pop('partial', False)  # Check if this is a partial update (PATCH)
        instance = self.get_object()  # GET THE DATA TO BE UPDATED (SCHEDULE)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data, status=status.HTTP_200_OK)

    # SCHEDULE Delete
    def destroy(self, request, *args, **kwargs):
        """SOFT DELETE A ATA BY MAKING THE IS_ACTIVE FIELD FALSE"""

        instance = self.get_object()  # GET THE DATA
        instance.is_active = False
        instance.deleted_at = timezone.now()
        instance.save()

        return Response({"message": "Schedule deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

    # SCHEDULE Read/Retrieve (All)
    def list(self, request, *args, **kwargs):
        """Retrieve and filter schedules. Filter by semester, program, section, subject, or professor."""
        queryset = self.filter_queryset(self.get_queryset())
        semester = request.query_params.get('semester', None)
        program = request.query_params.get('program', None)
        section = request.query_params.get('section', None)
        subject = request.query_params.get('subject', None)
        professor = request.query_params.get('professor', None)  # <-- Add this

        if semester:
            queryset = queryset.filter(semester=semester)
        if program:
            queryset = queryset.filter(program=program)
        if section:
            queryset = queryset.filter(section=section)
        if subject:
            queryset = queryset.filter(subject=subject)
        if professor:
            queryset = queryset.filter(instructor=professor)  # <-- Add this

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['GET'], url_path='my-schedules')
    def my_schedules(self, request):
        """Get schedules for the logged-in student based on their section"""
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        # Get student's sections
        student_sections = user.sections.all()

        # Get schedules for those sections
        schedules = Schedule.objects.filter(
            section__in=student_sections,
            is_active=True
        ).select_related('subject', 'instructor', 'section', 'room')

        serializer = self.get_serializer(schedules, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='sections')
    def sections(self, request, pk=None):
        """RETURNS SECTIONS ASSIGNED TO A SCHEDULE"""
        schedule = self.get_object()
        if schedule.section:
            serializer = SectionSerializer(schedule.section)
            return Response([serializer.data], status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'No sections is assigned to this schedule.'}, status=status.HTTP_404_NOT_FOUND)


# USER VIEWS.
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_professors(request):
    user = request.user
    professors = User.objects.filter(groups__name='professor')
    if not user.is_superuser and hasattr(user, 'faculty'):
        professors = professors.filter(faculties_as_professor=user.faculty)
    serializer = UserProgramProfessorSerializer(professors, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_students(request):
    """
    Return a simplified list of student users for selection in Sections dialog.
    Supports search by first/last name or email and scopes by faculty when applicable.
    Allowed roles: Dean, HR, Program Head (or superuser).
    """
    user = request.user
    if not (user.is_superuser or user.groups.filter(name__in=['Dean', 'HR', 'Program Head']).exists()):
        raise PermissionDenied("You do not have permission to view students.")

    qs = User.objects.filter(groups__name__iexact='Student', is_active=True)

    search = request.query_params.get('search')
    if search:
        qs = qs.filter(
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(email__icontains=search)
        )

    # Scope by faculty if user has one or HR temp context
    faculty = getattr(user, 'faculty', None)
    if user.is_superuser:
        pass
    elif user.groups.filter(name='HR').exists():
        temp_faculty_id = cache.get(f"hr_temp_faculty_{user.id}")
        if temp_faculty_id:
            student_ids = Section.objects.filter(program__faculty_id=temp_faculty_id).values_list('students__id', flat=True).distinct()
            qs = qs.filter(id__in=student_ids)
        elif faculty:
            student_ids = Section.objects.filter(program__faculty=faculty).values_list('students__id', flat=True).distinct()
            qs = qs.filter(id__in=student_ids)
        else:
            qs = qs.none()
    elif faculty:
        student_ids = Section.objects.filter(program__faculty=faculty).values_list('students__id', flat=True).distinct()
        qs = qs.filter(id__in=student_ids)
    else:
        qs = qs.none()

    data = [{'id': u.id, 'name': (u.get_full_name() or u.email)} for u in qs.order_by('first_name', 'last_name')[:50]]
    return Response(data, status=status.HTTP_200_OK)


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.filter(deleted_at__isnull=True)
    serializer_class = SectionSerializer

    def get_queryset(self):
        user = self.request.user
        base_qs = super().get_queryset()
        if user.is_superuser:
            return base_qs
        if hasattr(user, 'faculty') and user.faculty:
            return base_qs.filter(program__faculty=user.faculty)
        return base_qs.none()

    def _check_permissions(self, request):
        """Check if user has permission for CRUD operations"""
        user = request.user
        if not (user.is_superuser or user.groups.filter(name__in=['Dean', 'HR', 'Program Head']).exists()):
            raise PermissionDenied("You do not have permission to perform this action.")

    @action(detail=True, methods=['post'])
    def add_students(self, request, pk=None):
        """Add multiple students to a section with validation"""
        self._check_permissions(request)
        
        section = self.get_object()
        student_ids = request.data.get('student_ids', [])

        if not isinstance(student_ids, list):
            return Response({'error': 'student_ids must be a list.'}, status=status.HTTP_400_BAD_REQUEST)

        if not student_ids:
            return Response({'error': 'At least one student ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate that all provided IDs are actual students
        valid_students = User.objects.filter(
            id__in=student_ids,
            groups__name__iexact='Student',
            is_active=True
        )

        if valid_students.count() != len(student_ids):
            invalid_ids = set(student_ids) - set(valid_students.values_list('id', flat=True))
            return Response({
                'error': f'Invalid student IDs: {list(invalid_ids)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Add students to section
        section.students.add(*student_ids)

        return Response({
            'message': f'Successfully added {len(student_ids)} students to section {section.name}.',
            'added_students': len(student_ids)
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='students')
    def students(self, request, pk=None):
        """
        Returns all students assigned to this section.
        """
        section = self.get_object()
        students = section.students.all()
        serializer = UserSerializer(students, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        """Create section(s) with proper authorization"""
        self._check_permissions(request)
        
        data = request.data

        if isinstance(data, list):
            created_sections = []
            failed_sections = []

            for section_data in data:
                try:
                    serializer = self.get_serializer(data=section_data)
                    serializer.is_valid(raise_exception=True)
                    created_section = serializer.save()
                    created_sections.append(created_section)
                except ValidationError as e:
                    failed_sections.append({
                        "error": e.detail,
                        "data": section_data,
                    })

            if failed_sections:
                raise ValidationError({
                    "message": "Failed to create sections.",
                    "error": failed_sections
                })

            return Response(
                {"message": f"Sections created successfully "
                            f"{len(created_sections)} sections"}, status=status.HTTP_201_CREATED,
            )

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Update section with proper authorization"""
        self._check_permissions(request)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Delete section with proper authorization"""
        self._check_permissions(request)
        return super().destroy(request, *args, **kwargs)

# Retention vs Responses Regression API (multi-series using ScatterPlotAnalytics)
import logging

logger = logging.getLogger('hrapp.analytics')


def _linear_regression_improved(points_xy):
    """
    Improved linear regression with better error handling and validation.
    """
    if not points_xy or len(points_xy) < 2:
        return None

    try:
        xs = [float(p['x']) for p in points_xy]
        ys = [float(p['y']) for p in points_xy]
        n = float(len(points_xy))

        # Check for valid data
        if n == 0 or any(x is None or y is None for x, y in zip(xs, ys)):
            return None

        mean_x = sum(xs) / n
        mean_y = sum(ys) / n

        # Calculate variance and covariance
        var_x = sum((x - mean_x) ** 2 for x in xs)
        if var_x == 0:  # All x values are the same
            return None

        cov_xy = sum((xs[i] - mean_x) * (ys[i] - mean_y) for i in range(len(xs)))

        # Calculate slope and intercept
        b = cov_xy / var_x  # slope
        a = mean_y - b * mean_x  # intercept

        # Calculate R-squared
        ss_tot = sum((y - mean_y) ** 2 for y in ys)
        ss_res = sum((ys[i] - (a + b * xs[i])) ** 2 for i in range(len(xs)))
        r2 = 1.0 - (ss_res / ss_tot) if ss_tot != 0 else 0.0

        return {
            'slope': float(b),
            'intercept': float(a),
            'r2': float(r2),
            'formula': f"y = {a:.4f} + {b:.4f}x",
            'n_points': int(n)
        }
    except Exception as e:
        print(f"[ERROR] Linear regression calculation failed: {e}")
        return None


def _score_response_for_group_improved(resp):
    """
    Improved scoring function with better error handling and fallbacks.
    """
    q = resp.student_eval_question
    qtype = (q.type or '').strip().upper() if q else ''
    ans = resp.answer
    mode = 'unknown'
    pts = 0.0

    # First, try to use stored sentiment score if available
    if hasattr(resp, 'sentiment_score') and resp.sentiment_score:
        try:
            sentiment_data = resp.sentiment_score
            if isinstance(sentiment_data, dict):
                pts = float(sentiment_data.get('points', 0.0))
                label = sentiment_data.get('label', 'UNKNOWN')
                score_type = sentiment_data.get('type', qtype.lower())
                mode = f"{score_type}:stored_{label.lower()}"
                return float(pts), mode
        except Exception as e:
            print(f"[DEBUG] Error reading stored sentiment score: {e}")

    # Fallback to real-time analysis if no stored sentiment score
    if qtype == 'MCQ':
        if callable(score_mcq_answer):
            try:
                pts, meta = score_mcq_answer(q, ans)
                mode = f"mcq:{meta.get('mode', 'unknown')}"
            except Exception as e:
                print(f"[DEBUG] MCQ scoring error: {e}")
                mode = 'mcq:error'
        else:
            # Simple letter mapping fallback
            letter_map = {'A': 1.0, 'B': 0.5, 'C': 0.0, 'D': -0.5, 'E': -1.0}
            ans_upper = str(ans).strip().upper() if ans else ''
            if ans_upper in letter_map:
                pts = letter_map[ans_upper]
                mode = 'mcq:letter_fallback'
            else:
                # Try to extract letter from longer answers
                for letter in ['A', 'B', 'C', 'D', 'E']:
                    if letter in ans_upper:
                        pts = letter_map[letter]
                        mode = f'mcq:extracted_{letter}'
                        break

    elif qtype == 'TEXT':
        if callable(analyze_text_sentiment):
            try:
                text_input = f"Question: {q.question}\nAnswer: {ans}" if q and q.question else str(ans)
                res = analyze_text_sentiment(text_input) or {}
                pts = float(res.get('points', 0.0))
                mode = f"text:{res.get('label', 'unknown')}"
            except Exception as e:
                print(f"[DEBUG] Text sentiment analysis error: {e}")
                mode = 'text:error'
        else:
            # Simple heuristic fallback
            s = str(ans or '').lower()
            positive_words = ['excellent', 'good', 'satisfied', 'great', 'helpful', 'amazing', 'wonderful',
                              'outstanding']
            negative_words = ['bad', 'poor', 'unsatisfied', 'terrible', 'unhelpful', 'awful', 'horrible',
                              'disappointing']

            if any(word in s for word in positive_words):
                pts = 1.0
                mode = 'text:heuristic_pos'
            elif any(word in s for word in negative_words):
                pts = -1.0
                mode = 'text:heuristic_neg'
            else:
                pts = 0.0
                mode = 'text:heuristic_neu'

    elif qtype == 'RATING':
        # Handle rating questions (1-5 scale typically)
        try:
            rating = float(ans) if ans else 0
            if 1 <= rating <= 5:
                # Convert 1-5 scale to -1 to 1 scale
                pts = (rating - 3) / 2  # 1->-1, 2->-0.5, 3->0, 4->0.5, 5->1
                mode = f'rating:scale_{rating}'
            else:
                pts = 0.0
                mode = 'rating:out_of_range'
        except (ValueError, TypeError):
            pts = 0.0
            mode = 'rating:invalid'

    return float(pts), mode

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def scatterplot_analytics_save_improved(request):
    """
    Upsert ScatterPlotAnalytics entries.
    Supports payloads:
    1) Single entry: {year, semester, retention_rate}
    2) Year with multiple semesters: {year, semesters: [...], retention_rate}
    3) List of entries: [{year, semester, retention_rate}, ...]
    """
    def validate_year(y):
        valid_years = dict(ScatterPlotAnalytics.YEAR_CHOICES)
        if y not in valid_years:
            raise ValidationError({"error": f"Invalid year. Must be one of: {list(valid_years.keys())}"})

    def validate_semester(s):
        valid_semesters = dict(ScatterPlotAnalytics.SEMESTER_CHOICES)
        if s not in valid_semesters:
            raise ValidationError({"error": f"Invalid semester. Must be one of: {list(valid_semesters.keys())}"})

    def validate_rate(r):
        try:
            rr = float(r)
        except (ValueError, TypeError):
            raise ValidationError({"error": "retention_rate must be a valid number"})
        if not (0 <= rr <= 100):
            raise ValidationError({"error": "Retention rate must be between 0 and 100"})
        return rr

    try:
        payload = request.data
        entries = []

        # Case 3: list of entries
        if isinstance(payload, list):
            entries = payload
        # Case 2: dict with semesters list
        elif isinstance(payload, dict) and isinstance(payload.get('semesters'), list):
            year = payload.get('year')
            rr = payload.get('retention_rate')
            validate_year(year)
            rr = validate_rate(rr)
            semesters = payload.get('semesters')
            if not semesters:
                return Response({"error": "semesters list cannot be empty"}, status=status.HTTP_400_BAD_REQUEST)
            for s in semesters:
                validate_semester(s)
                entries.append({"year": year, "semester": s, "retention_rate": rr})
        # Case 1: single dict
        elif isinstance(payload, dict):
            year = payload.get('year')
            semester = payload.get('semester')
            rr = payload.get('retention_rate')
            validate_year(year)
            validate_semester(semester)
            rr = validate_rate(rr)
            entries = [{"year": year, "semester": semester, "retention_rate": rr}]
        else:
            return Response({"error": "Invalid payload format"}, status=status.HTTP_400_BAD_REQUEST)

        results = []
        for item in entries:
            year = item['year']
            semester = item['semester']
            rr = float(item['retention_rate'])
            obj, created = ScatterPlotAnalytics.objects.update_or_create(
                year=year, semester=semester,
                defaults={"retention_rate": rr}
            )
            results.append({
                "id": obj.id,
                "year": obj.year,
                "semester": obj.semester,
                "retention_rate": obj.retention_rate,
                "created_at": getattr(obj, 'created_at', None),
                "action": "created" if created else "updated"
            })

        # Return 200 always for upsert with list of results
        return Response({"results": results}, status=status.HTTP_200_OK)

    except ValidationError as ve:
        # When we raised one of our validations above
        return Response(ve.detail if hasattr(ve, 'detail') else {"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"[ERROR] Failed to save retention entry: {e}")
        return Response({
            "error": f"Failed to save retention entry: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def retention_regression_improved(request):
    """
    Improved retention regression with better debugging and error handling.
    """
    # Aggregate X by group (year_level, semester) from StudentEvaluationResponse
    responses = StudentEvaluationResponse.objects.select_related(
        'student_eval_question', 'student_evaluation__schedule__section', 'student_evaluation__schedule'
    )
    # Scope by role/faculty (HR uses temp faculty context)
    user = request.user
    if user.is_superuser:
        pass
    elif user.groups.filter(name='HR').exists():
        temp_faculty_id = cache.get(f"hr_temp_faculty_{user.id}")
        if temp_faculty_id:
            responses = responses.filter(student_evaluation__schedule__program__faculty_id=temp_faculty_id)
        elif hasattr(user, 'faculty') and user.faculty:
            responses = responses.filter(student_evaluation__schedule__program__faculty=user.faculty)
        else:
            responses = responses.none()
    elif hasattr(user, 'faculty') and user.faculty:
        responses = responses.filter(student_evaluation__schedule__program__faculty=user.faculty)
    else:
        responses = responses.none()

    group_stats = {}  # (year, semester) -> {sum, n, responses_count}
    mode_counts = defaultdict(int)

    total_responses = responses.count()
    print(f"[DEBUG] Processing {total_responses} total responses for retention regression")

    processed_count = 0
    for resp in responses:
        sched = getattr(resp.student_evaluation, 'schedule', None)
        if not sched or not sched.section:
            continue

        # Map Schedule/Section to ScatterPlotAnalytics choice values
        year_level = getattr(sched.section, 'year_level', None)  # e.g., '1','2','3','4'
        if year_level not in ('1', '2', '3', '4'):
            continue
        year_key = {'1': '1st', '2': '2nd', '3': '3rd', '4': '4th'}[year_level]

        sem_sched = getattr(sched, 'semester', None)  # 'First','Second','Summer'
        if sem_sched not in ('First', 'Second', 'Summer'):
            continue
        sem_key = {'First': '1st', 'Second': '2nd', 'Summer': 'Summer'}[sem_sched]

        pts, mode = _score_response_for_group_improved(resp)
        mode_counts[mode] += 1
        key = (year_key, sem_key)

        if key not in group_stats:
            group_stats[key] = {'sum': 0.0, 'n': 0, 'responses_count': 0}
        group_stats[key]['sum'] += pts
        group_stats[key]['n'] += 1
        group_stats[key]['responses_count'] += 1
        processed_count += 1

    # Log scoring distribution and group stats
    print(f"[DEBUG] Processed {processed_count}/{total_responses} responses")
    print(f"[DEBUG] Sentiment/MCQ scoring modes: {dict(mode_counts)}")
    print(f"[DEBUG] Group statistics: {group_stats}")

    # Prepare series using saved ScatterPlotAnalytics entries
    entries = ScatterPlotAnalytics.objects.all().order_by('created_at')
    print(f"[DEBUG] Found {entries.count()} ScatterPlotAnalytics entries")

    series_map = {}  # (year, semester) -> list of points
    for e in entries:
        key = (e.year, e.semester)
        stats = group_stats.get(key, None)

        # Allow plotting even if no responses, but use 0 as X value
        if not stats or stats['n'] == 0:
            print(f"[DEBUG] No responses for {key}, using X=0")
            avg_x = 0.0
        else:
            avg_x = stats['sum'] / stats['n']
            print(f"[DEBUG] Group {key}: avg_x={avg_x:.3f} from {stats['n']} responses")

        try:
            t_iso = (e.created_at or timezone.now()).isoformat()
        except Exception:
            t_iso = str(timezone.now())

        pt = {'x': avg_x, 'y': float(e.retention_rate or 0.0), 't': t_iso}
        if key not in series_map:
            series_map[key] = []
        series_map[key].append(pt)

    # Build response structure
    series = []
    for (y, s), pts in series_map.items():
        print(f"[DEBUG] Series {y}-{s}: {len(pts)} points")
        if len(pts) >= 2:
            reg = _linear_regression_improved(pts)
            if reg:
                print(
                    f"[DEBUG] Regression for {y}-{s}: slope={reg['slope']:.4f}, intercept={reg['intercept']:.4f}, r2={reg['r2']:.4f}")
            else:
                print(f"[DEBUG] Failed to calculate regression for {y}-{s}")
        else:
            reg = None
            print(f"[DEBUG] Not enough points for regression in {y}-{s}")

        series.append({
            'label': f"{y} - {s}",
            'key': {'year': y, 'semester': s},
            'points': pts,
            'regression': reg,
        })

    print(f"[DEBUG] Returning {len(series)} series")
    return Response({
        'series': series,
        'meta': {
            'grouped_by': ['year', 'semester'],
            'uses_scatterplot_analytics': True,
            'scoring_logged': True,
            'total_responses': sum(stats['n'] for stats in group_stats.values()),
            'total_entries': len(entries),
            'processed_responses': processed_count,
            'mode_distribution': dict(mode_counts)
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clear_faculty_context_view(request):
    """
    Clears the temporary faculty context for the current HR user.
    """
    user = request.user
    if not user.groups.filter(name='HR').exists():
        return Response({'error': 'Only HR users can clear faculty context.'}, status=status.HTTP_403_FORBIDDEN)
    cache.delete(f"hr_temp_faculty_{user.id}")
    return Response({'message': 'Temporary faculty context cleared.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_faculty_context_view(request):
    """
    Returns the current temp faculty context (if any) for HR.
    """
    user = request.user
    if not user.groups.filter(name='HR').exists():
        return Response({'error': 'Only HR users can read faculty context.'}, status=status.HTTP_403_FORBIDDEN)
    temp_id = cache.get(f"hr_temp_faculty_{user.id}")
    print("Current temp faculty context for user", user.id, "is", temp_id)
    return Response({'faculty_id': temp_id}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_faculty_context_view(request):
    """
    Allows an HR user to set (or clear) a temporary faculty context for their session.
    POST body:
      {"faculty_id": <int>} to set   OR   {"faculty_id": null} / {"faculty_id": "clear"} to clear
    """
    user = request.user
    if not user.groups.filter(name='HR').exists():
        return Response({'error': 'Only HR users can set faculty context.'}, status=status.HTTP_403_FORBIDDEN)

    faculty_id = request.data.get('faculty_id', None)
    cache_key = f"hr_temp_faculty_{user.id}"

    # Clear explicitly when None/"clear"
    if faculty_id in (None, "", "clear"):
        cache.delete(cache_key)
        print("Current temp faculty context for user", user.id, "is", faculty_id)
        return Response({'message': 'Temporary faculty context cleared.'}, status=status.HTTP_200_OK)

    try:
        fid = int(faculty_id)
    except (TypeError, ValueError):
        return Response({'error': 'faculty_id must be an integer or null to clear.'},
                        status=status.HTTP_400_BAD_REQUEST)

    # Replace old context with new one, refresh TTL to 1 hour
    cache.set(cache_key, fid, timeout=3600)
    return Response({'message': f'Temporary faculty context set to {fid}.'}, status=status.HTTP_200_OK)

class FacultyViewSet(viewsets.ModelViewSet):
    """ViewSet for managing Faculty objects.
Supports CRUD operations with soft delete functionality.
    """
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer
    permission_classes = [IsAuthenticated, IsHR | IsDean | IsProgramHead]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.is_superuser:
            return qs
        if user.groups.filter(name='HR').exists():
            # HR must list all faculties to display dynamic faculty/college cards
            return qs
        if hasattr(user, 'faculty') and user.faculty:
            return qs.filter(id=user.faculty.id)
        return qs.none()


def _resolve_faculty_from_request_or_hr_temp(request):
    """Return an int faculty_id if available, else None.
       Order: explicit ?faculty= → HR temp cache → user's own faculty (if Dean) → None"""
    fid = request.query_params.get('faculty')
    if fid:
        try:
            return int(fid)
        except ValueError:
            pass

    user = request.user
    # HR: use borrowed faculty from cache
    if user.groups.filter(name='HR').exists():
        temp = cache.get(f"hr_temp_faculty_{user.id}")
        if temp:
            try:
                return int(temp)
            except ValueError:
                return None

    # Dean: if your User has a faculty relation/id, use that
    # (adjust if you store this differently)
    if hasattr(user, 'faculty') and getattr(user, 'faculty', None):
        return getattr(user.faculty, 'id', None)

    return None

# --- Presign PUT for direct browser uploads ---
BUCKET = os.getenv("S3_BUCKET")
CDN_BASE = os.getenv("CDN_PUBLIC_BASE", "")
_SAFE_PATH = re.compile(r"^[a-zA-Z0-9/_\-.]+$")
_ALLOWED_CT = {"image/png","image/jpeg","image/webp","image/avif"}

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def presign_put(request):
    """
    Body: { "path": "deans/<ID>/photo.png", "contentType": "image/png" }
    Returns: { uploadUrl, fileUrl }
    """
    path = request.data.get("path") or ""
    ctype = request.data.get("contentType") or ""

    if not _SAFE_PATH.match(path):
        return Response({"detail": "Invalid path"}, status=400)
    if ctype not in _ALLOWED_CT:
        return Response({"detail": "Unsupported content type."}, status=400)

    base, ext = os.path.splitext(path)
    if not ext:
        ext = mimetypes.guess_extension(ctype) or ".bin"
    key = f"{base}-{uuid.uuid4().hex}{ext}"

    client = _s3_client()
    upload_url = client.generate_presigned_url(
        "put_object",
        Params={"Bucket": BUCKET, "Key": key, "ContentType": ctype},
        ExpiresIn=300,
    )
    file_url = urljoin(CDN_BASE.rstrip("/") + "/", key) if CDN_BASE else f"https://s3.phinma-fes.com/{BUCKET}/{key}"

    return Response({"uploadUrl": upload_url, "fileUrl": file_url})

