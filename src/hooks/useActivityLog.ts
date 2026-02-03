import { useState, useCallback, useEffect } from "react";

export interface ActivityEvent {
  id: string;
  type: "chat" | "api_call" | "model_test" | "error" | "system" | "provider";
  title: string;
  description?: string;
  timestamp: string;
  metadata?: Record<string, any>;
  status?: "success" | "error" | "pending";
}

const STORAGE_KEY = "dive-coder-activity-log";
const MAX_EVENTS = 100;

export function useActivityLog() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  // Load from localStorage on mount with defensive parsing
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate each event has required fields
        const valid = Array.isArray(parsed)
          ? parsed.filter(e =>
              typeof e === 'object' &&
              e !== null &&
              typeof e.id === 'string' &&
              typeof e.type === 'string' &&
              typeof e.title === 'string'
            )
          : [];
        setEvents(valid);
      }
    } catch (e) {
      console.warn("Failed to load activity log:", e);
      localStorage.removeItem(STORAGE_KEY);
      setEvents([]);
    }
  }, []);

  // Save to localStorage
  const saveEvents = useCallback((newEvents: ActivityEvent[]) => {
    const trimmed = newEvents.slice(0, MAX_EVENTS);
    setEvents(trimmed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  }, []);

  // Add new event
  const addEvent = useCallback((event: Omit<ActivityEvent, "id" | "timestamp">) => {
    const newEvent: ActivityEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    saveEvents([newEvent, ...events]);
    return newEvent;
  }, [events, saveEvents]);

  // Log chat message
  const logChat = useCallback((message: string, role: "user" | "assistant") => {
    return addEvent({
      type: "chat",
      title: role === "user" ? "Message sent" : "Response received",
      description: message.slice(0, 100) + (message.length > 100 ? "..." : ""),
      status: "success",
    });
  }, [addEvent]);

  // Log API call
  const logAPICall = useCallback((provider: string, model: string, latency: number, success: boolean) => {
    return addEvent({
      type: "api_call",
      title: `API Call: ${provider}`,
      description: `Model: ${model} • ${latency}ms`,
      status: success ? "success" : "error",
      metadata: { provider, model, latency },
    });
  }, [addEvent]);

  // Log model test
  const logModelTest = useCallback((provider: string, model: string, latency: number, success: boolean) => {
    return addEvent({
      type: "model_test",
      title: `Speed Test: ${model}`,
      description: success ? `${provider} • ${latency}ms` : `${provider} • Failed`,
      status: success ? "success" : "error",
      metadata: { provider, model, latency },
    });
  }, [addEvent]);

  // Log error
  const logError = useCallback((title: string, description?: string) => {
    return addEvent({
      type: "error",
      title,
      description,
      status: "error",
    });
  }, [addEvent]);

  // Log provider event
  const logProviderEvent = useCallback((action: "added" | "updated" | "deleted" | "connected", providerName: string) => {
    return addEvent({
      type: "provider",
      title: `Provider ${action}`,
      description: providerName,
      status: "success",
    });
  }, [addEvent]);

  // Clear all events
  const clearEvents = useCallback(() => {
    setEvents([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Get recent events (for dashboard)
  const getRecentEvents = useCallback((count: number = 10) => {
    return events.slice(0, count);
  }, [events]);

  return {
    events,
    addEvent,
    logChat,
    logAPICall,
    logModelTest,
    logError,
    logProviderEvent,
    clearEvents,
    getRecentEvents,
  };
}
