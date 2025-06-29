import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import PolicyManagement from "@/pages/policy-management";
import EmailMonitoring from "@/pages/email-monitoring";
import NotFound from "@/pages/not-found";
import { Sidebar } from "@/components/ui/sidebar";

function Router() {
  return (
    <div className="min-h-screen bg-ms-gray dark:bg-background">
      <Sidebar />
      <div className="ml-64">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/policy-management" component={PolicyManagement} />
          <Route path="/email-monitoring" component={EmailMonitoring} />
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
