import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, AlertTriangle, Eye, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailEvent {
  id: string;
  subject: string;
  sender: string;
  timestamp: string;
  classification: 'safe' | 'suspicious' | 'malicious' | 'dlp_violation';
  riskScore: number;
}

interface RealTimeMonitorProps {
  emails: EmailEvent[];
  isConnected: boolean;
  lastUpdate: string;
}

export function RealTimeMonitor({ emails, isConnected, lastUpdate }: RealTimeMonitorProps) {
  const getStatusIcon = (classification: string) => {
    switch (classification) {
      case 'safe':
        return <Check className="w-4 h-4" />;
      case 'suspicious':
      case 'malicious':
        return <AlertTriangle className="w-4 h-4" />;
      case 'dlp_violation':
        return <Eye className="w-4 h-4" />;
      default:
        return <Check className="w-4 h-4" />;
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

  const getRowBackground = (classification: string) => {
    switch (classification) {
      case 'suspicious':
      case 'malicious':
        return 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/20';
      case 'dlp_violation':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-900/20';
      default:
        return 'bg-card hover:bg-muted/50';
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

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Real-Time Email Monitoring</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdate}
            </span>
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected 
                ? "bg-green-500 pulse-indicator" 
                : "bg-red-500"
            )} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 scrollable-area">
          <div className="space-y-3">
            {emails.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Waiting for email events...</p>
                </div>
              </div>
            ) : (
              emails.map((email) => (
                <div
                  key={email.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border transition-colors",
                    getRowBackground(email.classification)
                  )}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      email.classification === 'safe' 
                        ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                        : email.classification === 'dlp_violation'
                        ? "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                        : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                    )}>
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
                    <Badge className={cn("text-xs", getStatusColor(email.classification))}>
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
  );
}
