FROM python:3.9

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY requirements.txt .

# install python dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Build-time only placeholder so management commands can import settings;
# not persisted in the image. The real SECRET_KEY comes from the runtime env.
RUN SECRET_KEY=build-time-placeholder python manage.py makemigrations \
 && SECRET_KEY=build-time-placeholder python manage.py generate-api -f

# The database is created at start-up (not baked into the image), then gunicorn
CMD ["sh", "-c", "python manage.py migrate --noinput && exec gunicorn --config gunicorn-cfg.py core.wsgi"]
