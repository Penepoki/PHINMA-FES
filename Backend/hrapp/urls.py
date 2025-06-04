from django.urls import path, include
from .views import *
from rest_framework.routers import DefaultRouter

# PROGRAM AND PROGPROF ROUTER
program_router = DefaultRouter()
program_router.register(r'programs', ProgramViewSet, basename='program')

program_professor_router = DefaultRouter()
program_professor_router.register(r'program-professors',
                ProgramProfessorViewSet, basename='program-professor')
# SUBJECT ROUTER
subject_router = DefaultRouter()

subject_router.register(r'subjects', SubjectViewSet, basename='subject')

#SCHEDULE ROUTER
schedule_router = DefaultRouter()
schedule_router.register(r'schedules', ScheduleViewSet, basename='schedule')

#EVALUATION ROUTER
evaluation_router = DefaultRouter()
evaluation_router.register(r'evaluations', EvaluationViewSet, basename='evaluation')

#EVALUATION TIMESTAMP ROUTER
timestamp_router = DefaultRouter()
timestamp_router.register(r'timestamps', TimestampViewSet, basename='timestamp')

#ROOM ROUTER
room_router = DefaultRouter()
room_router.register(r'rooms', RoomViewSet, basename='room')
urlpatterns = [

    path('subject/', include(subject_router.urls)),
    path('room/', include(room_router.urls)),

    path('program/', include(program_router.urls)),
    path('program-professor/', include(program_professor_router.urls)),
    path('schedule/', include(schedule_router.urls)),

    path('evaluation/', include(evaluation_router.urls)),

    path('timestamp/', include(timestamp_router.urls)),
    path('login/', login_view),

    path('logout/', logout_view, name='logout'),

    path('signup/', signup_view),

    path('user-dashboard/', user_view_dashboard, name='user-dashboard'),

    path('user-profile/', user_view_profile),

    path('forgot-password/', forgot_password_view),

    path('verify-otp/', verify_otp_view),

    path('set-new-password/', set_new_password_view),

    path('users/professors/', get_professors, name='get-professors'),

]
