import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth.forms import UserCreationForm
from hardware.models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ('email',)

form = CustomUserCreationForm()
print("Form initialized successfully!")
print(form.fields.keys())
