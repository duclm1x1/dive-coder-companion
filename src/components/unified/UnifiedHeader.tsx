import { useState } from "react";
import { 
  Wifi, WifiOff, Play, Square, RefreshCw, Download, 
  LayoutGrid, ChevronDown, Folder
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [workspace, setWorkspace] = useState("dive-monitor");

  const workspaces = [
    "dive-monitor",
    "dive-coder",
    "dive-chat",
    "my-project",
  ];

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
      {/* Left - Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">DC</span>
        </div>
        <div className="flex flex-col">
          <span className="text-primary font-bold text-sm">Dive Coder</span>
          <span className="text-muted-foreground text-xs">Dive the Code, Feel the Flow</span>
        </div>
      </div>

      {/* Center - Workspace Selector */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">WORKSPACE</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 border-border">
              <Folder className="w-4 h-4 text-muted-foreground" />
              {workspace}
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48">
            {workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws}
                onClick={() => setWorkspace(ws)}
                className={ws === workspace ? "bg-primary/10 text-primary" : ""}
              >
                <Folder className="w-4 h-4 mr-2" />
                {ws}
              </DropdownMenuItem>
            ))}
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
  );
}
