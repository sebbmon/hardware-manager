#!/bin/sh
set -e

echo "=== Running migrations ==="
python manage.py migrate --noinput

echo "=== Optional seed data ==="
if [ "$RUN_SEED" = "true" ]; then
  echo "Seed enabled"
  python manage.py load_seed_data || echo "Seed skipped (already exists or failed safely)"
else
  echo "Seed disabled"
fi

echo "=== Creating superuser (idempotent) ==="

python manage.py shell << EOF || echo "Superuser step skipped safely"
import os
from django.contrib.auth import get_user_model

User = get_user_model()

email = os.getenv("DJANGO_SUPERUSER_EMAIL")
password = os.getenv("DJANGO_SUPERUSER_PASSWORD")

if email and password:
    try:
        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(
                email=email,
                password=password
            )
            print("Superuser created")
        else:
            print("Superuser already exists")
    except Exception as e:
        print("Superuser creation error:", e)
EOF

echo "=== Starting server ==="
exec gunicorn config.wsgi:application \
  --bind 0.0.0.0:${PORT:-8000} \
  --workers 2 \
  --timeout 120