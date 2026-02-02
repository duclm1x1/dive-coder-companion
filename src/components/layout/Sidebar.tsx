import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  Terminal,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  GitBranch,
  FileCode,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: MessageSquare, label: "AI Chat", path: "/chat" },
  { icon: Terminal, label: "Console", path: "/console" },
  { icon: Activity, label: "Monitor", path: "/monitor" },
  { icon: GitBranch, label: "Tasks", path: "/tasks" },
  { icon: FileCode, label: "Code Review", path: "/review" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
          <Cpu className="w-6 h-6" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">DIVE CODER</span>
            <span className="text-xs text-muted-foreground">V19.5</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const NavIcon = item.icon;

          return (
            <Tooltip key={item.path} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    "hover:bg-sidebar-accent group",
                    isActive && "bg-primary/10 text-primary border border-primary/20"
                  )}
                >
                  <NavIcon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-primary" : "text-sidebar-foreground group-hover:text-primary"
                    )}
                  />
                  {!collapsed && (
                    <span
                      className={cn(
                        "text-sm font-medium transition-colors",
                        isActive ? "text-primary" : "text-sidebar-foreground group-hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="bg-card border-border">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </nav>

      {/* Status Indicator */}
      <div className={cn("p-3 border-t border-sidebar-border", collapsed && "flex justify-center")}>
        {!collapsed ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/20">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
            <span className="text-xs text-success font-medium">Engine Active</span>
            <Zap className="w-3 h-3 text-success ml-auto" />
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
        )}
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="m-2 border border-sidebar-border hover:bg-sidebar-accent"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
      </Button>
    </aside>
  );
}
