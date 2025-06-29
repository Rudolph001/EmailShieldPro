import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import PolicyManagement from "@/pages/policy-management";
import EmailMonitoring from "@/pages/email-monitoring";
import ThreatsDetected from "@/pages/threats-detected";
import UserAccounts from "@/pages/user-accounts";
import Analytics from "@/pages/analytics";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { Sidebar } from "@/components/ui/sidebar";

function Router() {
  return (
    <div className="min-h-screen bg-ms-gray dark:bg-background flex">
      <Sidebar />
      <div className="flex-1 w-0 min-w-0">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/email-monitoring" component={EmailMonitoring} />
          <Route path="/threats-detected" component={ThreatsDetected} />
          <Route path="/policy-management" component={PolicyManagement} />
          <Route path="/user-accounts" component={UserAccounts} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/settings" component={SettingsPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
