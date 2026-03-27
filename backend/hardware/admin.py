from django.contrib import admin
from .models import Hardware, Rental

@admin.register(Hardware)
class HardwareAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'status', 'purchase_date')
    list_filter = ('status', 'brand')
    search_fields = ('name', 'brand', 'notes')

@admin.register(Rental)
class RentalAdmin(admin.ModelAdmin):
    list_display = ('hardware', 'user', 'rented_at', 'returned_at', 'is_active')
    list_filter = ('is_active', 'rented_at')
    search_fields = ('hardware__name', 'user__username')
