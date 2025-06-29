import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import { useWebSocket } from "@/lib/websocket";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Shield, 
  AlertTriangle, 
  Mail,
  Clock,
  User,
  FileText,
  ExternalLink,
  RefreshCw,
  Activity
} from "lucide-react";

export default function EmailMonitoring() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isEmailDetailOpen, setIsEmailDetailOpen] = useState(false);
  const [realTimeEmails, setRealTimeEmails] = useState([]);

  // WebSocket connection for real-time updates
  const { isConnected, lastMessage } = useWebSocket("ws://localhost:5000");

  // Fetch emails based on filters
  const { data: emails, isLoading, refetch } = useQuery({
    queryKey: ["/api/emails", statusFilter],
    queryFn: () => api.email.getEmails(statusFilter),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Handle WebSocket messages for real-time updates
  useEffect(() => {
    if (lastMessage) {
      try {
        const message = JSON.parse(lastMessage);
        if (message.type === 'email_update') {
          setRealTimeEmails(prev => [message.data, ...prev.slice(0, 49)]);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    }
  }, [lastMessage]);

  // Combine real-time and fetched emails
  const displayEmails = realTimeEmails.length > 0 
    ? [...realTimeEmails, ...(emails || [])]
    : (emails || []);

  // Filter emails based on search term
  const filteredEmails = displayEmails.filter(email => 
    email.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.sender?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (classification: string) => {
    switch (classification) {
      case 'safe':
        return <Shield className="w-4 h-4 text-green-600" />;
      case 'suspicious':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'malicious':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'dlp_violation':
        return <Eye className="w-4 h-4 text-yellow-600" />;
      default:
        return <Mail className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (classification: string) => {
    switch (classification) {
      case 'safe':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'suspicious':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'malicious':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'dlp_violation':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatClassification = (classification: string) => {
    switch (classification) {
      case 'safe':
        return 'Safe';
      case 'suspicious':
        return 'Suspicious';
      case 'malicious':
        return 'Malicious';
      case 'dlp_violation':
        return 'DLP Alert';
      default:
        return 'Unknown';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString();
  };

  const openEmailDetail = (email: any) => {
    setSelectedEmail(email);
    setIsEmailDetailOpen(true);
  };

  const exportEmails = () => {
    // TODO: Implement email export functionality
    console.log('Exporting emails...');
  };

  const refreshEmails = () => {
    refetch();
  };

  return (
    <main className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Email Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            Real-time email analysis and threat detection
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 pulse-indicator' : 'bg-red-500'}`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Live Monitoring' : 'Disconnected'}
            </span>
          </div>
          <Button variant="outline" onClick={refreshEmails}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportEmails}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search emails by subject or sender..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Emails</SelectItem>
                <SelectItem value="safe">Safe</SelectItem>
                <SelectItem value="suspicious">Suspicious</SelectItem>
                <SelectItem value="malicious">Malicious</SelectItem>
                <SelectItem value="dlp_violation">DLP Violations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Email Monitoring Tabs */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">Email List</TabsTrigger>
          <TabsTrigger value="realtime">Real-time Feed</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Email Analysis Results</span>
                <span className="text-sm text-muted-foreground">
                  {filteredEmails.length} emails found
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50 animate-pulse" />
                  <p>Loading emails...</p>
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No emails found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Subject</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Sender</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Risk Score</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Received</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmails.map((email, index) => (
                        <tr 
                          key={email.id || index} 
                          className="border-b border-border hover:bg-muted/50 cursor-pointer"
                          onClick={() => openEmailDetail(email)}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(email.classification)}
                              <Badge className={getStatusColor(email.classification)}>
                                {formatClassification(email.classification)}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-foreground truncate max-w-md">
                                {email.subject || 'No Subject'}
                              </div>
                              <div className="text-sm text-muted-foreground truncate max-w-md">
                                {email.bodyPreview || 'No preview available'}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-foreground">
                            {email.sender}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-muted rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    (email.riskScore || 0) > 80 ? 'risk-bar-critical' :
                                    (email.riskScore || 0) > 60 ? 'risk-bar-high' :
                                    (email.riskScore || 0) > 30 ? 'risk-bar-medium' : 'risk-bar-low'
                                  }`}
                                  style={{ width: `${email.riskScore || 10}%` }}
                                />
                              </div>
                              <span className="text-sm text-foreground w-12">
                                {email.riskScore || 10}%
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-muted-foreground">
                            {formatTimestamp(email.receivedAt || email.timestamp)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEmailDetail(email);
                                }}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              {email.classification !== 'safe' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // TODO: Implement block functionality
                                  }}
                                >
                                  Block
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Real-time Email Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 scrollable-area">
                <div className="space-y-3">
                  {realTimeEmails.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Waiting for real-time email events...</p>
                    </div>
                  ) : (
                    realTimeEmails.map((email, index) => (
                      <div 
                        key={`rt-${index}`}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(email.classification)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {email.subject}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {email.sender}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(email.classification)}>
                            {formatClassification(email.classification)}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {email.timestamp}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {filteredEmails.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Total emails analyzed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Threat Detection Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {filteredEmails.filter(e => e.classification !== 'safe').length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Threats detected
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">DLP Violations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {filteredEmails.filter(e => e.classification === 'dlp_violation').length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Data leaks prevented
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Email Detail Dialog */}
      <Dialog open={isEmailDetailOpen} onOpenChange={setIsEmailDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Email Analysis Details</span>
            </DialogTitle>
          </DialogHeader>
          {selectedEmail && (
            <ScrollArea className="h-96 scrollable-area">
              <div className="space-y-6">
                {/* Email Header */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Subject</label>
                    <p className="text-foreground">{selectedEmail.subject || 'No Subject'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedEmail.classification)}>
                        {formatClassification(selectedEmail.classification)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Sender</label>
                    <p className="text-foreground">{selectedEmail.sender}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Risk Score</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (selectedEmail.riskScore || 0) > 80 ? 'risk-bar-critical' :
                            (selectedEmail.riskScore || 0) > 60 ? 'risk-bar-high' :
                            (selectedEmail.riskScore || 0) > 30 ? 'risk-bar-medium' : 'risk-bar-low'
                          }`}
                          style={{ width: `${selectedEmail.riskScore || 10}%` }}
                        />
                      </div>
                      <span className="text-sm text-foreground">
                        {selectedEmail.riskScore || 10}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Email Body */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email Content</label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {selectedEmail.body || selectedEmail.bodyPreview || 'No content available'}
                    </p>
                  </div>
                </div>

                {/* Analysis Results */}
                {selectedEmail.mlAnalysis && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">AI Analysis Results</label>
                    <div className="mt-2 p-4 bg-muted rounded-lg">
                      <pre className="text-xs text-foreground overflow-auto">
                        {JSON.stringify(selectedEmail.mlAnalysis, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Recipients */}
                {selectedEmail.recipients && selectedEmail.recipients.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Recipients</label>
                    <div className="mt-2 space-y-1">
                      {selectedEmail.recipients.map((recipient, index) => (
                        <p key={index} className="text-sm text-foreground">
                          {recipient.emailAddress?.address || recipient}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {selectedEmail.hasAttachments && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Attachments</label>
                    <div className="mt-2">
                      <Badge variant="outline">
                        <FileText className="w-3 h-3 mr-1" />
                        Has Attachments
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
