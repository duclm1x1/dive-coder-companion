import { useState, useEffect, useCallback } from 'react';
import { backendApi, SystemStatus, DashboardStats, Agent, Model, ActivityItem } from '@/lib/api/backend';
import { 
  initializeSocket, 
  disconnectSocket, 
  joinAsUser, 
  onSystemStatus, 
  onAgentStatusUpdated,
  onTaskStarted,
  onTaskCompleted,
  onActivityNew,
  AgentStatus,
  TaskEvent,
  TaskCompleteEvent
} from '@/lib/socket';

interface UseDiveBackendReturn {
  // State
  isConnected: boolean;
  status: SystemStatus | null;
  stats: DashboardStats | null;
  agents: Agent[];
  models: Model[];
  activity: ActivityItem[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refresh: () => Promise<void>;
  connect: (userId: string, userName: string, avatar?: string) => void;
  disconnect: () => void;
}

export function useDiveBackend(): UseDiveBackendReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [statusData, statsData, agentsData, modelsData, activityData] = await Promise.all([
        backendApi.getStatus(),
        backendApi.getStats(),
        backendApi.getAgents(),
        backendApi.getModels(),
        backendApi.getActivity(20),
      ]);

      setStatus(statusData);
      setStats(statsData);
      setAgents(agentsData);
      setModels(modelsData);
      setActivity(activityData);
      setIsConnected(statusData.connected);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load backend data';
      setError(message);
      console.error('[useDiveBackend] Load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize socket and subscribe to events
  const connect = useCallback((userId: string, userName: string, avatar?: string) => {
    const socket = initializeSocket();

    // Join as user
    joinAsUser({ id: userId, name: userName, avatar });

    // Subscribe to real-time updates
    const unsubStatus = onSystemStatus((data: SystemStatus) => {
      setStatus(data);
      setIsConnected(data.connected);
    });

    const unsubAgent = onAgentStatusUpdated((data: AgentStatus) => {
      setAgents(prev => prev.map(agent => 
        agent.id === data.agentId 
          ? { ...agent, status: data.status as Agent['status'], currentTask: data.currentTask || null, progress: data.progress || 0 }
          : agent
      ));
    });

    const unsubTaskStarted = onTaskStarted((data: TaskEvent) => {
      console.log('[useDiveBackend] Task started:', data);
    });

    const unsubTaskCompleted = onTaskCompleted((data: TaskCompleteEvent) => {
      console.log('[useDiveBackend] Task completed:', data);
      // Refresh stats after task completion
      backendApi.getStats().then(setStats);
    });

    const unsubActivity = onActivityNew((data: unknown) => {
      setActivity(prev => [data as ActivityItem, ...prev].slice(0, 50));
    });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // Return cleanup function
    return () => {
      unsubStatus();
      unsubAgent();
      unsubTaskStarted();
      unsubTaskCompleted();
      unsubActivity();
    };
  }, []);

  // Disconnect socket
  const disconnect = useCallback(() => {
    disconnectSocket();
    setIsConnected(false);
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    isConnected,
    status,
    stats,
    agents,
    models,
    activity,
    isLoading,
    error,
    refresh: loadData,
    connect,
    disconnect,
  };
}
