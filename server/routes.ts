import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { graphApiService } from "./services/graph-api";
import { mlService } from "./services/ml-service";
import { setupWebSocket } from "./services/websocket";
import { policyEngine } from "./services/policy-engine";
import { attachmentScanner } from "./services/attachment-scanner";
import { insertEmailAccountSchema, insertPolicySchema, insertPolicyRecommendationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket for real-time updates - only in production to avoid Vite conflicts
  if (process.env.NODE_ENV !== 'development') {
    const wss = new WebSocketServer({ 
      server: httpServer,
      path: '/api/ws'
    });
    setupWebSocket(wss);
  }

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    // TODO: Implement proper authentication
    // For now, assume user is authenticated
    req.user = { id: 1, role: 'admin' };
    next();
  };

  // Dashboard metrics endpoint
  app.get("/api/dashboard/metrics", requireAuth, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  });

  // Real-time email monitoring
  app.get("/api/emails/recent", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const emails = await storage.getRecentEmails(limit);
      res.json(emails);
    } catch (error) {
      console.error("Error fetching recent emails:", error);
      res.status(500).json({ error: "Failed to fetch recent emails" });
    }
  });

  // Email analysis endpoint
  app.get("/api/emails", requireAuth, async (req, res) => {
    try {
      const { status, limit = 100 } = req.query;
      const emails = await storage.getEmailsByStatus(status as string, parseInt(limit as string));
      res.json(emails);
    } catch (error) {
      console.error("Error fetching emails:", error);
      res.status(500).json({ error: "Failed to fetch emails" });
    }
  });

  // Active threats endpoint
  app.get("/api/threats/active", requireAuth, async (req, res) => {
    try {
      const threats = await storage.getActiveThreats();
      res.json(threats);
    } catch (error) {
      console.error("Error fetching active threats:", error);
      res.status(500).json({ error: "Failed to fetch active threats" });
    }
  });

  // Policy management endpoints
  app.get("/api/policies", requireAuth, async (req, res) => {
    try {
      const policies = await storage.getAllPolicies();
      res.json(policies);
    } catch (error) {
      console.error("Error fetching policies:", error);
      res.status(500).json({ error: "Failed to fetch policies" });
    }
  });

  app.post("/api/policies", requireAuth, async (req, res) => {
    try {
      const policyData = insertPolicySchema.parse({
        ...req.body,
        createdBy: req.user.id,
      });
      const policy = await storage.createPolicy(policyData);
      res.status(201).json(policy);
    } catch (error) {
      console.error("Error creating policy:", error);
      res.status(400).json({ error: "Failed to create policy" });
    }
  });

  // Policy recommendations endpoint
  app.get("/api/policies/recommendations", requireAuth, async (req, res) => {
    try {
      const recommendations = await storage.getPolicyRecommendations();
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching policy recommendations:", error);
      res.status(500).json({ error: "Failed to fetch policy recommendations" });
    }
  });

  app.post("/api/policies/recommendations", requireAuth, async (req, res) => {
    try {
      const recommendationData = insertPolicyRecommendationSchema.parse(req.body);
      const recommendation = await storage.createPolicyRecommendation(recommendationData);
      res.status(201).json(recommendation);
    } catch (error) {
      console.error("Error creating policy recommendation:", error);
      res.status(400).json({ error: "Failed to create policy recommendation" });
    }
  });

  // Email account management
  app.get("/api/email-accounts", requireAuth, async (req, res) => {
    try {
      const accounts = await storage.getEmailAccountsByUser(req.user.id);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching email accounts:", error);
      res.status(500).json({ error: "Failed to fetch email accounts" });
    }
  });

  app.post("/api/email-accounts", requireAuth, async (req, res) => {
    try {
      const accountData = insertEmailAccountSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const account = await storage.createEmailAccount(accountData);
      res.status(201).json(account);
    } catch (error) {
      console.error("Error creating email account:", error);
      res.status(400).json({ error: "Failed to create email account" });
    }
  });

  // Microsoft Graph OAuth endpoints
  app.get("/api/auth/graph/url", requireAuth, (req, res) => {
    try {
      const authUrl = graphApiService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      console.error("Error generating auth URL:", error);
      res.status(500).json({ error: "Failed to generate auth URL" });
    }
  });

  app.post("/api/auth/graph/callback", requireAuth, async (req, res) => {
    try {
      const { code } = req.body;
      const tokens = await graphApiService.handleCallback(code);
      
      // Store tokens for the user
      await storage.updateEmailAccountTokens(req.user.id, tokens);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error handling OAuth callback:", error);
      res.status(400).json({ error: "Failed to handle OAuth callback" });
    }
  });

  // Manual email sync trigger
  app.post("/api/emails/sync", requireAuth, async (req, res) => {
    try {
      const accounts = await storage.getEmailAccountsByUser(req.user.id);
      
      for (const account of accounts) {
        if (account.accessToken) {
          // Fetch latest emails
          const emails = await graphApiService.getRecentEmails(account.accessToken, 5);
          
          for (const emailData of emails) {
            // Store email
            const email = await storage.createEmail({
              messageId: emailData.id,
              accountId: account.id,
              subject: emailData.subject || "",
              sender: emailData.sender?.emailAddress?.address || "",
              recipients: emailData.toRecipients || [],
              body: emailData.body?.content || "",
              bodyPreview: emailData.bodyPreview || "",
              hasAttachments: emailData.hasAttachments || false,
              attachmentInfo: emailData.attachments || null,
              receivedAt: new Date(emailData.receivedDateTime),
              direction: "inbound",
            });

            // Analyze with ML service
            const analysis = await mlService.analyzeEmail(
              emailData.subject || "",
              emailData.body?.content || ""
            );

            // Update email with analysis
            await storage.updateEmailAnalysis(email.id, analysis);

            // Check against policies
            const threats = await policyEngine.checkPolicies(email, analysis);
            
            // Store threats
            for (const threat of threats) {
              await storage.createThreat(threat);
            }
          }
        }
      }

      res.json({ success: true, message: "Email sync completed" });
    } catch (error) {
      console.error("Error syncing emails:", error);
      res.status(500).json({ error: "Failed to sync emails" });
    }
  });

  // Policy testing endpoint
  app.post("/api/policies/:id/test", requireAuth, async (req, res) => {
    try {
      const policyId = parseInt(req.params.id);
      const { emailData } = req.body;
      
      const policy = await storage.getPolicyById(policyId);
      if (!policy) {
        return res.status(404).json({ error: "Policy not found" });
      }

      const testResult = await policyEngine.testPolicy(policy, emailData);
      res.json(testResult);
    } catch (error) {
      console.error("Error testing policy:", error);
      res.status(500).json({ error: "Failed to test policy" });
    }
  });

  // Generate AI policy recommendations
  app.post("/api/policies/generate-recommendations", requireAuth, async (req, res) => {
    try {
      // Analyze recent email patterns
      const recentEmails = await storage.getRecentEmails(1000);
      const recommendations = await policyEngine.generateRecommendations(recentEmails);
      
      // Store recommendations
      for (const rec of recommendations) {
        await storage.createPolicyRecommendation(rec);
      }

      res.json({ success: true, count: recommendations.length });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  // Email content scanning endpoint
  app.post("/api/emails/scan-content", requireAuth, async (req, res) => {
    try {
      const { emailId, scanRules } = req.body;
      
      // Get email details
      const emails = await storage.getEmailsByStatus(undefined, 1);
      const email = emails.find(e => e.id === emailId);
      
      if (!email) {
        return res.status(404).json({ error: "Email not found" });
      }

      // Get user's email account for access token
      const accounts = await storage.getEmailAccountsByUser(req.user.id);
      const accessToken = accounts[0]?.accessToken || null;

      // Example scan rules for demonstration
      const defaultScanRules = [
        {
          name: "Financial Data Detection",
          scanSubject: true,
          scanBody: true,
          scanAttachments: true,
          keywordRules: [
            {
              keywords: ["credit card", "social security", "bank account", "ssn"],
              matchType: "any",
              caseSensitive: false,
              wholeWords: true
            }
          ],
          attachmentRules: [
            attachmentScanner.createFinancialDataRule()
          ]
        },
        {
          name: "Confidential Information",
          scanSubject: true,
          scanBody: true,
          scanAttachments: true,
          keywordRules: [
            {
              keywords: ["confidential", "proprietary", "internal only"],
              matchType: "any",
              caseSensitive: false,
              wholeWords: true
            },
            {
              keywords: ["urgent", "immediate", "action required"],
              matchType: "all",
              caseSensitive: false,
              wholeWords: true
            }
          ],
          attachmentRules: [
            attachmentScanner.createConfidentialDataRule()
          ]
        }
      ];

      // Use provided scan rules or defaults
      const rulesToUse = scanRules || defaultScanRules;
      
      // Perform content scan
      const scanResults = await policyEngine.scanEmailContent(email, accessToken, rulesToUse);
      
      res.json({
        success: true,
        email: {
          id: email.id,
          subject: email.subject,
          sender: email.sender,
          hasAttachments: email.hasAttachments
        },
        scanResults,
        totalMatches: scanResults.reduce((sum, result) => sum + result.matches.length, 0),
        highestRiskScore: Math.max(...scanResults.map(r => r.overallRiskScore), 0)
      });
      
    } catch (error) {
      console.error("Error scanning email content:", error);
      res.status(500).json({ error: "Failed to scan email content" });
    }
  });

  return httpServer;
}
