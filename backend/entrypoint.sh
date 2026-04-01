#!/bin/sh
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Loading seed data..."
python manage.py load_seed_data seed_data.json || true

echo "Creating superuser..."

python manage.py shell << EOF
import os
from django.contrib.auth import get_user_model

User = get_user_model()

email = os.getenv("DJANGO_SUPERUSER_EMAIL")
password = os.getenv("DJANGO_SUPERUSER_PASSWORD")

if email and password:
    if not User.objects.filter(email=email).exists():
        User.objects.create_superuser(
            email=email,
            password=password
        )
EOF

echo "Starting server..."
gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000}