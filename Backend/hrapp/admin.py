from django.contrib import admin
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from hrapp.models.evaluation_models import *
from hrapp.models.schedules_models import *

@admin.register(Token)
class TokenAdmin(admin.ModelAdmin):
    list_display = ('key', 'user', 'created', 'expires_at')
    search_fields = ('user__username', 'key')


class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'is_staff', 'is_active')

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('email', 'first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Supervisor', {'fields': ('supervisor',)}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    #Modify this section to include more fields in the "Add User" form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('first_name', 'last_name', 'username', 'email', 'password1', 'password2', 'supervisor', 'is_staff', 'is_active')}
        ),
    )

    def get_queryset(self, request):
        return User.all_objects.all()  # Show all users (including deleted)


    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)

admin.site.register(User, CustomUserAdmin)



@admin.register(StudentEvaluation)
class StudentEvaluationAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'created_at', 'updated_at')


@admin.register(StudentEvaluationQuestion)
class StudentEvaluationQuestionsAdmin(admin.ModelAdmin):
    list_display = ('student_evaluation', 'question', 'type', 'options')

class EvaluationEvaluatorInLine(admin.TabularInline):
    model = EvaluationEvaluator
    extra = 0
class EvaluationInstructorInLine(admin.TabularInline):
    model = EvaluationInstructor
    extra = 0

@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_filter = ["is_deleted"]
    list_display = ("schedule", "observation_date", "evaluation_type", "additional_comments", "instructor_comments", "student_comments", "student_activities", "instructor_activities",
                                "is_deleted", "deleted_at")
    inlines = [EvaluationInstructorInLine, EvaluationEvaluatorInLine]


########### ADMIN REGISTRY TO REFLECT IN ADMIN SITE. CONTAINS: SCHEDULE, FACULTYASSIGN, ROOM, SUBJECT AND Program ##########
#Inlines SECTION
#class RoomInLine(admin.TabularInline): model = Room; extra = 0

class ProgramProfessorInline(admin.TabularInline): model = ProgramProfessor; extra = 1  # Or admin.StackedInline

class FacultyScheduleInline(admin.TabularInline):
    model = FacultySchedule
    extra = 1

#class SubjectInline(admin.TabularInline): model = Subject; extra = 1

#class ProgramInline(admin.TabularInline): model = Program; extra = 1

##REGISTRY SECTION
@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ( "subject", "room", "start_time","program", "end_time", "semester", "year", "is_active")
                                                                            #"deleted_at", "created_at", "updated_at")
    #inlines = [RoomInLine, ProgramInline, SubjectInline]


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
     list_display = ("name", "slug", "is_active")
                            #,"deleted_at", "created_at", "updated_at")

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active")
                    #, "deleted_at", "created_at", "updated_at")

@admin.register(FacultyAssignment)
class FacultyAssignmentAdmin(admin.ModelAdmin):
    inlines = [FacultyScheduleInline]
    list_display = ('user', 'get_schedules', 'created_at')

    def get_schedules(self, obj):
        return ", ".join(s.name for s in obj.schedules.all())
    get_schedules.short_description = 'Schedules'


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "is_active")
    search_fields = ("name", "code")
    list_filter = ("is_active",)
    inlines = [ProgramProfessorInline]  #This embeds ProgramProfessor inside ProgramAdmin


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'program', "year_level",'get_students')

    def get_students(self, obj):
        return ", ".join([str(student) for student in obj.students.all()])
    get_students.short_description = 'Students'
