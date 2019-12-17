from rest_framework import serializers
from rest_framework_jwt.settings import api_settings
from meetup.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email',)

class UserSerializerWithToken(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    email = serializers.EmailField(required=True)
    token = serializers.SerializerMethodField()
    first_name = serializers.CharField(max_length=255)
    password = serializers.CharField(min_length=2)

    def get_token(self, obj):
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

        payload = jwt_payload_handler(obj)
        token = jwt_encode_handler(payload)
        return token

    def create(self, validated_data):
        user = User.objects.create_user(validated_data['email'], validated_data['first_name'], password=validated_data['password'])
        return user

    class Meta:
        model = User
        fields = ('id', 'token', 'email', 'first_name', 'password')

    

