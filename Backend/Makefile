.PHONY: help install migrate makemigrations runserver shell test createsuperuser collectstatic lint format clean reset-db backup-db restore-db requirements check coverage

# Default target
help:
	@echo "Available commands:"
	@echo "  install          - Install dependencies using pipenv"
	@echo "  install-dev      - Install development dependencies"
	@echo "  migrate          - Apply database migrations"
	@echo "  makemigrations   - Create new migrations"
	@echo "  runserver        - Start development server"
	@echo "  shell            - Open Django shell"
	@echo "  test             - Run tests"
	@echo "  test-coverage    - Run tests with coverage report"
	@echo "  createsuperuser  - Create Django superuser"
	@echo "  collectstatic    - Collect static files"
	@echo "  lint             - Run code linting"
	@echo "  format           - Format code with black"
	@echo "  clean            - Clean up cache and temp files"
	@echo "  reset-db         - Reset database (WARNING: destroys data)"
	@echo "  backup-db        - Backup database"
	@echo "  requirements     - Generate requirements.txt"
	@echo "  check            - Run Django system checks"
	@echo "  setup            - Complete project setup"

# Environment setup
install:
	pipenv install

install-dev:
	pipenv install --dev

# Database operations
migrate:
	pipenv run python manage.py migrate

makemigrations:
	pipenv run python manage.py makemigrations

reset-db:
	@echo "WARNING: This will destroy all data in the database!"
	pipenv run python manage.py flush --noinput
	pipenv run python manage.py migrate
	@echo "Database reset complete."

backup-db:
	@if not exist "backups" mkdir backups
	@powershell -Command "$$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'; pipenv run python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission | Out-File -Encoding utf8 backups/db_backup_$$timestamp.json; Write-Host 'Database backed up to backups/db_backup_'$$timestamp'.json'"

# Development server
runserver:
	pipenv run python manage.py runserver

runserver-prod:
	pipenv run python manage.py runserver 0.0.0.0:8000

# Django utilities
shell:
	pipenv run python manage.py shell

createsuperuser:
	pipenv run python manage.py createsuperuser

collectstatic:
	pipenv run python manage.py collectstatic --noinput

check:
	pipenv run python manage.py check

# Testing
test:
	pipenv run python manage.py test

test-coverage:
	pipenv run coverage run --source=. manage.py test
	pipenv run coverage report
	pipenv run coverage html

# Code quality
lint:
	pipenv run flake8 .

format:
	pipenv run black .
	pipenv run isort .

format-check:
	pipenv run black --check .
	pipenv run isort --check-only .

# Utility commands
clean:
	@powershell -Command "Get-ChildItem -Path . -Recurse -Name '*.pyc' | Remove-Item -Force"
	@powershell -Command "Get-ChildItem -Path . -Recurse -Name '__pycache__' -Directory | Remove-Item -Recurse -Force"
	@powershell -Command "if (Test-Path '.coverage') { Remove-Item '.coverage' -Force }"
	@powershell -Command "if (Test-Path 'htmlcov') { Remove-Item 'htmlcov' -Recurse -Force }"

requirements:
	pipenv requirements > requirements.txt

# Setup commands
setup: install-dev makemigrations migrate
	@echo "Project setup complete!"
	@echo "Next steps:"
	@echo "  1. Create a superuser: make createsuperuser"
	@echo "  2. Start the server: make runserver"

# Quick commands for common tasks
quick-test:
	pipenv run python manage.py test --keepdb --parallel

quick-migrate: makemigrations migrate

# Performance and debugging
show-urls:
	pipenv run python manage.py show_urls

show-migrations:
	pipenv run python manage.py showmigrations

# Security
check-security:
	pipenv run python manage.py check --deploy

audit-packages:
	pipenv check