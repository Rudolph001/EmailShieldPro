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
                <span>API Configuration</span>
              </CardTitle>
              <CardDescription>
                Manage API keys and external services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Microsoft Graph API</Label>
                <div className="flex space-x-2">
                  <Input placeholder="Enter Client ID" type="password" />
                  <Button variant="outline">Update</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <div className="flex space-x-2">
                  <Input placeholder="https://your-webhook-url.com" />
                  <Button variant="outline">Test</Button>
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