import { CheckCircle2, Zap, XCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Run {
  id: string;
  type: string;
  status: 'success' | 'running' | 'failed';
  duration: string;
  timestamp: string;
}

interface RecentRunsProps {
  runs: Run[];
}

const statusConfig = {
  success: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
  running: { icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
  failed: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

export function RecentRuns({ runs }: RecentRunsProps) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-foreground">Recent Runs</h3>
        <span className="text-2xs text-muted-foreground uppercase tracking-wider">Last 5</span>
      </div>
      <div className="space-y-1">
        {runs.map((run) => {
          const config = statusConfig[run.status];
          const StatusIcon = config.icon;

          return (
            <div 
              key={run.id} 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={cn('p-2 rounded-lg', config.bg)}>
                  <StatusIcon className={cn('w-4 h-4', config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{run.type}</p>
                  <p className="text-xs text-muted-foreground">{run.timestamp}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-2xs text-muted-foreground">Duration</p>
                  <p className="text-sm font-medium text-foreground">{run.duration}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          );
        })}
        {runs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No runs yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
