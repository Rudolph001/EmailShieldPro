import { Policy, Email, InsertThreat, InsertPolicyRecommendation } from "@shared/schema";
import { attachmentScanner, AttachmentScanRule, KeywordMatchRule } from "./attachment-scanner.js";

interface PolicyTestResult {
  matches: boolean;
  confidence: number;
  triggeredRules: string[];
  suggestedActions: string[];
}

interface ContentScanRule {
  name: string;
  scanSubject: boolean;
  scanBody: boolean;
  scanAttachments: boolean;
  keywordRules: KeywordMatchRule[];
  attachmentRules?: AttachmentScanRule[];
}

interface EmailScanResult {
  ruleName: string;
  matches: {
    location: 'subject' | 'body' | 'attachment';
    matchedKeywords: string[];
    fileName?: string; // For attachment matches
    confidence: number;
  }[];
  overallRiskScore: number;
}

class PolicyEngine {
  // Enhanced email scanning for keywords in subject, body, and attachments
  async scanEmailContent(
    email: Email, 
    accessToken: string | null, 
    scanRules: ContentScanRule[]
  ): Promise<EmailScanResult[]> {
    const results: EmailScanResult[] = [];

    for (const rule of scanRules) {
      const scanResult: EmailScanResult = {
        ruleName: rule.name,
        matches: [],
        overallRiskScore: 0
      };

      // Scan subject
      if (rule.scanSubject && email.subject) {
        const subjectMatches = this.scanTextForKeywords(email.subject, rule.keywordRules);
        if (subjectMatches.length > 0) {
          scanResult.matches.push({
            location: 'subject',
            matchedKeywords: subjectMatches,
            confidence: 0.9
          });
        }
      }

      // Scan body
      if (rule.scanBody && email.body) {
        const bodyMatches = this.scanTextForKeywords(email.body, rule.keywordRules);
        if (bodyMatches.length > 0) {
          scanResult.matches.push({
            location: 'body',
            matchedKeywords: bodyMatches,
            confidence: 0.8
          });
        }
      }

      // Scan attachments
      if (rule.scanAttachments && email.hasAttachments && accessToken && rule.attachmentRules) {
        try {
          const attachmentResults = await attachmentScanner.scanEmailAttachments(
            accessToken, 
            email.messageId, 
            rule.attachmentRules
          );

          for (const attachmentResult of attachmentResults) {
            for (const match of attachmentResult.matches) {
              scanResult.matches.push({
                location: 'attachment',
                matchedKeywords: match.matchedKeywords,
                fileName: attachmentResult.fileName,
                confidence: match.confidence
              });
            }
          }
        } catch (error) {
          console.error('Error scanning attachments:', error);
        }
      }

      // Calculate overall risk score
      if (scanResult.matches.length > 0) {
        scanResult.overallRiskScore = this.calculateOverallRiskScore(scanResult.matches);
        results.push(scanResult);
      }
    }

    return results;
  }

  private scanTextForKeywords(text: string, keywordRules: KeywordMatchRule[]): string[] {
    const allMatches: string[] = [];

    for (const rule of keywordRules) {
      const matches = this.findKeywordMatches(text, rule);
      if (matches.length > 0) {
        allMatches.push(...matches);
      }
    }

    // Remove duplicates
    const uniqueMatches: string[] = [];
    for (const match of allMatches) {
      if (!uniqueMatches.includes(match)) {
        uniqueMatches.push(match);
      }
    }
    return uniqueMatches;
  }

  private findKeywordMatches(text: string, rule: KeywordMatchRule): string[] {
    const searchText = rule.caseSensitive ? text : text.toLowerCase();
    const keywords = rule.caseSensitive ? rule.keywords : rule.keywords.map(k => k.toLowerCase());

    switch (rule.matchType) {
      case 'any':
        return keywords.filter(keyword => this.containsKeyword(searchText, keyword, rule.wholeWords));

      case 'all':
        const allFound = keywords.every(keyword => this.containsKeyword(searchText, keyword, rule.wholeWords));
        return allFound ? keywords : [];

      case 'sequence':
        return this.findSequentialKeywords(searchText, keywords, rule.wholeWords);

      default:
        return [];
    }
  }

