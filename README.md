# SecureShield Email DLP - AI-Powered Enterprise Security Platform

SecureShield is an advanced email security platform inspired by Tessian, featuring AI-powered policy management, real-time threat detection, and comprehensive data loss prevention capabilities.

## 🚀 Features

### Core Security Capabilities
- **Real-time Email Monitoring** - Live analysis and threat detection
- **AI-Powered Policy Engine** - Intelligent security recommendations
- **Data Loss Prevention (DLP)** - Protect sensitive information
- **Phishing Detection** - Advanced threat identification
- **Microsoft Graph Integration** - Seamless Office 365 connectivity
- **Machine Learning Classification** - Python-based email analysis

### Advanced Policy Management
- **Intelligent Policy Suggestions** - AI recommendations based on organizational patterns
- **Risk-Based Policy Creation** - Automated policy generation from threat analysis
- **Policy Testing & Simulation** - Test policies before deployment
- **Continuous Learning** - AI improves recommendations over time
- **Compliance Intelligence** - Industry best practices integration

### Real-time Dashboard
- **Live Email Analysis** - WebSocket-powered real-time updates
- **Threat Alert System** - Immediate security notifications
- **Security Metrics** - Comprehensive analytics and reporting
- **Interactive Policy Builder** - Drag-and-drop policy creation
- **Predictive Risk Analysis** - Forecast potential security issues

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** with custom Tessian-inspired design
- **shadcn/ui** components for professional UI
- **TanStack Query** for data fetching and caching
- **Wouter** for lightweight routing
- **WebSocket** integration for real-time updates

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** with Drizzle ORM
- **Microsoft Graph API** for email access
- **WebSocket Server** for real-time communication
- **OAuth 2.0** authentication flow

### AI & Machine Learning
- **Python ML Service** using scikit-learn
- **TensorFlow** for advanced pattern recognition
- **Natural Language Processing** for content analysis
- **Naive Bayes Classifier** for email categorization
- **Real-time Analysis Pipeline** for immediate threat detection

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.8+ with pip
- PostgreSQL database
- Microsoft Azure app registration (for Graph API)

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/secureshield

# Microsoft Graph API
MICROSOFT_CLIENT_ID=your_azure_app_client_id
MICROSOFT_CLIENT_SECRET=your_azure_app_client_secret
MICROSOFT_TENANT_ID=your_azure_tenant_id
MICROSOFT_REDIRECT_URI=http://localhost:5000/api/auth/graph/callback

# Python ML Service
PYTHON_PATH=python3
