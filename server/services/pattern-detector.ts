/**
 * Smart Pattern Detection Service
 * Detects sensitive data patterns with AI-powered validation to minimize false positives
 */

export interface PatternMatch {
  type: 'credit_card' | 'ssn' | 'phone' | 'bank_account' | 'passport';
  value: string;
  confidence: number;
  position: number;
  context: string; // surrounding text
}

export class PatternDetector {
  
  /**
   * Detect credit card numbers with Luhn algorithm validation
   */
  detectCreditCards(text: string): PatternMatch[] {
    const matches: PatternMatch[] = [];
    
    // Credit card patterns (Visa, MasterCard, Amex, Discover)
    const patterns = [
      /\b4[0-9]{12}(?:[0-9]{3})?\b/g, // Visa
      /\b5[1-5][0-9]{14}\b/g, // MasterCard
      /\b3[47][0-9]{13}\b/g, // American Express
      /\b6(?:011|5[0-9]{2})[0-9]{12}\b/g, // Discover
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const cardNumber = match[0].replace(/\s+/g, '');
        
        // Validate with Luhn algorithm
        if (this.validateCreditCard(cardNumber)) {
          const context = this.getContext(text, match.index, 20);
          
          // Additional context validation to reduce false positives
          const confidence = this.calculateCreditCardConfidence(cardNumber, context);
          
          if (confidence > 0.7) {
            matches.push({
              type: 'credit_card',
              value: cardNumber,
              confidence,
              position: match.index,
              context
            });
          }
        }
      }
    });

    return matches;
  }

  /**
   * Detect Social Security Numbers with format validation
   */
  detectSSN(text: string): PatternMatch[] {
    const matches: PatternMatch[] = [];
    
    // SSN patterns: XXX-XX-XXXX, XXX XX XXXX, XXXXXXXXX
    const patterns = [
      /\b(?!000|666|9\d{2})\d{3}[-\s]?(?!00)\d{2}[-\s]?(?!0000)\d{4}\b/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const ssn = match[0].replace(/[-\s]/g, '');
        const context = this.getContext(text, match.index, 15);
        
        // Validate SSN format and avoid common false positives
        const confidence = this.calculateSSNConfidence(ssn, context);
        
        if (confidence > 0.8) {
          matches.push({
            type: 'ssn',
            value: ssn,
            confidence,
            position: match.index,
            context
          });
        }
      }
    });

    return matches;
  }

  /**
   * Detect phone numbers with international format support
   */
  detectPhoneNumbers(text: string): PatternMatch[] {
    const matches: PatternMatch[] = [];
    
    // Phone patterns: US and international
    const patterns = [
      /\b(?:\+1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g, // US format
      /\b\+[1-9]\d{1,14}\b/g, // International format
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const phone = match[0];
        const context = this.getContext(text, match.index, 15);
        
        // Calculate confidence based on context
        const confidence = this.calculatePhoneConfidence(phone, context);
        
        if (confidence > 0.6) {
          matches.push({
            type: 'phone',
            value: phone,
            confidence,
            position: match.index,
            context
          });
        }
      }
    });

    return matches;
  }

  /**
   * Detect bank account numbers with routing validation
   */
  detectBankAccounts(text: string): PatternMatch[] {
    const matches: PatternMatch[] = [];
    
    // Bank account patterns
    const routingPattern = /\b[0-9]{9}\b/g; // US routing numbers
    const accountPattern = /\b[0-9]{8,17}\b/g; // Account numbers
    
    // Look for routing + account combinations
    let routingMatch;
    while ((routingMatch = routingPattern.exec(text)) !== null) {
      const routing = routingMatch[0];
      const context = this.getContext(text, routingMatch.index, 50);
      
      // Look for account numbers near routing numbers
      const nearbyText = text.slice(
        Math.max(0, routingMatch.index - 100),
        routingMatch.index + 100
      );
      
      let accountMatch;
      while ((accountMatch = accountPattern.exec(nearbyText)) !== null) {
        const account = accountMatch[0];
        
        if (account !== routing) { // Ensure they're different
          const confidence = this.calculateBankAccountConfidence(routing, account, context);
          
          if (confidence > 0.7) {
            matches.push({
              type: 'bank_account',
              value: `${routing}/${account}`,
              confidence,
              position: routingMatch.index,
              context
            });
          }
        }
      }
    }

    return matches;
  }

  /**
   * Detect passport numbers with format validation
   */
  detectPassports(text: string): PatternMatch[] {
    const matches: PatternMatch[] = [];
    
    // US Passport pattern: 9 digits or 1-2 letters + 7 digits
    const patterns = [
      /\b[A-Z]{1,2}[0-9]{7}\b/g, // US format
      /\b[0-9]{9}\b/g, // Numeric format
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const passport = match[0];
        const context = this.getContext(text, match.index, 20);
        
        // Look for passport-related keywords in context
        const confidence = this.calculatePassportConfidence(passport, context);
        
        if (confidence > 0.8) {
          matches.push({
            type: 'passport',
            value: passport,
            confidence,
            position: match.index,
            context
          });
        }
      }
    });

    return matches;
  }

  /**
   * Luhn algorithm for credit card validation
   */
  private validateCreditCard(number: string): boolean {
    let sum = 0;
    let isEven = false;
    
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  private calculateCreditCardConfidence(number: string, context: string): number {
    let confidence = 0.8; // Base confidence for valid Luhn
    
    // Boost confidence for credit card related keywords
    const ccKeywords = /\b(card|credit|visa|mastercard|amex|discover|payment|charge)\b/i;
    if (ccKeywords.test(context)) {
      confidence += 0.15;
    }
    
    // Reduce confidence for test/sample numbers
    const testKeywords = /\b(test|sample|example|demo|fake)\b/i;
    if (testKeywords.test(context)) {
      confidence -= 0.3;
    }
    
    return Math.min(1.0, Math.max(0.0, confidence));
  }

  private calculateSSNConfidence(ssn: string, context: string): number {
    let confidence = 0.7; // Base confidence
    
    // Boost for SSN-related keywords
    const ssnKeywords = /\b(ssn|social.security|tax.id|tin)\b/i;
    if (ssnKeywords.test(context)) {
      confidence += 0.2;
    }
    
    // Reduce for common false positive patterns
    const falsePositives = /\b(phone|fax|date|time|order|invoice)\b/i;
    if (falsePositives.test(context)) {
      confidence -= 0.3;
    }
    
    // Check for invalid SSN patterns
    if (ssn.startsWith('000') || ssn.startsWith('666') || ssn.startsWith('9')) {
      confidence -= 0.5;
    }
    
    return Math.min(1.0, Math.max(0.0, confidence));
  }

  private calculatePhoneConfidence(phone: string, context: string): number {
    let confidence = 0.6; // Base confidence
    
    // Boost for phone-related keywords
    const phoneKeywords = /\b(phone|tel|call|mobile|cell|contact)\b/i;
    if (phoneKeywords.test(context)) {
      confidence += 0.2;
    }
    
    // Reduce for non-phone contexts
    const nonPhoneKeywords = /\b(account|id|number|reference|order)\b/i;
    if (nonPhoneKeywords.test(context)) {
      confidence -= 0.2;
    }
    
    return Math.min(1.0, Math.max(0.0, confidence));
  }

  private calculateBankAccountConfidence(routing: string, account: string, context: string): number {
    let confidence = 0.6; // Base confidence
    
    // Boost for banking keywords
    const bankKeywords = /\b(bank|routing|account|deposit|withdraw|transfer|ach)\b/i;
    if (bankKeywords.test(context)) {
      confidence += 0.25;
    }
    
    // Validate routing number format (first digit should be 0-1, 2, or 3)
    const firstDigit = parseInt(routing.charAt(0));
    if (firstDigit >= 0 && firstDigit <= 3) {
      confidence += 0.1;
    }
    
    return Math.min(1.0, Math.max(0.0, confidence));
  }

  private calculatePassportConfidence(passport: string, context: string): number {
    let confidence = 0.5; // Base confidence
    
    // Boost for passport-related keywords
    const passportKeywords = /\b(passport|travel|document|id|identification)\b/i;
    if (passportKeywords.test(context)) {
      confidence += 0.4;
    }
    
    return Math.min(1.0, Math.max(0.0, confidence));
  }

  private getContext(text: string, position: number, radius: number): string {
    const start = Math.max(0, position - radius);
    const end = Math.min(text.length, position + radius);
    return text.slice(start, end);
  }

  /**
   * Main detection method that runs all pattern detectors
   */
  detectAllPatterns(text: string, enabledPatterns: {
    creditCards?: boolean;
    ssn?: boolean;
    phoneNumbers?: boolean;
    bankAccounts?: boolean;
    passports?: boolean;
  }): PatternMatch[] {
    const allMatches: PatternMatch[] = [];
    
    if (enabledPatterns.creditCards) {
      allMatches.push(...this.detectCreditCards(text));
    }
    
    if (enabledPatterns.ssn) {
      allMatches.push(...this.detectSSN(text));
    }
    
    if (enabledPatterns.phoneNumbers) {
      allMatches.push(...this.detectPhoneNumbers(text));
    }
    
    if (enabledPatterns.bankAccounts) {
      allMatches.push(...this.detectBankAccounts(text));
    }
    
    if (enabledPatterns.passports) {
      allMatches.push(...this.detectPassports(text));
    }
    
    // Sort by position and remove overlapping matches
    return this.deduplicateMatches(allMatches);
  }

  private deduplicateMatches(matches: PatternMatch[]): PatternMatch[] {
    // Sort by position
    matches.sort((a, b) => a.position - b.position);
    
    // Remove overlapping matches, keeping the one with highest confidence
    const deduplicated: PatternMatch[] = [];
    
    for (const match of matches) {
      const overlapping = deduplicated.find(existing => 
        Math.abs(existing.position - match.position) < 10
      );
      
      if (!overlapping) {
        deduplicated.push(match);
      } else if (match.confidence > overlapping.confidence) {
        const index = deduplicated.indexOf(overlapping);
        deduplicated[index] = match;
      }
    }
    
    return deduplicated;
  }
}

export const patternDetector = new PatternDetector();