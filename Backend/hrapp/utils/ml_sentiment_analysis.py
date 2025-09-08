import os
import json
import re
import pickle
import numpy as np
import pandas as pd
from typing import Any, Dict, List, Optional, Tuple
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.pipeline import Pipeline
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SaintJudeDjango.settings')
django.setup()

from hrapp.models.evaluation_models import Timestamp, StudentEvaluationResponse, StudentEvaluationQuestion

############################################################
# Text Preprocessing Utilities
############################################################

def preprocess_text(text: str) -> str:
    """
    Clean and preprocess text for ML model.
    """
    if not isinstance(text, str):
        return ""
    
    # Convert to lowercase
    text = text.lower().strip()
    
    # Remove special characters but keep spaces
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove very short words (less than 2 characters)
    words = text.split()
    words = [word for word in words if len(word) >= 2]
    
    return ' '.join(words)


def extract_features_from_text(text: str) -> Dict[str, float]:
    """
    Extract additional features from text that might help with sentiment analysis.
    """
    if not isinstance(text, str):
        return {}
    
    # Basic text statistics
    word_count = len(text.split())
    char_count = len(text)
    avg_word_length = np.mean([len(word) for word in text.split()]) if text.split() else 0
    
    # Sentiment-related features
    positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 
                     'outstanding', 'perfect', 'love', 'like', 'enjoy', 'satisfied', 'happy']
    negative_words = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'poor',
                     'disappointing', 'unsatisfied', 'unhappy', 'frustrated', 'annoyed']
    
    text_lower = text.lower()
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    # Exclamation and question marks
    exclamation_count = text.count('!')
    question_count = text.count('?')
    
    return {
        'word_count': word_count,
        'char_count': char_count,
        'avg_word_length': avg_word_length,
        'positive_word_count': positive_count,
        'negative_word_count': negative_count,
        'exclamation_count': exclamation_count,
        'question_count': question_count,
        'sentiment_ratio': (positive_count - negative_count) / max(word_count, 1)
    }


############################################################
# Logistic Regression Sentiment Analyzer
############################################################

