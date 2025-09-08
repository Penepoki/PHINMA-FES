# ML Sentiment Analysis Implementation

This document describes the Logistic Regression-based sentiment analysis implementation for the HR application.

## Overview

The ML sentiment analysis system provides an alternative to the existing DistilBERT-based sentiment analysis, using a custom-trained Logistic Regression model with TF-IDF vectorization. This approach offers:

- **Faster inference** compared to transformer models
- **Customizable training** on domain-specific data
- **Transparent feature extraction** with TF-IDF
- **Lower computational requirements**
- **Easy model retraining** as new data becomes available

## Architecture

### Core Components

1. **LogisticRegressionSentimentAnalyzer** (`ml_sentiment_analysis.py`)
   - Main ML pipeline with TF-IDF vectorizer and Logistic Regression classifier
   - Handles model training, prediction, and persistence
   - Includes text preprocessing and feature extraction

2. **Enhanced Sentiment Analysis Manager** (`enhanced_sentiment_analysis.py`)
   - Provides unified interface for multiple sentiment analysis models
   - Supports automatic model selection and comparison
   - Maintains compatibility with existing codebase

3. **Management Commands** (`management/commands/train_sentiment_model.py`)
   - Django management command for training and testing models
   - Provides CLI interface for model operations

4. **API Endpoints** (added to `views.py`)
   - RESTful endpoints for training, prediction, and model management
   - Integration with existing Django REST framework

## Features

### Text Preprocessing
- Lowercase conversion and whitespace normalization
- Special character removal while preserving spaces
- Short word filtering (< 2 characters)
- Stop word removal via TF-IDF configuration

### Feature Engineering
- **TF-IDF Vectorization**: Unigrams and bigrams with configurable parameters
- **Additional Features**: Word count, character count, sentiment word counts
- **Vocabulary Management**: Configurable min/max document frequency

### Model Configuration
- **Algorithm**: Logistic Regression with L2 regularization
- **Class Balancing**: Automatic handling of imbalanced datasets
- **Hyperparameters**: Configurable regularization strength (C=1.0)
- **Evaluation**: Train/test split with stratification

### Training Data
The system uses existing data from the application:
- Student evaluation text responses
- Timestamp comments (student and instructor)
- Heuristic labeling based on sentiment keywords (can be replaced with human-labeled data)

## Installation and Setup

### 1. Install Dependencies

The required packages are already added to `Pipfile`:

```bash
cd Backend
pipenv install
```

New dependencies added:
- `scikit-learn`: Machine learning library
- `numpy`: Numerical computing (if not already present)

### 2. Database Migration

No database changes are required. The system uses existing models and adds sentiment analysis capabilities.

### 3. Model Training

#### Using Django Management Command:

```bash
# Train the model
python manage.py train_sentiment_model --train

# Test the model
python manage.py train_sentiment_model --test

# Get model information
python manage.py train_sentiment_model --info

# Run full analysis
python manage.py train_sentiment_model --analyze
```

#### Using Python Script:

```bash
python test_ml_sentiment.py
```

#### Using API Endpoints:

```bash
# Train model
curl -X POST http://localhost:8000/api/ml/train-sentiment-model/ \
  -H "Authorization: Token YOUR_TOKEN"

# Get model info
curl -X GET http://localhost:8000/api/ml/model-info/ \
  -H "Authorization: Token YOUR_TOKEN"

# Analyze text
curl -X POST http://localhost:8000/api/ml/analyze-sentiment/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "This course was excellent!"}'
```

## API Endpoints

### Training and Management

- `POST /api/ml/train-sentiment-model/` - Train the ML model
- `GET /api/ml/model-info/` - Get model status and information

### Prediction

- `POST /api/ml/analyze-sentiment/` - Analyze sentiment of provided text
- `GET /api/ml/enhanced-sentiment-analysis/` - Run enhanced analysis with model selection
- `POST /api/ml/compare-sentiment-models/` - Compare different models on provided texts

### Request/Response Examples

#### Train Model
```json
// POST /api/ml/train-sentiment-model/
{
  "success": true,
  "message": "Model trained successfully",
  "training_results": {
    "accuracy": 0.8542,
    "training_samples": 156,
    "test_samples": 40
  },
  "data_summary": {
    "total_samples": 196,
    "positive_samples": 98,
    "negative_samples": 98
  }
}
```

#### Analyze Sentiment
```json
// POST /api/ml/analyze-sentiment/
// Request: {"text": "This course was excellent!"}
{
  "label": "POSITIVE",
  "score": 0.892,
  "points": 1,
  "model": "LogisticRegression"
}
```

## Model Performance

### Evaluation Metrics
- **Accuracy**: Overall classification accuracy
- **Precision/Recall**: Per-class performance metrics
- **Confusion Matrix**: Detailed classification results
- **Cross-validation**: Available for more robust evaluation

