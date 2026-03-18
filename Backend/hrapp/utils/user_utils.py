from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import Group, User

from rest_framework.authtoken.models import Token
from hrapp.models import *

#USER UTILS HANDLES ALL REGARDING USER LOGIC SIGN-UP ETC
#USER UTILS ARE FOR USER DATA MANIPULATION ETC, LOOK FUNCTIONS FOR USERS HERE
def user_signup(data):
    first_name = data['first_name']
    last_name = data['last_name']
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    # USER SIGNUP VALIDATIONS
    if not first_name or not last_name or not username or not password or not email:
        return {"error": "Please fill in all required fields."}

    if User.objects.filter(username=username).exists():
        return {"error": "Username already exists."}

    if User.objects.filter(email=email).exists():
        return {"error": "Email already exists."}

    # Domain restriction for signup
    allowed_pattern = r"(@sjc@phinmaed\.com$|\.sjc@phinmaed\.com$)"
    import re
    if not re.search(allowed_pattern, email or ""):
        return {"error": "Email must use the .sjc@phinmaed.com domain."}

    if User.objects.filter(username=username).exists():
        return {'error': 'Username already exists!'}

    user = User.objects.create_user(username=username, email=email, password=password, first_name=first_name, last_name=last_name)

    token, _ = Token.objects.get_or_create(user=user)

    return {
        'message' :"Registered Successfully!",
        "token" : token.key
    }

def get_full_name(user):
    return f"{user.first_name} {user.last_name}".strip()

def reset_password(data):
    email = data.get('email')
    new_password = data.get('new_password')

    if not email or not new_password:
        return {"Fill the list Required"}

    try:
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        return {"Reset Password Success!"}
    except User.DoesNotExist:
        return {"User not found!"}

def assign_user_to_group(username: str, group_name: str):
    """Assigns a user to a specified group, creating the group if needed."""
    try:
        user = User.objects.get(username=username)
        group, _ = Group.objects.get_or_create(name=group_name)
        user.groups.add(group)
        user.save()
    except User.DoesNotExist:
        print(f"User '{username}' not found.")


def user_format(user):
    return {
        'id': user.id,
        'name': f"{user.last_name} {user.first_name}",
        'role': user.role or 'no role',
        'username': user.username,
        'email': user.email,
    }

def user_dashboard(request):
    try:
         user = request.user
         return {
            'name': f"{user.last_name} {user.first_name}"
         }
    except User.DoesNotExist:
        return None


def user_profile(request):
    try:
        user = request.user
        role = user.groups.first().name if user.groups.exists() else None

        sections = user.sections.select_related('program').all()

        section_data = [
            {
                'section_name': section.name,
                'year_level': section.get_year_level_display(),
                'program': section.program.name,
                'program_code': section.program.code,


            }
            for section in sections
        ]

        #Get all related data programs connected to professor
        programs = Program.objects.filter(programprofessor__professor=user)

        program_data = [
                {
                    'program_name': program.name,
                    'program_code': program.code,
                }
                for program in programs
            ]

        return {
            'name': f"{user.last_name} {user.first_name}",
            'username': user.username,
            'email': user.email,
            'programs': program_data if role.lower() == 'student' else [],
            'section': section_data if role.lower() == 'student' else [],
        }
    except User.DoesNotExist:
        return None

@property
def role (self):
    return self.groups.first().name if self.groups.exists() else None

