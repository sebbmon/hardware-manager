from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HardwareViewSet, RentalViewSet, AdminHardwareViewSet, AdminUserViewSet, UserMeView

router = DefaultRouter()
router.register(r'hardware', HardwareViewSet, basename='hardware')
router.register(r'my-rentals', RentalViewSet, basename='rental')

admin_router = DefaultRouter()
admin_router.register(r'hardware', AdminHardwareViewSet, basename='admin-hardware')
admin_router.register(r'users', AdminUserViewSet, basename='admin-users')

urlpatterns = [
    path('users/me/', UserMeView.as_view(), name='user-me'),
    path('', include(router.urls)),
    path('admin/', include(admin_router.urls)),
]
