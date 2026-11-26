FROM python:3.12-slim

# set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .

# install python dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Build-time only placeholder so management commands can import settings;
# not persisted in the image. The real SECRET_KEY comes from the runtime env.
# Migrations are committed (home/migrations); never run makemigrations here.
RUN SECRET_KEY=build-time-placeholder python manage.py collectstatic --noinput

# SQLite lives on a volume so data survives container restarts
ENV SQLITE_PATH=/data/db.sqlite3
VOLUME /data

# At start-up (not at image build): apply migrations to the persistent DB,
# generate the API app (generate-api needs migrated tables), then run gunicorn
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py generate-api -f && exec gunicorn --config gunicorn-cfg.py core.wsgi"]
