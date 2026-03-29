from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Hardware, Rental, CustomUser

# 1. custom user registration
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    
    list_display = ('email', 'is_staff', 'is_superuser', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    search_fields = ('email',)
    ordering = ('email',)
    
    # edit form
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    # add form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'is_staff', 'is_active')}
        ),
    )

# 2. hardware registration
@admin.register(Hardware)
class HardwareAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'status', 'purchase_date')
    list_filter = ('status', 'brand')
    search_fields = ('name', 'brand', 'notes')

# 3. rental registration
@admin.register(Rental)
class RentalAdmin(admin.ModelAdmin):
    list_display = ('hardware', 'user', 'rented_at', 'returned_at', 'is_active')
    list_filter = ('is_active', 'rented_at')
    search_fields = ('hardware__name', 'user__email')