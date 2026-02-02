import { cn } from "@/lib/utils";
import { Info, AlertTriangle, XCircle, CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Event {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
  details?: string;
}

interface EventListProps {
  events: Event[];
}

const eventConfig = {
  info: { icon: Info, color: 'text-primary', bg: 'bg-primary/10', label: 'Info' },
  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning-background', label: 'Warning' },
  error: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Error' },
  success: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', label: 'Success' },
};

export function EventList({ events }: EventListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-foreground">Event Log</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xs text-muted-foreground">{events.length} events</span>
        </div>
      </div>
      <div className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-thin">
        {events.map((event) => {
          const config = eventConfig[event.type];
          const EventIcon = config.icon;
          const isExpanded = expandedId === event.id;

          return (
            <div key={event.id} className="rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : event.id)}
                className="w-full p-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
              >
                {event.details ? (
                  isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )
                ) : (
                  <div className="w-4" />
                )}
                <div className={cn('p-1.5 rounded', config.bg)}>
                  <EventIcon className={cn('w-3.5 h-3.5', config.color)} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm text-foreground truncate">{event.message}</p>
                </div>
                <span className="text-2xs text-muted-foreground whitespace-nowrap">{event.timestamp}</span>
                <span className={cn('px-2 py-0.5 rounded text-2xs font-medium', config.bg, config.color)}>
                  {config.label}
                </span>
              </button>
              {isExpanded && event.details && (
                <div className="px-4 pb-3 pl-14 border-t border-border bg-muted/20">
                  <pre className="text-xs text-muted-foreground mt-3 font-mono whitespace-pre-wrap">
                    {event.details}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
        {events.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No events recorded</p>
          </div>
        )}
      </div>
    </div>
  );
}
