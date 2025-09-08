#!/usr/bin/env python
"""
Comprehensive validation script for the ML Sentiment Analysis system.
This script checks for issues, validates functionality, and provides recommendations.
"""

import os
import sys
import django
import json
from datetime import datetime

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SaintJudeDjango.settings')
django.setup()

def validate_dependencies():
    """Check if all required dependencies are installed."""
    print("🔍 Checking Dependencies...")
    issues = []
    
    try:
        import sklearn
        print(f"   ✅ scikit-learn: {sklearn.__version__}")
    except ImportError:
        issues.append("❌ scikit-learn not installed - run: pipenv install scikit-learn")
    
    try:
        import numpy
        print(f"   ✅ numpy: {numpy.__version__}")
    except ImportError:
        issues.append("❌ numpy not installed - run: pipenv install numpy")
    
    try:
        import psutil
        print(f"   ✅ psutil: {psutil.__version__}")
    except ImportError:
        issues.append("❌ psutil not installed - run: pipenv install psutil")
    
    try:
        import pandas
        print(f"   ✅ pandas: {pandas.__version__}")
    except ImportError:
        issues.append("❌ pandas not installed - run: pipenv install pandas")
    
    return issues

def validate_file_structure():
    """Check if all required files exist."""
    print("\n📁 Checking File Structure...")
    issues = []
    
    required_files = [
        'hrapp/utils/ml_sentiment_analysis.py',
        'hrapp/utils/enhanced_sentiment_analysis.py',
        'hrapp/utils/production_ml_training.py',
        'hrapp/management/commands/train_sentiment_model.py',
        'hrapp/ml_models/README.md',
        'test_ml_sentiment.py',
        'test_current_model.py'
    ]
    
    for file_path in required_files:
        full_path = os.path.join(os.getcwd(), file_path)
        if os.path.exists(full_path):
            print(f"   ✅ {file_path}")
        else:
            issues.append(f"❌ Missing file: {file_path}")
    
    # Check if ml_models directory exists
    ml_models_dir = os.path.join(os.getcwd(), 'hrapp', 'ml_models')
    if os.path.exists(ml_models_dir):
        print(f"   ✅ ml_models directory exists")
        
        # Check for model file
        model_file = os.path.join(ml_models_dir, 'lr_sentiment_model.pkl')
        if os.path.exists(model_file):
            size_mb = os.path.getsize(model_file) / (1024 * 1024)
            print(f"   ✅ Model file exists ({size_mb:.2f} MB)")
        else:
            print(f"   ⚠️  Model file not found (normal if not trained yet)")
    else:
        issues.append(f"❌ ml_models directory missing")
    
    return issues

def validate_imports():
    """Check if all ML modules can be imported."""
    print("\n🔧 Checking Module Imports...")
    issues = []
    
    try:
        from hrapp.utils.ml_sentiment_analysis import (
            LogisticRegressionSentimentAnalyzer,
            train_sentiment_model,
            analyze_text_sentiment_lr,
            get_model_info
        )
        print("   ✅ ml_sentiment_analysis imports successful")
    except ImportError as e:
        issues.append(f"❌ ml_sentiment_analysis import failed: {e}")
    
    try:
        from hrapp.utils.enhanced_sentiment_analysis import (
            SentimentAnalysisManager,
            analyze_text_sentiment_enhanced,
            process_student_evaluations_enhanced
        )
        print("   ✅ enhanced_sentiment_analysis imports successful")
    except ImportError as e:
        issues.append(f"��� enhanced_sentiment_analysis import failed: {e}")
    
    try:
        from hrapp.utils.production_ml_training import (
            ProductionMLTrainer,
            train_model_production,
            production_safety_check
        )
        print("   ✅ production_ml_training imports successful")
    except ImportError as e:
        issues.append(f"❌ production_ml_training import failed: {e}")
    
    return issues

def validate_model_functionality():
    """Test basic model functionality."""
    print("\n🧪 Testing Model Functionality...")
    issues = []
    
    try:
        from hrapp.utils.ml_sentiment_analysis import get_model_info, analyze_text_sentiment_lr
        
        # Check model info
        model_info = get_model_info()
        print(f"   📊 Model Type: {model_info.get('model_type')}")
        print(f"   📊 Is Trained: {model_info.get('is_trained')}")
        print(f"   📊 Model Exists: {model_info.get('model_exists')}")
        
        if model_info.get('is_trained'):
            # Test prediction
            test_text = "This course was excellent and very helpful!"
            result = analyze_text_sentiment_lr(test_text)
            
            if 'label' in result and 'score' in result:
                print(f"   ✅ Prediction test successful: {result['label']} ({result['score']:.3f})")
            else:
                issues.append("❌ Prediction returned invalid format")
        else:
            print("   ⚠️  Model not trained - prediction test skipped")
            
    except Exception as e:
        issues.append(f"❌ Model functionality test failed: {e}")
    
    return issues

def validate_enhanced_system():
    """Test the enhanced multi-model system."""
    print("\n🔄 Testing Enhanced System...")
    issues = []
    
    try:
        from hrapp.utils.enhanced_sentiment_analysis import (
            sentiment_manager,
            analyze_text_sentiment_enhanced
        )
        
        # Check model status
        status = sentiment_manager.get_model_status()
        print(f"   📊 Current Model: {status.get('current_model')}")
        print(f"   📊 Available Models: {status.get('available_models')}")
        
        # Test enhanced analysis
        test_text = "The material was confusing and poorly explained."
        result = analyze_text_sentiment_enhanced(test_text)
        
        if 'label' in result and 'model' in result:
            print(f"   ✅ Enhanced analysis successful: {result['label']} via {result['model']}")
        else:
            issues.append("❌ Enhanced analysis returned invalid format")
            
    except Exception as e:
        issues.append(f"❌ Enhanced system test failed: {e}")
    
    return issues

