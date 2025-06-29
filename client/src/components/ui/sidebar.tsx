import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Shield, 
  BarChart3, 
  Mail, 
  AlertTriangle, 
  Settings, 
  Users, 
  FileText,
  Activity 
} from "lucide-react";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
  },
  {
    name: "Email Monitoring",
    href: "/email-monitoring", 
    icon: Mail,
  },
  {
    name: "Threats Detected",
    href: "/threats",
    icon: AlertTriangle,
  },
  {
    name: "Policy Management", 
    href: "/policy-management",
    icon: FileText,
  },
  {
    name: "User Accounts",
    href: "/users",
    icon: Users,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: Activity,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-background border-r border-sidebar-border shadow-lg">
      {/* Logo Section */}
      <div className="flex items-center px-6 py-4 border-b border-sidebar-border">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <span className="ml-3 text-xl font-semibold text-sidebar-foreground">SecureShield</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6">
        <div className="px-3 space-y-1">
          {navigationItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </a>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-sidebar-border">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center">
            <span className="text-sidebar-primary-foreground text-sm font-medium">AD</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-sidebar-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground">Security Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
