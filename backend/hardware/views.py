import json
from google import genai
from google.genai import types
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import Hardware, Rental
from .serializers import HardwareSerializer, RentalSerializer, UserSerializer, CustomTokenObtainPairSerializer
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
            '''
            if hardware.notes:
                blocked_words = ['swelling', 'damage', 'service']
                notes_lower = hardware.notes.lower()
                # Use regex or simple string match to block words
                if any(word in notes_lower for word in blocked_words):
                    return Response({'detail': 'Equipment requires service and cannot be rented.'}, status=status.HTTP_400_BAD_REQUEST)
            '''
                    
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

User = get_user_model()

class AdminHardwareViewSet(viewsets.ModelViewSet):
    queryset = Hardware.objects.all()
    serializer_class = HardwareSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['status', 'brand', 'name']

    def update(self, request, *args, **kwargs):
        # get hardware from db
        instance = self.get_object()
        
        # check what new status admin is sending in the form
        new_status = request.data.get('status', instance.status)

        # GUARD: protecting business logic! 
        # If hardware is in use, and admin tries to change status to Repair
        if instance.status == 'In Use' and new_status != 'In Use':
            return Response(
                {"detail": "Cannot change the status of hardware that is currently rented. User must return it first."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # If hardware is not in use (or admin is not changing the status, but only notes/serial number),
        # allow DRF to save to db normally
        return super().update(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def mark_in_repair(self, request, pk=None):
        with transaction.atomic():
            hardware = Hardware.objects.select_for_update().filter(pk=pk).first()
            if not hardware:
                return Response({'detail': 'Equipment not found.'}, status=status.HTTP_404_NOT_FOUND)
                
            # GUARD: cant send an item which is currently in use
            if hardware.status == 'In Use':
                return Response(
                    {'detail': 'Equipment is currently in use. It must be returned before it can be marked for repair.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # TOGGLE OFF: if (in repair -> available)
            if hardware.status == 'Repair':
                hardware.status = 'Available'
                hardware.save(update_fields=['status'])
                return Response({'detail': 'Equipment is now available.'}, status=status.HTTP_200_OK)
                
            # TOGGLE ON: if (available -> in repair)
            if hardware.status == 'Available':
                hardware.status = 'Repair'
                hardware.save(update_fields=['status'])
                return Response({'detail': 'Equipment marked for repair successfully.'}, status=status.HTTP_200_OK)
            
            return Response({'detail': 'Equipment marked for repair successfully.'}, status=status.HTTP_200_OK)

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

from rest_framework.views import APIView

class UserMeView(APIView):
    """
    Returns the data of the currently logged-in user based on the JWT token.
    Available to any logged-in user (not just admins).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

from rest_framework_simplejwt.views import TokenObtainPairView
from django.conf import settings


# 2. Custom Login View
class CookieTokenObtainPairView(TokenObtainPairView):
    """
    Overwrites default login, so that tokens are saved in secure cookies (httpOnly)
    """
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')

            # set cookie access token
            response.set_cookie(
                'access_token',
                access_token,
                max_age=24 * 60 * 60,  # 1 day (according to SIMPLE_JWT)
                httponly=True,
                samesite='Lax',
                secure=False, # Change to True in production (requires HTTPS)
            )
            
            # set cookie refresh token
            response.set_cookie(
                'refresh_token',
                refresh_token,
                max_age=7 * 24 * 60 * 60, # 7 days
                httponly=True,
                samesite='Lax',
                secure=False,
            )
            
            # Security: We remove tokens from the JSON body
            del response.data['access']
            del response.data['refresh']
            response.data['detail'] = 'Successfully logged in.'

        return response

# 3. Custom Logout View
class LogoutView(APIView):
    """
    Deletes cookies during logout.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        response = Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token', samesite='Lax')
        response.delete_cookie('refresh_token', samesite='Lax')
        return response

# SEMANTIC SEARCH
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def semantic_search(request):
    """
    Takes a natural language query, asks Gemini to find matching hardware IDs,
    and returns the filtered hardware list.
    """
    # initializing the client
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    user_query = request.data.get('query')
    if not user_query:
        return Response({"error": "Please provide a search query!"}, status=status.HTTP_400_BAD_REQUEST)

    # fetch basic data including status so AI knows what is available
    hardware_list = list(Hardware.objects.all().values('id', 'name', 'brand', 'status'))
    
    # crafting the prompt
    prompt = f"""
    You are an IT assistant in an equipment rental system. 
    The user is asking for: "{user_query}".
    Here is our hardware database: {json.dumps(hardware_list)}.
    Return ONLY and EXCLUSIVELY a JSON array with the ID numbers of the equipment that best matches the query. 
    Take into account the 'status' field. If the user wants to rent something, prioritize 'Available' devices.
    """

    try:
        # calling the model through the client object
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=prompt,
            # forcing the model to return a pure json
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        # forced application/json -> response.text is ready to parse
        matched_ids = json.loads(response.text)

        # fetching full objects from the DB based on the selected IDs
        results = Hardware.objects.filter(id__in=matched_ids)
        serializer = HardwareSerializer(results, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except json.JSONDecodeError:
        return Response({"error": "AI returned an invalid format. Try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        # added str(e) for debugging
        return Response({"error": "AI service is currently unavailable.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)