### Expected Performance
- **Training Time**: < 1 second for typical datasets
- **Inference Time**: < 1ms per text sample
- **Memory Usage**: < 10MB for trained model
- **Accuracy**: 80-90% on domain-specific data (depends on training data quality)

## Integration with Existing System

### Backward Compatibility
- All existing sentiment analysis functionality remains unchanged
- New ML features are additive and optional
- Fallback mechanisms ensure system stability

### Model Selection
The enhanced system supports automatic model selection:

1. **Trained Logistic Regression** (preferred if available)
2. **DistilBERT** (fallback if LR not trained)
3. **Heuristic Analysis** (last resort)

### Data Flow
```
Student Response → Text Preprocessing → Feature Extraction → ML Model → Sentiment Score
                                                         ↓
                                    Database Storage ← Score Integration
```

## File Structure

```
Backend/
├── hrapp/
│   ├── utils/
│   │   ├── ml_sentiment_analysis.py          # Core ML implementation
│   │   ├── enhanced_sentiment_analysis.py    # Multi-model manager
│   │   └── sentiment_analysis_test.py        # Original BERT implementation
│   ├── management/
│   │   └── commands/
│   │       └── train_sentiment_model.py      # Django management command
│   ├── ml_models/                            # Model storage directory (auto-created)
│   │   └── lr_sentiment_model.pkl            # Trained model file
│   ├── views.py                              # API endpoints (updated)
│   └── urls.py                               # URL routing (updated)
├── test_ml_sentiment.py                      # Test script
├── Pipfile                                   # Dependencies (updated)
└── ML_SENTIMENT_README.md                    # This documentation
```

## Usage Examples

### Basic Sentiment Analysis

```python
from hrapp.utils.ml_sentiment_analysis import analyze_text_sentiment_lr

# Analyze a single text
result = analyze_text_sentiment_lr("This course was amazing!")
print(f"Sentiment: {result['label']} (Score: {result['score']:.3f})")
```

### Model Training

```python
from hrapp.utils.ml_sentiment_analysis import train_sentiment_model

# Train the model
result = train_sentiment_model()
if result['success']:
    print(f"Model trained with accuracy: {result['training_results']['accuracy']:.3f}")
```

### Enhanced Analysis with Model Comparison

```python
from hrapp.utils.enhanced_sentiment_analysis import process_student_evaluations_enhanced

# Run analysis with automatic model selection
results = process_student_evaluations_enhanced()
print(f"Current model: {results['model_status']['current_model']}")
print(f"Overall sentiment score: {results['totals']['overall']:.2f}")
```

## Customization and Extension

### Improving Training Data
1. **Human Labeling**: Replace heuristic labeling with human-annotated sentiment labels
2. **Domain-Specific Data**: Add more education-specific training examples
3. **Balanced Datasets**: Ensure equal representation of positive/negative samples

### Model Tuning
1. **Hyperparameter Optimization**: Tune regularization strength, n-gram ranges
2. **Feature Engineering**: Add domain-specific features (education keywords, etc.)
3. **Ensemble Methods**: Combine multiple models for better performance

### Advanced Features
1. **Multi-class Classification**: Extend beyond positive/negative to include neutral, very positive, etc.
2. **Confidence Thresholds**: Implement confidence-based prediction filtering
3. **Online Learning**: Update model incrementally as new data arrives

## Troubleshooting

### Common Issues

1. **Insufficient Training Data**
   - Error: "Need at least 10 samples to train the model"
   - Solution: Ensure database has sufficient text responses and comments

2. **Model Not Found**
   - Error: "No existing model found"
   - Solution: Run training command or API endpoint to create model

3. **Import Errors**
   - Error: "No module named 'sklearn'"
   - Solution: Install dependencies with `pipenv install`

### Performance Issues

1. **Slow Training**
   - Reduce TF-IDF max_features parameter
   - Use smaller training dataset for testing

2. **Poor Accuracy**
   - Review training data quality
   - Adjust preprocessing parameters
   - Consider using human-labeled data

### Debugging

Enable debug logging by setting environment variable:
```bash
export DJANGO_LOG_LEVEL=DEBUG
```

## Future Enhancements

1. **Advanced ML Models**: Support for Random Forest, SVM, or neural networks
2. **Real-time Learning**: Continuous model updates based on user feedback
3. **Multilingual Support**: Extend to support multiple languages
4. **Sentiment Intensity**: Provide fine-grained sentiment scores
5. **Topic Modeling**: Combine sentiment with topic analysis
6. **A/B Testing**: Framework for comparing model performance in production

## Contributing

When contributing to the ML sentiment analysis system:

1. **Code Style**: Follow existing Django and Python conventions
2. **Testing**: Add unit tests for new functionality
3. **Documentation**: Update this README for significant changes
4. **Performance**: Consider computational efficiency for production use
5. **Compatibility**: Maintain backward compatibility with existing features

## License

This ML sentiment analysis implementation is part of the HR application and follows the same licensing terms as the main project.