class LogisticRegressionSentimentAnalyzer:
    """
    Logistic Regression-based sentiment analyzer with TF-IDF vectorization.
    """
    
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or os.path.join(
            os.path.dirname(__file__), '..', 'ml_models', 'lr_sentiment_model.pkl'
        )
        self.pipeline = None
        self.is_trained = False
        
        # Create model directory if it doesn't exist
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        
        # Try to load existing model
        self.load_model()
    
    def create_pipeline(self) -> Pipeline:
        """
        Create the ML pipeline with TF-IDF vectorizer and Logistic Regression.
        """
        return Pipeline([
            ('tfidf', TfidfVectorizer(
                max_features=1000,  # Reduced for small datasets
                ngram_range=(1, 2),  # Use unigrams and bigrams
                stop_words='english',
                lowercase=True,
                min_df=1,  # Allow terms that appear in at least 1 document (for small datasets)
                max_df=0.95  # Ignore terms that appear in more than 95% of documents
            )),
            ('classifier', LogisticRegression(
                random_state=42,
                max_iter=1000,
                C=1.0,  # Regularization strength
                class_weight='balanced'  # Handle class imbalance
            ))
        ])
    
    def prepare_training_data(self, include_synthetic: bool = True) -> Tuple[List[str], List[int]]:
        """
        Prepare training data from the database.
        Returns texts and labels (1 for positive, 0 for negative).
        """
        texts = []
        labels = []
        
        # Collect text responses from student evaluations
        for resp in StudentEvaluationResponse.objects.all():
            q = getattr(resp, 'student_eval_question', None)
            if not q:
                continue
                
            qtype = getattr(q, 'type', '').lower().strip()
            if qtype != 'text':
                continue
                
            answer = getattr(resp, 'answer', None)
            if not answer or not isinstance(answer, str):
                continue
                
            question_text = getattr(q, 'question', '')
            # Combine question and answer for context
            full_text = f"{question_text} {answer}" if question_text else answer
            
            # Preprocess text
            processed_text = preprocess_text(full_text)
            if len(processed_text.split()) < 3:  # Skip very short texts
                continue
                
            texts.append(processed_text)
            
            # Simple heuristic labeling based on keywords (in real scenario, you'd have labeled data)
            # This is a basic approach - ideally you'd have human-labeled sentiment data
            label = self._heuristic_label(processed_text)
            labels.append(label)
        
        # Collect comments from timestamps
        for ts in Timestamp.objects.all():
            for comment_field in ['student_comments', 'instructor_comments']:
                comment = getattr(ts, comment_field, None)
                if isinstance(comment, str) and comment.strip():
                    processed_text = preprocess_text(comment.strip())
                    if len(processed_text.split()) >= 3:
                        texts.append(processed_text)
                        labels.append(self._heuristic_label(processed_text))
                elif isinstance(comment, dict):
                    text = comment.get('text') or comment.get('comment')
                    if isinstance(text, str) and text.strip():
                        processed_text = preprocess_text(text.strip())
                        if len(processed_text.split()) >= 3:
                            texts.append(processed_text)
                            labels.append(self._heuristic_label(processed_text))
        
        # Add synthetic training data if we don't have enough samples
        if include_synthetic and len(texts) < 20:
            synthetic_texts, synthetic_labels = self._generate_synthetic_training_data()
            texts.extend(synthetic_texts)
            labels.extend(synthetic_labels)
        
        return texts, labels
    
    def _generate_synthetic_training_data(self) -> Tuple[List[str], List[int]]:
        """
        Generate synthetic training data for educational sentiment analysis.
        This helps when you have insufficient real data.
        """
        synthetic_data = [
            # Positive examples (label = 1)
            ("The course was excellent and very informative", 1),
            ("I really enjoyed this class and learned a lot", 1),
            ("Great instructor who explains concepts clearly", 1),
            ("The material was well organized and easy to follow", 1),
            ("Outstanding teaching methods and engaging content", 1),
            ("This course exceeded my expectations completely", 1),
            ("The professor was helpful and always available for questions", 1),
            ("I found the assignments challenging but rewarding", 1),
            ("The course content was relevant and practical", 1),
            ("Excellent use of examples to illustrate concepts", 1),
            ("The instructor made complex topics easy to understand", 1),
            ("I would definitely recommend this course to others", 1),
            ("The learning environment was positive and supportive", 1),
            ("Great balance between theory and practical application", 1),
            ("The course materials were comprehensive and useful", 1),
            
            # Negative examples (label = 0)
            ("The course was boring and poorly structured", 0),
            ("I found the material confusing and hard to follow", 0),
            ("The instructor was not helpful and seemed disorganized", 0),
            ("The assignments were unclear and poorly designed", 0),
            ("I struggled to understand the concepts presented", 0),
            ("The course content was outdated and irrelevant", 0),
            ("The teaching methods were ineffective and monotonous", 0),
            ("I was disappointed with the overall quality", 0),
            ("The course failed to meet my learning expectations", 0),
            ("The material was too difficult without proper explanation", 0),
            ("The instructor was not responsive to student questions", 0),
            ("I found the course frustrating and unhelpful", 0),
            ("The content was poorly organized and hard to navigate", 0),
            ("The course lacked practical examples and applications", 0),
            ("I would not recommend this course to other students", 0),
        ]
        
        texts = []
        labels = []
        
        for text, label in synthetic_data:
            processed_text = preprocess_text(text)
            if processed_text:  # Only add if preprocessing was successful
                texts.append(processed_text)
                labels.append(label)
        
        return texts, labels
    
    def _heuristic_label(self, text: str) -> int:
        """
        Simple heuristic labeling based on positive/negative keywords.
        In production, you should use properly labeled data.
        """
        positive_words = [
            'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
            'outstanding', 'perfect', 'love', 'like', 'enjoy', 'satisfied',
            'happy', 'pleased', 'impressed', 'helpful', 'clear', 'effective'
        ]
        negative_words = [
            'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'poor',
            'disappointing', 'unsatisfied', 'unhappy', 'frustrated', 'annoyed',
            'confused', 'difficult', 'unclear', 'ineffective', 'boring'
        ]
        
        text_lower = text.lower()
        positive_score = sum(1 for word in positive_words if word in text_lower)
        negative_score = sum(1 for word in negative_words if word in text_lower)
        
        # Return 1 for positive, 0 for negative
        # If neutral or equal scores, default to positive (1)
        return 1 if positive_score >= negative_score else 0
    
    def train_model(self, texts: List[str], labels: List[int]) -> Dict[str, Any]:
        """
        Train the logistic regression model.
        """
        if len(texts) < 4:
            raise ValueError("Need at least 4 samples to train the model")
        
        # Create pipeline
        self.pipeline = self.create_pipeline()
        
        # Split data with safe stratification
        try:
            # Try stratified split first (preferred for balanced evaluation)
            X_train, X_test, y_train, y_test = train_test_split(
                texts, labels, test_size=0.2, random_state=42, stratify=labels
            )
        except ValueError:
            # Fallback to simple split if stratification fails (e.g., too few samples per class)
            X_train, X_test, y_train, y_test = train_test_split(
                texts, labels, test_size=0.2, random_state=42
            )
        
        # Train model
        self.pipeline.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = self.pipeline.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        # Get classification report
        report = classification_report(y_test, y_pred, output_dict=True)
        
        # Get confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        
        self.is_trained = True
        
        # Save model
        self.save_model()
        
        return {
            'accuracy': accuracy,
            'classification_report': report,
            'confusion_matrix': cm.tolist(),
            'training_samples': len(X_train),
            'test_samples': len(X_test)
        }
    
    def predict_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Predict sentiment for a given text.
        Returns sentiment label, confidence score, and points.
        """
        if not self.is_trained or self.pipeline is None:
            raise ValueError("Model is not trained. Please train the model first.")
        
        if not text or not isinstance(text, str):
            return {"label": "NEUTRAL", "score": 0.5, "points": 0}
        
        # Preprocess text
        processed_text = preprocess_text(text)
        if not processed_text:
            return {"label": "NEUTRAL", "score": 0.5, "points": 0}
        
        # Get prediction and probability
        prediction = self.pipeline.predict([processed_text])[0]
        probabilities = self.pipeline.predict_proba([processed_text])[0]
        
        # Convert to sentiment format compatible with existing system
        if prediction == 1:  # Positive
            label = "POSITIVE"
            score = probabilities[1]  # Probability of positive class
            points = 1
        else:  # Negative
            label = "NEGATIVE"
            score = probabilities[0]  # Probability of negative class
            points = -1
        
        return {
            "label": label,
            "score": float(score),
            "points": points,
            "model": "LogisticRegression"
        }
    
    def save_model(self):
        """Save the trained model to disk."""
        if self.pipeline is not None:
            with open(self.model_path, 'wb') as f:
                pickle.dump(self.pipeline, f)
    
    def load_model(self):
        """Load a trained model from disk."""
        if os.path.exists(self.model_path):
            try:
                with open(self.model_path, 'rb') as f:
                    self.pipeline = pickle.load(f)
                self.is_trained = True
                # Model loaded successfully - could add logging here if needed
                pass
            except Exception as e:
                # Model loading failed - could add logging here if needed
                self.is_trained = False
        else:
            # No existing model file - this is normal for first run
            self.is_trained = False


############################################################
# Enhanced Sentiment Analysis Functions
############################################################

# Global analyzer instance
lr_analyzer = LogisticRegressionSentimentAnalyzer()

def analyze_text_sentiment_lr(text: str) -> Dict[str, Any]:
    """
    Analyze sentiment using Logistic Regression model.
    Falls back to heuristic if model is not trained.
    """
    global lr_analyzer
    
    if lr_analyzer.is_trained:
        return lr_analyzer.predict_sentiment(text)
    else:
        # Fallback to simple heuristic
        return _heuristic_sentiment_analysis(text)

def _heuristic_sentiment_analysis(text: str) -> Dict[str, Any]:
    """
    Simple heuristic-based sentiment analysis as fallback.
    """
    if not text or not isinstance(text, str):
        return {"label": "NEUTRAL", "score": 0.5, "points": 0}
    
    features = extract_features_from_text(text)
    sentiment_ratio = features.get('sentiment_ratio', 0)
    
    if sentiment_ratio > 0.1:
        return {"label": "POSITIVE", "score": 0.7, "points": 1, "model": "Heuristic"}
    elif sentiment_ratio < -0.1:
        return {"label": "NEGATIVE", "score": 0.7, "points": -1, "model": "Heuristic"}
    else:
        return {"label": "NEUTRAL", "score": 0.5, "points": 0, "model": "Heuristic"}

def train_sentiment_model() -> Dict[str, Any]:
    """
    Train the Logistic Regression sentiment model using available data.
    """
    global lr_analyzer
    
    try:
        texts, labels = lr_analyzer.prepare_training_data()
        
        if len(texts) < 4:
            return {
                "success": False,
                "message": f"Insufficient training data. Found {len(texts)} samples, need at least 4.",
                "data_summary": {"total_samples": len(texts)}
            }
        
        # Check class distribution
        positive_count = sum(labels)
        negative_count = len(labels) - positive_count
        
        training_results = lr_analyzer.train_model(texts, labels)
        
        return {
            "success": True,
            "message": "Model trained successfully",
            "training_results": training_results,
            "data_summary": {
                "total_samples": len(texts),
                "positive_samples": positive_count,
                "negative_samples": negative_count
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Training failed: {str(e)}",
            "error": str(e)
        }

def get_model_info() -> Dict[str, Any]:
    """
    Get information about the current sentiment analysis model.
    """
    global lr_analyzer
    
    return {
        "model_type": "Logistic Regression with TF-IDF",
        "is_trained": lr_analyzer.is_trained,
        "model_path": lr_analyzer.model_path,
        "model_exists": os.path.exists(lr_analyzer.model_path)
    }


############################################################
# Updated Analysis Functions (Compatible with existing code)
############################################################

def process_student_evaluations_lr() -> Dict[str, Any]:
    """
    Enhanced version of process_student_evaluations using Logistic Regression.
    Maintains compatibility with existing code structure.
    """
    from .sentiment_analysis_test import score_mcq_answer, _safe_lower
    
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
            # Use Logistic Regression for sentiment analysis
            text_input = f"Question: {question_text}\nAnswer: {answer}" if question_text else str(answer)
            sres = analyze_text_sentiment_lr(text_input)
            text_sentiments.append({
                "student_evaluation_id": evaluation_id,
                "student_eval_question_id": question_id,
                "question": question_text,
                "answer": answer,
                "sentiment": sres.get("label"),
                "confidence": sres.get("score"),
                "points": sres.get("points"),
                "model_used": sres.get("model", "LogisticRegression"),
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
        "model_info": get_model_info()
    }


if __name__ == "__main__":
    # Example usage and testing
    print("=== Logistic Regression Sentiment Analysis ===")
    
    # Check model status
    model_info = get_model_info()
    print(f"Model Info: {json.dumps(model_info, indent=2)}")
    
    # Train model if not already trained
    if not model_info["is_trained"]:
        print("\n=== Training Model ===")
        training_result = train_sentiment_model()
        print(f"Training Result: {json.dumps(training_result, indent=2)}")
    
    # Test sentiment analysis
    test_texts = [
        "This course was excellent and very helpful!",
        "I really enjoyed the learning experience.",
        "The material was confusing and poorly explained.",
        "Average course, nothing special.",
        "Outstanding instructor and great content!"
    ]
    
    print("\n=== Testing Sentiment Analysis ===")
    for text in test_texts:
        result = analyze_text_sentiment_lr(text)
        print(f"Text: '{text}'")
        print(f"Result: {json.dumps(result, indent=2)}")
        print("-" * 50)
    
    # Run full analysis
    print("\n=== Full Student Evaluation Analysis ===")
    results = process_student_evaluations_lr()
    print(json.dumps(results, indent=2, ensure_ascii=False))