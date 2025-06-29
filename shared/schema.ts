import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("user"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailAccounts = pgTable("email_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  email: text("email").notNull(),
  tenantId: text("tenant_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  isActive: boolean("is_active").default(true),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const policies = pgTable("policies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'dlp', 'phishing', 'malware', 'custom'
  rules: jsonb("rules").notNull(),
  isActive: boolean("is_active").default(true),
  severity: text("severity").notNull().default("medium"), // 'low', 'medium', 'high', 'critical'
  actions: jsonb("actions").notNull(), // ['block', 'quarantine', 'alert', 'log']
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  messageId: text("message_id").notNull().unique(),
  accountId: integer("account_id").references(() => emailAccounts.id),
  subject: text("subject"),
  sender: text("sender").notNull(),
  recipients: jsonb("recipients").notNull(),
  body: text("body"),
  bodyPreview: text("body_preview"),
  hasAttachments: boolean("has_attachments").default(false),
  attachmentInfo: jsonb("attachment_info"),
  receivedAt: timestamp("received_at").notNull(),
  direction: text("direction").notNull(), // 'inbound', 'outbound'
  status: text("status").notNull().default("pending"), // 'pending', 'analyzed', 'blocked', 'delivered'
  riskScore: decimal("risk_score", { precision: 5, scale: 2 }),
  classification: text("classification"), // 'safe', 'suspicious', 'malicious', 'dlp_violation'
  mlAnalysis: jsonb("ml_analysis"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const threats = pgTable("threats", {
  id: serial("id").primaryKey(),
  emailId: integer("email_id").references(() => emails.id),
  policyId: integer("policy_id").references(() => policies.id),
  type: text("type").notNull(), // 'phishing', 'malware', 'dlp', 'suspicious_sender', 'data_leak'
  severity: text("severity").notNull(), // 'low', 'medium', 'high', 'critical'
  description: text("description").notNull(),
  detectionMethod: text("detection_method"), // 'ml', 'rule_based', 'manual'
  isResolved: boolean("is_resolved").default(false),
  resolvedBy: integer("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const policyRecommendations = pgTable("policy_recommendations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  suggestedPolicy: jsonb("suggested_policy").notNull(),
  reasoning: text("reasoning").notNull(),
  priority: text("priority").notNull().default("medium"), // 'low', 'medium', 'high'
  status: text("status").notNull().default("pending"), // 'pending', 'accepted', 'rejected', 'ignored'
  basedOnPattern: text("based_on_pattern"),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  emailAccounts: many(emailAccounts),
  createdPolicies: many(policies),
  resolvedThreats: many(threats),
  auditLogs: many(auditLogs),
}));

export const emailAccountsRelations = relations(emailAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [emailAccounts.userId],
    references: [users.id],
  }),
  emails: many(emails),
}));

export const policiesRelations = relations(policies, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [policies.createdBy],
    references: [users.id],
  }),
  threats: many(threats),
}));

export const emailsRelations = relations(emails, ({ one, many }) => ({
  account: one(emailAccounts, {
    fields: [emails.accountId],
    references: [emailAccounts.id],
  }),
  threats: many(threats),
}));

export const threatsRelations = relations(threats, ({ one }) => ({
  email: one(emails, {
    fields: [threats.emailId],
    references: [emails.id],
  }),
  policy: one(policies, {
    fields: [threats.policyId],
    references: [policies.id],
  }),
  resolvedBy: one(users, {
    fields: [threats.resolvedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
});

export const insertEmailAccountSchema = createInsertSchema(emailAccounts).pick({
  userId: true,
  email: true,
  tenantId: true,
});

export const insertPolicySchema = createInsertSchema(policies).pick({
  name: true,
  description: true,
  type: true,
  rules: true,
  severity: true,
  actions: true,
  createdBy: true,
});

export const insertEmailSchema = createInsertSchema(emails).pick({
  messageId: true,
  accountId: true,
  subject: true,
  sender: true,
  recipients: true,
  body: true,
  bodyPreview: true,
  hasAttachments: true,
  attachmentInfo: true,
  receivedAt: true,
  direction: true,
});

export const insertThreatSchema = createInsertSchema(threats).pick({
  emailId: true,
  policyId: true,
  type: true,
  severity: true,
  description: true,
  detectionMethod: true,
  metadata: true,
});

export const insertPolicyRecommendationSchema = createInsertSchema(policyRecommendations).pick({
  title: true,
  description: true,
  suggestedPolicy: true,
  reasoning: true,
  priority: true,
  basedOnPattern: true,
  confidence: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type EmailAccount = typeof emailAccounts.$inferSelect;
export type InsertEmailAccount = z.infer<typeof insertEmailAccountSchema>;
export type Policy = typeof policies.$inferSelect;
export type InsertPolicy = z.infer<typeof insertPolicySchema>;
export type Email = typeof emails.$inferSelect;
export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type Threat = typeof threats.$inferSelect;
export type InsertThreat = z.infer<typeof insertThreatSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type PolicyRecommendation = typeof policyRecommendations.$inferSelect;
export type InsertPolicyRecommendation = z.infer<typeof insertPolicyRecommendationSchema>;
