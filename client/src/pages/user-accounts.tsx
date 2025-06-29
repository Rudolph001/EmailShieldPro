import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail, Shield, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function UserAccounts() {
  const { data: emailAccounts = [], isLoading } = useQuery({
    queryKey: ["/api/accounts/email"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">User Accounts</h1>
          <p className="text-muted-foreground">Manage user accounts and email connections</p>
        </div>
        <div className="text-center py-8">Loading accounts...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Accounts</h1>
          <p className="text-muted-foreground">Manage user accounts and their email connections</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Active user accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Accounts</CardTitle>
            <Mail className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailAccounts.length}</div>
            <p className="text-xs text-muted-foreground">Connected email accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">Accounts protected</p>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user permissions and access control
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    A
                  </div>
                  <div>
                    <h4 className="font-semibold">Admin User</h4>
                    <p className="text-sm text-muted-foreground">admin@company.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="default">Admin</Badge>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Last login: {new Date().toLocaleString()} | Role: Administrator
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Account Connections */}
      <Card>
        <CardHeader>
          <CardTitle>Email Account Connections</CardTitle>
          <CardDescription>
            Microsoft 365 and other email service integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailAccounts.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Email Accounts Connected</h3>
              <p className="text-muted-foreground mb-4">
                Connect your Microsoft 365 or other email accounts to enable email security monitoring.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Connect Email Account
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {emailAccounts.map((account) => (
                <div key={account.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <div>
                        <h4 className="font-semibold">{account.email}</h4>
                        <p className="text-sm text-muted-foreground">Microsoft 365</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={account.isActive ? "default" : "secondary"}>
                        {account.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Settings
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Connected: {new Date(account.createdAt).toLocaleString()}
                    {account.lastSyncAt && ` | Last sync: ${new Date(account.lastSyncAt).toLocaleString()}`}
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