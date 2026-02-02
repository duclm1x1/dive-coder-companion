import { useState } from "react";
import { Save, RotateCcw, Key, Bell, Monitor, Palette, Database, Shield, Zap, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SkinSelector } from "@/components/SkinSelector";
import { APIProviderManager } from "@/components/settings/APIProviderManager";

type SettingsTab = "general" | "providers" | "notifications" | "appearance";

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const tabs = [
    { id: "general" as SettingsTab, label: "General", icon: Monitor },
    { id: "providers" as SettingsTab, label: "API Providers", icon: Server },
    { id: "notifications" as SettingsTab, label: "Notifications", icon: Bell },
    { id: "appearance" as SettingsTab, label: "Appearance", icon: Palette },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your Dive Monitor preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-border">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === "general" && (
          <>
            <div className="p-5 rounded-xl bg-card border border-border space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Database className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Project Configuration</h3>
                  <p className="text-sm text-muted-foreground">Basic project settings</p>
                </div>
              </div>
              
              <div className="grid gap-4 pt-2">
                <div className="grid gap-2">
                  <Label className="text-foreground text-sm">Project Name</Label>
                  <Input
                    defaultValue="dive-monitor"
                    className="bg-muted border-border"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label className="text-foreground text-sm">Working Directory</Label>
                  <Input
                    defaultValue="/home/user/projects"
                    className="bg-muted border-border"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-card border border-border space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Performance</h3>
                  <p className="text-sm text-muted-foreground">Monitoring settings</p>
                </div>
              </div>
              
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Real-time Updates</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Stream metrics as they happen</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Auto-refresh Dashboard</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Refresh data every 5 seconds</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="grid gap-2">
                  <Label className="text-foreground text-sm">Refresh Interval (seconds)</Label>
                  <Input
                    type="number"
                    defaultValue="5"
                    className="bg-muted border-border w-24"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "providers" && (
          <div className="p-5 rounded-xl bg-card border border-border">
            <APIProviderManager />
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="p-5 rounded-xl bg-card border border-border space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Notification Preferences</h3>
                <p className="text-sm text-muted-foreground">Choose what alerts you receive</p>
              </div>
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Task Completion</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Notify when tasks finish</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Error Alerts</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Notify on failures</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Cost Alerts</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Warn when costs exceed threshold</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Sound Effects</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Play sounds on notifications</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="p-5 rounded-xl bg-card border border-border space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Palette className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Theme & Appearance</h3>
                <p className="text-sm text-muted-foreground">Customize the look and feel</p>
              </div>
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="grid gap-2">
                <Label className="text-foreground text-sm">Theme Skin</Label>
                <SkinSelector />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Animations</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Enable UI animations</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Compact Mode</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Use smaller spacing</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Show Keyboard Shortcuts</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Display shortcut hints</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
