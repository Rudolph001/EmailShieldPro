import { spawn } from 'child_process';
import path from 'path';

interface EmailAnalysis {
  classification: 'safe' | 'suspicious' | 'malicious' | 'dlp_violation';
  confidence: number;
  riskScore: number;
  reasons: string[];
  features: {
    hasUrls: boolean;
    hasAttachments: boolean;
    urgencyKeywords: string[];
    sensitiveDataTypes: string[];
    suspiciousPatterns: string[];
  };
}

class MLService {
  private pythonPath: string;
  private scriptPath: string;

  constructor() {
    this.pythonPath = process.env.PYTHON_PATH || 'python3';
    this.scriptPath = path.join(process.cwd(), 'ml_classifier', 'email_classifier.py');
  }

  async analyzeEmail(subject: string, body: string): Promise<EmailAnalysis> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.pythonPath, [
        this.scriptPath,
        JSON.stringify({ subject, body })
      ]);

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const analysis = JSON.parse(output.trim());
            resolve(analysis);
          } catch (error) {
            console.error('Error parsing ML analysis output:', error);
            resolve(this.getFallbackAnalysis(subject, body));
          }
        } else {
          console.error('ML analysis failed:', errorOutput);
          resolve(this.getFallbackAnalysis(subject, body));
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('Error running ML analysis:', error);
        resolve(this.getFallbackAnalysis(subject, body));
      });
    });
  }

  private getFallbackAnalysis(subject: string, body: string): EmailAnalysis {
    // Fallback rule-based analysis if ML service fails
    const text = `${subject} ${body}`.toLowerCase();
    
    // Suspicious keywords
    const suspiciousKeywords = [
      'urgent', 'immediate', 'verify', 'suspend', 'click here', 'wire transfer',
      'lottery', 'winner', 'congratulations', 'prince', 'inheritance',
      'bitcoin', 'cryptocurrency', 'investment opportunity'
    ];

    // DLP keywords
    const dlpKeywords = [
      'social security', 'ssn', 'credit card', 'password', 'confidential',
      'proprietary', 'internal only', 'customer data', 'financial records'
    ];

    const foundSuspicious = suspiciousKeywords.filter(keyword => text.includes(keyword));
    const foundDLP = dlpKeywords.filter(keyword => text.includes(keyword));
    
    // URL detection
    const hasUrls = /https?:\/\//.test(text);
    
    // Determine classification
    let classification: EmailAnalysis['classification'] = 'safe';
    let riskScore = 10;
    let reasons: string[] = [];

    if (foundDLP.length > 0) {
      classification = 'dlp_violation';
      riskScore = 75;
      reasons.push(`Detected sensitive data: ${foundDLP.join(', ')}`);
    } else if (foundSuspicious.length >= 2) {
      classification = 'malicious';
      riskScore = 90;
      reasons.push(`Multiple suspicious keywords: ${foundSuspicious.join(', ')}`);
    } else if (foundSuspicious.length > 0 || hasUrls) {
      classification = 'suspicious';
      riskScore = 60;
      if (foundSuspicious.length > 0) {
        reasons.push(`Suspicious keywords: ${foundSuspicious.join(', ')}`);
      }
      if (hasUrls) {
        reasons.push('Contains external URLs');
      }
    }

    return {
      classification,
      confidence: 0.7, // Lower confidence for fallback analysis
      riskScore,
      reasons,
      features: {
        hasUrls,
        hasAttachments: false, // Would need to check attachment data
        urgencyKeywords: foundSuspicious.filter(k => ['urgent', 'immediate'].includes(k)),
        sensitiveDataTypes: foundDLP,
        suspiciousPatterns: foundSuspicious,
      }
    };
  }

  async trainModel(trainingData: Array<{ subject: string; body: string; label: string }>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.pythonPath, [
        this.scriptPath,
        '--train',
        JSON.stringify(trainingData)
      ]);

      let errorOutput = '';

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          console.error('Model training failed:', errorOutput);
          resolve(false);
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('Error training model:', error);
        resolve(false);
      });
    });
  }
}

export const mlService = new MLService();
