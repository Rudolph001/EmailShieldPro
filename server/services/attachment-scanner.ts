import { graphApiService } from './graph-api.js';

export interface KeywordMatchRule {
  keywords: string[];
  matchType: 'any' | 'all' | 'sequence'; // any = OR, all = AND, sequence = in order
  caseSensitive: boolean;
  wholeWords: boolean;
}

export interface AttachmentScanRule {
  name: string;
  fileTypes: string[]; // ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'] etc.
  maxFileSize: number; // in MB
  keywordRules: KeywordMatchRule[];
  scanContent: boolean;
  scanFilename: boolean;
}

export interface ScanResult {
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  matches: {
    ruleName: string;
    matchedKeywords: string[];
    locations: string[]; // 'filename', 'content'
    confidence: number;
  }[];
  riskScore: number;
  extractedText?: string;
}

class AttachmentScanner {
  private supportedTextTypes = ['txt', 'csv', 'json', 'xml', 'html'];
  private supportedOfficeTypes = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
  private supportedPdfTypes = ['pdf'];

  async scanEmailAttachments(
    accessToken: string, 
    messageId: string, 
    scanRules: AttachmentScanRule[]
  ): Promise<ScanResult[]> {
    try {
      const attachments = await graphApiService.getEmailAttachments(accessToken, messageId);
      const results: ScanResult[] = [];

      for (const attachment of attachments) {
        const scanResult = await this.scanSingleAttachment(attachment, scanRules);
        if (scanResult) {
          results.push(scanResult);
        }
      }

      return results;
    } catch (error) {
      console.error('Error scanning attachments:', error);
      return [];
    }
  }

  private async scanSingleAttachment(
    attachment: any, 
    scanRules: AttachmentScanRule[]
  ): Promise<ScanResult | null> {
    const fileName = attachment.name || 'unknown';
    const fileType = this.getFileType(fileName);
    const fileSize = attachment.size || 0;
    const fileSizeMB = fileSize / (1024 * 1024);

    const result: ScanResult = {
      fileId: attachment.id,
      fileName,
      fileType,
      fileSize,
      matches: [],
      riskScore: 0
    };

    // Apply scan rules
    for (const rule of scanRules) {
      // Check file type filter
      if (rule.fileTypes.length > 0 && !rule.fileTypes.includes(fileType)) {
        continue;
      }

      // Check file size limit
      if (fileSizeMB > rule.maxFileSize) {
        continue;
      }

      // Scan filename if enabled
      if (rule.scanFilename) {
        const filenameMatches = this.scanTextForKeywords(fileName, rule.keywordRules);
        if (filenameMatches.length > 0) {
          result.matches.push({
            ruleName: rule.name,
            matchedKeywords: filenameMatches,
            locations: ['filename'],
            confidence: 0.9
          });
        }
      }

      // Scan content if enabled and file type is supported
      if (rule.scanContent && this.canExtractText(fileType)) {
        try {
          const content = await this.extractAttachmentContent(attachment);
          if (content) {
            result.extractedText = content;
            const contentMatches = this.scanTextForKeywords(content, rule.keywordRules);
            if (contentMatches.length > 0) {
              result.matches.push({
                ruleName: rule.name,
                matchedKeywords: contentMatches,
                locations: ['content'],
                confidence: 0.8
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to extract content from ${fileName}:`, error);
        }
      }
    }

    // Calculate risk score based on matches
    result.riskScore = this.calculateRiskScore(result.matches);

    return result.matches.length > 0 ? result : null;
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

  private canExtractText(fileType: string): boolean {
    return [
      ...this.supportedTextTypes,
      ...this.supportedOfficeTypes,
      ...this.supportedPdfTypes
    ].includes(fileType);
  }

  private async extractAttachmentContent(attachment: any): Promise<string | null> {
    // For now, return a placeholder. In a real implementation, you'd:
    // 1. Download the attachment content
    // 2. Use appropriate libraries to extract text:
    //    - pdf-parse for PDFs
    //    - mammoth for Word docs
    //    - xlsx for Excel files
    //    - etc.
    
    // Simulate content extraction for demo
    return `Sample extracted content from ${attachment.name}`;
  }

  private getFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension || 'unknown';
  }

  private calculateRiskScore(matches: any[]): number {
    if (matches.length === 0) return 0;

    const baseScore = Math.min(matches.length * 20, 80);
    const confidenceBonus = matches.reduce((sum, match) => sum + match.confidence, 0) / matches.length * 20;
    
    return Math.min(baseScore + confidenceBonus, 100);
  }

  // Utility method to create common scan rules
  static createFinancialDataRule(): AttachmentScanRule {
    return {
      name: 'Financial Data Detection',
      fileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
      maxFileSize: 50, // 50MB
      keywordRules: [
        {
          keywords: ['credit card', 'social security', 'bank account'],
          matchType: 'any',
          caseSensitive: false,
          wholeWords: true
        },
        {
          keywords: ['ssn', 'routing number', 'account number'],
          matchType: 'any',
          caseSensitive: false,
          wholeWords: true
        }
      ],
      scanContent: true,
      scanFilename: true
    };
  }

  static createConfidentialDataRule(): AttachmentScanRule {
    return {
      name: 'Confidential Information',
      fileTypes: [], // All file types
      maxFileSize: 100,
      keywordRules: [
        {
          keywords: ['confidential', 'proprietary', 'internal only'],
          matchType: 'any',
          caseSensitive: false,
          wholeWords: true
        },
        {
          keywords: ['do not', 'distribute', 'externally'],
          matchType: 'all',
          caseSensitive: false,
          wholeWords: true
        }
      ],
      scanContent: true,
      scanFilename: true
    };
  }

  static createCustomKeywordRule(
    name: string,
    keywords: string[],
    matchType: 'any' | 'all' | 'sequence' = 'any'
  ): AttachmentScanRule {
    return {
      name,
      fileTypes: [],
      maxFileSize: 100,
      keywordRules: [
        {
          keywords,
          matchType,
          caseSensitive: false,
          wholeWords: true
        }
      ],
      scanContent: true,
      scanFilename: true
    };
  }
}

export const attachmentScanner = new AttachmentScanner();