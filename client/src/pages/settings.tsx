import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Bell, Shield, Database, Globe, Key } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your email security platform preferences and integrations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>General Configuration</span>
              </CardTitle>
              <CardDescription>
                Basic platform settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input id="orgName" placeholder="Your Company Name" defaultValue="SecureShield Demo" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" placeholder="UTC-8" defaultValue="UTC-0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Administrator Email</Label>
                <Input id="adminEmail" type="email" placeholder="admin@company.com" defaultValue="admin@company.com" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Settings</span>
              </CardTitle>
              <CardDescription>
                Configure how and when you receive security alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Real-time Threat Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Instant notifications for critical security threats
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Daily Security Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Email summary of daily security activity
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Policy Recommendations</Label>
                  <p className="text-sm text-muted-foreground">
                    AI-generated policy improvement suggestions
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Configuration</span>
              </CardTitle>
              <CardDescription>
                Advanced security and scanning settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Aggressive Threat Detection</Label>
                  <p className="text-sm text-muted-foreground">
                    Higher sensitivity may increase false positives
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Policy Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Auto-apply AI-recommended security policies
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Attachment Deep Scanning</Label>
                  <p className="text-sm text-muted-foreground">
                    Scan inside compressed files and documents
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Integrations</span>
              </CardTitle>
              <CardDescription>
                External service connections and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                    <Globe className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Microsoft 365</div>
                    <div className="text-xs text-muted-foreground">Email access</div>
                  </div>
                </div>
                <Badge variant="secondary">Not Connected</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                    <Database className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">Database</div>
                    <div className="text-xs text-muted-foreground">PostgreSQL</div>
                  </div>
                </div>
                <Badge variant="default">Connected</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">ML Engine</div>
                    <div className="text-xs text-muted-foreground">Threat detection</div>
                  </div>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>Microsoft Graph API Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure Azure AD app registration for email security and UEBA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Connection Status */}
              <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium">Setup Required</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Configure your Azure AD app registration to enable email monitoring and user behavior analytics.
                </p>
              </div>

              {/* Configuration Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tenantId">Tenant ID</Label>
                  <Input 
                    id="tenantId" 
                    placeholder="12345678-1234-1234-1234-123456789012" 
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Found in Azure Portal → Azure Active Directory → Overview
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientId">Client ID (Application ID)</Label>
                  <Input 
                    id="clientId" 
                    placeholder="87654321-4321-4321-4321-210987654321" 
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Found in your app registration overview page
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientSecret">Client Secret</Label>
                  <Input 
                    id="clientSecret" 
                    type="password" 
                    placeholder="Enter client secret value"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Create under Certificates & secrets in your app registration
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button>Save Configuration</Button>
                  <Button variant="outline">Test Connection</Button>
                </div>
              </div>

              {/* Setup Instructions */}
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-semibold">Setup Instructions</h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <div>
                      <div className="font-medium">Register App in Azure Portal</div>
                      <div className="text-muted-foreground">
                        Go to <span className="font-mono">portal.azure.com</span> → Azure Active Directory → App registrations
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <div>
                      <div className="font-medium">Configure API Permissions</div>
                      <div className="text-muted-foreground">Add these Microsoft Graph permissions:</div>
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="font-mono text-xs">Mail.Read</Badge>
                          <span className="text-xs text-muted-foreground">Read user mailboxes</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="font-mono text-xs">AuditLog.Read.All</Badge>
                          <span className="text-xs text-muted-foreground">Read audit logs</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="font-mono text-xs">User.Read.All</Badge>
                          <span className="text-xs text-muted-foreground">Read user profiles</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="font-mono text-xs">Directory.Read.All</Badge>
                          <span className="text-xs text-muted-foreground">Read directory data</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <div>
                      <div className="font-medium">Grant Admin Consent</div>
                      <div className="text-muted-foreground">
                        Click "Grant admin consent" to authorize the permissions
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                    <div>
                      <div className="font-medium">Enter Credentials Above</div>
                      <div className="text-muted-foreground">
                        Copy your Tenant ID, Client ID, and Client Secret to the form above
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supported Features */}
              <Separator />
              
              <div className="space-y-3">
                <h4 className="font-semibold">Available Features</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">Email Security</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Real-time email monitoring and threat detection
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">User Behavior Analytics</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Sign-in analysis and anomaly detection
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">Audit Logs</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Directory changes and administrative actions
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">Security Alerts</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Azure AD security incidents and risks
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Version</span>
                <span className="font-mono">1.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Environment</span>
                <span className="font-mono">Development</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Database</span>
                <span className="font-mono">PostgreSQL 14</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-mono">{new Date().toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}