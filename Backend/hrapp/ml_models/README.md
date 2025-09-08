# ML Sentiment Analysis - Configuration Guide

This directory contains the machine learning models and configuration for sentiment analysis in the HR application.

## 📁 Directory Structure

```
ml_models/
├── README.md                    # This file
├── lr_sentiment_model.pkl       # Trained Logistic Regression model (auto-generated)
└── model_backups/              # Model version backups (optional)
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd Backend
pipenv install  # Installs scikit-learn, numpy, psutil
```

### 2. Train Your First Model
```bash
# Option A: Django Management Command
python manage.py train_sentiment_model --train

# Option B: Direct Python Script
python test_ml_sentiment.py

# Option C: API Endpoint (requires authentication)
curl -X POST http://localhost:8000/api/ml/train-sentiment-model/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"force": true, "async": false}'
```

### 3. Test the Model
```bash
# Test with sample texts
python manage.py train_sentiment_model --test

# Check model status
python manage.py train_sentiment_model --info
```

## ⚙️ Configuration Options

### Model Parameters (ml_sentiment_analysis.py)

```python
# TF-IDF Vectorizer Settings
TfidfVectorizer(
    max_features=1000,      # Maximum vocabulary size
    ngram_range=(1, 2),     # Use unigrams and bigrams
    min_df=1,               # Minimum document frequency
    max_df=0.95,            # Maximum document frequency
    stop_words='english'    # Remove common English words
)

# Logistic Regression Settings
LogisticRegression(
    random_state=42,        # For reproducible results
    max_iter=1000,          # Maximum training iterations
    C=1.0,                  # Regularization strength
    class_weight='balanced' # Handle imbalanced data
)
```

### Training Data Sources

The system automatically collects training data from:
1. **Student Evaluation Text Responses** (`StudentEvaluationResponse` model)
2. **Timestamp Comments** (`Timestamp` model - student/instructor comments)
3. **Synthetic Data** (30 educational examples when real data < 20 samples)

### Minimum Requirements

- **Minimum samples**: 4 (lowered for development)
- **Recommended samples**: 50+ for production
- **Memory requirement**: 50MB+ available
- **Disk space**: 10MB+ free

## 🔧 Production Configuration

### Environment Variables (optional)
```bash
# Add to your .env file
ML_MODEL_PATH=/path/to/custom/model/directory
ML_TRAINING_ENABLED=true
ML_SYNTHETIC_DATA_ENABLED=true
ML_MIN_SAMPLES=4
```

### Scheduled Retraining
```python
# Add to your cron jobs or Celery tasks
# Retrain weekly on Mondays at 2 AM
0 2 * * 1 cd /path/to/project && python manage.py train_sentiment_model --train
```

### Production Safety Settings
```python
# In production_ml_training.py
MEMORY_THRESHOLD = 85      # Don't train if memory usage > 85%
DISK_THRESHOLD = 10        # Don't train if disk space < 10%
TRAINING_TIMEOUT = 300     # 5 minutes max training time
LOCK_TIMEOUT = 300         # 5 minutes max lock duration
```

## 📊 API Endpoints

### Training Endpoints
```bash
# Train model (production-safe)
POST /api/ml/train-sentiment-model/
{
  "force": false,    # Force retrain even if not needed
  "async": true      # Train in background (recommended)
}

# Check training status
GET /api/ml/training-status/

# Safety check before training
GET /api/ml/safety-check/
```

### Prediction Endpoints
```bash
# Analyze single text
POST /api/ml/analyze-sentiment/
{
  "text": "This course was excellent!"
}

# Get model information
GET /api/ml/model-info/

# Enhanced analysis with model comparison
GET /api/ml/enhanced-sentiment-analysis/?model=lr

# Compare different models
POST /api/ml/compare-sentiment-models/
{
  "texts": ["Great course!", "Poor teaching"]
}
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Insufficient training data" Error
```bash
# Problem: Less than 4 samples found
# Solution: Add more student evaluations or enable synthetic data

# Check current data count
python -c "
from hrapp.utils.ml_sentiment_analysis import LogisticRegressionSentimentAnalyzer
analyzer = LogisticRegressionSentimentAnalyzer()
texts, labels = analyzer.prepare_training_data()
print(f'Found {len(texts)} samples')
"
```

#### 2. "Model not trained" Error
```bash
# Problem: No trained model file exists
# Solution: Train the model first

python manage.py train_sentiment_model --train
```

#### 3. Memory/Resource Issues
```bash
# Check system resources
GET /api/ml/safety-check/

