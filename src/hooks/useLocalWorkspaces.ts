import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface Workspace {
  id: string;
  name: string;
  path?: string;
  createdAt: string;
  lastAccessed: string;
  isLocal?: boolean;
}

export interface WorkspaceData {
  conversations: any[];
  settings: Record<string, any>;
  history: any[];
}

const STORAGE_KEY = "dive-coder-workspaces";
const SELECTED_KEY = "dive-coder-selected-workspace";
const DATA_PREFIX = "dive-coder-workspace-data-";

const defaultWorkspaces: Workspace[] = [
  {
    id: "default",
    name: "dive-monitor",
    path: "/home/user/projects/dive-monitor",
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
    isLocal: false,
  },
];

// Check if running in an iframe (cross-origin iframes block file picker)
const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true; // If we can't access window.top, we're in a cross-origin iframe
  }
};

// Check if File System Access API is supported and usable
export const isFileSystemAccessSupported = () => {
  return 'showDirectoryPicker' in window && !isInIframe();
};

// Get reason why file picker is not available
export const getFilePickerUnavailableReason = () => {
  if (!('showDirectoryPicker' in window)) {
    return "Your browser doesn't support folder selection. Use Chrome or Edge.";
  }
  if (isInIframe()) {
    return "Folder picker is not available in preview mode. Open the published app directly to use this feature.";
  }
  return null;
};

