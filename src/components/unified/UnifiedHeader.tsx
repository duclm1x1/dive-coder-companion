import { useState } from "react";
import { 
  Wifi, WifiOff, Play, Square, RefreshCw, 
  LayoutGrid, ChevronDown, Folder, Plus, Trash2, FolderOpen, HardDrive, Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useLocalWorkspaces, Workspace } from "@/hooks/useLocalWorkspaces";
import { cn } from "@/lib/utils";
import { DIVE_CODER_VERSION } from "@/lib/dive-coder-config";

interface UnifiedHeaderProps {
  isConnected: boolean;
  isRunning: boolean;
  onToggleRun: () => void;
  onRefresh: () => void;
  onExport: () => void;
}

export function UnifiedHeader({
  isConnected,
  isRunning,
  onToggleRun,
  onRefresh,
  onExport,
}: UnifiedHeaderProps) {
  const {
    workspaces,
    selectedWorkspace,
    selectWorkspace,
    addWorkspace,
    deleteWorkspace,
  } = useLocalWorkspaces();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspacePath, setNewWorkspacePath] = useState("");

  const handleAddWorkspace = () => {
    if (newWorkspaceName.trim()) {
      const ws = addWorkspace(newWorkspaceName, newWorkspacePath);
      selectWorkspace(ws);
      setNewWorkspaceName("");
      setNewWorkspacePath("");
      setShowAddDialog(false);
    }
  };

  const handleDeleteWorkspace = (e: React.MouseEvent, ws: Workspace) => {
    e.stopPropagation();
    if (workspaces.length > 1) {
      deleteWorkspace(ws.id);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        {/* Left - Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
            <Brain className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm gradient-text">Dive Coder</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
                {DIVE_CODER_VERSION}
              </span>
            </div>
            <span className="text-muted-foreground text-[10px]">Dive the Code, Feel the Flow</span>
          </div>
        </div>

        {/* Center - Workspace Selector */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">WORKSPACE</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 border-border min-w-[180px] justify-between">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate max-w-[120px]">{selectedWorkspace?.name || "Select..."}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-64">
              <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
                <HardDrive className="w-3 h-3" />
                Local Workspaces
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => selectWorkspace(ws)}
                  className={cn(
                    "flex items-center justify-between group",
                    ws.id === selectedWorkspace?.id && "bg-primary/10 text-primary"
                  )}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FolderOpen className="w-4 h-4 flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{ws.name}</span>
                      {ws.path && (
                        <span className="text-[10px] text-muted-foreground truncate">{ws.path}</span>
                      )}
                    </div>
                  </div>
                  {workspaces.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => handleDeleteWorkspace(e, ws)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowAddDialog(true)} className="text-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right - Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className={`flex items-center gap-2 ${isConnected ? "text-success" : "text-muted-foreground"}`}>
            {isConnected ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            <span className="text-sm font-medium flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-success" : "bg-muted-foreground"}`} />
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 border-l border-border pl-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleRun}
              className="hover:bg-muted"
            >
              {isRunning ? (
                <Square className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted"
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              className="hover:bg-muted"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onExport}
              className="hover:bg-muted"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Add Workspace Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              Add Local Workspace
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="my-project"
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-path">Local Path (optional)</Label>
              <Input
                id="workspace-path"
                value={newWorkspacePath}
                onChange={(e) => setNewWorkspacePath(e.target.value)}
                placeholder="/home/user/projects/my-project"
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                The local directory path for this workspace
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddWorkspace} disabled={!newWorkspaceName.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
