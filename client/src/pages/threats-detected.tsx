import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Clock, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function ThreatsDetected() {
  const { data: threats = [], isLoading } = useQuery({
    queryKey: ["/api/threats/active"],
  });

  const { data: resolvedThreats = [] } = useQuery({
    queryKey: ["/api/threats/resolved"],
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "high": return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "medium": return <Shield className="h-4 w-4 text-yellow-500" />;
      case "low": return <Shield className="h-4 w-4 text-blue-500" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Threats Detected</h1>
          <p className="text-muted-foreground">Monitor and manage security threats</p>
        </div>
        <div className="text-center py-8">Loading threats...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Threats Detected</h1>
        <p className="text-muted-foreground">Monitor and manage security threats across your email infrastructure</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{threats.length}</div>
            <p className="text-xs text-muted-foreground">Requiring immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Severity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {threats.filter(t => t.severity === 'critical' || t.severity === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">Critical and high priority</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedThreats.length}</div>
            <p className="text-xs text-muted-foreground">Successfully mitigated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3m</div>
            <p className="text-xs text-muted-foreground">Average resolution time</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Threats */}
      <Card>
        <CardHeader>
          <CardTitle>Active Threats</CardTitle>
          <CardDescription>
            Security threats detected across your email environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {threats.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Threats</h3>
              <p className="text-muted-foreground">
                Your email security is currently operating normally. All detected threats have been resolved.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {threats.map((threat) => (
                <div key={threat.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getSeverityIcon(threat.severity)}
                      <h4 className="font-semibold">{threat.type}</h4>
                      <Badge variant={getSeverityColor(threat.severity)}>
                        {threat.severity}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Investigate
                      </Button>
                      <Button variant="default" size="sm">
                        Resolve
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {threat.description}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Detected: {new Date(threat.createdAt).toLocaleString()} | 
                    Method: {threat.detectionMethod}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}