def validate_production_safety():
    """Test production safety features."""
    print("\n🛡️  Testing Production Safety...")
    issues = []
    
    try:
        from hrapp.utils.production_ml_training import production_safety_check
        
        safety_result = production_safety_check()
        
        if 'safe_to_train' in safety_result:
            safe = safety_result['safe_to_train']
            checks = safety_result.get('checks', {})
            
            print(f"   📊 Safe to Train: {safe}")
            for check_name, check_result in checks.items():
                status = "✅" if check_result else "⚠️"
                print(f"   {status} {check_name}: {check_result}")
            
            if not safe:
                recommendations = safety_result.get('recommendations', [])
                for rec in recommendations:
                    print(f"   💡 Recommendation: {rec}")
        else:
            issues.append("❌ Safety check returned invalid format")
            
    except Exception as e:
        issues.append(f"❌ Production safety test failed: {e}")
    
    return issues

def validate_api_endpoints():
    """Check if API endpoints are properly configured."""
    print("\n🌐 Checking API Configuration...")
    issues = []
    
    try:
        from hrapp.urls import urlpatterns
        
        # Check for ML endpoints
        ml_endpoints = [
            'ml/train-sentiment-model/',
            'ml/training-status/',
            'ml/safety-check/',
            'ml/analyze-sentiment/',
            'ml/model-info/',
            'ml/enhanced-sentiment-analysis/',
            'ml/compare-sentiment-models/'
        ]
        
        url_strings = [str(pattern.pattern) for pattern in urlpatterns]
        all_urls = ' '.join(url_strings)
        
        for endpoint in ml_endpoints:
            if endpoint in all_urls:
                print(f"   ✅ {endpoint}")
            else:
                issues.append(f"❌ Missing API endpoint: {endpoint}")
                
    except Exception as e:
        issues.append(f"❌ API configuration check failed: {e}")
    
    return issues

def validate_database_access():
    """Check if the system can access required database models."""
    print("\n🗄️  Testing Database Access...")
    issues = []
    
    try:
        from hrapp.models.evaluation_models import (
            StudentEvaluationResponse,
            StudentEvaluationQuestion,
            Timestamp
        )
        
        # Test model access
        response_count = StudentEvaluationResponse.objects.count()
        question_count = StudentEvaluationQuestion.objects.count()
        timestamp_count = Timestamp.objects.count()
        
        print(f"   📊 Student Evaluation Responses: {response_count}")
        print(f"   📊 Student Evaluation Questions: {question_count}")
        print(f"   📊 Timestamps: {timestamp_count}")
        
        total_data = response_count + timestamp_count
        if total_data == 0:
            print("   ⚠️  No training data available - system will use synthetic data")
        elif total_data < 10:
            print("   ⚠️  Limited training data - consider adding more evaluations")
        else:
            print("   ✅ Sufficient training data available")
            
    except Exception as e:
        issues.append(f"❌ Database access test failed: {e}")
    
    return issues

def generate_recommendations(all_issues):
    """Generate recommendations based on found issues."""
    print("\n💡 Recommendations:")
    
    if not all_issues:
        print("   🎉 No issues found! Your ML sentiment analysis system is ready for production.")
        print("\n   Next steps:")
        print("   1. Train your model: python manage.py train_sentiment_model --train")
        print("   2. Test the system: python test_ml_sentiment.py")
        print("   3. Set up scheduled retraining for production")
        return
    
    print(f"   Found {len(all_issues)} issues that need attention:")
    
    for i, issue in enumerate(all_issues, 1):
        print(f"   {i}. {issue}")
    
    print("\n   Priority fixes:")
    
    # Categorize issues
    dependency_issues = [i for i in all_issues if "not installed" in i]
    file_issues = [i for i in all_issues if "Missing file" in i]
    import_issues = [i for i in all_issues if "import failed" in i]
    
    if dependency_issues:
        print("   🔧 Install missing dependencies first:")
        print("      pipenv install scikit-learn numpy psutil")
    
    if file_issues:
        print("   📁 Restore missing files from the implementation")
    
    if import_issues:
        print("   🔧 Fix import issues - check Python path and Django settings")

def main():
    """Run comprehensive validation."""
    print("🚀 ML Sentiment Analysis System Validation")
    print("=" * 50)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Working Directory: {os.getcwd()}")
    
    all_issues = []
    
    # Run all validation checks
    all_issues.extend(validate_dependencies())
    all_issues.extend(validate_file_structure())
    all_issues.extend(validate_imports())
    all_issues.extend(validate_model_functionality())
    all_issues.extend(validate_enhanced_system())
    all_issues.extend(validate_production_safety())
    all_issues.extend(validate_api_endpoints())
    all_issues.extend(validate_database_access())
    
    # Generate summary
    print("\n" + "=" * 50)
    print("📋 VALIDATION SUMMARY")
    print("=" * 50)
    
    if all_issues:
        print(f"❌ Found {len(all_issues)} issues")
    else:
        print("✅ All checks passed!")
    
    generate_recommendations(all_issues)
    
    print("\n" + "=" * 50)
    print("Validation completed!")

if __name__ == "__main__":
    main()