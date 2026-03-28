from rest_framework import serializers
from .models import Hardware, Rental

class HardwareSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hardware
        fields = '__all__'

class RentalSerializer(serializers.ModelSerializer):
    hardware_details = HardwareSerializer(source='hardware', read_only=True)

    class Meta:
        model = Rental
        fields = '__all__'
        #read_only_fields = ['user', 'rented_at', 'returned_at', 'is_active']

from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'is_staff', 'is_active']
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
