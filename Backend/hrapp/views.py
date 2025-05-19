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
from rest_framework.exceptions import ValidationError
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
@require_http_methods(["POST"])
@login_required
@role_required(allowed_roles=["HR", "Dean", "Program Head"],
               required_permission="add_evaluation")
@permission_required("hrapp.add_evaluation", raise_exception=True)
def create_evaluation_view(request):
    #Parse data (JSON payload current)
    #data for handling large payloads and if client sends a JSON-encoded data
    data = json.loads(request.body)

    #Remove comment if client send raw and not encoded
    """data = request.POST.dict()"""

    try:
        evaluation = create_evaluation(data)
        if "some_required_field" not in data:
            raise ValueError("Missing required field: some_required_field")
        return JsonResponse({"message": " Copus evaluation successfuly", "id": evaluation.id},
            status=201)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=400)


#Read or Retrieve
@require_http_methods(["GET"])
@login_required
@role_required(allowed_roles=["HR", "Dean", "Program Head"])
@permission_required("hrapp.view_evaluation", raise_exception=True)
# GET ALL INCLUDED THE SOFT DELETED
def get_evaluation_view(request):
    try:
        evaluation = get_evaluations_deleted_included()
        if evaluation.get('error'):
            return JsonResponse({"data": None, "error": evaluation['error']}, status=404)
        return JsonResponse({"data": evaluation['data'], "error": None}, status=200)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=404)


# GET ALL EVALUATION WITH TRUE ACTIVE ONLY
def get_except_deleted_evaluation_view(request):
    try:
        evaluation = get_evaluations()
        if evaluation.get('error'):
            return JsonResponse({"data": None, "error": evaluation['error']}, status=404)
        return JsonResponse({"data": evaluation['data'], "error": None}, status=200)

    except Exception as e:
        return JsonResponse({"message": str(e)}, status=404)
# LATEST GET EVALUATION
def get_latest_evaluation_view(request):
    try:
        evaluation = get_latest_evaluation()
        if evaluation.get('error'):
            return JsonResponse({"data": None, "error": evaluation['error']}, status=404)
        return JsonResponse({"data": evaluation['data'], "error": None}, status=200)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=404)

#UPDATE
@require_http_methods(["PUT", "PATCH"])
@login_required
@role_required(allowed_roles=["HR", "Dean", "Program Head"],
               required_permission="change_evaluation")
@permission_required("hrapp.change_evaluation", raise_exception=True)
def update_evaluation_view(request, evaluation_id):
    data = request.POST.dict()
    try:
        evaluation = update_evaluation(evaluation_id, data)
        return JsonResponse({"message": " Copus evaluation successfuly", "id": evaluation.id}, status=200)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=400)

#DELETE (Soft Delete)
@require_http_methods(["DELETE"])
@login_required
@role_required(allowed_roles=["HR", "Dean", "Program Head"],
               required_permission="delete_evaluation")
@permission_required("hrapp.delete_evaluation", raise_exception=True)
def delete_evaluation_view(request, evaluation_id):
    try:
        result = delete_evaluation(evaluation_id, soft_delete=True)
        if isinstance(result, dict) and 'error' in result:
            return JsonResponse({"message": result['error']}, status=400)
        return JsonResponse({"message": " Copus evaluation deleted successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=400)

#RESTORE (Restore soft deleted objects(data)
@require_http_methods(["POST"])
@login_required
@role_required(allowed_roles=["HR", "Dean", "Program Head"],
               required_permission="restore_evaluation")
@permission_required("hrapp.restore_evaluation", raise_exception=True)
def restore_evaluation_view(request, evaluation_id):
    try:
        restore_evaluation(evaluation_id)
        return JsonResponse({"message": " Copus evaluation restored successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=400)
#END OF CRUD EVALUATION -----------------------------------------

#START OF CRUD COURSE -------------------------------------------



# THE CRUD UTILITY  FOR SCHEDULE(ROOMS, SUBJECTS,
# COURSE
class CourseViewSet(viewsets.ModelViewSet):

    queryset = Course.objects.filter(deleted_at__isnull=True)
    serializer_class = CourseSerializer
    parser_classes = [MultiPartParser]
    @action(detail=True, methods=['post'])
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

    @action(detail=True, methods=['post'])
    @login_required
    @role_required(allowed_roles=["Dean", "HR", "Program Head"],
                   required_permission="add_schedule")
    def create(self, request, *args, **kwargs):
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