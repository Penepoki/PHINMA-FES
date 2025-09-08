from rest_framework import serializers
from hrapp.models.user_models import User
from hrapp.utils import get_full_name
from django.conf import settings
import os
from pathlib import Path
from django.core.files.base import File



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
        if not request:
            return None
        pp = getattr(obj, 'profile_picture', None)
        name = getattr(pp, 'name', None)
        if not name:
            # Return a default placeholder hosted on the site
            return request.build_absolute_uri('/media/defaults/default.png')
        # If file exists in default storage, return its URL
        try:
            if pp.storage.exists(name):
                return request.build_absolute_uri(pp.url)
        except Exception:
            pass
        # Fallback: try to locate a copy under project root 'profile_pictures_root' and re-save into MEDIA_ROOT
        try:
            basename = os.path.basename(name)
            fallback_dir = Path(settings.BASE_DIR).parent / 'profile_pictures_root'
            fallback_path = fallback_dir / basename
            if fallback_path.exists():
                with open(fallback_path, 'rb') as f:
                    saved_name = pp.storage.save(f"profile_pictures/{basename}", File(f))
                # Update model field to new storage path
                obj.profile_picture.name = saved_name
                obj.save(update_fields=['profile_picture'])
                return request.build_absolute_uri(obj.profile_picture.url)
        except Exception:
            pass
        return request.build_absolute_uri('/media/defaults/default.png')


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
        if not request:
            return None
        pp = getattr(obj, 'profile_picture', None)
        name = getattr(pp, 'name', None)
        if not name:
            return None
        try:
            if pp.storage.exists(name):
                return request.build_absolute_uri(pp.url)
        except Exception:
            pass
        # Fallback attempt from project-level directory
        try:
            basename = os.path.basename(name)
            fallback_dir = Path(settings.BASE_DIR).parent / 'profile_pictures_root'
            fallback_path = fallback_dir / basename
            if fallback_path.exists():
                with open(fallback_path, 'rb') as f:
                    saved_name = pp.storage.save(f"profile_pictures/{basename}", File(f))
                obj.profile_picture.name = saved_name
                obj.save(update_fields=['profile_picture'])
                return request.build_absolute_uri(obj.profile_picture.url)
        except Exception:
            pass
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
        if request:
            if obj.profile_picture:
                try:
                    return request.build_absolute_uri(obj.profile_picture.url)
                except Exception:
                    pass
            return request.build_absolute_uri('/media/profile_pictures/default.jpg')
        return None

    def get_full_name_professor(self, obj):
        # Call the model method, or use the "full_name" property
        return obj.full_name
