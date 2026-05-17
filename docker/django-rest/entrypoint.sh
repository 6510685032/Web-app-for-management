#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Wait for the Postgres database to be ready before moving forward
echo "Waiting for postgres..."
# Uses Python's built-in socket library to wait for the port
while ! python -c "import socket; s = socket.socket(); s.connect(('postgres', int('5432')))" 2>/dev/null; do
  sleep 0.5
done
echo "PostgreSQL started"

echo "Create new migrations from API models..."
python manage.py makemigrations

echo "Applying database migrations..."
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Creating default superuser..."
python -c "
import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@admin.com', 'admin')
    print('  Superuser created: admin / admin')
else:
    print('  Superuser already exists')
"

echo "Starting server..."
exec python manage.py runserver 0.0.0.0:8000