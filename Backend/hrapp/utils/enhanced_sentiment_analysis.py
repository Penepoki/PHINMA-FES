import os
import json
import re
from typing import Any, Dict, List, Optional, Tuple
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SaintJudeDjango.settings')
django.setup()

from hrapp.models.evaluation_models import Timestamp, StudentEvaluationResponse, StudentEvaluationQuestion

# Import both sentiment analysis approaches
try:
    from .sentiment_analysis_test import (
        analyze_text_sentiment as analyze_text_sentiment_bert,
        score_mcq_answer,
        _safe_lower,
        collect_timestamp_comments,
        analyze_timestamp_comments
    )
    BERT_AVAILABLE = True
except ImportError as e:
    print(f"[WARNING] BERT sentiment analysis not available: {e}")
    BERT_AVAILABLE = False

try:
    from .ml_sentiment_analysis import (
        analyze_text_sentiment_lr,
        get_model_info,
        train_sentiment_model
    )
    LR_AVAILABLE = True
except ImportError as e:
    print(f"[WARNING] Logistic Regression sentiment analysis not available: {e}")
    LR_AVAILABLE = False


############################################################
# Enhanced Sentiment Analysis with Model Selection
############################################################

class SentimentAnalysisManager:
    """
    Manager class that can switch between different sentiment analysis models.
    """
    
    def __init__(self, preferred_model: str = "auto"):
        """
        Initialize with preferred model.
        
        Args:
            preferred_model: "bert", "logistic_regression", "lr", or "auto"
        """
        self.preferred_model = preferred_model.lower()
        self.available_models = self._check_available_models()
        self.current_model = self._select_model()
    
    def _check_available_models(self) -> Dict[str, bool]:
        """Check which models are available."""
        models = {
            "bert": BERT_AVAILABLE,
            "logistic_regression": LR_AVAILABLE
        }
        
        # Check if LR model is actually trained
        if LR_AVAILABLE:
            try:
                model_info = get_model_info()
                models["logistic_regression"] = model_info.get("is_trained", False)
            except:
                models["logistic_regression"] = False
        
        return models
    
    def _select_model(self) -> str:
        """Select the best available model based on preferences."""
        if self.preferred_model in ["lr", "logistic_regression"] and self.available_models.get("logistic_regression"):
            return "logistic_regression"
        elif self.preferred_model == "bert" and self.available_models.get("bert"):
            return "bert"
        elif self.preferred_model == "auto":
            # Auto-select: prefer trained LR model, fallback to BERT
            if self.available_models.get("logistic_regression"):
                return "logistic_regression"
            elif self.available_models.get("bert"):
                return "bert"
        
        # Fallback to any available model
        for model, available in self.available_models.items():
            if available:
                return model
        
        return "none"
    
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentiment using the selected model.
        """
        if not text or not isinstance(text, str):
            return {"label": "NEUTRAL", "score": 0.5, "points": 0, "model": "none"}
        
        try:
            if self.current_model == "logistic_regression" and LR_AVAILABLE:
                result = analyze_text_sentiment_lr(text)
                result["model"] = "LogisticRegression"
                return result
            elif self.current_model == "bert" and BERT_AVAILABLE:
                result = analyze_text_sentiment_bert(text)
                result["model"] = "DistilBERT"
                return result
            else:
                # Fallback to simple heuristic
                return self._heuristic_sentiment(text)
        except Exception as e:
            print(f"[WARNING] Sentiment analysis failed: {e}")
            return self._heuristic_sentiment(text)
    
    def _heuristic_sentiment(self, text: str) -> Dict[str, Any]:
        """Simple heuristic sentiment analysis as last resort."""
        positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 
                         'outstanding', 'perfect', 'love', 'like', 'enjoy', 'satisfied', 'happy']
        negative_words = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'poor',
                         'disappointing', 'unsatisfied', 'unhappy', 'frustrated', 'annoyed']
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            return {"label": "POSITIVE", "score": 0.7, "points": 1, "model": "Heuristic"}
        elif negative_count > positive_count:
            return {"label": "NEGATIVE", "score": 0.7, "points": -1, "model": "Heuristic"}
        else:
            return {"label": "NEUTRAL", "score": 0.5, "points": 0, "model": "Heuristic"}
    
    def get_model_status(self) -> Dict[str, Any]:
        """Get status of all available models."""
        return {
            "current_model": self.current_model,
            "preferred_model": self.preferred_model,
            "available_models": self.available_models,
            "model_details": {
                "bert": {"available": BERT_AVAILABLE, "description": "DistilBERT pre-trained model"},
                "logistic_regression": {
                    "available": self.available_models.get("logistic_regression", False),
                    "description": "Custom Logistic Regression with TF-IDF",
                    "trained": self.available_models.get("logistic_regression", False)
                }
            }
        }


# Global sentiment manager instance
sentiment_manager = SentimentAnalysisManager()


############################################################
# Enhanced Analysis Functions
############################################################

def analyze_text_sentiment_enhanced(text: str, model: Optional[str] = None) -> Dict[str, Any]:
    """
    Enhanced sentiment analysis that can use different models.
    
    Args:
        text: Text to analyze
        model: Specific model to use ("bert", "lr", or None for default)
    
    Returns:
        Sentiment analysis result with model information
    """
    global sentiment_manager
    
    if model:
        # Create temporary manager with specific model preference
        temp_manager = SentimentAnalysisManager(preferred_model=model)
        return temp_manager.analyze_sentiment(text)
    else:
        return sentiment_manager.analyze_sentiment(text)


def process_student_evaluations_enhanced(model: Optional[str] = None) -> Dict[str, Any]:
    """
    Enhanced version that supports multiple sentiment analysis models.
    
    Args:
        model: Specific model to use for text sentiment analysis
    
    Returns:
        Complete evaluation results with model information
    """
    mcq_scores: List[Dict[str, Any]] = []
    text_sentiments: List[Dict[str, Any]] = []

    for resp in StudentEvaluationResponse.objects.all():
        q: Optional[StudentEvaluationQuestion] = getattr(resp, 'student_eval_question', None)
        qtype = _safe_lower(getattr(q, 'type', None)) if q else ""
        question_text = getattr(q, 'question', None) if q else ""
        answer = getattr(resp, 'answer', None)
        evaluation_id = getattr(resp, 'student_evaluation_id', None)
        question_id = getattr(q, 'id', None) if q else None

        if qtype == "mcq":
            points, meta = score_mcq_answer(q, answer)
            mcq_scores.append({
                "student_evaluation_id": evaluation_id,
                "student_eval_question_id": question_id,
                "question": question_text,
                "answer": answer,
                "points": points,
                "meta": meta,
            })
        elif qtype == "text":
            # Use enhanced sentiment analysis
            text_input = f"Question: {question_text}\nAnswer: {answer}" if question_text else str(answer)
            sres = analyze_text_sentiment_enhanced(text_input, model=model)
            text_sentiments.append({
                "student_evaluation_id": evaluation_id,
                "student_eval_question_id": question_id,
                "question": question_text,
                "answer": answer,
                "sentiment": sres.get("label"),
                "confidence": sres.get("score"),
                "points": sres.get("points"),
                "model_used": sres.get("model"),
            })

    total_mcq = float(sum(item.get("points", 0.0) for item in mcq_scores))
    total_text = float(sum(item.get("points", 0.0) for item in text_sentiments))

    return {
        "mcq_scores": mcq_scores,
        "text_sentiments": text_sentiments,
        "totals": {
            "sum_mcq": total_mcq,
            "sum_text": total_text,
            "overall": total_mcq + total_text,
        },
        "model_status": sentiment_manager.get_model_status(),
        "analysis_summary": {
            "total_mcq_responses": len(mcq_scores),
            "total_text_responses": len(text_sentiments),
            "text_sentiment_breakdown": {
                "positive": sum(1 for item in text_sentiments if item.get('sentiment') == 'POSITIVE'),
                "negative": sum(1 for item in text_sentiments if item.get('sentiment') == 'NEGATIVE'),
                "neutral": sum(1 for item in text_sentiments if item.get('sentiment') == 'NEUTRAL'),
            }
        }
    }


def analyze_timestamp_comments_enhanced(comments: List[Dict[str, Any]], model: Optional[str] = None) -> Dict[str, Any]:
    """
    Enhanced timestamp comment analysis with model selection.
    """
    promoter: List[Dict[str, Any]] = []
    delimiter: List[Dict[str, Any]] = []
    detailed: List[Dict[str, Any]] = []

    for comment in comments:
        text = comment.get('text')
        if not text:
            continue
        
        res = analyze_text_sentiment_enhanced(text, model=model)
        item = {
            **comment, 
            "sentiment": res["label"], 
            "confidence": res["score"], 
            "points": res["points"],
            "model_used": res.get("model")
        }
        detailed.append(item)
        
        if res["label"] == "NEGATIVE":
            delimiter.append(item)
        else:
            promoter.append(item)

    return {
        "promoter": promoter,
        "delimiter": delimiter,
        "detailed": detailed,
        "totals": {
            "sum_points": float(sum(x.get("points", 0.0) for x in detailed))
        },
        "model_used": model or sentiment_manager.current_model
    }


def compare_sentiment_models(text_samples: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Compare results from different sentiment analysis models.
    
    Args:
        text_samples: List of texts to analyze. If None, uses default samples.
    
    Returns:
        Comparison results across available models
    """
    if text_samples is None:
        text_samples = [
            "This course was excellent and very helpful!",
            "I really enjoyed the learning experience.",
            "The material was confusing and poorly explained.",
            "Average course, nothing special.",
            "Outstanding instructor and great content!",
            "I hate this class, it's boring and useless.",
            "The professor is knowledgeable and explains things clearly.",
            "Difficult to understand, needs improvement."
        ]
    
    results = {
        "text_samples": text_samples,
        "model_comparisons": [],
        "available_models": sentiment_manager.available_models
    }
    
    for text in text_samples:
        comparison = {"text": text, "results": {}}
        
        # Test with different models
        for model_name in ["bert", "logistic_regression"]:
            if sentiment_manager.available_models.get(model_name):
                try:
                    result = analyze_text_sentiment_enhanced(text, model=model_name)
                    comparison["results"][model_name] = result
                except Exception as e:
                    comparison["results"][model_name] = {"error": str(e)}
        
        results["model_comparisons"].append(comparison)
    
    return results


