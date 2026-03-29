from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Hardware, Rental

User = get_user_model()

class HardwareSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hardware
        fields = '__all__'

class RentalSerializer(serializers.ModelSerializer):
    hardware = HardwareSerializer(read_only=True)

    class Meta:
        model = Rental
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Zmieniono 'username' na 'email'
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