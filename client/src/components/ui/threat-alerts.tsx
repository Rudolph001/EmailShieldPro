import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertTriangle, 
  Shield, 
  FileX, 
  Plus, 
  Download, 
  RefreshCw,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Threat {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
}

interface PolicyStatus {
  name: string;
  status: 'active' | 'inactive' | 'partial';
}

interface ThreatAlertsProps {
  threats: Threat[];
  policies: PolicyStatus[];
  onAddPolicy?: () => void;
  onExportLogs?: () => void;
  onSyncAccounts?: () => void;
}

export function ThreatAlerts({ 
  threats, 
  policies, 
  onAddPolicy, 
  onExportLogs, 
  onSyncAccounts 
}: ThreatAlertsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-orange-500';
      case 'low':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'partial':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Active Threats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Active Threats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {threats.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-muted-foreground">
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active threats detected</p>
                </div>
              </div>
            ) : (
              threats.map((threat) => (
                <div key={threat.id} className="flex items-start space-x-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full mt-2",
                    getSeverityColor(threat.severity)
                  )} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {threat.type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {threat.description}
                    </p>
                    <div className="flex items-center mt-1 space-x-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {threat.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Policy Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Policy Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {policies.map((policy) => (
              <div key={policy.name} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{policy.name}</span>
                <Badge className={cn("text-xs", getStatusColor(policy.status))}>
                  {formatStatus(policy.status)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              onClick={onAddPolicy}
              className="w-full justify-start"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-3" />
              Add New Policy
            </Button>
            <Button
              onClick={onExportLogs}
              className="w-full justify-start"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-3" />
              Export Logs
            </Button>
            <Button
              onClick={onSyncAccounts}
              className="w-full justify-start"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-3" />
              Sync Accounts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