# Response will show:
{
  "safe_to_train": false,
  "checks": {
    "memory_available": false,
    "disk_space_available": true
  },
  "recommendations": ["Free up system memory before training"]
}
```

#### 4. Import Errors
```bash
# Problem: Missing dependencies
# Solution: Install required packages

pipenv install scikit-learn numpy psutil
```

### Debug Mode
```python
# Enable detailed logging in settings.py
LOGGING = {
    'loggers': {
        'hrapp.utils.ml_sentiment_analysis': {
            'level': 'DEBUG',
        }
    }
}
```

## 📈 Performance Monitoring

### Model Metrics
```python
# Check model performance
python manage.py train_sentiment_model --analyze

# Expected output:
{
  "accuracy": 0.85,
  "training_samples": 29,
  "test_samples": 7,
  "positive_samples": 18,
  "negative_samples": 18
}
```

### Production Monitoring
```bash
# Model status endpoint
GET /api/ml/model-info/

# Response:
{
  "model_type": "Logistic Regression with TF-IDF",
  "is_trained": true,
  "model_path": "/path/to/lr_sentiment_model.pkl",
  "model_exists": true
}
```

## 🔄 Model Updates

### Manual Retraining
```bash
# Force retrain with latest data
python manage.py train_sentiment_model --train --force

# Or via API
curl -X POST /api/ml/train-sentiment-model/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -d '{"force": true}'
```

### Automatic Retraining Triggers
- **Weekly schedule**: Every Monday at 2 AM
- **Data threshold**: When new data > 20% of training set
- **Performance drop**: When accuracy falls below threshold
- **Manual trigger**: Via admin interface or API

### Model Backup Strategy
```bash
# Create backup before retraining
cp lr_sentiment_model.pkl model_backups/lr_sentiment_model_$(date +%Y%m%d).pkl

# Restore from backup if needed
cp model_backups/lr_sentiment_model_20240115.pkl lr_sentiment_model.pkl
```

## 🎯 Best Practices

### Development
1. **Start Small**: Begin with synthetic data + your real samples
2. **Test Frequently**: Use `--test` flag to validate model performance
3. **Monitor Logs**: Check Django logs for training/prediction errors
4. **Version Control**: Don't commit `.pkl` files to git (too large)

### Production
1. **Scheduled Training**: Set up automated retraining
2. **Health Checks**: Monitor model status via API endpoints
3. **Fallback Strategy**: Ensure BERT model works as backup
4. **Resource Monitoring**: Watch memory/CPU usage during training
5. **Data Quality**: Regularly review and clean training data

### Security
1. **API Authentication**: Protect training endpoints with proper auth
2. **Rate Limiting**: Prevent abuse of prediction endpoints
3. **Input Validation**: Sanitize text inputs before processing
4. **Access Control**: Limit model training to admin users only

## 📚 Additional Resources

### Code Files
- `ml_sentiment_analysis.py` - Core ML implementation
- `production_ml_training.py` - Production-safe training wrapper
- `enhanced_sentiment_analysis.py` - Multi-model manager
- `train_sentiment_model.py` - Django management command

### Documentation
- `ML_SENTIMENT_README.md` - Detailed technical documentation
- `test_ml_sentiment.py` - Testing and validation script

### External Dependencies
- **scikit-learn**: Machine learning algorithms
- **numpy**: Numerical computing
- **psutil**: System resource monitoring
- **pandas**: Data manipulation (already in project)

## 🆘 Support

### Getting Help
1. **Check Logs**: Django logs contain detailed error information
2. **Run Tests**: Use test script to validate setup
3. **API Status**: Check `/api/ml/model-info/` for current state
4. **Documentation**: Refer to `ML_SENTIMENT_README.md` for details

### Common Commands Reference
```bash
# Training
python manage.py train_sentiment_model --train
python manage.py train_sentiment_model --test
python manage.py train_sentiment_model --info
python manage.py train_sentiment_model --analyze

# Testing
python test_ml_sentiment.py

# API Health Check
curl -X GET http://localhost:8000/api/ml/model-info/
```

---

**Last Updated**: January 2024  
**Version**: 1.0  
**Compatibility**: Django 4.x, Python 3.12+

monitoring dashboard with:

# Complete system overview
curl -X GET http://localhost:8000/api/ml/system-status/

# Check if retraining is needed
curl -X GET http://localhost:8000/api/ml/retraining-conditions/

# View training progress
curl -X GET http://localhost:8000/api/ml/training-status/

Test automation

# Check current conditions
GET /api/ml/retraining-conditions/

# Manually trigger (for testing)
POST /api/ml/trigger-smart-retraining/

verify if working

# Check system status
GET /api/ml/system-status/

# Should show: "smart_retraining_active": true