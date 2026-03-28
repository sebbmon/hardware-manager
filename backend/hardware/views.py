from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import Hardware, Rental
from .serializers import HardwareSerializer, RentalSerializer
import re
#NOT FOR PRODUCTION
from rest_framework.permissions import AllowAny

class HardwareViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Hardware.objects.all()
    serializer_class = HardwareSerializer
    #PRODUCTION
    permission_classes = [permissions.IsAuthenticated]
    #LOCALHOST
    #permission_classes = [AllowAny]
    filterset_fields = ['status', 'brand', 'name']
    
    @action(detail=True, methods=['post'])
    def rent(self, request, pk=None):
        with transaction.atomic():
            # Refresh from db and lock row to avoid race conditions
            hardware = Hardware.objects.select_for_update().filter(pk=pk).first()
            if not hardware:
                return Response({'detail': 'Equipment not found.'}, status=status.HTTP_404_NOT_FOUND)
            
            # Guard: check if status == 'Available'
            if hardware.status != 'Available':
                return Response({'detail': 'Equipment is not available for rent.'}, status=status.HTTP_400_BAD_REQUEST)
                
            # Guard: check for blocked words in notes
            if hardware.notes:
                blocked_words = ['swelling', 'damage', 'service']
                notes_lower = hardware.notes.lower()
                # Use regex or simple string match to block words
                if any(word in notes_lower for word in blocked_words):
                    return Response({'detail': 'Equipment requires service and cannot be rented.'}, status=status.HTTP_400_BAD_REQUEST)
                    
            # Change status and create rental
            hardware.status = 'In Use'
            hardware.save(update_fields=['status'])
            
            Rental.objects.create(
                user=request.user,
                hardware=hardware,
                is_active=True
            )
            
            return Response({'detail': 'Equipment rented successfully.'}, status=status.HTTP_200_OK)
            
    @action(detail=True, methods=['post'])
    def return_hardware(self, request, pk=None):
        with transaction.atomic():
            hardware = Hardware.objects.select_for_update().filter(pk=pk).first()
            if not hardware:
                return Response({'detail': 'Equipment not found.'}, status=status.HTTP_404_NOT_FOUND)
            
            # Guard: must have status 'In Use'
            if hardware.status != 'In Use':
                return Response({'detail': 'Equipment is not currently in use.'}, status=status.HTTP_400_BAD_REQUEST)
                
            # Guard: active rental for this user
            rental = Rental.objects.filter(hardware=hardware, user=request.user, is_active=True).first()
            if not rental:
                return Response({'detail': 'You do not have an active rental for this equipment.'}, status=status.HTTP_400_BAD_REQUEST)
                
            # Action: Change status to Available, close Rental
            hardware.status = 'Available'
            hardware.save(update_fields=['status'])
            
            rental.is_active = False
            rental.returned_at = timezone.now()
            rental.save(update_fields=['is_active', 'returned_at'])
            
            return Response({'detail': 'Equipment returned successfully.'}, status=status.HTTP_200_OK)

class RentalViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RentalSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # "My rentals": active rentals for logged in user
        return Rental.objects.filter(user=self.request.user, is_active=True)

from django.contrib.auth import get_user_model
from .serializers import UserSerializer

User = get_user_model()

class AdminHardwareViewSet(viewsets.ModelViewSet):
    queryset = Hardware.objects.all()
    serializer_class = HardwareSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['status', 'brand', 'name']
    
    @action(detail=True, methods=['post'])
    def mark_in_repair(self, request, pk=None):
        with transaction.atomic():
            hardware = Hardware.objects.select_for_update().filter(pk=pk).first()
            if not hardware:
                return Response({'detail': 'Equipment not found.'}, status=status.HTTP_404_NOT_FOUND)
                
            if hardware.status == 'In Use':
                # Closes active rental related to that hardware
                rental = Rental.objects.filter(hardware=hardware, is_active=True).first()
                if rental:
                    rental.is_active = False
                    rental.returned_at = timezone.now()
                    rental.save(update_fields=['is_active', 'returned_at'])
            
            # Forces repair status
            hardware.status = 'Repair'
            hardware.save(update_fields=['status'])
            
            return Response({'detail': 'Equipment marked for repair successfully.'}, status=status.HTTP_200_OK)

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
