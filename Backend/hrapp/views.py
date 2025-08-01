from collections import defaultdict
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.db.models import Count
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
# from rest_framework.filter import Search
import pandas as pd
from datetime import datetime, timedelta, time

User = get_user_model()

"""User View"""


# Login Func look @ utils/Auth.py for the logic
@api_view(['POST'])
def login_view(request):
    # calls a utility function here
    result = authenticate_user(request.data)
    return Response(result)


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
                if not user_can_access_evaluation(self.request.user, evaluation):
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


# CRUD BELOW FOR EVALUATION (COPUS)----------------------------------------------
# Create
class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.filter(deleted_at__isnull=True).select_related('schedule', 'evaluator')
    serializer_class = EvaluationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base_qs = super().get_queryset()
        if hasattr(user, "Dean") and user.Dean:
            return base_qs
        if hasattr(user, 'faculty') and user.faculty:
            return base_qs.filter(schedule__program__faculty=user.faculty)
        return base_qs

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


# END OF CRUD EVALUATION -----------------------------------------
# Define your activity options (should match frontend)
@api_view(["GET"])
def copus_bulk_tallies(request):
    eval_ids = request.GET.get('evaluation_ids')
    if not eval_ids:
        return Response({"Error": "evaluation_ids required"}, status=status.HTTP_400_BAD_REQUEST)
    ids = [int(i) for i in eval_ids.split(',') if i.strip().isdigit()]
    result = {}

    # Use choices from the model
    STUDENT_CHOICES = Timestamp.STUDENT_ACTIVITY_CHOICES
    INSTRUCTOR_CHOICES = Timestamp.INSTRUCTOR_ACTIVITY_CHOICES

    # Build Mappings
    STUDENT_ACTIVITY_MAP_REVERSE = dict((key, display) for key, display in STUDENT_CHOICES)
    INSTRUCTOR_ACTIVITY_MAP_REVERSE = dict((key, display) for key, display in INSTRUCTOR_CHOICES)
    STUDENT_OPTIONS = [display for key, display in STUDENT_CHOICES]
    INSTRUCTOR_OPTIONS = [display for key, display in INSTRUCTOR_CHOICES]

    for eval_id in ids:
        timestamps = Timestamp.objects.filter(evaluation_id=eval_id)
        student_tallies = {opt: {"count": 0, "percentage": 0.0} for opt in STUDENT_OPTIONS}
        instructor_tallies = {opt: {"count": 0, "percentage": 0.0} for opt in INSTRUCTOR_OPTIONS}
        total_students = 0
        total_instructors = 0

        for ts in timestamps:
            for key, display in STUDENT_ACTIVITY_MAP_REVERSE.items():
                if getattr(ts, 'student_activities', {}).get(key, False):
                    student_tallies[display]["count"] += 1
                    total_students += 1
            for key, display in INSTRUCTOR_ACTIVITY_MAP_REVERSE.items():
                if getattr(ts, 'instructor_activities', {}).get(key, False):
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

        result[eval_id] = {
            "studentTallies": student_tallies,
            "teacherTallies": instructor_tallies,
        }
    return Response(result)


### STUDENTEVALUATION(QUESTION, FORM AND ANSWER CRUD) ###

class StudentEvaluationViewSet(viewsets.ModelViewSet):
    queryset = StudentEvaluation.objects.filter(deleted_at__isnull=True)
    serializer_class = StudentEvaluationSerializer

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

class StudentEvaluationQuestionViewSet(viewsets.ModelViewSet):
    queryset = StudentEvaluationQuestion.objects.all()
    serializer_class = StudentEvaluationQuestionSerializer

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

            # Create responses
            response_objects = []
            for response_data in responses:
                response_obj = StudentEvaluationResponse(
                    student_evaluation_id=student_evaluation_id,
                    student_eval_question_id=response_data.get('question_id'),
                    user=user,
                    answer=response_data.get('answer')
                )
                response_objects.append(response_obj)

            # Bulk create responses
            StudentEvaluationResponse.objects.bulk_create(response_objects)

            return Response(
                {'message': 'Responses submitted successfully'},
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
        program_id = request.query_params.get('programs')
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
            student_evaluation_faculty_id=faculty_id)
        serializer = self.get_serializer(responses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
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
        queryset = ProgramProfessor.objects.select_related('professor')
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


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.filter(deleted_at__isnull=True)
    serializer_class = SectionSerializer

    def get_queryset(self):
        user = self.request.user
        base_qs = super().get_queryset()
        if user.is_superuser:
            return base_qs
        if hasattr(user, 'faculty') and user.faculty:
            return base_qs.filter(schedule__program__faculty=user.faculty)
        return base_qs.none()

    @action(detail=True, methods=['post'])
    def add_students(self, request, pk=None):
        section = self.get_object()
        student_ids = request.data.get('student_ids', [])
        if not isinstance(student_ids, list):
            return Response({'error': 'student_ids must be a list.'}, status=status.HTTP_400_BAD_REQUEST)
        section.students.add(*student_ids)
        return Response({'message': f'Added {len(student_ids)} students to section {section.name}.'},
                        status=status.HTTP_200_OK)

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
        data = request.data

        if isinstance(data, list):
            created_sections = []
            failed_sections = []

            for section_data in data:
                serializer = self.get_serializer(data=section_data)
                serializer.is_valid(raise_exception=True)
                created_section = serializer.save()
                created_sections.append(created_section)

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