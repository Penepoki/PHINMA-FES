from django.contrib.auth.decorators import login_required, permission_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from hrapp.utils.evaluation_utils import *
from hrapp.utils.user_utils import *
from hrapp.utils.auth import *
from hrapp.utils.decorators import *
from rest_framework import status, viewsets
from django.contrib.auth import get_user_model
from django.views.decorators.http import require_http_methods
from hrapp.serializers.user_serializer import *
import json


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
#CRUD BELOW
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