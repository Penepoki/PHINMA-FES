import json
from django.core.management.base import BaseCommand
from hrapp.utils.ml_sentiment_analysis import (
    train_sentiment_model, 
    get_model_info, 
    analyze_text_sentiment_lr,
    process_student_evaluations_lr
)


class Command(BaseCommand):
    help = 'Train and test the Logistic Regression sentiment analysis model'

    def add_arguments(self, parser):
        parser.add_argument(
            '--train',
            action='store_true',
            help='Train the sentiment model',
        )
        parser.add_argument(
            '--test',
            action='store_true',
            help='Test the sentiment model with sample texts',
        )
        parser.add_argument(
            '--analyze',
            action='store_true',
            help='Run full sentiment analysis on student evaluations',
        )
        parser.add_argument(
            '--info',
            action='store_true',
            help='Show model information',
        )

    def handle(self, *args, **options):
        if options['info'] or not any([options['train'], options['test'], options['analyze']]):
            self.show_model_info()
        
        if options['train']:
            self.train_model()
        
        if options['test']:
            self.test_model()
        
        if options['analyze']:
            self.analyze_evaluations()

    def show_model_info(self):
        """Display current model information."""
        self.stdout.write(self.style.SUCCESS('=== Model Information ==='))
        model_info = get_model_info()
        self.stdout.write(json.dumps(model_info, indent=2))

    def train_model(self):
        """Train the sentiment analysis model."""
        self.stdout.write(self.style.SUCCESS('=== Training Sentiment Model ==='))
        
        try:
            result = train_sentiment_model()
            
            if result['success']:
                self.stdout.write(
                    self.style.SUCCESS(f"✓ {result['message']}")
                )
                
                # Display training results
                if 'training_results' in result:
                    tr = result['training_results']
                    self.stdout.write(f"Accuracy: {tr['accuracy']:.4f}")
                    self.stdout.write(f"Training samples: {tr['training_samples']}")
                    self.stdout.write(f"Test samples: {tr['test_samples']}")
                
                # Display data summary
                if 'data_summary' in result:
                    ds = result['data_summary']
                    self.stdout.write(f"Total samples: {ds['total_samples']}")
                    self.stdout.write(f"Positive samples: {ds['positive_samples']}")
                    self.stdout.write(f"Negative samples: {ds['negative_samples']}")
                    
            else:
                self.stdout.write(
                    self.style.ERROR(f"✗ {result['message']}")
                )
                if 'error' in result:
                    self.stdout.write(f"Error details: {result['error']}")
                    
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"✗ Training failed: {str(e)}")
            )

    def test_model(self):
        """Test the model with sample texts."""
        self.stdout.write(self.style.SUCCESS('=== Testing Sentiment Model ==='))
        
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
                
                # Color code based on sentiment
                if result['label'] == 'POSITIVE':
                    style = self.style.SUCCESS
                elif result['label'] == 'NEGATIVE':
                    style = self.style.ERROR
                else:
                    style = self.style.WARNING
                
                self.stdout.write(f"\n{i}. Text: '{text}'")
                self.stdout.write(
                    style(f"   Sentiment: {result['label']} "
                          f"(Score: {result['score']:.3f}, Points: {result['points']})")
                )
                if 'model' in result:
                    self.stdout.write(f"   Model: {result['model']}")
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"✗ Error analyzing text {i}: {str(e)}")
                )

    def analyze_evaluations(self):
        """Run full sentiment analysis on student evaluations."""
        self.stdout.write(self.style.SUCCESS('=== Analyzing Student Evaluations ==='))
        
        try:
            results = process_student_evaluations_lr()
            
            # Summary statistics
            totals = results.get('totals', {})
            self.stdout.write(f"\nSummary:")
            self.stdout.write(f"MCQ Total Score: {totals.get('sum_mcq', 0):.2f}")
            self.stdout.write(f"Text Sentiment Total Score: {totals.get('sum_text', 0):.2f}")
            self.stdout.write(f"Overall Score: {totals.get('overall', 0):.2f}")
            
            # Text sentiment details
            text_sentiments = results.get('text_sentiments', [])
            if text_sentiments:
                self.stdout.write(f"\nText Sentiment Analysis ({len(text_sentiments)} responses):")
                
                positive_count = sum(1 for item in text_sentiments if item.get('sentiment') == 'POSITIVE')
                negative_count = sum(1 for item in text_sentiments if item.get('sentiment') == 'NEGATIVE')
                neutral_count = len(text_sentiments) - positive_count - negative_count
                
                self.stdout.write(f"  Positive: {positive_count}")
                self.stdout.write(f"  Negative: {negative_count}")
                self.stdout.write(f"  Neutral: {neutral_count}")
                
                # Show a few examples
                self.stdout.write(f"\nSample Analysis:")
                for i, item in enumerate(text_sentiments[:5]):
                    sentiment = item.get('sentiment', 'UNKNOWN')
                    confidence = item.get('confidence', 0)
                    answer = item.get('answer', '')[:100] + ('...' if len(str(item.get('answer', ''))) > 100 else '')
                    
                    if sentiment == 'POSITIVE':
                        style = self.style.SUCCESS
                    elif sentiment == 'NEGATIVE':
                        style = self.style.ERROR
                    else:
                        style = self.style.WARNING
                    
                    self.stdout.write(f"  {i+1}. '{answer}'")
                    self.stdout.write(style(f"     → {sentiment} (confidence: {confidence:.3f})"))
            
            # Model info
            model_info = results.get('model_info', {})
            if model_info:
                self.stdout.write(f"\nModel Used: {model_info.get('model_type', 'Unknown')}")
                self.stdout.write(f"Model Trained: {model_info.get('is_trained', False)}")
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"✗ Analysis failed: {str(e)}")
            )