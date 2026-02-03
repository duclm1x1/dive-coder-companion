import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://3000-iym918g1udg3z0fllnp0o-5536f345.us2.manus.computer';

let socket: Socket | null = null;

export interface SystemStatus {
  connected: boolean;
  components: {
    diveOrchestrator: boolean;
    masterOrchestrator: boolean;
    multiModelReview: boolean;
    diveCoder: boolean;
  };
  agentCount: number;
  models: number;
}

export interface AgentStatus {
  agentId: number;
  status: string;
  currentTask?: string;
  progress?: number;
}

export interface TaskEvent {
  taskId: string;
  description: string;
  type: string;
  userId: string;
}

export interface TaskCompleteEvent {
  taskId: string;
  success: boolean;
  result?: unknown;
  userId: string;
}

export interface UserInfo {
  id: string;
  name: string;
  avatar?: string;
}

export function initializeSocket(): Socket {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket.IO] Connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('[Socket.IO] Disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket.IO] Connection error:', error.message);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Emit events
export function joinAsUser(user: UserInfo): void {
  socket?.emit('user:join', user);
}

export function startTask(task: TaskEvent): void {
  socket?.emit('task:start', task);
}

export function completeTask(task: TaskCompleteEvent): void {
  socket?.emit('task:complete', task);
}

export function updateAgentStatus(agent: AgentStatus): void {
  socket?.emit('agent:status', agent);
}

// Subscribe to events
export function onSystemStatus(callback: (data: SystemStatus) => void): () => void {
  socket?.on('system:status', callback);
  return () => socket?.off('system:status', callback);
}

export function onAgentStatusUpdated(callback: (data: AgentStatus) => void): () => void {
  socket?.on('agent:status:updated', callback);
  return () => socket?.off('agent:status:updated', callback);
}

export function onTaskStarted(callback: (data: TaskEvent) => void): () => void {
  socket?.on('task:started', callback);
  return () => socket?.off('task:started', callback);
}

export function onTaskCompleted(callback: (data: TaskCompleteEvent & { result?: unknown }) => void): () => void {
  socket?.on('task:completed', callback);
  return () => socket?.off('task:completed', callback);
}

export function onActivityNew(callback: (data: unknown) => void): () => void {
  socket?.on('activity:new', callback);
  return () => socket?.off('activity:new', callback);
}

export function onUserJoined(callback: (user: UserInfo) => void): () => void {
  socket?.on('user:joined', callback);
  return () => socket?.off('user:joined', callback);
}

export function onUserLeft(callback: (data: { id: string }) => void): () => void {
  socket?.on('user:left', callback);
  return () => socket?.off('user:left', callback);
}
