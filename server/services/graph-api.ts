import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client';

class GraphApiService {
  private clientId: string;
  private clientSecret: string;
  private tenantId: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.MICROSOFT_CLIENT_ID || process.env.AZURE_CLIENT_ID || "";
    this.clientSecret = process.env.MICROSOFT_CLIENT_SECRET || process.env.AZURE_CLIENT_SECRET || "";
    this.tenantId = process.env.MICROSOFT_TENANT_ID || process.env.AZURE_TENANT_ID || "common";
    this.redirectUri = process.env.MICROSOFT_REDIRECT_URI || process.env.AZURE_REDIRECT_URI || "http://localhost:5000/api/auth/graph/callback";

    if (!this.clientId || !this.clientSecret) {
      console.warn("Microsoft Graph API credentials not found in environment variables");
    }
  }

  getAuthUrl(): string {
    const scopes = [
      'https://graph.microsoft.com/Mail.Read',
      'https://graph.microsoft.com/Mail.ReadBasic',
      'https://graph.microsoft.com/User.Read',
      'offline_access'
    ].join(' ');

    const authUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/authorize?` +
      `client_id=${this.clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `response_mode=query`;

    return authUrl;
  }

  async handleCallback(code: string): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    
    const params = new URLSearchParams();
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('code', code);
    params.append('redirect_uri', this.redirectUri);
    params.append('grant_type', 'authorization_code');

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const tokens = await response.json();
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    
    const params = new URLSearchParams();
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('refresh_token', refreshToken);
    params.append('grant_type', 'refresh_token');

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${error}`);
    }

    const tokens = await response.json();
    return tokens.access_token;
  }

  async getRecentEmails(accessToken: string, count: number = 5): Promise<any[]> {
    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/messages?$top=${count}&$select=id,subject,sender,toRecipients,body,bodyPreview,hasAttachments,receivedDateTime&$orderby=receivedDateTime desc`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch emails: ${error}`);
      }

      const data = await response.json();
      return data.value || [];
    } catch (error) {
      console.error("Error fetching emails from Graph API:", error);
      return [];
    }
  }

  async getUserProfile(accessToken: string): Promise<any> {
    try {
      const response = await fetch(
        'https://graph.microsoft.com/v1.0/me',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch user profile: ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user profile from Graph API:", error);
      return null;
    }
  }

  async getEmailAttachments(accessToken: string, messageId: string): Promise<any[]> {
    try {
      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/messages/${messageId}/attachments`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to fetch attachments: ${error}`);
      }

      const data = await response.json();
      return data.value || [];
    } catch (error) {
      console.error("Error fetching attachments from Graph API:", error);
      return [];
    }
  }
}

export const graphApiService = new GraphApiService();
