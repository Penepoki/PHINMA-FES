"""
Smart retraining system that automatically triggers retraining based on data changes.
This module provides intelligent, data-driven automatic retraining for the ML sentiment analysis model.
"""

import os
import logging
from datetime import datetime, timedelta
from django.core.cache import cache
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from hrapp.models.evaluation_models import StudentEvaluationResponse, Timestamp
import threading

logger = logging.getLogger(__name__)

class SmartRetrainingManager:
    """
    Manages automatic retraining based on data changes and model performance.
    """
    
    def __init__(self):
        self.cache_key_prefix = "ml_smart_retrain"
        self.min_new_samples_threshold = 10  # Retrain after 10 new samples
        self.max_days_without_retrain = 7    # Force retrain after 7 days
        self.cooldown_minutes = 10           # Prevent too frequent checks
        
    def should_trigger_retraining(self) -> dict:
        """
        Determine if automatic retraining should be triggered.
        
        Returns:
            dict: Decision result with reasoning
        """
        try:
            reasons = []
            
            # Check if enough new data has been added
            new_data_result = self._has_sufficient_new_data()
            if new_data_result['should_retrain']:
                reasons.append(new_data_result['reason'])
            
            # Check if too much time has passed since last training
            age_result = self._is_model_too_old()
            if age_result['should_retrain']:
                reasons.append(age_result['reason'])
            
            # Check if model performance has degraded
            performance_result = self._has_performance_degraded()
            if performance_result['should_retrain']:
                reasons.append(performance_result['reason'])
            
            should_retrain = len(reasons) > 0
            
            return {
                'should_retrain': should_retrain,
                'reasons': reasons,
                'checks': {
                    'new_data': new_data_result,
                    'model_age': age_result,
                    'performance': performance_result
                },
                'timestamp': timezone.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error checking retraining conditions: {e}")
            return {
                'should_retrain': False,
                'reasons': [],
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    def _has_sufficient_new_data(self) -> dict:
        """Check if enough new data has been added since last training."""
        try:
            last_training_time = self._get_last_training_time()
            
            if not last_training_time:
                return {
                    'should_retrain': True,
                    'reason': 'No previous training detected - initial training needed',
                    'new_samples': 0,
                    'threshold': self.min_new_samples_threshold
                }
            
            # Count new responses since last training
            new_responses = StudentEvaluationResponse.objects.filter(
                created_at__gt=last_training_time
            ).count()
            
            # Count new timestamp comments since last training
            new_timestamps = Timestamp.objects.filter(
                created_at__gt=last_training_time
            ).exclude(
                student_comments__isnull=True,
                instructor_comments__isnull=True
            ).count()
            
            total_new_samples = new_responses + new_timestamps
            should_retrain = total_new_samples >= self.min_new_samples_threshold
            
            logger.info(f"New samples since last training: {total_new_samples} (threshold: {self.min_new_samples_threshold})")
            
            return {
                'should_retrain': should_retrain,
                'reason': f'Found {total_new_samples} new samples (threshold: {self.min_new_samples_threshold})' if should_retrain else f'Only {total_new_samples} new samples, threshold not met',
                'new_samples': total_new_samples,
                'threshold': self.min_new_samples_threshold,
                'breakdown': {
                    'new_responses': new_responses,
                    'new_timestamps': new_timestamps
                }
            }
            
        except Exception as e:
            logger.error(f"Error checking new data: {e}")
            return {
                'should_retrain': False,
                'reason': f'Error checking new data: {str(e)}',
                'error': str(e)
            }
    
    def _is_model_too_old(self) -> dict:
        """Check if model hasn't been retrained in too long."""
        try:
            last_training_time = self._get_last_training_time()
            
            if not last_training_time:
                return {
                    'should_retrain': True,
                    'reason': 'No previous training found - initial training needed',
                    'days_since_training': None,
                    'threshold_days': self.max_days_without_retrain
                }
            
            days_since_training = (timezone.now() - last_training_time).days
            should_retrain = days_since_training >= self.max_days_without_retrain
            
            return {
                'should_retrain': should_retrain,
                'reason': f'Model is {days_since_training} days old (max: {self.max_days_without_retrain} days)' if should_retrain else f'Model is {days_since_training} days old, still fresh',
                'days_since_training': days_since_training,
                'threshold_days': self.max_days_without_retrain,
                'last_training': last_training_time.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error checking model age: {e}")
            return {
                'should_retrain': False,
                'reason': f'Error checking model age: {str(e)}',
                'error': str(e)
            }
    
    def _has_performance_degraded(self) -> dict:
        """Check if model performance has degraded."""
        try:
            # This is a placeholder for future implementation
            # Could be implemented by:
            # 1. Tracking prediction confidence over time
            # 2. Comparing recent predictions with manual labels
            # 3. Monitoring user feedback on sentiment accuracy
            # 4. A/B testing different models
            
            return {
                'should_retrain': False,
                'reason': 'Performance monitoring not yet implemented',
                'confidence_trend': None,
                'accuracy_trend': None
            }
            
        except Exception as e:
            logger.error(f"Error checking performance: {e}")
            return {
                'should_retrain': False,
                'reason': f'Error checking performance: {str(e)}',
                'error': str(e)
            }
    
    def _get_last_training_time(self) -> datetime:
        """Get the timestamp of the last training session."""
        try:
            last_training_info = cache.get("ml_sentiment_last_training")
            
            if last_training_info and 'completed_at' in last_training_info:
                try:
                    # Handle both string and datetime formats
                    if isinstance(last_training_info['completed_at'], str):
                        return datetime.fromisoformat(last_training_info['completed_at'].replace('Z', '+00:00'))
                    else:
                        return last_training_info['completed_at']
                except (ValueError, TypeError) as e:
                    logger.warning(f"Error parsing last training time: {e}")
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting last training time: {e}")
            return None
    
    def trigger_smart_retraining(self) -> dict:
        """Trigger retraining if conditions are met."""
        try:
            # Check cooldown to prevent too frequent triggers
            cooldown_key = f"{self.cache_key_prefix}_cooldown"
            if cache.get(cooldown_key):
                return {
                    'success': False,
                    'message': 'Smart retraining check is in cooldown period',
                    'cooldown_remaining': cache.ttl(cooldown_key),
                    'timestamp': timezone.now().isoformat()
                }
            
            # Set cooldown
            cache.set(cooldown_key, True, timeout=self.cooldown_minutes * 60)
            
            # Check if retraining is needed
            decision = self.should_trigger_retraining()
            
            if decision['should_retrain']:
                logger.info(f"🔄 Smart retraining triggered. Reasons: {', '.join(decision['reasons'])}")
                
                # Import here to avoid circular imports
                from hrapp.utils.production_ml_training import train_model_production
                
                # Use async training to avoid blocking
                result = train_model_production(force=False, async_mode=True)
                
                if result.get('success'):
                    logger.info(f"✅ Smart retraining initiated: {result.get('message')}")
                    
                    # Store retraining trigger info
                    trigger_info = {
                        'triggered_at': timezone.now().isoformat(),
                        'trigger_reasons': decision['reasons'],
                        'trigger_checks': decision['checks']
                    }
                    cache.set(f"{self.cache_key_prefix}_last_trigger", trigger_info, timeout=86400 * 30)  # 30 days
                    
                    return {
                        'success': True,
                        'message': 'Smart retraining initiated successfully',
                        'reasons': decision['reasons'],
                        'training_result': result,
                        'timestamp': timezone.now().isoformat()
                    }
                else:
                    logger.warning(f"⚠️ Smart retraining failed to start: {result.get('message')}")
                    return {
                        'success': False,
                        'message': f"Smart retraining failed to start: {result.get('message')}",
                        'reasons': decision['reasons'],
                        'training_result': result,
                        'timestamp': timezone.now().isoformat()
                    }
            else:
                logger.info("ℹ️ Smart retraining not needed at this time")
                return {
                    'success': False,
                    'message': 'Smart retraining not needed at this time',
                    'decision': decision,
                    'timestamp': timezone.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"❌ Smart retraining failed: {str(e)}")
            return {
                'success': False,
                'message': f'Smart retraining failed: {str(e)}',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
    
    def get_retraining_status(self) -> dict:
        """Get current status of smart retraining system."""
        try:
            decision = self.should_trigger_retraining()
            last_trigger = cache.get(f"{self.cache_key_prefix}_last_trigger")
            cooldown_remaining = cache.ttl(f"{self.cache_key_prefix}_cooldown")
            
            return {
                'smart_retraining_enabled': True,
                'should_retrain': decision['should_retrain'],
                'reasons': decision.get('reasons', []),
                'last_check': decision.get('timestamp'),
                'last_trigger': last_trigger,
                'cooldown_active': cooldown_remaining > 0,
                'cooldown_remaining_seconds': max(0, cooldown_remaining),
                'configuration': {
                    'min_new_samples_threshold': self.min_new_samples_threshold,
                    'max_days_without_retrain': self.max_days_without_retrain,
                    'cooldown_minutes': self.cooldown_minutes
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting retraining status: {e}")
            return {
                'smart_retraining_enabled': False,
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }

# Global instance
smart_retrain_manager = SmartRetrainingManager()

# Signal handlers for automatic retraining
@receiver(post_save, sender=StudentEvaluationResponse)
def on_student_response_saved(sender, instance, created, **kwargs):
    """Trigger smart retraining when new student responses are added."""
    if created:  # Only for new responses
        logger.info(f"New student response added (ID: {instance.id}) - checking retraining conditions")
        
        # Use threading to avoid blocking the response
        def check_retraining():
            try:
                smart_retrain_manager.trigger_smart_retraining()
            except Exception as e:
                logger.error(f"Error in background retraining check: {e}")
        
        # Run in background thread
        thread = threading.Thread(target=check_retraining, daemon=True)
        thread.start()

@receiver(post_save, sender=Timestamp)
def on_timestamp_saved(sender, instance, created, **kwargs):
    """Trigger smart retraining when new timestamp comments are added."""
    if created and (instance.student_comments or instance.instructor_comments):
        logger.info(f"New timestamp comment added (ID: {instance.id}) - checking retraining conditions")
        
        # Use threading to avoid blocking the response
        def check_retraining():
            try:
                smart_retrain_manager.trigger_smart_retraining()
            except Exception as e:
                logger.error(f"Error in background retraining check: {e}")
        
        # Run in background thread
        thread = threading.Thread(target=check_retraining, daemon=True)
        thread.start()

# Manual trigger functions
def trigger_smart_retraining_now() -> dict:
    """Manually trigger smart retraining check (for testing or admin use)."""
    return smart_retrain_manager.trigger_smart_retraining()

def get_smart_retraining_status() -> dict:
    """Get current status of smart retraining system."""
    return smart_retrain_manager.get_retraining_status()

def check_retraining_conditions() -> dict:
    """Check if retraining conditions are met without triggering."""
    return smart_retrain_manager.should_trigger_retraining()

# Configuration functions
def configure_smart_retraining(min_samples: int = None, max_days: int = None, cooldown_minutes: int = None):
    """Configure smart retraining parameters."""
    global smart_retrain_manager
    
    if min_samples is not None:
        smart_retrain_manager.min_new_samples_threshold = min_samples
        logger.info(f"Updated min_new_samples_threshold to {min_samples}")
    
    if max_days is not None:
        smart_retrain_manager.max_days_without_retrain = max_days
        logger.info(f"Updated max_days_without_retrain to {max_days}")
    
    if cooldown_minutes is not None:
        smart_retrain_manager.cooldown_minutes = cooldown_minutes
        logger.info(f"Updated cooldown_minutes to {cooldown_minutes}")

# Utility functions for monitoring
def get_training_data_stats() -> dict:
    """Get statistics about available training data."""
    try:
        total_responses = StudentEvaluationResponse.objects.count()
        text_responses = StudentEvaluationResponse.objects.filter(
            student_eval_question__type__iexact='text'
        ).count()
        
        total_timestamps = Timestamp.objects.count()
        timestamps_with_comments = Timestamp.objects.exclude(
            student_comments__isnull=True,
            instructor_comments__isnull=True
        ).count()
        
        # Get recent data (last 7 days)
        recent_cutoff = timezone.now() - timedelta(days=7)
        recent_responses = StudentEvaluationResponse.objects.filter(
            created_at__gt=recent_cutoff
        ).count()
        recent_timestamps = Timestamp.objects.filter(
            created_at__gt=recent_cutoff
        ).exclude(
            student_comments__isnull=True,
            instructor_comments__isnull=True
        ).count()
        
        return {
            'total_data': {
                'student_responses': total_responses,
                'text_responses': text_responses,
                'timestamps': total_timestamps,
                'timestamps_with_comments': timestamps_with_comments,
                'estimated_training_samples': text_responses + timestamps_with_comments
            },
            'recent_data': {
                'student_responses_7d': recent_responses,
                'timestamps_7d': recent_timestamps,
                'total_new_samples_7d': recent_responses + recent_timestamps
            },
            'timestamp': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting training data stats: {e}")
        return {
            'error': str(e),
            'timestamp': timezone.now().isoformat()
        }