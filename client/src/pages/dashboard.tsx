import { useQuery } from "@tanstack/react-query";
import { SecurityMetrics } from "@/components/ui/security-metrics";
import { RealTimeMonitor } from "@/components/ui/real-time-monitor";
import { ThreatAlerts } from "@/components/ui/threat-alerts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Activity } from "lucide-react";
import { useWebSocket } from "@/lib/websocket";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [realtimeEmails, setRealtimeEmails] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());
  
  // WebSocket connection for real-time updates
  const { isConnected, lastMessage } = useWebSocket("ws://localhost:5000");
  
  // Fetch dashboard metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch recent emails
  const { data: emails } = useQuery({
    queryKey: ["/api/emails/recent", { limit: 10 }],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch active threats
  const { data: threats } = useQuery({
    queryKey: ["/api/threats/active"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch policy status
  const { data: policies } = useQuery({
    queryKey: ["/api/policies"],
    refetchInterval: 60000, // Refresh every minute
  });

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const message = JSON.parse(lastMessage);
        if (message.type === 'email_update') {
          setRealtimeEmails(prev => [message.data, ...prev.slice(0, 9)]);
          setLastUpdate(new Date().toLocaleTimeString());
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    }
  }, [lastMessage]);

  // Use fetched emails if WebSocket data is not available
  const displayEmails = realtimeEmails.length > 0 ? realtimeEmails : (emails || []);

  const defaultMetrics = {
    emailsScanned: 0,
    threatsBlocked: 0,
    dlpViolations: 0,
    usersProtected: 0,
    trends: {
      emailsScanned: 0,
      threatsBlocked: 0,
      dlpViolations: 0,
      usersProtected: 0,
    }
  };

  const metricsData = metrics || defaultMetrics;
  const threatsData = threats || [];
  const policiesData = policies || [];

  const policyStatus = policiesData.map(policy => ({
    name: policy.name,
    status: policy.isActive ? 'active' : 'inactive'
  }));

  const handleAddPolicy = () => {
    // Navigate to policy management page
    window.location.href = '/policy-management';
  };

  const handleExportLogs = () => {
    // Trigger log export
    console.log('Exporting logs...');
  };

  const handleSyncAccounts = async () => {
    try {
      const response = await fetch('/api/emails/sync', { 
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        console.log('Account sync completed');
      }
    } catch (error) {
      console.error('Error syncing accounts:', error);
    }
  };

  return (
    <main className="p-6 bg-background min-h-screen">
      {/* Top Bar */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Security Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Real-time email security monitoring and threat detection
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Real-time Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 pulse-indicator' : 'bg-red-500'}`} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? 'Live Monitoring' : 'Disconnected'}
              </span>
            </div>
            {/* Notification Bell */}
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {threatsData.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {threatsData.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Security Metrics */}
      <div className="mb-8">
        <SecurityMetrics data={metricsData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-Time Monitoring */}
        <div className="lg:col-span-2">
          <RealTimeMonitor
            emails={displayEmails}
            isConnected={isConnected}
            lastUpdate={lastUpdate}
          />
        </div>

        {/* Threat Alerts */}
        <div>
          <ThreatAlerts
            threats={threatsData}
            policies={policyStatus}
            onAddPolicy={handleAddPolicy}
            onExportLogs={handleExportLogs}
            onSyncAccounts={handleSyncAccounts}
          />
        </div>
      </div>

      {/* Email Analysis Details */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Email Analysis Details</CardTitle>
              <div className="flex space-x-2">
                <Button variant={emails?.filter(e => e.status === 'all').length ? "default" : "outline"} size="sm">
                  All
                </Button>
                <Button variant="outline" size="sm">
                  Suspicious
                </Button>
                <Button variant="outline" size="sm">
                  DLP Alerts
                </Button>
                <Button variant="outline" size="sm">
                  Safe
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Sender</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Risk Score</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Timestamp</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayEmails.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No emails to display</p>
                      </td>
                    </tr>
                  ) : (
                    displayEmails.map((email, index) => (
                      <tr key={email.id || index} className="border-b border-border hover:bg-muted/50">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-foreground">{email.subject}</div>
                            <div className="text-sm text-muted-foreground">
                              {email.bodyPreview || 'No preview available'}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-foreground">{email.sender}</td>
                        <td className="py-4 px-4">
                          <Badge className={`badge-${email.classification || 'safe'}`}>
                            {email.classification === 'dlp_violation' ? 'DLP Alert' : 
                             email.classification || 'Safe'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-12 bg-muted rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  (email.riskScore || 0) > 80 ? 'risk-bar-critical' :
                                  (email.riskScore || 0) > 60 ? 'risk-bar-high' :
                                  (email.riskScore || 0) > 30 ? 'risk-bar-medium' : 'risk-bar-low'
                                }`}
                                style={{ width: `${email.riskScore || 10}%` }}
                              />
                            </div>
                            <span className="text-sm text-foreground">{email.riskScore || 10}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {email.timestamp || new Date().toLocaleTimeString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button variant="link" size="sm" className="text-primary">
                              View
                            </Button>
                            {email.classification !== 'safe' && (
                              <Button variant="link" size="sm" className="text-destructive">
                                Block
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
