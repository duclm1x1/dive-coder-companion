import { useState, useEffect, useCallback } from "react";

export interface Workspace {
  id: string;
  name: string;
  path?: string;
  createdAt: string;
  lastAccessed: string;
}

const STORAGE_KEY = "dive-coder-workspaces";
const SELECTED_KEY = "dive-coder-selected-workspace";

const defaultWorkspaces: Workspace[] = [
  {
    id: "default",
    name: "dive-monitor",
    path: "/home/user/projects/dive-monitor",
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
  },
];

export function useLocalWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Select a workspace
  const selectWorkspace = useCallback((workspace: Workspace) => {
    const updated = workspaces.map((w) =>
      w.id === workspace.id ? { ...w, lastAccessed: new Date().toISOString() } : w
    );
    saveWorkspaces(updated);
    localStorage.setItem(SELECTED_KEY, workspace.id);
    setSelectedWorkspace(workspace);
  }, [workspaces, saveWorkspaces]);

  // Add a new workspace
  const addWorkspace = useCallback((name: string, path?: string) => {
    const newWorkspace: Workspace = {
      id: `ws-${Date.now()}`,
      name: name.trim(),
      path: path?.trim(),
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
    };
    const updated = [...workspaces, newWorkspace];
    saveWorkspaces(updated);
    return newWorkspace;
  }, [workspaces, saveWorkspaces]);

  // Delete a workspace
  const deleteWorkspace = useCallback((id: string) => {
    if (workspaces.length <= 1) {
      console.warn("Cannot delete last workspace");
      return false;
    }
    const updated = workspaces.filter((w) => w.id !== id);
    saveWorkspaces(updated);

    // If deleted workspace was selected, select first available
    if (selectedWorkspace?.id === id) {
      const newSelected = updated[0];
      localStorage.setItem(SELECTED_KEY, newSelected.id);
      setSelectedWorkspace(newSelected);
    }
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

  // Import workspace from path (simulated for web)
  const importWorkspace = useCallback((name: string, path: string) => {
    return addWorkspace(name, path);
  }, [addWorkspace]);

  // Export all workspaces data
  const exportWorkspaces = useCallback(() => {
    return JSON.stringify(workspaces, null, 2);
  }, [workspaces]);

  return {
    workspaces,
    selectedWorkspace,
    isLoading,
    selectWorkspace,
    addWorkspace,
    deleteWorkspace,
    renameWorkspace,
    importWorkspace,
    exportWorkspaces,
  };
}
