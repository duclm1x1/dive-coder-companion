import { Circle, Pause, Play, RotateCcw, XCircle, Download, Keyboard, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MonitorHeaderProps {
  isConnected: boolean;
  workspace: string;
  isPaused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onRerun?: () => void;
  onExport?: () => void;
}

export function MonitorHeader({
  isConnected,
  workspace,
  isPaused = false,
  onPause,
  onResume,
  onCancel,
  onRerun,
  onExport,
}: MonitorHeaderProps) {
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-card/80 backdrop-blur-sm">
      {/* Left: Logo & Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
          <Cpu className="w-6 h-6" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-lg font-semibold text-gradient-cyan">Dive Coder</h1>
          <p className="text-2xs text-muted-foreground italic">Dive the Code, Feel the Flow</p>
        </div>
      </div>

      {/* Center: Workspace */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background-secondary border border-border hover:bg-muted hover:border-primary/50 transition-all cursor-pointer">
            <span className="text-2xs text-muted-foreground uppercase tracking-wider">Workspace</span>
            <span className="text-sm font-medium text-foreground">{workspace}</span>
            <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </TooltipTrigger>
        <TooltipContent>Current workspace</TooltipContent>
      </Tooltip>

      {/* Right: Status & Controls */}
      <div className="flex items-center gap-4">
        {/* Status Chip */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card">
          <div className="relative">
            <Circle
              className={`w-2.5 h-2.5 fill-current ${
                isConnected ? 'text-success' : 'text-destructive'
              }`}
            />
            {isConnected && (
              <Circle
                className="absolute inset-0 w-2.5 h-2.5 fill-current text-success animate-ping opacity-50"
              />
            )}
          </div>
          <span className="text-xs font-medium text-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Run Controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-warning/10 hover:text-warning"
                onClick={isPaused ? onResume : onPause}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isPaused ? 'Resume' : 'Pause'}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                onClick={onCancel}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Cancel</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                onClick={onRerun}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Rerun</TooltipContent>
          </Tooltip>
        </div>

        {/* Export Button */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 border-primary/30 text-primary hover:bg-primary/10"
          onClick={onExport}
        >
          <Download className="w-4 h-4" />
          <span className="hidden md:inline">Export</span>
        </Button>

        {/* Keyboard shortcuts hint */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Keyboard className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="text-xs space-y-1">
              <p><kbd className="px-1 py-0.5 rounded bg-muted">1-4</kbd> Switch tabs</p>
              <p><kbd className="px-1 py-0.5 rounded bg-muted">Space</kbd> Pause/Resume</p>
              <p><kbd className="px-1 py-0.5 rounded bg-muted">R</kbd> Refresh</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
