import os
import json
import logging
import threading
import time
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from django.core.cache import cache
from django.conf import settings
from django.db import transaction
from .ml_sentiment_analysis import train_sentiment_model, get_model_info

# Configure logging
logger = logging.getLogger(__name__)

class ProductionMLTrainer:
    """
    Production-safe ML model trainer with proper resource management,
    concurrency control, and monitoring.
    """
    
    def __init__(self):
        self.training_lock_key = "ml_sentiment_training_lock"
        self.training_status_key = "ml_sentiment_training_status"
        self.last_training_key = "ml_sentiment_last_training"
        self.lock_timeout = 300  # 5 minutes
        
    def is_training_in_progress(self) -> bool:
        """Check if training is currently in progress."""
        return cache.get(self.training_lock_key, False)
    
    def get_training_status(self) -> Dict[str, Any]:
        """Get current training status."""
        return cache.get(self.training_status_key, {
            "status": "idle",
            "message": "No training in progress",
            "started_at": None,
            "progress": 0
        })
    
    def get_last_training_info(self) -> Dict[str, Any]:
        """Get information about the last training session."""
        return cache.get(self.last_training_key, {
            "completed_at": None,
            "success": None,
            "accuracy": None,
            "samples_used": None
        })
    
    def should_retrain(self, force: bool = False) -> bool:
        """
        Determine if model should be retrained based on various factors.
        """
        if force:
            return True
            
        # Check if model exists
        model_info = get_model_info()
        if not model_info.get("is_trained", False):
            return True
            
        # Check last training time (retrain weekly)
        last_training = self.get_last_training_info()
        if last_training.get("completed_at"):
            try:
                last_time = datetime.fromisoformat(last_training["completed_at"])
                if datetime.now() - last_time > timedelta(days=7):
                    return True
            except (ValueError, TypeError):
                pass
                
        # Check if there's new data (simplified check)
        # In production, you might want more sophisticated data change detection
        return False
    
    def acquire_training_lock(self) -> bool:
        """Acquire exclusive lock for training."""
        if cache.get(self.training_lock_key):
            return False
            
        # Set lock with timeout
        return cache.set(self.training_lock_key, True, timeout=self.lock_timeout)
    
    def release_training_lock(self):
        """Release training lock."""
        cache.delete(self.training_lock_key)
    
    def update_training_status(self, status: str, message: str, progress: int = 0):
        """Update training status in cache."""
        status_data = {
            "status": status,
            "message": message,
            "started_at": datetime.now().isoformat(),
            "progress": progress
        }
        cache.set(self.training_status_key, status_data, timeout=3600)  # 1 hour
        logger.info(f"ML Training Status: {status} - {message}")
    
    def train_model_safe(self, force: bool = False) -> Dict[str, Any]:
        """
        Safely train the model with proper error handling and resource management.
        """
        # Check if training is needed
        if not self.should_retrain(force) and not force:
            return {
                "success": False,
                "message": "Training not needed. Model is up to date.",
                "reason": "no_retrain_needed"
            }
        
        # Check if training is already in progress
        if self.is_training_in_progress():
            return {
                "success": False,
                "message": "Training is already in progress",
                "reason": "training_in_progress",
                "status": self.get_training_status()
            }
        
        # Acquire training lock
        if not self.acquire_training_lock():
            return {
                "success": False,
                "message": "Could not acquire training lock",
                "reason": "lock_failed"
            }
        
        try:
            self.update_training_status("starting", "Initializing training process", 10)
            
            # Pre-training checks
            self.update_training_status("checking", "Checking system resources", 20)
            
            # Check available memory (simplified)
            import psutil
            memory = psutil.virtual_memory()
            if memory.percent > 90:
                raise Exception("Insufficient memory for training (>90% used)")
            
            self.update_training_status("training", "Training model with current data", 50)
            
            # Perform actual training
            training_result = train_sentiment_model()
            
            if training_result.get("success"):
                self.update_training_status("completing", "Finalizing model", 90)
                
                # Store training results
                training_info = {
                    "completed_at": datetime.now(),  # Store as datetime object for smart retraining
                    "completed_at_iso": datetime.now().isoformat(),  # Also store ISO string
                    "success": True,
                    "accuracy": training_result.get("training_results", {}).get("accuracy"),
                    "samples_used": training_result.get("data_summary", {}).get("total_samples"),
                    "model_path": get_model_info().get("model_path"),
                    "trigger_type": getattr(self, '_current_trigger_type', 'manual')
                }
                cache.set(self.last_training_key, training_info, timeout=86400 * 30)  # 30 days
                
                self.update_training_status("completed", "Training completed successfully", 100)
                
                return {
                    "success": True,
                    "message": "Model trained successfully in production",
                    "training_results": training_result.get("training_results"),
                    "data_summary": training_result.get("data_summary"),
                    "completed_at": training_info["completed_at"]
                }
            else:
                raise Exception(training_result.get("message", "Training failed"))
                
        except Exception as e:
            error_msg = f"Training failed: {str(e)}"
            logger.error(error_msg, exc_info=True)
            
            self.update_training_status("failed", error_msg, 0)
            
            # Store failure info
            failure_info = {
                "completed_at": datetime.now().isoformat(),
                "success": False,
                "error": str(e),
                "samples_used": None
            }
            cache.set(self.last_training_key, failure_info, timeout=86400 * 7)  # 7 days
            
            return {
                "success": False,
                "message": error_msg,
                "error": str(e)
            }
        
        finally:
            # Always release the lock
            self.release_training_lock()
            
            # Clear status after delay
            threading.Timer(60.0, lambda: cache.delete(self.training_status_key)).start()
    
    def train_model_async(self, force: bool = False) -> Dict[str, Any]:
        """
        Start training in background thread (non-blocking).
        """
        if self.is_training_in_progress():
            return {
                "success": False,
                "message": "Training already in progress",
                "status": self.get_training_status()
            }
        
        def background_training():
            try:
                self.train_model_safe(force=force)
            except Exception as e:
                logger.error(f"Background training failed: {e}", exc_info=True)
        
        # Start training in background
        training_thread = threading.Thread(target=background_training, daemon=True)
        training_thread.start()
        
        return {
            "success": True,
            "message": "Training started in background",
            "status": "started",
            "check_status_url": "/api/ml/training-status/"
        }


