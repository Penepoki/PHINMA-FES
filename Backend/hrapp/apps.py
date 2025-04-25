from django.apps import AppConfig


class HrappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'hrapp'

    def ready(self):
        import hrapp.signals.user_signals  # Ensure signals are loaded
