from rest_framework import serializers
from hrapp.models.user_models import User
from hrapp.utils import get_full_name



# USER SERIALIZER SPECIFICALLY FOR PROGRAMPROFESSOR TABLE THAT GETS NECESSARY DETAILS NEEDED
class UserProgramProfessorSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    profile_picture_url = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'last_name', 'first_name', 'full_name', 'profile_picture_url']

    def get_full_name(self, obj):
        return f"{obj.last_name} {obj.first_name}"

    def get_profile_picture_url(self, obj):
        request = self.context.get('request')
        if getattr(obj, 'profile_picture', None) and request:
            try:
                return request.build_absolute_uri(obj.profile_picture.url)
            except Exception:
                return None
        return None


# USER SERIALIZER THATS GETS ALL THE SELECTED FIELDS LOOK AT META CLASS BELOW THE FIELDS
class UserSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()
    full_name_professor = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'last_name', 'first_name', 'profile_picture_url',
            'profile_picture', 'role', 'full_name_professor'
        ]

    def get_profile_picture_url(self, obj):
        request = self.context.get('request')
        if obj.profile_picture and request:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None

    def get_full_name_professor(self, obj):
        # Adjust as needed for your User model
        return f"{obj.first_name} {obj.last_name}"

class UserDashboardSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'full_name', 'profile_picture', 'profile_picture_url']

    def get_profile_picture_url(self, obj):
        request = self.context.get('request')
        if obj.profile_picture and request:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None

    def get_full_name_professor(self, obj):
        # Call the model method, or use the "full_name" property
        return obj.full_name
