#!/usr/bin/env python3
"""
Email Security Classifier - AI-powered email threat detection
Inspired by Tessian's approach to email security
"""

import sys
import json
import re
import pickle
import os
from typing import Dict, List, Tuple, Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import warnings
warnings.filterwarnings('ignore')

class EmailSecurityClassifier:
    """
    Advanced email security classifier using machine learning
    """
    
    def __init__(self, model_path: str = "email_security_model.pkl"):
        self.model_path = model_path
        self.pipeline = None
        self.feature_names = []
        
        # Security patterns and keywords
        self.phishing_keywords = [
            'urgent', 'immediate', 'verify', 'suspend', 'click here', 'act now',
            'limited time', 'expire', 'confirm', 'update payment', 'security alert',
            'account locked', 'unusual activity', 'verify identity', 'wire transfer'
        ]
        
        self.dlp_keywords = [
            'confidential', 'proprietary', 'internal only', 'do not distribute',
            'social security', 'ssn', 'credit card', 'password', 'api key',
            'customer data', 'financial records', 'salary', 'compensation',
            'merger', 'acquisition', 'insider', 'personal information', 'pii'
        ]
        
        self.urgency_keywords = [
            'urgent', 'asap', 'immediately', 'emergency', 'critical',
            'deadline', 'expires', 'last chance', 'final notice'
        ]
        
        self.suspicious_patterns = [
            r'https?://[^\s]+\.tk\b',  # .tk domains
            r'https?://[^\s]+\.ml\b',  # .ml domains  
            r'https?://bit\.ly/\w+',   # Shortened URLs
            r'https?://tinyurl\.com/\w+',
            r'\$\d+[,\d]*\.\d{2}',     # Money amounts
            r'\b\d{3}-\d{2}-\d{4}\b',  # SSN patterns
            r'\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b',  # Credit card patterns
        ]
        
        # Load existing model if available
        self.load_model()
    
    def extract_features(self, subject: str, body: str) -> Dict[str, Any]:
        """
        Extract comprehensive features from email content
        """
        text = f"{subject} {body}".lower()
        
        features = {
            'text_content': text,
            'subject_length': len(subject),
            'body_length': len(body),
            'has_urls': bool(re.search(r'https?://', text)),
            'url_count': len(re.findall(r'https?://[^\s]+', text)),
            'phishing_keyword_count': sum(1 for keyword in self.phishing_keywords if keyword in text),
            'dlp_keyword_count': sum(1 for keyword in self.dlp_keywords if keyword in text),
            'urgency_keyword_count': sum(1 for keyword in self.urgency_keywords if keyword in text),
            'suspicious_pattern_count': sum(1 for pattern in self.suspicious_patterns if re.search(pattern, text)),
            'capital_ratio': sum(1 for c in subject + body if c.isupper()) / max(len(subject + body), 1),
            'exclamation_count': text.count('!'),
            'question_count': text.count('?'),
            'money_mentioned': bool(re.search(r'\$[\d,]+', text)),
            'external_domain': not any(domain in text for domain in ['@company.com', '@yourcompany.com']),
        }
        
        return features
    
    def classify_email(self, subject: str, body: str) -> Dict[str, Any]:
        """
        Classify email and return detailed analysis
        """
        features = self.extract_features(subject, body)
        text = features['text_content']
        
        # Initialize result
        result = {
            'classification': 'safe',
            'confidence': 0.0,
            'riskScore': 10,
            'reasons': [],
            'features': {
                'hasUrls': features['has_urls'],
                'hasAttachments': False,  # Would be provided by caller
                'urgencyKeywords': [kw for kw in self.urgency_keywords if kw in text],
                'sensitiveDataTypes': [kw for kw in self.dlp_keywords if kw in text],
                'suspiciousPatterns': []
            }
        }
        
        # Use ML model if available
        if self.pipeline:
            try:
                prediction = self.pipeline.predict([text])[0]
                confidence = max(self.pipeline.predict_proba([text])[0])
                result['confidence'] = float(confidence)
                
                if prediction == 'malicious':
                    result['classification'] = 'malicious'
                    result['riskScore'] = 85 + (confidence * 15)
                elif prediction == 'suspicious':
                    result['classification'] = 'suspicious' 
                    result['riskScore'] = 50 + (confidence * 35)
                elif prediction == 'dlp':
                    result['classification'] = 'dlp_violation'
                    result['riskScore'] = 70 + (confidence * 25)
            except Exception as e:
                print(f"ML prediction error: {e}", file=sys.stderr)
        
        # Rule-based fallback and enhancement
        risk_score = 10
        reasons = []
        
        # DLP Detection
        if features['dlp_keyword_count'] > 0:
            result['classification'] = 'dlp_violation'
            risk_score = max(risk_score, 75)
            reasons.append(f"Contains {features['dlp_keyword_count']} sensitive data indicators")
            result['features']['sensitiveDataTypes'] = [kw for kw in self.dlp_keywords if kw in text]
        
        # Phishing Detection
        phishing_score = 0
        if features['phishing_keyword_count'] >= 2:
            phishing_score += 40
            reasons.append(f"Multiple phishing keywords detected ({features['phishing_keyword_count']})")
        
        if features['urgency_keyword_count'] > 0:
            phishing_score += 20
            reasons.append("Contains urgency indicators")
        
        if features['suspicious_pattern_count'] > 0:
            phishing_score += 30
            reasons.append("Suspicious patterns detected")
            result['features']['suspiciousPatterns'] = [
                pattern for pattern in self.suspicious_patterns 
                if re.search(pattern, text)
            ]
        
        if features['url_count'] > 2:
            phishing_score += 15
            reasons.append(f"Contains {features['url_count']} URLs")
        
        if features['capital_ratio'] > 0.3:
            phishing_score += 10
            reasons.append("Excessive use of capital letters")
        
        if features['exclamation_count'] > 2:
            phishing_score += 10
            reasons.append("Multiple exclamation marks")
        
        # Update classification based on phishing score
        if phishing_score >= 60 and result['classification'] != 'dlp_violation':
            result['classification'] = 'malicious'
            risk_score = max(risk_score, 85)
        elif phishing_score >= 30 and result['classification'] == 'safe':
            result['classification'] = 'suspicious'
            risk_score = max(risk_score, 60)
        
        # External sender check
        if features['external_domain']:
            risk_score += 5
            if result['classification'] == 'safe':
                reasons.append("External sender")
        
        result['riskScore'] = min(risk_score + phishing_score, 100)
        result['reasons'] = reasons
        
        return result
    
    def train_model(self, training_data: List[Dict[str, str]]) -> bool:
        """
        Train the ML model with provided data
        """
        try:
            # Prepare training data
            texts = []
            labels = []
            
            for item in training_data:
                text = f"{item.get('subject', '')} {item.get('body', '')}"
                texts.append(text)
                labels.append(item.get('label', 'safe'))
            
            # Create pipeline
            self.pipeline = Pipeline([
                ('tfidf', TfidfVectorizer(
                    max_features=5000,
                    ngram_range=(1, 2),
                    stop_words='english',
                    lowercase=True
                )),
                ('classifier', MultinomialNB(alpha=0.1))
            ])
            
            # Split data for validation
            if len(texts) > 10:
                X_train, X_test, y_train, y_test = train_test_split(
                    texts, labels, test_size=0.2, random_state=42
                )
                
                # Train model
                self.pipeline.fit(X_train, y_train)
                
                # Validate
                predictions = self.pipeline.predict(X_test)
                accuracy = accuracy_score(y_test, predictions)
                print(f"Model accuracy: {accuracy:.2f}", file=sys.stderr)
                
            else:
                # Too little data, train on all
                self.pipeline.fit(texts, labels)
            
            # Save model
            self.save_model()
            return True
            
        except Exception as e:
            print(f"Training error: {e}", file=sys.stderr)
            return False
    
    def save_model(self):
        """Save trained model to disk"""
        try:
            with open(self.model_path, 'wb') as f:
                pickle.dump(self.pipeline, f)
        except Exception as e:
            print(f"Error saving model: {e}", file=sys.stderr)
    
    def load_model(self):
        """Load trained model from disk"""
        try:
            if os.path.exists(self.model_path):
                with open(self.model_path, 'rb') as f:
                    self.pipeline = pickle.load(f)
        except Exception as e:
            print(f"Error loading model: {e}", file=sys.stderr)

def main():
    classifier = EmailSecurityClassifier()
    
    if len(sys.argv) < 2:
        print("Usage: python email_classifier.py <email_data_json>", file=sys.stderr)
        sys.exit(1)
    
    # Check for training mode
    if sys.argv[1] == '--train':
        if len(sys.argv) < 3:
            print("Training mode requires training data", file=sys.stderr)
            sys.exit(1)
        
        try:
            training_data = json.loads(sys.argv[2])
            success = classifier.train_model(training_data)
            if success:
                print("Training completed successfully", file=sys.stderr)
                sys.exit(0)
            else:
                print("Training failed", file=sys.stderr)
                sys.exit(1)
        except json.JSONDecodeError:
            print("Invalid training data JSON", file=sys.stderr)
            sys.exit(1)
    
    # Normal classification mode
    try:
        email_data = json.loads(sys.argv[1])
        subject = email_data.get('subject', '')
        body = email_data.get('body', '')
        
        result = classifier.classify_email(subject, body)
        print(json.dumps(result))
        
    except json.JSONDecodeError:
        print("Invalid JSON input", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Classification error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
