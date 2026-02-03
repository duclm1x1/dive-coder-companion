import { useState, useRef } from "react";
import { 
  Wifi, WifiOff, Play, Square, RefreshCw, 
  LayoutGrid, ChevronDown, Folder, Plus, Trash2, FolderOpen, HardDrive, Brain,
  Upload, Download, Loader2
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
import { useLocalWorkspaces, isFileSystemAccessSupported, getFilePickerUnavailableReason, Workspace } from "@/hooks/useLocalWorkspaces";
import { cn } from "@/lib/utils";
import { DIVE_CODER_VERSION } from "@/lib/dive-coder-config";
import { UserHeader } from "@/components/layout/UserHeader";
import { toast } from "sonner";

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
    exportWorkspaceData,
    importWorkspaceData,
    isFileSystemSupported,
  } = useLocalWorkspaces();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspacePath, setNewWorkspacePath] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleBrowseFolder = async () => {
    const unavailableReason = getFilePickerUnavailableReason();
    if (unavailableReason) {
      toast.error(unavailableReason);
      return;
    }

    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      setNewWorkspacePath(handle.name);
      if (!newWorkspaceName.trim()) {
        setNewWorkspaceName(handle.name);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast.error("Failed to select folder");
      }
    }
  };

  const handleAddWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }

    setIsCreating(true);
    try {
      const ws = await addWorkspace(newWorkspaceName, newWorkspacePath || undefined, false);
      if (ws) {
        selectWorkspace(ws);
        setNewWorkspaceName("");
        setNewWorkspacePath("");
        setShowAddDialog(false);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddWithFolderPicker = async () => {
    const unavailableReason = getFilePickerUnavailableReason();
    if (unavailableReason) {
      toast.error(unavailableReason);
      return;
    }

    setIsCreating(true);
    try {
      const ws = await addWorkspace(newWorkspaceName || "", undefined, true);
      if (ws) {
        selectWorkspace(ws);
        setNewWorkspaceName("");
        setNewWorkspacePath("");
        setShowAddDialog(false);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteWorkspace = (e: React.MouseEvent, ws: Workspace) => {
    e.stopPropagation();
    if (workspaces.length > 1) {
      if (window.confirm(`Delete workspace "${ws.name}"?`)) {
        deleteWorkspace(ws.id);
      }
    }
  };

  const handleExport = (e: React.MouseEvent, ws: Workspace) => {
    e.stopPropagation();
    exportWorkspaceData(ws.id);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const workspace = await importWorkspaceData(file);
    if (workspace) {
      selectWorkspace(workspace);
    }
    
    if (importInputRef.current) importInputRef.current.value = '';
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
            <DropdownMenuContent align="center" className="w-72">
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
                        <span className="text-[10px] text-muted-foreground truncate">
                          {ws.isLocal ? "📁 " : ""}{ws.path}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-muted"
                      onClick={(e) => handleExport(e, ws)}
                      title="Export"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    {workspaces.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => handleDeleteWorkspace(e, ws)}
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowAddDialog(true)} className="text-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Local Workspace
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => importInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Import Workspace
              </DropdownMenuItem>
              
              <input
                ref={importInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
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

          {/* User Menu */}
          <div className="border-l border-border pl-3">
            <UserHeader />
          </div>
        </div>
      </header>

      {/* Add Workspace Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) {
          setNewWorkspaceName("");
          setNewWorkspacePath("");
        }
      }}>
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
              <div className="flex gap-2">
                <Input
                  id="workspace-path"
                  value={newWorkspacePath}
                  onChange={(e) => setNewWorkspacePath(e.target.value)}
                  placeholder="/home/user/projects/my-project"
                  className="flex-1 bg-primary/5 border-primary/20"
                />
                {isFileSystemSupported && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleBrowseFolder}
                    title="Browse folder"
                    disabled={isCreating}
                  >
                    <FolderOpen className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                The local directory path for this workspace
              </p>
            </div>

            {isFileSystemSupported && (
              <div className="pt-2 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleAddWithFolderPicker}
                  disabled={isCreating}
                >
                  <FolderOpen className="w-4 h-4" />
                  Pick Folder from PC
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Select a folder directly from your hard drive
                </p>
              </div>
            )}

            {!isFileSystemSupported && (
              <p className="text-xs text-amber-500 bg-amber-500/10 p-2 rounded">
                ⚠️ {getFilePickerUnavailableReason() || "Folder selection requires Chrome or Edge browser."} You can still enter a path manually.
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleAddWorkspace} disabled={!newWorkspaceName.trim() || isCreating}>
              {isCreating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
