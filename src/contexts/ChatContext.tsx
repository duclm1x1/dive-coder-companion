import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status?: "sending" | "thinking" | "generating" | "complete" | "error";
  thinkingSteps?: string[];
  attachments?: FileAttachment[];
  thinking?: string;
  thinkingDuration?: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  model: string;
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  badge?: string;
  color: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  sessionCost: number;
  latencyHistory: number[];
  selectedModel: AIModel;
  localPerformance: {
    totalTime: number;
    toolExecution: number;
    llmProcessing: number;
    characters: number;
    maxCharacters: number;
    inputTokens: number;
    outputTokens: number;
    p50Latency: number;
    p95Latency: number;
  };
}

interface ChatContextType {
  state: ChatState;
  // Current conversation helpers
  activeConversation: Conversation | null;
  messages: Message[];
  conversationTitle: string;
  // Conversation management
  createConversation: () => Conversation;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  // Message management
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setConversationTitle: (title: string) => void;
  // State management
  setSessionCost: (cost: number | ((prev: number) => number)) => void;
  setLatencyHistory: (history: number[] | ((prev: number[]) => number[])) => void;
  setSelectedModel: (model: AIModel) => void;
  setLocalPerformance: (perf: Partial<ChatState["localPerformance"]> | ((prev: ChatState["localPerformance"]) => ChatState["localPerformance"])) => void;
  clearChat: () => void;
}

const STORAGE_KEY = "dive-coder-conversations";

const defaultModel: AIModel = { 
  id: "gemini-3-flash", 
  name: "Gemini 3 Flash", 
  provider: "Google", 
  badge: "fast", 
  color: "bg-blue-500" 
};

const defaultPerformance = {
  totalTime: 0,
  toolExecution: 0,
  llmProcessing: 0,
  characters: 0,
  maxCharacters: 128000,
  inputTokens: 0,
  outputTokens: 0,
  p50Latency: 0,
  p95Latency: 0,
};

const defaultState: ChatState = {
  conversations: [],
  activeConversationId: null,
  sessionCost: 0,
  latencyHistory: [],
  selectedModel: defaultModel,
  localPerformance: defaultPerformance,
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Serialize conversations for storage (convert Date to string)
function serializeConversations(conversations: Conversation[]): string {
  return JSON.stringify(conversations.map(conv => ({
    ...conv,
    createdAt: conv.createdAt.toISOString(),
    updatedAt: conv.updatedAt.toISOString(),
    messages: conv.messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
      attachments: msg.attachments?.map(att => ({ ...att, file: undefined })),
    })),
  })));
}

