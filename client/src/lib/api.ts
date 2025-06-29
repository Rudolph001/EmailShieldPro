import { apiRequest } from "./queryClient";

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface EmailData {
  id: string;
  messageId: string;
  subject: string;
  sender: string;
  recipients: any[];
  body: string;
  bodyPreview: string;
  hasAttachments: boolean;
  receivedAt: string;
  classification: 'safe' | 'suspicious' | 'malicious' | 'dlp_violation';
  riskScore: number;
  timestamp: string;
}

export interface ThreatData {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
}

export interface PolicyData {
  id: number;
  name: string;
  description: string;
  type: 'dlp' | 'phishing' | 'malware' | 'custom';
  rules: any;
  isActive: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PolicyRecommendation {
  id: number;
  title: string;
  description: string;
  suggestedPolicy: any;
  reasoning: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'accepted' | 'rejected' | 'ignored';
  confidence: number;
  createdAt: string;
}

// Dashboard API
export const dashboardApi = {
  getMetrics: async (): Promise<any> => {
    const response = await apiRequest('GET', '/api/dashboard/metrics');
    return response.json();
  },

  getRecentEmails: async (limit: number = 10): Promise<EmailData[]> => {
    const response = await apiRequest('GET', `/api/emails/recent?limit=${limit}`);
    return response.json();
  },

  getActiveThreats: async (): Promise<ThreatData[]> => {
    const response = await apiRequest('GET', '/api/threats/active');
    return response.json();
  },
};

// Email API
export const emailApi = {
  getEmails: async (status?: string, limit: number = 100): Promise<EmailData[]> => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    params.append('limit', limit.toString());
    
    const response = await apiRequest('GET', `/api/emails?${params.toString()}`);
    return response.json();
  },

  syncEmails: async (): Promise<ApiResponse> => {
    const response = await apiRequest('POST', '/api/emails/sync');
    return response.json();
  },

  analyzeEmail: async (emailId: string): Promise<any> => {
    const response = await apiRequest('POST', `/api/emails/${emailId}/analyze`);
    return response.json();
  },
};

// Policy API
export const policyApi = {
  getAllPolicies: async (): Promise<PolicyData[]> => {
    const response = await apiRequest('GET', '/api/policies');
    return response.json();
  },

  createPolicy: async (policy: Omit<PolicyData, 'id' | 'createdAt' | 'updatedAt'>): Promise<PolicyData> => {
    const response = await apiRequest('POST', '/api/policies', policy);
    return response.json();
  },

  updatePolicy: async (id: number, updates: Partial<PolicyData>): Promise<PolicyData> => {
    const response = await apiRequest('PATCH', `/api/policies/${id}`, updates);
    return response.json();
  },

  deletePolicy: async (id: number): Promise<ApiResponse> => {
    const response = await apiRequest('DELETE', `/api/policies/${id}`);
    return response.json();
  },

  testPolicy: async (id: number, emailData: any): Promise<any> => {
    const response = await apiRequest('POST', `/api/policies/${id}/test`, { emailData });
    return response.json();
  },

  getRecommendations: async (): Promise<PolicyRecommendation[]> => {
    const response = await apiRequest('GET', '/api/policies/recommendations');
    return response.json();
  },

  generateRecommendations: async (): Promise<ApiResponse> => {
    const response = await apiRequest('POST', '/api/policies/generate-recommendations');
    return response.json();
  },

  acceptRecommendation: async (id: number): Promise<ApiResponse> => {
    const response = await apiRequest('PATCH', `/api/policies/recommendations/${id}`, { 
      status: 'accepted' 
    });
    return response.json();
  },

  rejectRecommendation: async (id: number): Promise<ApiResponse> => {
    const response = await apiRequest('PATCH', `/api/policies/recommendations/${id}`, { 
      status: 'rejected' 
    });
    return response.json();
  },
};

// Authentication API
export const authApi = {
  getGraphAuthUrl: async (): Promise<{ authUrl: string }> => {
    const response = await apiRequest('GET', '/api/auth/graph/url');
    return response.json();
  },

  handleGraphCallback: async (code: string): Promise<ApiResponse> => {
    const response = await apiRequest('POST', '/api/auth/graph/callback', { code });
    return response.json();
  },
};

// Email Accounts API
export const emailAccountApi = {
  getAccounts: async (): Promise<any[]> => {
    const response = await apiRequest('GET', '/api/email-accounts');
    return response.json();
  },

  addAccount: async (account: { email: string; tenantId: string }): Promise<any> => {
    const response = await apiRequest('POST', '/api/email-accounts', account);
    return response.json();
  },
};

// Export all APIs
export const api = {
  dashboard: dashboardApi,
  email: emailApi,
  policy: policyApi,
  auth: authApi,
  emailAccount: emailAccountApi,
};

export default api;