# Global trainer instance
production_trainer = ProductionMLTrainer()


def train_model_production(force: bool = False, async_mode: bool = True) -> Dict[str, Any]:
    """
    Production-safe model training entry point.
    
    Args:
        force: Force retraining even if not needed
        async_mode: Train in background (recommended for production)
    
    Returns:
        Training result or status
    """
    global production_trainer
    
    if async_mode:
        return production_trainer.train_model_async(force=force)
    else:
        return production_trainer.train_model_safe(force=force)


def get_training_status() -> Dict[str, Any]:
    """Get current training status."""
    global production_trainer
    
    status = production_trainer.get_training_status()
    last_training = production_trainer.get_last_training_info()
    model_info = get_model_info()
    
    return {
        "current_training": status,
        "last_training": last_training,
        "model_info": model_info,
        "training_available": not production_trainer.is_training_in_progress()
    }


def schedule_periodic_retraining():
    """
    Schedule periodic model retraining (call this from Django management command or celery task).
    """
    global production_trainer
    
    try:
        if production_trainer.should_retrain():
            logger.info("Scheduled retraining triggered")
            result = production_trainer.train_model_async(force=False)
            return result
        else:
            logger.info("Scheduled retraining skipped - not needed")
            return {"message": "Retraining not needed"}
    except Exception as e:
        logger.error(f"Scheduled retraining failed: {e}", exc_info=True)
        return {"error": str(e)}


# Production safety checks
def production_safety_check() -> Dict[str, Any]:
    """
    Perform safety checks before allowing training in production.
    """
    checks = {
        "memory_available": False,
        "disk_space_available": False,
        "database_accessible": False,
        "cache_available": False,
        "training_lock_available": False
    }
    
    try:
        # Memory check
        import psutil
        memory = psutil.virtual_memory()
        checks["memory_available"] = memory.percent < 85
        
        # Disk space check
        disk = psutil.disk_usage('/')
        checks["disk_space_available"] = (disk.free / disk.total) > 0.1  # 10% free
        
        # Database check
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            checks["database_accessible"] = True
            
        # Cache check
        cache.set("test_key", "test_value", 10)
        checks["cache_available"] = cache.get("test_key") == "test_value"
        cache.delete("test_key")
        
        # Training lock check
        checks["training_lock_available"] = not production_trainer.is_training_in_progress()
        
    except Exception as e:
        logger.error(f"Safety check failed: {e}")
        return {
            "safe_to_train": False,
            "checks": checks,
            "error": str(e)
        }
    
    safe_to_train = all(checks.values())
    
    return {
        "safe_to_train": safe_to_train,
        "checks": checks,
        "recommendations": _get_safety_recommendations(checks) if not safe_to_train else []
    }


def _get_safety_recommendations(checks: Dict[str, bool]) -> list:
    """Get recommendations based on failed safety checks."""
    recommendations = []
    
    if not checks["memory_available"]:
        recommendations.append("Free up system memory before training")
    if not checks["disk_space_available"]:
        recommendations.append("Free up disk space (need at least 10% free)")
    if not checks["database_accessible"]:
        recommendations.append("Check database connection")
    if not checks["cache_available"]:
        recommendations.append("Check cache system (Redis/Memcached)")
    if not checks["training_lock_available"]:
        recommendations.append("Wait for current training to complete")
    
    return recommendations