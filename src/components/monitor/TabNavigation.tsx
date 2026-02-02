import { cn } from "@/lib/utils";
import { LayoutDashboard, Activity, Settings, Sparkles } from "lucide-react";

export type TabId = 'dashboard' | 'activity' | 'events' | 'settings';

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs = [
  { id: 'dashboard' as TabId, label: 'Dashboard', icon: LayoutDashboard, shortcut: '1' },
  { id: 'activity' as TabId, label: 'Activity', icon: Activity, shortcut: '2' },
  { id: 'events' as TabId, label: 'Events', icon: Sparkles, shortcut: '3' },
  { id: 'settings' as TabId, label: 'Settings', icon: Settings, shortcut: '4' },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="flex items-center gap-1 px-6 py-2 border-b border-border bg-background-secondary">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            <kbd className={cn(
              'ml-2 px-1.5 py-0.5 text-2xs rounded',
              isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            )}>
              {tab.shortcut}
            </kbd>
          </button>
        );
      })}
    </nav>
  );
}
