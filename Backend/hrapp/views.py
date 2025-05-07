from urllib import request

from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .utils import *
from rest_framework import status
from django.contrib.auth import get_user_model

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



#Evaluation View
@api_view(['GET'])
def latest_evaluation(request):
    latest_result = get_latest_evaluation()
    return Response(latest_result)



@api_view(['GET'])
def get_evaluations(request):
    result = get_all_evaluations()
    return Response(result)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_view_dashboard(request):
    #Returns the basic info of the currently logged user
    user_data = user_dashboard(request)
    return Response(user_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_view_profile(request):
    return Response(user_profile(request))
