from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Hardware(models.Model):
    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('In Use', 'In Use'),
        ('Repair', 'Repair'),
    ]

    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=255, default='Unknown')
    purchase_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Available')
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.brand})"

class Rental(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rentals')
    hardware = models.ForeignKey(Hardware, on_delete=models.CASCADE, related_name='rentals')
    rented_at = models.DateTimeField(auto_now_add=True)
    returned_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.hardware.name} rented by {self.user.username}"