export function useLocalWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [directoryHandles, setDirectoryHandles] = useState<Map<string, FileSystemDirectoryHandle>>(new Map());

  // Load workspaces from localStorage on mount
  useEffect(() => {
    const loadWorkspaces = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : defaultWorkspaces;
        setWorkspaces(parsed);

        // Load selected workspace
        const selectedId = localStorage.getItem(SELECTED_KEY);
        const selected = parsed.find((w: Workspace) => w.id === selectedId) || parsed[0];
        setSelectedWorkspace(selected);
      } catch (error) {
        console.error("Error loading workspaces:", error);
        setWorkspaces(defaultWorkspaces);
        setSelectedWorkspace(defaultWorkspaces[0]);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspaces();
  }, []);

  // Save workspaces to localStorage
  const saveWorkspaces = useCallback((newWorkspaces: Workspace[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newWorkspaces));
    setWorkspaces(newWorkspaces);
  }, []);

  // Get workspace data from localStorage
  const getWorkspaceData = useCallback((workspaceId: string): WorkspaceData => {
    try {
      const stored = localStorage.getItem(`${DATA_PREFIX}${workspaceId}`);
      return stored ? JSON.parse(stored) : { conversations: [], settings: {}, history: [] };
    } catch {
      return { conversations: [], settings: {}, history: [] };
    }
  }, []);

  // Save workspace data to localStorage
  const saveWorkspaceData = useCallback((workspaceId: string, data: WorkspaceData) => {
    localStorage.setItem(`${DATA_PREFIX}${workspaceId}`, JSON.stringify(data));
  }, []);

  // Select a workspace
  const selectWorkspace = useCallback((workspace: Workspace) => {
    const updated = workspaces.map((w) =>
      w.id === workspace.id ? { ...w, lastAccessed: new Date().toISOString() } : w
    );
    saveWorkspaces(updated);
    localStorage.setItem(SELECTED_KEY, workspace.id);
    setSelectedWorkspace(workspace);
  }, [workspaces, saveWorkspaces]);

  // Pick a directory using File System Access API
  const pickDirectory = useCallback(async (): Promise<{ path: string; handle: FileSystemDirectoryHandle } | null> => {
    const unavailableReason = getFilePickerUnavailableReason();
    if (unavailableReason) {
      toast.error(unavailableReason);
      return null;
    }

    try {
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
      });
      
      // Get the full path - note: this only returns the folder name, not full path for security
      const path = handle.name;
      
      return { path, handle };
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Error picking directory:", error);
        toast.error("Failed to select folder");
      }
      return null;
    }
  }, []);

  // Add a new workspace with optional local path
  const addWorkspace = useCallback(async (name: string, path?: string, pickFolder?: boolean): Promise<Workspace | null> => {
    let localPath = path;
    let handle: FileSystemDirectoryHandle | undefined;

    // If picking folder, use File System Access API
    if (pickFolder) {
      const result = await pickDirectory();
      if (!result) return null;
      localPath = result.path;
      handle = result.handle;
    }

    const newWorkspace: Workspace = {
      id: `ws-${Date.now()}`,
      name: name.trim() || localPath || "New Workspace",
      path: localPath,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      isLocal: !!localPath,
    };

    const updated = [...workspaces, newWorkspace];
    saveWorkspaces(updated);

    // Store directory handle for later use
    if (handle) {
      setDirectoryHandles(prev => new Map(prev).set(newWorkspace.id, handle));
    }

    // Initialize empty workspace data
    saveWorkspaceData(newWorkspace.id, { conversations: [], settings: {}, history: [] });

    toast.success(`Workspace "${newWorkspace.name}" created`);
    return newWorkspace;
  }, [workspaces, saveWorkspaces, pickDirectory, saveWorkspaceData]);

  // Delete a workspace
  const deleteWorkspace = useCallback((id: string) => {
    if (workspaces.length <= 1) {
      toast.error("Cannot delete the last workspace");
      return false;
    }
    
    const workspace = workspaces.find(w => w.id === id);
    const updated = workspaces.filter((w) => w.id !== id);
    saveWorkspaces(updated);

    // Clean up workspace data
    localStorage.removeItem(`${DATA_PREFIX}${id}`);

    // Remove directory handle
    setDirectoryHandles(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });

    // If deleted workspace was selected, select first available
    if (selectedWorkspace?.id === id) {
      const newSelected = updated[0];
      localStorage.setItem(SELECTED_KEY, newSelected.id);
      setSelectedWorkspace(newSelected);
    }

    toast.success(`Workspace "${workspace?.name}" deleted`);
    return true;
  }, [workspaces, selectedWorkspace, saveWorkspaces]);

  // Rename a workspace
  const renameWorkspace = useCallback((id: string, newName: string) => {
    const updated = workspaces.map((w) =>
      w.id === id ? { ...w, name: newName.trim() } : w
    );
    saveWorkspaces(updated);
    
    if (selectedWorkspace?.id === id) {
      setSelectedWorkspace({ ...selectedWorkspace, name: newName.trim() });
    }
  }, [workspaces, selectedWorkspace, saveWorkspaces]);

  // Export workspace data to file
  const exportWorkspaceData = useCallback(async (workspaceId: string) => {
    const data = getWorkspaceData(workspaceId);
    const workspace = workspaces.find(w => w.id === workspaceId);
    
    const exportData = {
      workspace,
      data,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workspace?.name || 'workspace'}-export.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Workspace exported successfully");
  }, [workspaces, getWorkspaceData]);

  // Import workspace data from file
  const importWorkspaceData = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      if (!importData.workspace || !importData.data) {
        throw new Error("Invalid workspace file format");
      }

      const newWorkspace: Workspace = {
        ...importData.workspace,
        id: `ws-${Date.now()}`,
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
      };

      const updated = [...workspaces, newWorkspace];
      saveWorkspaces(updated);
      saveWorkspaceData(newWorkspace.id, importData.data);

      toast.success(`Workspace "${newWorkspace.name}" imported`);
      return newWorkspace;
    } catch (error) {
      console.error("Error importing workspace:", error);
      toast.error("Failed to import workspace");
      return null;
    }
  }, [workspaces, saveWorkspaces, saveWorkspaceData]);

  // Save data to local folder (if supported and connected)
  const syncToLocalFolder = useCallback(async (workspaceId: string) => {
    const handle = directoryHandles.get(workspaceId);
    if (!handle) {
      toast.error("No folder connected to this workspace");
      return false;
    }

    try {
      // Verify permission using type assertion for experimental API
      const handleWithPerms = handle as FileSystemDirectoryHandle & {
        queryPermission?: (opts: { mode: string }) => Promise<string>;
        requestPermission?: (opts: { mode: string }) => Promise<string>;
      };
      
      if (handleWithPerms.queryPermission) {
        const permission = await handleWithPerms.queryPermission({ mode: 'readwrite' });
        if (permission !== 'granted' && handleWithPerms.requestPermission) {
          const requestResult = await handleWithPerms.requestPermission({ mode: 'readwrite' });
          if (requestResult !== 'granted') {
            toast.error("Permission denied to write to folder");
            return false;
          }
        }
      }

      const data = getWorkspaceData(workspaceId);
      const fileHandle = await handle.getFileHandle('dive-coder-data.json', { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();

      toast.success("Data synced to local folder");
      return true;
    } catch (error) {
      console.error("Error syncing to local folder:", error);
      toast.error("Failed to sync to local folder");
      return false;
    }
  }, [directoryHandles, getWorkspaceData]);

  // Load data from local folder
  const loadFromLocalFolder = useCallback(async (workspaceId: string) => {
    const handle = directoryHandles.get(workspaceId);
    if (!handle) {
      toast.error("No folder connected to this workspace");
      return false;
    }

    try {
      const fileHandle = await handle.getFileHandle('dive-coder-data.json');
      const file = await fileHandle.getFile();
      const text = await file.text();
      const data = JSON.parse(text);

      saveWorkspaceData(workspaceId, data);
      toast.success("Data loaded from local folder");
      return true;
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        toast.info("No existing data found in folder");
      } else {
        console.error("Error loading from local folder:", error);
        toast.error("Failed to load from local folder");
      }
      return false;
    }
  }, [directoryHandles, saveWorkspaceData]);

  // Reconnect to local folder (re-pick after page reload)
  const reconnectLocalFolder = useCallback(async (workspaceId: string) => {
    const result = await pickDirectory();
    if (!result) return false;

    // Update workspace path
    const updated = workspaces.map(w =>
      w.id === workspaceId ? { ...w, path: result.path } : w
    );
    saveWorkspaces(updated);

    // Store handle
    setDirectoryHandles(prev => new Map(prev).set(workspaceId, result.handle));

    toast.success("Folder reconnected");
    return true;
  }, [workspaces, pickDirectory, saveWorkspaces]);

  return {
    workspaces,
    selectedWorkspace,
    isLoading,
    selectWorkspace,
    addWorkspace,
    deleteWorkspace,
    renameWorkspace,
    getWorkspaceData,
    saveWorkspaceData,
    exportWorkspaceData,
    importWorkspaceData,
    syncToLocalFolder,
    loadFromLocalFolder,
    reconnectLocalFolder,
    isFileSystemSupported: isFileSystemAccessSupported(),
  };
}

// Type declarations for File System Access API
declare global {
  interface Window {
    showDirectoryPicker(options?: { mode?: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>;
  }
}
