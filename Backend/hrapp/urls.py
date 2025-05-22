from django.urls import path, include
from .views import *
from rest_framework.routers import DefaultRouter

# COURSE AND COURSEPROF ROUTER
course_router = DefaultRouter()
course_router.register(r'courses', CourseViewSet, basename='course')
course_router.register(r'course-professors',
                CourseProfessorViewSet, basename='course-professor')
# SUBJECT ROUTER
subject_router = DefaultRouter()

subject_router.register(r'subjects', SubjectViewSet, basename='subject')

#SCHEDULE ROUTER
schedule_router = DefaultRouter()
schedule_router.register(r'schedules', ScheduleViewSet, basename='schedule')

#EVALUATION ROUTER
evaluation_router = DefaultRouter()
evaluation_router.register(r'evaluations', EvaluationViewSet, basename='evaluation')


urlpatterns = [

    path('subject/', include(subject_router.urls)),


    path('course/', include(course_router.urls)),

    path('schedule/', include(schedule_router.urls)),

    path('evaluation/', include(evaluation_router.urls)),
    path('login/', login_view),

    path('logout/', logout_view, name='logout'),

    path('signup/', signup_view),

    path('latest-evaluation/', get_latest_evaluation),

    path('user-dashboard/', user_view_dashboard, name='user-dashboard'),

    path('user-profile/', user_view_profile),

    path('forgot-password/', forgot_password_view),

    path('verify-otp/', verify_otp_view),

    path('set-new-password/', set_new_password_view),

]
