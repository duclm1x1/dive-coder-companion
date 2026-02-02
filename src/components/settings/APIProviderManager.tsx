import { useState } from "react";
import { 
  Plus, Trash2, RefreshCw, Zap, Check, X, AlertCircle, 
  Globe, Key, Star, StarOff, Eye, EyeOff, Loader2,
  Wifi, WifiOff, Clock, Server
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAPIProviders, APIProvider } from "@/hooks/useAPIProviders";
import { toast } from "sonner";

export function APIProviderManager() {
  const {
    providers,
    isLoading,
    addProvider,
    updateProvider,
    deleteProvider,
    setDefaultProvider,
    testConnection,
    runSpeedtest,
  } = useAPIProviders();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<APIProvider | null>(null);
  const [isSpeedtesting, setIsSpeedtesting] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState<Set<string>>(new Set());

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: "",
    baseUrl: "",
    apiKey: "",
  });

  const resetForm = () => {
    setFormData({ name: "", baseUrl: "", apiKey: "" });
  };

  const handleAddProvider = () => {
    if (!formData.name || !formData.baseUrl) {
      toast.error("Name and Base URL are required");
      return;
    }

    addProvider(formData);
    toast.success(`Provider "${formData.name}" added`);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditProvider = () => {
    if (!editingProvider) return;

    updateProvider(editingProvider.id, {
      name: formData.name,
      baseUrl: formData.baseUrl,
      apiKey: formData.apiKey,
      status: "disconnected", // Reset status when credentials change
      models: [], // Clear models to refetch
    });
    
    toast.success(`Provider "${formData.name}" updated`);
    setIsEditDialogOpen(false);
    setEditingProvider(null);
    resetForm();
  };

  const handleDeleteProvider = (provider: APIProvider) => {
    deleteProvider(provider.id);
    toast.success(`Provider "${provider.name}" deleted`);
  };

  const handleTestConnection = async (provider: APIProvider) => {
    if (!provider.apiKey) {
      toast.error("Please add an API key first");
      return;
    }

    toast.info(`Testing ${provider.name}...`);
    const result = await testConnection(provider.id);
    
    if (result.success) {
      toast.success(`${provider.name}: Connected! ${result.models.length} models found (${result.latency}ms)`);
    } else {
      toast.error(`${provider.name}: ${result.error}`);
    }
  };

  const handleRunSpeedtest = async () => {
    setIsSpeedtesting(true);
    toast.info("Running speedtest on all providers...");
    
    const results = await runSpeedtest();
    
    let fastest: { name: string; latency: number } | null = null;
    results.forEach((latency, id) => {
      const provider = providers.find(p => p.id === id);
      if (provider && (!fastest || latency < fastest.latency)) {
        fastest = { name: provider.name, latency };
      }
    });

    if (fastest) {
      toast.success(`Speedtest complete! Fastest: ${fastest.name} (${fastest.latency}ms)`);
    } else {
      toast.info("Speedtest complete. Configure API keys to test providers.");
    }
    
    setIsSpeedtesting(false);
  };

  const openEditDialog = (provider: APIProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      baseUrl: provider.baseUrl,
      apiKey: provider.apiKey,
    });
    setIsEditDialogOpen(true);
  };

  const toggleShowApiKey = (id: string) => {
    setShowApiKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: APIProvider["status"]) => {
    switch (status) {
      case "connected":
        return <Wifi className="w-4 h-4 text-emerald-500" />;
      case "testing":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case "error":
        return <WifiOff className="w-4 h-4 text-destructive" />;
      default:
        return <WifiOff className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: APIProvider["status"]) => {
    switch (status) {
      case "connected":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Connected</Badge>;
      case "testing":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">Testing...</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header with actions */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
          <Server className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">API Providers</h3>
          <p className="text-sm text-muted-foreground">Manage your AI provider connections</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunSpeedtest}
            disabled={isSpeedtesting}
            className="border-border"
          >
            {isSpeedtesting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Speedtest All
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Provider
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add API Provider</DialogTitle>
                <DialogDescription>
                  Add a new OpenAI-compatible API provider
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Provider Name</Label>
                  <Input
                    placeholder="e.g., OpenRouter, Together AI"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Base URL</Label>
                  <Input
                    placeholder="https://api.example.com/v1"
                    value={formData.baseUrl}
                    onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    OpenAI-compatible endpoint (usually ends with /v1)
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProvider}>Add Provider</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Provider list */}
      <div className="space-y-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className={`p-4 rounded-lg border transition-all ${
              provider.isDefault 
                ? "bg-primary/5 border-primary/30" 
                : "bg-muted/50 border-border hover:border-primary/30"
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Status indicator */}
              <div className="mt-1">
                {getStatusIcon(provider.status)}
              </div>

              {/* Provider info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">{provider.name}</span>
                  {provider.isDefault && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                      Default
                    </Badge>
                  )}
                  {getStatusBadge(provider.status)}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="truncate">{provider.baseUrl}</span>
                </div>

                {/* API Key display */}
                <div className="flex items-center gap-2 text-sm mb-2">
                  <Key className="w-3.5 h-3.5 text-muted-foreground" />
                  {provider.apiKey ? (
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-0.5 bg-muted rounded text-xs">
                        {showApiKeys.has(provider.id) 
                          ? provider.apiKey 
                          : `${provider.apiKey.slice(0, 7)}...${provider.apiKey.slice(-4)}`
                        }
                      </code>
                      <button
                        onClick={() => toggleShowApiKey(provider.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {showApiKeys.has(provider.id) ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">No API key configured</span>
                  )}
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  {provider.latency !== undefined && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{provider.latency}ms</span>
                    </div>
                  )}
                  {provider.models.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span>{provider.models.length} models available</span>
                    </div>
                  )}
                  {provider.lastChecked && (
                    <div className="flex items-center gap-1">
                      <span>Last checked: {new Date(provider.lastChecked).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>

                {/* Error message */}
                {provider.error && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-destructive">
                    <AlertCircle className="w-3 h-3" />
                    <span>{provider.error}</span>
                  </div>
                )}

                {/* Models list (collapsible) */}
                {provider.models.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {provider.models.slice(0, 8).map((model) => (
                      <Badge key={model.id} variant="secondary" className="text-xs">
                        {model.name}
                      </Badge>
                    ))}
                    {provider.models.length > 8 && (
                      <Badge variant="outline" className="text-xs">
                        +{provider.models.length - 8} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleTestConnection(provider)}
                  disabled={provider.status === "testing"}
                  title="Test Connection"
                >
                  <RefreshCw className={`w-4 h-4 ${provider.status === "testing" ? "animate-spin" : ""}`} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDefaultProvider(provider.id)}
                  title={provider.isDefault ? "Default provider" : "Set as default"}
                >
                  {provider.isDefault ? (
                    <Star className="w-4 h-4 text-primary fill-primary" />
                  ) : (
                    <StarOff className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(provider)}
                  title="Edit"
                >
                  <Key className="w-4 h-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{provider.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove the provider and its API key. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteProvider(provider)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}

        {providers.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <Server className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No providers configured</p>
            <p className="text-sm">Add a provider to get started</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Provider</DialogTitle>
            <DialogDescription>
              Update provider configuration
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Provider Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Base URL</Label>
              <Input
                value={formData.baseUrl}
                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>API Key</Label>
              <Input
                type="password"
                placeholder="Enter new key or leave empty to keep current"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProvider}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feature tips */}
      <div className="p-4 rounded-lg bg-muted/30 border border-border">
        <h4 className="font-medium text-sm text-foreground mb-2">💡 Tips</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• <strong>Auto-connect:</strong> Click refresh to test connection and fetch available models</li>
          <li>• <strong>Speedtest:</strong> Run speedtest to compare latency across all configured providers</li>
          <li>• <strong>Default provider:</strong> Star a provider to use it as default for new chats</li>
          <li>• <strong>Fallback:</strong> If default fails, system will try other connected providers</li>
        </ul>
      </div>
    </div>
  );
}