// Deserialize conversations from storage (convert string to Date)
function deserializeConversations(data: string): Conversation[] {
  try {
    const parsed = JSON.parse(data);
    return parsed.map((conv: any) => ({
      ...conv,
      createdAt: new Date(conv.createdAt),
      updatedAt: new Date(conv.updatedAt),
      messages: conv.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }));
  } catch {
    return [];
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ChatState>(() => {
    // Load from localStorage on init
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const conversations = deserializeConversations(stored);
      const lastActiveId = localStorage.getItem(`${STORAGE_KEY}-active`);
      return {
        ...defaultState,
        conversations,
        activeConversationId: lastActiveId && conversations.find(c => c.id === lastActiveId) 
          ? lastActiveId 
          : conversations[0]?.id || null,
      };
    }
    return defaultState;
  });

  // Save to localStorage whenever conversations change
  useEffect(() => {
    if (state.conversations.length > 0) {
      localStorage.setItem(STORAGE_KEY, serializeConversations(state.conversations));
    }
    if (state.activeConversationId) {
      localStorage.setItem(`${STORAGE_KEY}-active`, state.activeConversationId);
    }
  }, [state.conversations, state.activeConversationId]);

  // Get active conversation
  const activeConversation = state.conversations.find(c => c.id === state.activeConversationId) || null;
  const messages = activeConversation?.messages || [];
  const conversationTitle = activeConversation?.title || "";

  // Create new conversation
  const createConversation = useCallback(() => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model: state.selectedModel.id,
    };
    
    setState(prev => ({
      ...prev,
      conversations: [newConv, ...prev.conversations],
      activeConversationId: newConv.id,
    }));
    
    return newConv;
  }, [state.selectedModel.id]);

  // Select conversation
  const selectConversation = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      activeConversationId: id,
    }));
  }, []);

  // Delete conversation
  const deleteConversation = useCallback((id: string) => {
    setState(prev => {
      const filtered = prev.conversations.filter(c => c.id !== id);
      const newActiveId = prev.activeConversationId === id 
        ? (filtered[0]?.id || null)
        : prev.activeConversationId;
      
      if (filtered.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      }
      
      return {
        ...prev,
        conversations: filtered,
        activeConversationId: newActiveId,
      };
    });
  }, []);

  // Rename conversation
  const renameConversation = useCallback((id: string, title: string) => {
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(c => 
        c.id === id ? { ...c, title, updatedAt: new Date() } : c
      ),
    }));
  }, []);

  // Set messages for active conversation
  const setMessages = useCallback((messagesOrUpdater: Message[] | ((prev: Message[]) => Message[])) => {
    setState(prev => {
      if (!prev.activeConversationId) return prev;
      
      return {
        ...prev,
        conversations: prev.conversations.map(c => {
          if (c.id !== prev.activeConversationId) return c;
          
          const newMessages = typeof messagesOrUpdater === "function" 
            ? messagesOrUpdater(c.messages) 
            : messagesOrUpdater;
          
          // Auto-update title from first user message
          const firstUserMsg = newMessages.find(m => m.role === "user");
          const title = c.title === "New Chat" && firstUserMsg
            ? firstUserMsg.content.slice(0, 50) + (firstUserMsg.content.length > 50 ? "..." : "")
            : c.title;
          
          return { 
            ...c, 
            messages: newMessages, 
            title,
            updatedAt: new Date() 
          };
        }),
      };
    });
  }, []);

  // Set conversation title
  const setConversationTitle = useCallback((title: string) => {
    setState(prev => {
      if (!prev.activeConversationId) return prev;
      
      return {
        ...prev,
        conversations: prev.conversations.map(c => 
          c.id === prev.activeConversationId 
            ? { ...c, title, updatedAt: new Date() } 
            : c
        ),
      };
    });
  }, []);

  const setSessionCost = useCallback((cost: number | ((prev: number) => number)) => {
    setState(prev => ({
      ...prev,
      sessionCost: typeof cost === "function" ? cost(prev.sessionCost) : cost,
    }));
  }, []);

  const setLatencyHistory = useCallback((history: number[] | ((prev: number[]) => number[])) => {
    setState(prev => ({
      ...prev,
      latencyHistory: typeof history === "function" ? history(prev.latencyHistory) : history,
    }));
  }, []);

  const setSelectedModel = useCallback((model: AIModel) => {
    setState(prev => ({ ...prev, selectedModel: model }));
  }, []);

  const setLocalPerformance = useCallback((perf: Partial<ChatState["localPerformance"]> | ((prev: ChatState["localPerformance"]) => ChatState["localPerformance"])) => {
    setState(prev => ({
      ...prev,
      localPerformance: typeof perf === "function" 
        ? perf(prev.localPerformance) 
        : { ...prev.localPerformance, ...perf },
    }));
  }, []);

  const clearChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(c =>
        c.id === prev.activeConversationId
          ? { ...c, messages: [], title: "New Chat", updatedAt: new Date() }
          : c
      ),
    }));
  }, []);

  return (
    <ChatContext.Provider value={{
      state,
      activeConversation,
      messages,
      conversationTitle,
      createConversation,
      selectConversation,
      deleteConversation,
      renameConversation,
      setMessages,
      setConversationTitle,
      setSessionCost,
      setLatencyHistory,
      setSelectedModel,
      setLocalPerformance,
      clearChat,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
