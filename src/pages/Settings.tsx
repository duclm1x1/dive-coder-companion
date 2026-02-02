import { Settings as SettingsIcon, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
  return (
    <div className="p-6 space-y-6 bg-background-secondary min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Settings</h1>
            <p className="text-xs text-muted-foreground">Configure Dive Coder • V19.5</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-border">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="bg-muted">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="engine">Engine</TabsTrigger>
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <div className="p-5 rounded-xl bg-card border border-border space-y-6">
            <h3 className="font-medium text-foreground">Project Settings</h3>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="projectName" className="text-foreground">Project Name</Label>
                <Input
                  id="projectName"
                  defaultValue="dive-coder-v19.5"
                  className="bg-background-secondary border-border"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="workingDir" className="text-foreground">Working Directory</Label>
                <Input
                  id="workingDir"
                  defaultValue="/home/user/projects/dive-coder"
                  className="bg-background-secondary border-border"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-foreground">Auto-save</Label>
                  <p className="text-xs text-muted-foreground">Automatically save changes</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-foreground">Notifications</Label>
                  <p className="text-xs text-muted-foreground">Show desktop notifications</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="engine" className="mt-6 space-y-6">
          <div className="p-5 rounded-xl bg-card border border-border space-y-6">
            <h3 className="font-medium text-foreground">Dual Thinking Engine</h3>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-foreground">Enable Dual Thinking</Label>
                  <p className="text-xs text-muted-foreground">Use both primary and secondary analysis</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confidence" className="text-foreground">Minimum Confidence (%)</Label>
                <Input
                  id="confidence"
                  type="number"
                  defaultValue="80"
                  className="bg-background-secondary border-border w-32"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mode" className="text-foreground">Analysis Mode</Label>
                <select
                  id="mode"
                  defaultValue="balanced"
                  className="w-full p-2 rounded-md bg-background-secondary border border-border text-sm text-foreground"
                >
                  <option value="fast">Fast</option>
                  <option value="balanced">Balanced</option>
                  <option value="thorough">Thorough</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-foreground">Auto-patch</Label>
                  <p className="text-xs text-muted-foreground">Automatically fix simple issues</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-card border border-border space-y-6">
            <h3 className="font-medium text-foreground">Code Review Settings</h3>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-foreground">Security Checks</Label>
                  <p className="text-xs text-muted-foreground">Check for security vulnerabilities</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-foreground">Best Practices</Label>
                  <p className="text-xs text-muted-foreground">Enforce coding best practices</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-foreground">Performance Analysis</Label>
                  <p className="text-xs text-muted-foreground">Analyze code performance</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="monitor" className="mt-6 space-y-6">
          <div className="p-5 rounded-xl bg-card border border-border space-y-6">
            <h3 className="font-medium text-foreground">Monitor Settings</h3>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="refreshRate" className="text-foreground">Refresh Rate (seconds)</Label>
                <Input
                  id="refreshRate"
                  type="number"
                  defaultValue="2"
                  className="bg-background-secondary border-border w-32"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-foreground">Real-time Updates</Label>
                  <p className="text-xs text-muted-foreground">Stream metrics in real-time</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-foreground">Event Logging</Label>
                  <p className="text-xs text-muted-foreground">Log all system events</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="logRetention" className="text-foreground">Log Retention (days)</Label>
                <Input
                  id="logRetention"
                  type="number"
                  defaultValue="30"
                  className="bg-background-secondary border-border w-32"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6 space-y-6">
          <div className="p-5 rounded-xl bg-card border border-border space-y-6">
            <h3 className="font-medium text-foreground">Theme</h3>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label className="text-foreground">Color Scheme</Label>
                <div className="flex gap-3">
                  {["Light", "Dark", "System"].map((theme) => (
                    <button
                      key={theme}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        theme === "Light"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50 text-foreground"
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-foreground">Animations</Label>
                  <p className="text-xs text-muted-foreground">Enable UI animations</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-foreground">Compact Mode</Label>
                  <p className="text-xs text-muted-foreground">Use compact spacing</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
