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

section_router = DefaultRouter()
section_router.register(r'sections', SectionViewSet, basename='section')
#SCHEDULE ROUTER
schedule_router = DefaultRouter()
schedule_router.register(r'schedules', ScheduleViewSet, basename='schedule')

faculty_router = DefaultRouter()
faculty_router.register(r'faculties', FacultyViewSet, basename='faculty')

#EVALUATION ROUTER
evaluation_router = DefaultRouter()
evaluation_router.register(r'evaluations', EvaluationViewSet, basename='evaluation')

#EVALUATION TIMESTAMP ROUTER
timestamp_router = DefaultRouter()
timestamp_router.register(r'timestamps', TimestampViewSet, basename='timestamp')

#STUDENT EVALUATION ROUTER
StudentEvaluation_router = DefaultRouter()
StudentEvaluation_router.register(r'studentevaluation', StudentEvaluationViewSet, basename='studentevaluation')

StudentEvaluationQuestion_router = DefaultRouter()
StudentEvaluationQuestion_router.register(r'studentevaluationquestion', StudentEvaluationQuestionViewSet, basename='studentevaluationquestion')

StudentEvaluationResponse_router = DefaultRouter()
StudentEvaluationResponse_router.register(r'studentevaluationresponse', StudentEvaluationResponseViewSet, basename='studentevaluationresponse')

#ROOM ROUTER
room_router = DefaultRouter()
room_router.register(r'rooms', RoomViewSet, basename='room')

# USERS ADMIN ROUTER (HR/Dean)
user_admin_router = DefaultRouter()
user_admin_router.register(r'users', UserAdminViewSet, basename='user-admin')

urlpatterns = [
    path('section/', include(section_router.urls)),
    path('subject/', include(subject_router.urls)),
    path('room/', include(room_router.urls)),
    path('analytics/retention-regression/', retention_regression_improved, name='retention-regression'),
    path('analytics/scatterplot-analytics/', scatterplot_analytics_save_improved, name='scatterplot-analytics-save'),
    path('analytics/retention-recommendations/', retention_recommendations, name='retention-recommendations'),
    path('program/', include(program_router.urls)),
    path('program-professor/', include(program_professor_router.urls)),
    path('schedule/', include(schedule_router.urls)),

    path('evaluation/', include(evaluation_router.urls)),

    path('timestamp/', include(timestamp_router.urls)),

    path('studentevaluation/', include(StudentEvaluation_router.urls)),

    path('studentevaluationquestion/', include(StudentEvaluationQuestion_router.urls)),

    path('studentevaluationresponse/', include(StudentEvaluationResponse_router.urls)),

    path('login/', login_view),

    path('logout/', logout_view, name='logout'),

    path('signup/', signup_view),

    path('user-dashboard/', user_view_dashboard, name='user-dashboard'),

    path('user-profile/', user_view_profile),

    path('forgot-password/', forgot_password_view),

    path('verify-otp/', verify_otp_view),

    path('set-new-password/', set_new_password_view),

    path('users/professors/', get_professors, name='get-professors'),

    path('users/students/', get_students, name='get-students'),

    path('copus/bulk-tallies/', copus_bulk_tallies, name='copus-bulk-tallies'),

    path('set-faculty-context/', set_faculty_context_view, name='set-faculty-context-view'),

    path('clear-faculty-context/', clear_faculty_context_view),
    path('get-faculty-context/', get_faculty_context_view),

    path('faculty/', include(faculty_router.urls)),

    # HR/Dean user admin endpoints
    path('admin/', include(user_admin_router.urls)),

    path("uploads/presign", presign_put, name="presign-put")
]
