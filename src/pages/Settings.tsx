import { Settings as SettingsIcon, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 glow-primary">
            <SettingsIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Settings</h1>
            <p className="text-xs text-muted-foreground">Configure Dive Coder • V19.5</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-border">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button className="bg-primary hover:bg-primary/90 glow-primary">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="engine">Engine</TabsTrigger>
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <div className="p-5 rounded-xl glass border border-border space-y-6">
            <h3 className="font-medium">Project Settings</h3>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  defaultValue="dive-coder-v19.5"
                  className="bg-secondary/50 border-border"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="workingDir">Working Directory</Label>
                <Input
                  id="workingDir"
                  defaultValue="/home/user/projects/dive-coder"
                  className="bg-secondary/50 border-border"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Auto-save</Label>
                  <p className="text-xs text-muted-foreground">Automatically save changes</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Notifications</Label>
                  <p className="text-xs text-muted-foreground">Show desktop notifications</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="engine" className="mt-6 space-y-6">
          <div className="p-5 rounded-xl glass border border-border space-y-6">
            <h3 className="font-medium">Dual Thinking Engine</h3>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Enable Dual Thinking</Label>
                  <p className="text-xs text-muted-foreground">Use both primary and secondary analysis</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confidence">Minimum Confidence (%)</Label>
                <Input
                  id="confidence"
                  type="number"
                  defaultValue="80"
                  className="bg-secondary/50 border-border w-32"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mode">Analysis Mode</Label>
                <select
                  id="mode"
                  defaultValue="balanced"
                  className="w-full p-2 rounded-md bg-secondary/50 border border-border text-sm"
                >
                  <option value="fast">Fast</option>
                  <option value="balanced">Balanced</option>
                  <option value="thorough">Thorough</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Auto-patch</Label>
                  <p className="text-xs text-muted-foreground">Automatically fix simple issues</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl glass border border-border space-y-6">
            <h3 className="font-medium">Code Review Settings</h3>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Security Checks</Label>
                  <p className="text-xs text-muted-foreground">Check for security vulnerabilities</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Best Practices</Label>
                  <p className="text-xs text-muted-foreground">Enforce coding best practices</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Performance Analysis</Label>
                  <p className="text-xs text-muted-foreground">Analyze code performance</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="monitor" className="mt-6 space-y-6">
          <div className="p-5 rounded-xl glass border border-border space-y-6">
            <h3 className="font-medium">Monitor Settings</h3>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="refreshRate">Refresh Rate (seconds)</Label>
                <Input
                  id="refreshRate"
                  type="number"
                  defaultValue="2"
                  className="bg-secondary/50 border-border w-32"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Real-time Updates</Label>
                  <p className="text-xs text-muted-foreground">Stream metrics in real-time</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Event Logging</Label>
                  <p className="text-xs text-muted-foreground">Log all system events</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="logRetention">Log Retention (days)</Label>
                <Input
                  id="logRetention"
                  type="number"
                  defaultValue="30"
                  className="bg-secondary/50 border-border w-32"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6 space-y-6">
          <div className="p-5 rounded-xl glass border border-border space-y-6">
            <h3 className="font-medium">Theme</h3>
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Color Scheme</Label>
                <div className="flex gap-3">
                  {["Dark", "Light", "System"].map((theme) => (
                    <button
                      key={theme}
                      className={`px-4 py-2 rounded-lg border text-sm ${
                        theme === "Dark"
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Animations</Label>
                  <p className="text-xs text-muted-foreground">Enable UI animations</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Glow Effects</Label>
                  <p className="text-xs text-muted-foreground">Show glow effects on active elements</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
