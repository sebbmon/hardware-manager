from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Hardware, Rental
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class HardwareSerializer(serializers.ModelSerializer):
    serial_number = serializers.CharField(allow_blank=True, allow_null=True, required=False)

    class Meta:
        model = Hardware
        fields = '__all__'

    def validate_serial_number(self, value):
        if not value or value.strip() == "":
            return None
        return value

class RentalSerializer(serializers.ModelSerializer):
    hardware = HardwareSerializer(read_only=True)

    class Meta:
        model = Rental
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'is_staff', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        # Get default token (with ID and expiration date)
        token = super().get_token(user)

        # ADD OWN FLAG FOR SECURITY:
        token['is_staff'] = user.is_staff

        return token