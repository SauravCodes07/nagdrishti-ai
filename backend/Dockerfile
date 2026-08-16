# Production Dockerfile for NagDrishti AI Django Backend on Render
FROM python:3.12-slim

# Install system geospatial libraries (GDAL, GEOS, PROJ) for GeoDjango & PostGIS
RUN apt-get update && apt-get install -y --no-install-recommends \
    binutils \
    libproj-dev \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Set GDAL / GEOS environment paths
ENV GDAL_LIBRARY_PATH=/usr/lib/libgdal.so
ENV GEOS_LIBRARY_PATH=/usr/lib/libgeos_c.so
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Copy dependency definition and install
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend codebase
COPY . /app/

# Ensure media directory exists
RUN mkdir -p /app/media /app/staticfiles

# Expose server port (Render dynamically assigns PORT, default 8000)
EXPOSE 8000

# Run migrations and start Gunicorn WSGI server
CMD gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 3 --timeout 120
