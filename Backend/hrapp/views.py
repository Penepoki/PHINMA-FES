from django.contrib.auth.decorators import login_required, permission_required
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth import get_user_model
from django.views.decorators.http import require_http_methods
from django.utils.timezone import now
from django.db import transaction
from django.shortcuts import get_object_or_404
from hrapp.utils.evaluation_utils import *
from hrapp.serializers import CourseSerializer
from hrapp.utils.user_utils import *
from hrapp.utils.auth import *
from hrapp.utils.decorators import *
from hrapp.serializers.user_serializer import *
from hrapp.serializers.schedules_serializer import *
from hrapp.models.schedules_models import *
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework.exceptions import ValidationError, PermissionDenied
import json
import pandas as pd



User = get_user_model()

"""User View"""
#Login Func look @ utils/Auth.py for the logic
@api_view(['POST'])
def login_view(request):
    # calls a utility function here
    result = authenticate_user(request.data)
    return Response(result)


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
    new_password = request.data.get('password')
    try:
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        return Response({'message': 'OTP sent successfully'}, status=200)
    except User.DoesNotExist:
        return Response({'message': 'User does not exist'}, status=404)

#User Creation and Pass Reset look @ user_utils.py
@api_view(['POST'])
def signup_view(request):
    result = user_signup(request.data)

    if 'error' in result:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)

    return Response(result, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_view_dashboard(request):
    #Returns the basic info of the currently logged user
    user = request.user
    serializer = UserDashboardSerializer(user, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_view_profile(request):
    user = request.user
    serializer = UserSerializer(user, context={'request': request})
    return Response(serializers.data)

#Evaluation View
#CRUD BELOW FOR EVALUATION (COPUS)----------------------------------------------
#Create
class EvaluationViewSet(viewsets.ModelViewSet):
    """
    A viewset for managing evaluation.
    Includes soft delete, restore, and custom creation with evaluatiors and instructor
    """
    queryset = Evaluation.objects.filter(deleted_at__isnull=True).prefetch_related('evaluators', 'instructor')
    serializer_class = EvaluationSerializer
    permission_classes = [IsHR | IsDean | IsProgramHead]

    def create(self, request, *args, **kwargs):
        data = request.data
        evaluators = data.pop('evaluators', [])
        instructors = data.pop('instructors', [])

        with transaction.atomic():
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            evaluation = serializer.save() # Create the eval model

            #CREATE RELATIONSHIP FOR RELATED TABLES ( EVALUATOR AND INSTRUCTOR)
            for evaluator_id in evaluators:
                EvaluationEvaluator.objects.create(evaluation=evaluation, evaluator_id=evaluator_id)
            for instructor_id in instructors:
                EvaluationInstructor.objects.create(evaluation=evaluation, instructor_id=instructor_id)

        return Response(
            {"Message": "Evaluation created successfully", "data": serializer.data},
            status=status.HTTP_201_CREATED,
        )

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
        Get the latest evaluation for a specific course
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
#END OF CRUD EVALUATION -----------------------------------------

#START OF CRUD COURSE -------------------------------------------



# THE CRUD UTILITY  FOR SCHEDULE(ROOMS, SUBJECTS,
# COURSE
class CourseViewSet(viewsets.ModelViewSet):

    queryset = Course.objects.filter(deleted_at__isnull=True)
    serializer_class = CourseSerializer
    parser_classes = [MultiPartParser]

    @transaction.atomic
    @role_required(allowed_roles=["HR", "Dean", "Program Head"])
    def create(self, request, *args, **kwargs):
        """
        HANDLE BULK CREATION OR SINGLE OF COURSES
            WITH INTERMEDIATE TABLE(COURSEPROFESSOR)
            INPUT CAN BE SINGLE OR LIST OF COURSES
        """
        data = request.data

        #HANDLE BULK CREATION
        if isinstance(data, list):
            course_to_create = []
            relationships = []

            for course_data in data:
                serializer = self.get_serializer(data=course_data)
                serializer.is_valid(raise_exception=True)
                validated_data = serializer.validated_data

            professors = validated_data.pop('professors', [])
            course = Course(**validated_data)
            course_to_create.append(course)

            for professor_id in professors:
                relationships.append(CourseProfessor(course=course, professor_id=professor_id))
            # BULK CREATION FOR ALL COURSES
            created_courses = Course.objects.bulk_create(course_to_create)
            # UPDATE RELATIONSHIP WITH THE NEWLY CREATED COURSES
            for course, data in zip(created_courses, data):
                for professor_id in data.get('professors', []):
                    relationships.append(CourseProfessor(course=course, professor_id=professor_id))
            # BULT CREATION FOR ALL RELATIONSHIPS IN THE COURSEPROFESSOR TABLE
            CourseProfessor.objects.bulk_create(relationships)

            return Response(
                {"message": f"Courses created successfully "
                            f"{len(created_courses)} courses"}, status=status.HTTP_201_CREATED,
            )
        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=['post'],
            url_path='search')
    def import_course_from_csv(self, request, *args, **kwargs):
        """
            IMPORT COURSES AND THEIR RELATIONSHIPS FROM A CSV FILE.
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
            courses_to_create = []
            relationships = []

            # Loop through the DataFrame rows to prepare data for bulk creation
            for _, row in df.iterrows():
                course = Course(name=row["name"], code=row["code"])
                courses_to_create.append(course)

            with transaction.atomic():
                # Bulk create courses
                created_courses = Course.objects.bulk_create(courses_to_create)

                # Create relationships for each course
                for course, (_, row) in zip(created_courses, df.iterrows()):
                    professor_ids = map(int, row["professor_ids"].split("|"))  # Parse professor IDs
                    for professor_id in professor_ids:
                        relationships.append(CourseProfessor(course=course, professor_id=professor_id))

                # Bulk create relationships
                CourseProfessor.objects.bulk_create(relationships)

            return Response(
                {"message": f"Successfully imported {len(created_courses)} courses from CSV."},
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


    @action(detail=True, methods=['put', 'patch'])
    @role_required(allowed_roles=["HR", "Dean", "Program Head"], required_permission="hrapp.change_course")
    def perform_update(self, serializer):
        #DRF UPDATE METHOD
        course = serializer.save()

        professors = self.request.data.get('professors', None)
        if professors is not None:
            CourseProfessor.objects.filter(course=course).delete()
            CourseProfessor.objects.bulk_create([
                CourseProfessor(course=course,
                                professor_id=prof_id)
                                for prof_id in professors
            ])

    def destroy(self, request, *args, **kwargs):
        course = self.get_object()
        course.deleted_at = now()
        course.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # RETRIEVE OR READ data fetching for all courses including the deleted ones
    @action(detail=False, methods=['get'])
    def course_all(self, request, *args, **kwargs):
        include_deleted = request.query_params.get('include_deleted', 'false').lower() == 'true'
        if include_deleted:
            queryset = Course.objects.all()
        else:
            queryset = Course.objects.filter(deleted_at__isnull=True)
        serializer = CourseSerializer(queryset, many=True)
        return Response(serializer.data)

    #RESTORE
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        course = get_object_or_404(Course, pk=pk, deleted_at__isnull=False)
        course.restore()
        return Response(self.get_serializer(course).data, status=status.HTTP_200_OK)


class CourseProfessorViewSet(viewsets.ModelViewSet):
    queryset = CourseProfessor.objects.all()
    serializer_class = CourseProfessorSerializer


# SCHEDULES CRUD BELOW v------------------------
class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.filter(is_active=True)
    serializer_class = ScheduleSerializer


    @login_required
    @permission_classes([IsAuthenticated])
    @role_required(allowed_roles=["Dean", "HR", "Program Head"],
                   required_permission="add_schedule")
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
                 "count": len(validated_schedules)},status=status.HTTP_201_CREATED,
            )

        return super().create(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        """RETRIVE A SPECIFIC DATA BASED ON NAME or ID"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)


    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """UPDATE AN EXISTING SCHEDULE"""
        partial = kwargs.pop('partial', False) # Check if this is a partial update (PATCH)
        instance = self.get_object() # GET THE DATA TO BE UPDATED (SCHEDULE)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        """SOFT DELETE A ATA BY MAKING THE IS_ACTIVE FIELD FALSE"""

        instance = self.get_object() # GET THE DATA
        instance.is_active = False
        instance.deleted_at = timezone.now()
        instance.save()

        return Response({"message": "Schedule deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

    def list(self, request, *args, **kwargs):
        """Retrieve and filter schedules.
        Filter by semester, course, section, or other fields."""
        queryset = self.filter_queryset(self.get_queryset()) #Apply global filters

        # Apply custom filters
        semester = request.query_params.get('semester', None)
        course = request.query_params.get('course', None)
        section = request.query_params.get('section', None)
        subject = request.query_params.get('subject', None)

        if semester:
            queryset = queryset.filter(semester=semester)
        if course:
            queryset = queryset.filter(course=course)
        if section:
            queryset = queryset.filter(section=section)
        if subject:
            queryset = queryset.filter(subject=subject)

        # PAGINATE THE RESPONSE
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