if __name__ == "__main__":
    # Example usage and model comparison
    print("=== Enhanced Sentiment Analysis System ===")
    
    # Show model status
    status = sentiment_manager.get_model_status()
    print(f"Model Status: {json.dumps(status, indent=2)}")
    
    # Compare models if multiple are available
    if sum(sentiment_manager.available_models.values()) > 1:
        print("\n=== Model Comparison ===")
        comparison = compare_sentiment_models()
        print(json.dumps(comparison, indent=2))
    
    # Run enhanced analysis
    print("\n=== Enhanced Student Evaluation Analysis ===")
    results = process_student_evaluations_enhanced()
    
    # Print summary
    print(f"Current Model: {results['model_status']['current_model']}")
    print(f"MCQ Total: {results['totals']['sum_mcq']:.2f}")
    print(f"Text Sentiment Total: {results['totals']['sum_text']:.2f}")
    print(f"Overall Score: {results['totals']['overall']:.2f}")
    
    # Print analysis summary
    summary = results['analysis_summary']
    print(f"\nAnalysis Summary:")
    print(f"  MCQ Responses: {summary['total_mcq_responses']}")
    print(f"  Text Responses: {summary['total_text_responses']}")
    print(f"  Sentiment Breakdown:")
    breakdown = summary['text_sentiment_breakdown']
    print(f"    Positive: {breakdown['positive']}")
    print(f"    Negative: {breakdown['negative']}")
    print(f"    Neutral: {breakdown['neutral']}")