# lightweight
FROM python:3.12-slim

# buffer off
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# req install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy rest
COPY . .

# collect static files
RUN python manage.py collectstatic --noinput

#CMD sh -c "python manage.py migrate && python manage.py createsuperuser --noinput || true && gunicorn config.wsgi --bind 0.0.0.0:8000"
CMD gunicorn config.wsgi:application --bind 0.0.0.0:8000