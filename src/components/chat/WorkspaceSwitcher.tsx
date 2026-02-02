import { useState, useEffect, useRef } from "react";
import { ChevronDown, Plus, Folder, Check, Loader2, Trash2, Upload, Download, RefreshCw, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLocalWorkspaces, isFileSystemAccessSupported, Workspace } from "@/hooks/useLocalWorkspaces";

interface WorkspaceSwitcherProps {
  currentWorkspaceId?: string;
  onWorkspaceChange?: (workspace: Workspace) => void;
  className?: string;
}

export function WorkspaceSwitcher({
  currentWorkspaceId,
  onWorkspaceChange,
  className,
}: WorkspaceSwitcherProps) {
  const {
    workspaces,
    selectedWorkspace,
    isLoading,
    selectWorkspace,
    addWorkspace,
    deleteWorkspace,
    exportWorkspaceData,
    importWorkspaceData,
    syncToLocalFolder,
    reconnectLocalFolder,
    isFileSystemSupported,
  } = useLocalWorkspaces();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspacePath, setNewWorkspacePath] = useState("");
  const [useLocalFolder, setUseLocalFolder] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Sync with external currentWorkspaceId if provided
  useEffect(() => {
    if (currentWorkspaceId && selectedWorkspace?.id !== currentWorkspaceId) {
      const ws = workspaces.find(w => w.id === currentWorkspaceId);
      if (ws) selectWorkspace(ws);
    }
  }, [currentWorkspaceId, workspaces, selectedWorkspace, selectWorkspace]);

  const handleSelectWorkspace = (workspace: Workspace) => {
    selectWorkspace(workspace);
    onWorkspaceChange?.(workspace);
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim() && !useLocalFolder) {
      toast.error("Please enter a workspace name");
      return;
    }

    setIsCreating(true);
    try {
      const workspace = await addWorkspace(
        newWorkspaceName.trim(),
        useLocalFolder ? undefined : newWorkspacePath.trim() || undefined,
        useLocalFolder
      );

      if (workspace) {
        handleSelectWorkspace(workspace);
        setShowCreateDialog(false);
        resetCreateForm();
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleBrowseFolder = async () => {
    if (!isFileSystemSupported) {
      toast.error("Your browser doesn't support folder selection. Use Chrome or Edge.");
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

  const handleDeleteWorkspace = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this workspace?")) {
      deleteWorkspace(id);
    }
  };

  const handleExport = (workspaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    exportWorkspaceData(workspaceId);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const workspace = await importWorkspaceData(file);
    if (workspace) {
      handleSelectWorkspace(workspace);
    }
    
    if (importInputRef.current) importInputRef.current.value = '';
  };

  const handleSync = async (workspaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await syncToLocalFolder(workspaceId);
  };

  const handleReconnect = async (workspaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await reconnectLocalFolder(workspaceId);
  };

  const resetCreateForm = () => {
    setNewWorkspaceName("");
    setNewWorkspacePath("");
    setUseLocalFolder(false);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-xs text-muted-foreground font-medium">WORKSPACE</span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 min-w-[140px] justify-between"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{selectedWorkspace?.name || "Select"}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Workspaces
          </DropdownMenuLabel>
          
          {workspaces.map(workspace => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => handleSelectWorkspace(workspace)}
              className="flex items-center justify-between gap-2 group"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Folder className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{workspace.name}</p>
                  {workspace.path && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      {workspace.isLocal ? "📁 " : ""}{workspace.path}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {workspace.isLocal && isFileSystemSupported && (
                  <>
                    <button
                      onClick={(e) => handleSync(workspace.id, e)}
                      className="p-1 hover:bg-muted rounded"
                      title="Sync to folder"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleReconnect(workspace.id, e)}
                      className="p-1 hover:bg-muted rounded"
                      title="Reconnect folder"
                    >
                      <FolderOpen className="w-3 h-3" />
                    </button>
                  </>
                )}
                <button
                  onClick={(e) => handleExport(workspace.id, e)}
                  className="p-1 hover:bg-muted rounded"
                  title="Export"
                >
                  <Download className="w-3 h-3" />
                </button>
                {workspaces.length > 1 && (
                  <button
                    onClick={(e) => handleDeleteWorkspace(workspace.id, e)}
                    className="p-1 hover:bg-destructive/10 hover:text-destructive rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              {selectedWorkspace?.id === workspace.id && (
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
              )}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
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

      {/* Create Workspace Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        if (!open) resetCreateForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Folder className="w-5 h-5" />
              Add Local Workspace
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                placeholder="my-project"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workspace-path">Local Path (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="workspace-path"
                  placeholder="/home/user/projects/my-project"
                  value={newWorkspacePath}
                  onChange={(e) => setNewWorkspacePath(e.target.value)}
                  className="flex-1 bg-primary/5 border-primary/20"
                />
                {isFileSystemSupported && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleBrowseFolder}
                    title="Browse folder"
                  >
                    <FolderOpen className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                The local directory path for this workspace
              </p>
            </div>

            {!isFileSystemSupported && (
              <p className="text-xs text-amber-500 bg-amber-500/10 p-2 rounded">
                ⚠️ Folder selection requires Chrome or Edge browser. You can still enter a path manually.
              </p>
            )}
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                resetCreateForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateWorkspace}
              disabled={isCreating || !newWorkspaceName.trim()}
              className="gap-2"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
