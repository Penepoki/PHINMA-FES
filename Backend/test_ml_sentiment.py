#!/usr/bin/env python
"""
Test script for ML Sentiment Analysis functionality.
Run this script to test the Logistic Regression sentiment analysis implementation.
"""

import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SaintJudeDjango.settings')
django.setup()

from hrapp.utils.ml_sentiment_analysis import (
    LogisticRegressionSentimentAnalyzer,
    train_sentiment_model,
    analyze_text_sentiment_lr,
    get_model_info
)

def test_ml_sentiment_analysis():
    """Test the ML sentiment analysis functionality."""
    
    print("=" * 60)
    print("TESTING LOGISTIC REGRESSION SENTIMENT ANALYSIS")
    print("=" * 60)
    
    # 1. Check model status
    print("\n1. Checking Model Status:")
    print("-" * 30)
    model_info = get_model_info()
    for key, value in model_info.items():
        print(f"   {key}: {value}")
    
    # 2. Train model if not trained
    if not model_info.get("is_trained", False):
        print("\n2. Training Model:")
        print("-" * 30)
        print("   Training sentiment analysis model...")
        
        try:
            training_result = train_sentiment_model()
            
            if training_result.get("success"):
                print("   ✓ Model trained successfully!")
                
                # Display training results
                if "training_results" in training_result:
                    tr = training_result["training_results"]
                    print(f"   Accuracy: {tr.get('accuracy', 0):.4f}")
                    print(f"   Training samples: {tr.get('training_samples', 0)}")
                    print(f"   Test samples: {tr.get('test_samples', 0)}")
                
                # Display data summary
                if "data_summary" in training_result:
                    ds = training_result["data_summary"]
                    print(f"   Total samples: {ds.get('total_samples', 0)}")
                    print(f"   Positive samples: {ds.get('positive_samples', 0)}")
                    print(f"   Negative samples: {ds.get('negative_samples', 0)}")
            else:
                print(f"   ✗ Training failed: {training_result.get('message', 'Unknown error')}")
                return
                
        except Exception as e:
            print(f"   ✗ Training error: {str(e)}")
            return
    else:
        print("\n2. Model Status:")
        print("-" * 30)
        print("   ✓ Model is already trained and ready!")
    
    # 3. Test sentiment analysis
    print("\n3. Testing Sentiment Analysis:")
    print("-" * 30)
    
    test_texts = [
        "This course was excellent and very helpful!",
        "I really enjoyed the learning experience and found it engaging.",
        "The material was confusing and poorly explained.",
        "Average course, nothing special about it.",
        "Outstanding instructor and great content!",
        "I hate this class, it's boring and useless.",
        "The professor is knowledgeable and explains things clearly.",
        "Difficult to understand, needs improvement.",
        "Perfect balance of theory and practice.",
        "Waste of time, learned nothing new."
    ]
    
    for i, text in enumerate(test_texts, 1):
        try:
            result = analyze_text_sentiment_lr(text)
            
            # Format output based on sentiment
            sentiment = result.get('label', 'UNKNOWN')
            score = result.get('score', 0)
            points = result.get('points', 0)
            model_used = result.get('model', 'Unknown')
            
            # Color indicators
            if sentiment == 'POSITIVE':
                indicator = "😊 +"
            elif sentiment == 'NEGATIVE':
                indicator = "😞 -"
            else:
                indicator = "😐 ○"
            
            print(f"   {i:2d}. '{text[:50]}{'...' if len(text) > 50 else ''}'")
            print(f"       {indicator} {sentiment} (Score: {score:.3f}, Points: {points}) [{model_used}]")
            
        except Exception as e:
            print(f"   {i:2d}. Error analyzing text: {str(e)}")
    
    # 4. Model comparison (if both models are available)
    print("\n4. Model Comparison:")
    print("-" * 30)
    
    try:
        from hrapp.utils.enhanced_sentiment_analysis import compare_sentiment_models
        
        comparison_texts = [
            "This course was excellent!",
            "The material was confusing.",
            "Average learning experience."
        ]
        
        comparison_result = compare_sentiment_models(comparison_texts)
        
        if comparison_result.get("model_comparisons"):
            for i, comp in enumerate(comparison_result["model_comparisons"], 1):
                text = comp.get("text", "")
                results = comp.get("results", {})
                
                print(f"   {i}. '{text}'")
                for model_name, result in results.items():
                    if "error" not in result:
                        sentiment = result.get("label", "UNKNOWN")
                        score = result.get("score", 0)
                        print(f"      {model_name}: {sentiment} ({score:.3f})")
                    else:
                        print(f"      {model_name}: Error - {result['error']}")
        else:
            print("   Only one model available for comparison.")
            
    except Exception as e:
        print(f"   Comparison error: {str(e)}")
    
    print("\n" + "=" * 60)
    print("TESTING COMPLETED")
    print("=" * 60)


if __name__ == "__main__":
    test_ml_sentiment_analysis()