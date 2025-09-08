from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)

class HrappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'hrapp'
    
    def ready(self):
        """
        Initialize the app when Django starts.
        This is where we enable smart retraining signals.
        """
        try:
            # Import smart retraining to enable signal handlers
            from hrapp.utils import smart_retraining
            logger.info("✅ Smart retraining system enabled - automatic ML model retraining is active")
            
            # Log configuration
            from hrapp.utils.smart_retraining import smart_retrain_manager
            config = {
                'min_new_samples_threshold': smart_retrain_manager.min_new_samples_threshold,
                'max_days_without_retrain': smart_retrain_manager.max_days_without_retrain,
                'cooldown_minutes': smart_retrain_manager.cooldown_minutes
            }
            logger.info(f"Smart retraining configuration: {config}")
            
        except Exception as e:
            logger.warning(f"⚠️ Smart retraining system could not be enabled: {e}")
            logger.info("Manual training will still be available via management commands and API")