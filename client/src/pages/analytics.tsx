import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, Shield } from "lucide-react";

const threatTrendData = [
  { month: "Jan", threats: 12, blocked: 10 },
  { month: "Feb", threats: 8, blocked: 8 },
  { month: "Mar", threats: 15, blocked: 13 },
  { month: "Apr", threats: 6, blocked: 6 },
  { month: "May", threats: 20, blocked: 18 },
  { month: "Jun", threats: 3, blocked: 3 },
];

const threatTypeData = [
  { name: "Phishing", value: 45, color: "#ef4444" },
  { name: "Malware", value: 25, color: "#f97316" },
  { name: "DLP Violations", value: 20, color: "#eab308" },
  { name: "Suspicious Senders", value: 10, color: "#3b82f6" },
];

const riskScoreData = [
  { time: "00:00", score: 20 },
  { time: "04:00", score: 15 },
  { time: "08:00", score: 35 },
  { time: "12:00", score: 45 },
  { time: "16:00", score: 30 },
  { time: "20:00", score: 25 },
];

export default function Analytics() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Security Analytics</h1>
        <p className="text-muted-foreground">Comprehensive security insights and threat intelligence</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Detection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.7%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">False Positive Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.3%</div>
            <p className="text-xs text-muted-foreground">-0.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Risk Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28.5</div>
            <p className="text-xs text-muted-foreground">-5.2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Policy Effectiveness</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">+1.8% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Threat Detection Trends</CardTitle>
            <CardDescription>Monthly threat detection and blocking statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={threatTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="threats" fill="#ef4444" name="Threats Detected" />
                <Bar dataKey="blocked" fill="#22c55e" name="Threats Blocked" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Threat Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Threat Types Distribution</CardTitle>
            <CardDescription>Breakdown of threat categories detected</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={threatTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {threatTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Score Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Real-time Risk Assessment</CardTitle>
            <CardDescription>Organization risk score throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={riskScoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Risk Domains</CardTitle>
            <CardDescription>External domains with highest risk scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { domain: "suspicious-site.com", risk: 85, blocked: 12 },
                { domain: "phishing-example.net", risk: 92, blocked: 8 },
                { domain: "malware-host.org", risk: 78, blocked: 15 },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{item.domain}</div>
                    <div className="text-sm text-muted-foreground">{item.blocked} emails blocked</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-500">{item.risk}%</div>
                    <div className="text-xs text-muted-foreground">Risk Score</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Policy Performance</CardTitle>
            <CardDescription>Most effective security policies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { policy: "Financial Data Protection", effectiveness: 96, triggers: 24 },
                { policy: "Phishing Detection", effectiveness: 94, triggers: 18 },
                { policy: "External Sender Screening", effectiveness: 89, triggers: 31 },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{item.policy}</div>
                    <div className="text-sm text-muted-foreground">{item.triggers} triggers</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-500">{item.effectiveness}%</div>
                    <div className="text-xs text-muted-foreground">Effective</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Insights</CardTitle>
            <CardDescription>AI-generated security recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="font-medium text-blue-900 dark:text-blue-100">
                  Increased phishing attempts detected
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Consider tightening external sender policies
                </div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="font-medium text-green-900 dark:text-green-100">
                  DLP policies highly effective
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Zero data leaks detected this month
                </div>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div className="font-medium text-yellow-900 dark:text-yellow-100">
                  Review attachment scanning rules
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Some legitimate files being flagged
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}