import { LayoutDashboard, Activity, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export type MainTabId = "dashboard" | "activity" | "settings";

interface MainTabsProps {
  activeTab: MainTabId;
  onTabChange: (tab: MainTabId) => void;
}

const tabs = [
  { id: "dashboard" as MainTabId, label: "Dashboard", icon: LayoutDashboard },
  { id: "activity" as MainTabId, label: "Activity", icon: Activity },
  { id: "settings" as MainTabId, label: "Settings", icon: Settings },
];

export function MainTabs({ activeTab, onTabChange }: MainTabsProps) {
  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-background">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              isActive
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
