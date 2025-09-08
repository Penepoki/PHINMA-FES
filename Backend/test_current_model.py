#!/usr/bin/env python
"""
Test script to see which model is actually being used in production.
"""

import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SaintJudeDjango.settings')
django.setup()

def test_current_model():
    """Test which model is currently being used."""
    
    print("=" * 60)
    print("TESTING CURRENT MODEL IN PRODUCTION")
    print("=" * 60)
    
    # Test the enhanced sentiment analysis (what's actually used in production)
    try:
        from hrapp.utils.enhanced_sentiment_analysis import (
            sentiment_manager, 
            analyze_text_sentiment_enhanced,
            process_student_evaluations_enhanced
        )
        
        # 1. Show current model status
        print("\n1. Current Model Status:")
        print("-" * 30)
        status = sentiment_manager.get_model_status()
        print(f"   Current Model: {status['current_model']}")
        print(f"   Available Models: {status['available_models']}")
        
        # 2. Test sentiment analysis with sample texts
        print("\n2. Testing Sentiment Analysis:")
        print("-" * 30)
        
        test_texts = [
            "This course was excellent and very helpful!",
            "The material was confusing and poorly explained.",
            "Average course, nothing special."
        ]
        
        for i, text in enumerate(test_texts, 1):
            result = analyze_text_sentiment_enhanced(text)
            model_used = result.get('model', 'Unknown')
            sentiment = result.get('label', 'Unknown')
            confidence = result.get('score', 0)
            
            print(f"   {i}. Text: '{text[:40]}{'...' if len(text) > 40 else ''}'")
            print(f"      → Model Used: {model_used}")
            print(f"      → Sentiment: {sentiment} (Confidence: {confidence:.3f})")
            print()
        
        # 3. Test model comparison
        print("3. Model Comparison (if both available):")
        print("-" * 30)
        
        test_text = "This course was excellent!"
        
        # Test Logistic Regression specifically
        try:
            lr_result = analyze_text_sentiment_enhanced(test_text, model="lr")
            print(f"   Logistic Regression: {lr_result.get('label')} ({lr_result.get('score', 0):.3f}) - Model: {lr_result.get('model')}")
        except Exception as e:
            print(f"   Logistic Regression: Error - {e}")
        
        # Test BERT specifically
        try:
            bert_result = analyze_text_sentiment_enhanced(test_text, model="bert")
            print(f"   DistilBERT: {bert_result.get('label')} ({bert_result.get('score', 0):.3f}) - Model: {bert_result.get('model')}")
        except Exception as e:
            print(f"   DistilBERT: Error - {e}")
        
        # 4. Test what's used in actual student evaluation processing
        print("\n4. Student Evaluation Processing:")
        print("-" * 30)
        
        try:
            # This is what actually runs when processing student evaluations
            results = process_student_evaluations_enhanced()
            model_status = results.get('model_status', {})
            current_model = model_status.get('current_model', 'Unknown')
            
            print(f"   Model used for student evaluations: {current_model}")
            
            # Show some sample results if available
            text_sentiments = results.get('text_sentiments', [])
            if text_sentiments:
                print(f"   Sample results from recent evaluations:")
                for i, item in enumerate(text_sentiments[:3], 1):
                    model_used = item.get('model_used', 'Unknown')
                    sentiment = item.get('sentiment', 'Unknown')
                    print(f"     {i}. Model: {model_used}, Sentiment: {sentiment}")
            else:
                print("   No text sentiment data available yet")
                
        except Exception as e:
            print(f"   Error testing student evaluation processing: {e}")
        
    except ImportError as e:
        print(f"Error importing enhanced sentiment analysis: {e}")
        
        # Fallback: test basic ML model
        try:
            from hrapp.utils.ml_sentiment_analysis import analyze_text_sentiment_lr, get_model_info
            
            print("\nFallback: Testing basic ML model:")
            model_info = get_model_info()
            print(f"   Model trained: {model_info.get('is_trained')}")
            
            if model_info.get('is_trained'):
                result = analyze_text_sentiment_lr("This course was excellent!")
                print(f"   Test result: {result}")
            
        except Exception as e:
            print(f"   Error with basic ML model: {e}")
    
    print("\n" + "=" * 60)
    print("TESTING COMPLETED")
    print("=" * 60)


if __name__ == "__main__":
    test_current_model()