  private containsKeyword(text: string, keyword: string, wholeWords: boolean): boolean {
    if (wholeWords) {
      const wordBoundary = new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, 'g');
      return wordBoundary.test(text);
    } else {
      return text.includes(keyword);
    }
  }

  private findSequentialKeywords(text: string, keywords: string[], wholeWords: boolean): string[] {
    if (keywords.length === 0) return [];

    let currentIndex = 0;
    const foundKeywords: string[] = [];

    for (const keyword of keywords) {
      let keywordIndex: number;
      
      if (wholeWords) {
        const wordBoundary = new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, 'g');
        wordBoundary.lastIndex = currentIndex;
        const match = wordBoundary.exec(text);
        keywordIndex = match ? match.index : -1;
      } else {
        keywordIndex = text.indexOf(keyword, currentIndex);
      }

      if (keywordIndex >= currentIndex) {
        foundKeywords.push(keyword);
        currentIndex = keywordIndex + keyword.length;
      } else {
        // Sequence broken
        return [];
      }
    }

    return foundKeywords;
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private calculateOverallRiskScore(matches: any[]): number {
    if (matches.length === 0) return 0;

    const baseScore = Math.min(matches.length * 15, 70);
    const confidenceBonus = matches.reduce((sum, match) => sum + match.confidence, 0) / matches.length * 30;
    
    return Math.min(baseScore + confidenceBonus, 100);
  }

  async checkPolicies(email: Email, analysis: any): Promise<InsertThreat[]> {
    const threats: InsertThreat[] = [];

    // Check DLP violations
    if (analysis.classification === 'dlp_violation') {
      threats.push({
        emailId: email.id!,
        policyId: null, // Would be set based on matched policy
        type: 'dlp',
        severity: 'high',
        description: `DLP violation detected: ${analysis.reasons.join(', ')}`,
        detectionMethod: 'ml',
        metadata: {
          riskScore: analysis.riskScore,
          features: analysis.features,
          mlAnalysis: analysis
        }
      });
    }

    // Check phishing
    if (analysis.classification === 'malicious' || analysis.classification === 'suspicious') {
      const severity = analysis.classification === 'malicious' ? 'critical' : 'medium';
      threats.push({
        emailId: email.id!,
        policyId: null,
        type: 'phishing',
        severity,
        description: `Potential phishing email detected: ${analysis.reasons.join(', ')}`,
        detectionMethod: 'ml',
        metadata: {
          riskScore: analysis.riskScore,
          features: analysis.features,
          mlAnalysis: analysis
        }
      });
    }

    // Check external sender policy
    if (!email.sender.includes('@company.com')) { // Would be configurable
      threats.push({
        emailId: email.id!,
        policyId: null,
        type: 'suspicious_sender',
        severity: 'low',
        description: 'Email from external sender',
        detectionMethod: 'rule_based',
        metadata: {
          sender: email.sender,
          domain: email.sender.split('@')[1]
        }
      });
    }

    return threats;
  }

  async testPolicy(policy: Policy, emailData: any): Promise<PolicyTestResult> {
    const rules = policy.rules as any;
    const triggeredRules: string[] = [];
    let confidence = 0;

    // Simulate policy testing logic
    if (rules.keywords) {
      const text = `${emailData.subject} ${emailData.body}`.toLowerCase();
      for (const keyword of rules.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          triggeredRules.push(`Keyword: ${keyword}`);
          confidence += 20;
        }
      }
    }

    if (rules.senderPattern) {
      if (emailData.sender.match(new RegExp(rules.senderPattern))) {
        triggeredRules.push(`Sender pattern: ${rules.senderPattern}`);
        confidence += 30;
      }
    }

    if (rules.attachmentTypes && emailData.attachments) {
      for (const attachment of emailData.attachments) {
        if (rules.attachmentTypes.includes(attachment.type)) {
          triggeredRules.push(`Attachment type: ${attachment.type}`);
          confidence += 25;
        }
      }
    }

    const matches = triggeredRules.length > 0;
    const actions = policy.actions as string[];

    return {
      matches,
      confidence: Math.min(confidence, 100),
      triggeredRules,
      suggestedActions: matches ? actions : []
    };
  }

  async generateRecommendations(emails: Email[]): Promise<InsertPolicyRecommendation[]> {
    const recommendations: InsertPolicyRecommendation[] = [];

    // Analyze email patterns to generate recommendations
    const suspiciousDomains = this.analyzeDomainsForSuspiciousPatterns(emails);
    const commonKeywords = this.analyzeKeywordPatterns(emails);
    const attachmentRisks = this.analyzeAttachmentPatterns(emails);

    // Generate domain-based recommendations
    for (const domain of suspiciousDomains) {
      recommendations.push({
        title: `Block Suspicious Domain: ${domain.name}`,
        description: `High volume of suspicious emails detected from ${domain.name}. Consider blocking or quarantining emails from this domain.`,
        suggestedPolicy: {
          name: `Block ${domain.name}`,
          type: 'phishing',
          rules: {
            senderPattern: `.*@${domain.name}`,
            action: 'block'
          },
          severity: 'high',
          actions: ['block', 'alert']
        },
        reasoning: `Detected ${domain.count} suspicious emails from ${domain.name} with average risk score of ${domain.avgRisk.toFixed(1)}%`,
        priority: domain.avgRisk > 80 ? 'high' : 'medium',
        basedOnPattern: 'suspicious_domain_analysis',
        confidence: Math.min(domain.count * 10, 95)
      });
    }

    // Generate keyword-based DLP recommendations
    for (const keyword of commonKeywords) {
      if (keyword.dlpRisk > 0.7) {
        recommendations.push({
          title: `DLP Policy for "${keyword.word}"`,
          description: `Frequent use of sensitive keyword "${keyword.word}" detected in outbound emails.`,
          suggestedPolicy: {
            name: `DLP - ${keyword.word}`,
            type: 'dlp',
            rules: {
              keywords: [keyword.word],
              direction: 'outbound',
              action: 'review'
            },
            severity: 'medium',
            actions: ['quarantine', 'alert']
          },
          reasoning: `Keyword "${keyword.word}" appeared in ${keyword.count} emails with potential data sensitivity`,
          priority: 'medium',
          basedOnPattern: 'keyword_frequency_analysis',
          confidence: Math.min(keyword.count * 5, 90)
        });
      }
    }

    // Generate attachment-based recommendations
    for (const attachmentType of attachmentRisks) {
      if (attachmentType.riskScore > 0.6) {
        recommendations.push({
          title: `Restrict ${attachmentType.type} Attachments`,
          description: `High risk associated with ${attachmentType.type} attachments in recent emails.`,
          suggestedPolicy: {
            name: `Restrict ${attachmentType.type}`,
            type: 'malware',
            rules: {
              attachmentTypes: [attachmentType.type],
              action: 'scan_and_quarantine'
            },
            severity: 'high',
            actions: ['quarantine', 'scan', 'alert']
          },
          reasoning: `${attachmentType.count} ${attachmentType.type} attachments detected with elevated risk indicators`,
          priority: attachmentType.riskScore > 0.8 ? 'high' : 'medium',
          basedOnPattern: 'attachment_risk_analysis',
          confidence: Math.min(attachmentType.count * 8, 95)
        });
      }
    }

    return recommendations;
  }

  private analyzeDomainsForSuspiciousPatterns(emails: Email[]): Array<{ name: string; count: number; avgRisk: number }> {
    const domainStats = new Map<string, { count: number; totalRisk: number }>();

    emails.forEach(email => {
      if (email.riskScore && parseFloat(email.riskScore) > 50) {
        const domain = email.sender.split('@')[1];
        if (domain && !domain.includes('company.com')) { // Exclude internal emails
          const stats = domainStats.get(domain) || { count: 0, totalRisk: 0 };
          stats.count++;
          stats.totalRisk += parseFloat(email.riskScore);
          domainStats.set(domain, stats);
        }
      }
    });

    return Array.from(domainStats.entries())
      .map(([domain, stats]) => ({
        name: domain,
        count: stats.count,
        avgRisk: stats.totalRisk / stats.count
      }))
      .filter(domain => domain.count >= 3 && domain.avgRisk > 60)
      .sort((a, b) => b.avgRisk - a.avgRisk)
      .slice(0, 5);
  }

  private analyzeKeywordPatterns(emails: Email[]): Array<{ word: string; count: number; dlpRisk: number }> {
    const keywordStats = new Map<string, number>();
    const dlpKeywords = [
      'confidential', 'proprietary', 'internal', 'password', 'ssn', 'social security',
      'credit card', 'financial', 'salary', 'customer data', 'personal information'
    ];

    emails.forEach(email => {
      const text = `${email.subject} ${email.body}`.toLowerCase();
      dlpKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          keywordStats.set(keyword, (keywordStats.get(keyword) || 0) + 1);
        }
      });
    });

    return Array.from(keywordStats.entries())
      .map(([word, count]) => ({
        word,
        count,
        dlpRisk: Math.min(count / 10, 1) // Simple risk calculation
      }))
      .filter(item => item.count >= 2)
      .sort((a, b) => b.dlpRisk - a.dlpRisk)
      .slice(0, 5);
  }

  private analyzeAttachmentPatterns(emails: Email[]): Array<{ type: string; count: number; riskScore: number }> {
    const attachmentStats = new Map<string, number>();
    const riskyTypes = ['.exe', '.zip', '.rar', '.scr', '.bat', '.cmd', '.pif'];

    emails.forEach(email => {
      if (email.hasAttachments && email.attachmentInfo) {
        const attachments = Array.isArray(email.attachmentInfo) ? email.attachmentInfo : [email.attachmentInfo];
        attachments.forEach((attachment: any) => {
          if (attachment.name) {
            const extension = attachment.name.toLowerCase().split('.').pop();
            if (extension) {
              attachmentStats.set(extension, (attachmentStats.get(extension) || 0) + 1);
            }
          }
        });
      }
    });

    return Array.from(attachmentStats.entries())
      .map(([type, count]) => ({
        type,
        count,
        riskScore: riskyTypes.some(risky => risky.includes(type)) ? 0.9 : 0.3
      }))
      .filter(item => item.count >= 3)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);
  }
}

export const policyEngine = new PolicyEngine();
