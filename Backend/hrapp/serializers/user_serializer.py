from rest_framework import serializers
from hrapp.models.user_models import User

class UserSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()
    #Provides a URL for the Image

    class Meta:
        fields = [
            'id', 'email', 'last_name', 'first_name', 'profile_picture_url',
            'role'
        ] #DICT FOR FIELDS YOU WANT TO SHOW

    def get_profile_picture_url(self, obj):
        #GENERATE A FULLY QUALIFIED URL FOR THE USER'S PROFILE
        request = self.context.get('request')
        if obj.profile_picture and request:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None