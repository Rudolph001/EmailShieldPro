import { 
  users, 
  emailAccounts, 
  policies, 
  emails, 
  threats, 
  auditLogs,
  policyRecommendations,
  type User, 
  type InsertUser,
  type EmailAccount,
  type InsertEmailAccount,
  type Policy,
  type InsertPolicy,
  type Email,
  type InsertEmail,
  type Threat,
  type InsertThreat,
  type PolicyRecommendation,
  type InsertPolicyRecommendation
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, isNull, sql } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Email account management
  getEmailAccountsByUser(userId: number): Promise<EmailAccount[]>;
  createEmailAccount(account: InsertEmailAccount): Promise<EmailAccount>;
  updateEmailAccountTokens(userId: number, tokens: { accessToken: string; refreshToken: string }): Promise<void>;

  // Policy management
  getAllPolicies(): Promise<Policy[]>;
  getPolicyById(id: number): Promise<Policy | undefined>;
  createPolicy(policy: InsertPolicy): Promise<Policy>;
  updatePolicy(id: number, updates: Partial<Policy>): Promise<Policy | undefined>;
  deletePolicy(id: number): Promise<boolean>;

  // Email management
  getRecentEmails(limit: number): Promise<Email[]>;
  getEmailsByStatus(status?: string, limit?: number): Promise<Email[]>;
  createEmail(email: InsertEmail): Promise<Email>;
  updateEmailAnalysis(emailId: number, analysis: any): Promise<void>;

  // Threat management
  getActiveThreats(): Promise<Threat[]>;
  createThreat(threat: InsertThreat): Promise<Threat>;
  resolveThreat(threatId: number, resolvedBy: number): Promise<void>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<any>;

  // Policy recommendations
  getPolicyRecommendations(): Promise<PolicyRecommendation[]>;
  createPolicyRecommendation(recommendation: InsertPolicyRecommendation): Promise<PolicyRecommendation>;
  updatePolicyRecommendation(id: number, status: string, reviewedBy: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getEmailAccountsByUser(userId: number): Promise<EmailAccount[]> {
    return await db.select().from(emailAccounts).where(eq(emailAccounts.userId, userId));
  }

  async createEmailAccount(account: InsertEmailAccount): Promise<EmailAccount> {
    const [emailAccount] = await db
      .insert(emailAccounts)
      .values(account)
      .returning();
    return emailAccount;
  }

  async updateEmailAccountTokens(userId: number, tokens: { accessToken: string; refreshToken: string }): Promise<void> {
    await db
      .update(emailAccounts)
      .set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        lastSyncAt: new Date(),
      })
      .where(eq(emailAccounts.userId, userId));
  }

  async getAllPolicies(): Promise<Policy[]> {
    return await db.select().from(policies).orderBy(desc(policies.createdAt));
  }

  async getPolicyById(id: number): Promise<Policy | undefined> {
    const [policy] = await db.select().from(policies).where(eq(policies.id, id));
    return policy || undefined;
  }

  async createPolicy(policy: InsertPolicy): Promise<Policy> {
    const [newPolicy] = await db
      .insert(policies)
      .values({
        ...policy,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newPolicy;
  }

  async updatePolicy(id: number, updates: Partial<Policy>): Promise<Policy | undefined> {
    const [updatedPolicy] = await db
      .update(policies)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(policies.id, id))
      .returning();
    return updatedPolicy || undefined;
  }

  async deletePolicy(id: number): Promise<boolean> {
    const result = await db.delete(policies).where(eq(policies.id, id));
    return result.rowCount > 0;
  }

  async getRecentEmails(limit: number): Promise<Email[]> {
    return await db
      .select()
      .from(emails)
      .orderBy(desc(emails.receivedAt))
      .limit(limit);
  }

  async getEmailsByStatus(status?: string, limit: number = 100): Promise<Email[]> {
    const query = db.select().from(emails).orderBy(desc(emails.receivedAt)).limit(limit);
    
    if (status && status !== 'all') {
      return await query.where(eq(emails.classification, status));
    }
    
    return await query;
  }

  async createEmail(email: InsertEmail): Promise<Email> {
    const [newEmail] = await db
      .insert(emails)
      .values({
        ...email,
        createdAt: new Date(),
      })
      .returning();
    return newEmail;
  }

  async updateEmailAnalysis(emailId: number, analysis: any): Promise<void> {
    await db
      .update(emails)
      .set({
        classification: analysis.classification,
        riskScore: analysis.riskScore.toString(),
        mlAnalysis: analysis,
        status: 'analyzed',
      })
      .where(eq(emails.id, emailId));
  }

  async getActiveThreats(): Promise<Threat[]> {
    return await db
      .select()
      .from(threats)
      .where(eq(threats.isResolved, false))
      .orderBy(desc(threats.createdAt))
      .limit(10);
  }

  async createThreat(threat: InsertThreat): Promise<Threat> {
    const [newThreat] = await db
      .insert(threats)
      .values({
        ...threat,
        createdAt: new Date(),
      })
      .returning();
    return newThreat;
  }

  async resolveThreat(threatId: number, resolvedBy: number): Promise<void> {
    await db
      .update(threats)
      .set({
        isResolved: true,
        resolvedBy,
        resolvedAt: new Date(),
      })
      .where(eq(threats.id, threatId));
  }

  async getDashboardMetrics(): Promise<any> {
    // Get today's metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Count emails scanned today
    const [emailsToday] = await db
      .select({ count: sql<number>`count(*)` })
      .from(emails)
      .where(sql`${emails.createdAt} >= ${today}`);

    const [emailsYesterday] = await db
      .select({ count: sql<number>`count(*)` })
      .from(emails)
      .where(sql`${emails.createdAt} >= ${yesterday} AND ${emails.createdAt} < ${today}`);

    // Count threats blocked today
    const [threatsToday] = await db
      .select({ count: sql<number>`count(*)` })
      .from(threats)
      .where(sql`${threats.createdAt} >= ${today}`);

    const [threatsYesterday] = await db
      .select({ count: sql<number>`count(*)` })
      .from(threats)
      .where(sql`${threats.createdAt} >= ${yesterday} AND ${threats.createdAt} < ${today}`);

    // Count DLP violations today
    const [dlpToday] = await db
      .select({ count: sql<number>`count(*)` })
      .from(threats)
      .where(and(
        eq(threats.type, 'dlp'),
        sql`${threats.createdAt} >= ${today}`
      ));

    const [dlpYesterday] = await db
      .select({ count: sql<number>`count(*)` })
      .from(threats)
      .where(and(
        eq(threats.type, 'dlp'),
        sql`${threats.createdAt} >= ${yesterday} AND ${threats.createdAt} < ${today}`
      ));

    // Count protected users
    const [usersCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailAccounts)
      .where(eq(emailAccounts.isActive, true));

    const calculateTrend = (today: number, yesterday: number) => {
      if (yesterday === 0) return today > 0 ? 100 : 0;
      return ((today - yesterday) / yesterday) * 100;
    };

    return {
      emailsScanned: emailsToday?.count || 0,
      threatsBlocked: threatsToday?.count || 0,
      dlpViolations: dlpToday?.count || 0,
      usersProtected: usersCount?.count || 0,
      trends: {
        emailsScanned: calculateTrend(emailsToday?.count || 0, emailsYesterday?.count || 0),
        threatsBlocked: calculateTrend(threatsToday?.count || 0, threatsYesterday?.count || 0),
        dlpViolations: calculateTrend(dlpToday?.count || 0, dlpYesterday?.count || 0),
        usersProtected: 0, // Users don't change daily typically
      }
    };
  }

  async getPolicyRecommendations(): Promise<PolicyRecommendation[]> {
    return await db
      .select()
      .from(policyRecommendations)
      .where(eq(policyRecommendations.status, 'pending'))
      .orderBy(desc(policyRecommendations.priority), desc(policyRecommendations.createdAt));
  }

  async createPolicyRecommendation(recommendation: InsertPolicyRecommendation): Promise<PolicyRecommendation> {
    const [newRecommendation] = await db
      .insert(policyRecommendations)
      .values({
        ...recommendation,
        createdAt: new Date(),
      })
      .returning();
    return newRecommendation;
  }

  async updatePolicyRecommendation(id: number, status: string, reviewedBy: number): Promise<void> {
    await db
      .update(policyRecommendations)
      .set({
        status,
        reviewedBy,
        reviewedAt: new Date(),
      })
      .where(eq(policyRecommendations.id, id));
  }
}

export const storage = new DatabaseStorage();
