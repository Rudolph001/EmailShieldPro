import { Card, CardContent } from "@/components/ui/card";
import { Mail, Shield, AlertTriangle, Users, TrendingUp, TrendingDown } from "lucide-react";

interface MetricsData {
  emailsScanned: number;
  threatsBlocked: number;
  dlpViolations: number;
  usersProtected: number;
  trends: {
    emailsScanned: number;
    threatsBlocked: number;
    dlpViolations: number;
    usersProtected: number;
  };
}

interface SecurityMetricsProps {
  data: MetricsData;
}

export function SecurityMetrics({ data }: SecurityMetricsProps) {
  const metrics = [
    {
      title: "Emails Scanned",
      value: data.emailsScanned.toLocaleString(),
      trend: data.trends.emailsScanned,
      icon: Mail,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Threats Blocked", 
      value: data.threatsBlocked.toString(),
      trend: data.trends.threatsBlocked,
      icon: Shield,
      iconColor: "text-red-600",
      iconBg: "bg-red-100 dark:bg-red-900/20",
    },
    {
      title: "DLP Violations",
      value: data.dlpViolations.toString(),
      trend: data.trends.dlpViolations,
      icon: AlertTriangle,
      iconColor: "text-orange-600", 
      iconBg: "bg-orange-100 dark:bg-orange-900/20",
    },
    {
      title: "Users Protected",
      value: data.usersProtected.toLocaleString(),
      trend: data.trends.usersProtected,
      icon: Users,
      iconColor: "text-green-600",
      iconBg: "bg-green-100 dark:bg-green-900/20",
    },
  ];

  const formatTrend = (trend: number) => {
    const isPositive = trend > 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? "text-green-600" : "text-red-600";
    
    return (
      <div className={`flex items-center text-sm ${colorClass}`}>
        <TrendIcon className="w-4 h-4 mr-1" />
        {Math.abs(trend).toFixed(1)}% from yesterday
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        
        return (
          <Card key={metric.title} className="bg-card border border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{metric.value}</p>
                  {formatTrend(metric.trend)}
                </div>
                <div className={`w-12 h-12 ${metric.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${metric.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
