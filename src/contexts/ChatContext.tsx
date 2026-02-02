import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  isLoadingFromDb: boolean;
}

interface ChatContextType {
  state: ChatState;
  activeConversation: Conversation | null;
  messages: Message[];
  conversationTitle: string;
  createConversation: () => Conversation;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setConversationTitle: (title: string) => void;
  setSessionCost: (cost: number | ((prev: number) => number)) => void;
  setLatencyHistory: (history: number[] | ((prev: number[]) => number[])) => void;
  setSelectedModel: (model: AIModel) => void;
  setLocalPerformance: (perf: Partial<ChatState["localPerformance"]> | ((prev: ChatState["localPerformance"]) => ChatState["localPerformance"])) => void;
  clearChat: () => void;
  refreshFromDatabase: () => Promise<void>;
}

const ACTIVE_CONV_KEY = "dive-coder-active-conversation";

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
  isLoadingFromDb: true,
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Convert DB message to local format
function dbToLocalMessage(msg: {
  id: string;
  role: string;
  content: string;
  created_at: string;
  thinking: string | null;
  thinking_duration: number | null;
  attachments: unknown;
}): Message {
  const attachments = Array.isArray(msg.attachments) ? msg.attachments : undefined;
  return {
    id: msg.id,
    role: msg.role as "user" | "assistant",
    content: msg.content,
    timestamp: new Date(msg.created_at),
    status: "complete",
    thinking: msg.thinking ?? undefined,
    thinkingDuration: msg.thinking_duration ?? undefined,
    attachments: attachments as FileAttachment[] | undefined,
  };
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<ChatState>(defaultState);
  const isInitialLoad = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Load conversations from database
  const loadFromDatabase = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, isLoadingFromDb: false, conversations: [], activeConversationId: null }));
      return;
    }

    try {
      // Fetch conversations
      const { data: convData, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_archived", false)
        .order("updated_at", { ascending: false });

      if (convError) {
        console.error("Failed to load conversations:", convError);
        setState(prev => ({ ...prev, isLoadingFromDb: false }));
        return;
      }

      if (!convData || convData.length === 0) {
        setState(prev => ({ 
          ...prev, 
          isLoadingFromDb: false, 
          conversations: [], 
          activeConversationId: null 
        }));
        isInitialLoad.current = false;
        return;
      }

      // Fetch all messages
      const convIds = convData.map(c => c.id);
      const { data: msgData, error: msgError } = await supabase
        .from("messages")
        .select("*")
        .in("conversation_id", convIds)
        .order("created_at", { ascending: true });

      if (msgError) {
        console.error("Failed to load messages:", msgError);
      }

      // Group messages by conversation
      const messagesByConv = (msgData || []).reduce((acc, msg) => {
        if (!acc[msg.conversation_id]) acc[msg.conversation_id] = [];
        acc[msg.conversation_id].push(msg);
        return acc;
      }, {} as Record<string, typeof msgData>);

      // Convert to local format
      const conversations: Conversation[] = convData.map(conv => ({
        id: conv.id,
        title: conv.title,
        model: conv.model,
        createdAt: new Date(conv.created_at),
        updatedAt: new Date(conv.updated_at),
        messages: (messagesByConv[conv.id] || []).map(dbToLocalMessage),
      }));

      // Restore active conversation
      const storedActiveId = localStorage.getItem(ACTIVE_CONV_KEY);
      const validActiveId = storedActiveId && conversations.find(c => c.id === storedActiveId)
        ? storedActiveId
        : conversations[0]?.id || null;

      setState(prev => ({
        ...prev,
        conversations,
        activeConversationId: validActiveId,
        isLoadingFromDb: false,
      }));
      
      isInitialLoad.current = false;
    } catch (error) {
      console.error("Database load error:", error);
      setState(prev => ({ ...prev, isLoadingFromDb: false }));
      isInitialLoad.current = false;
    }
  }, [user]);

  // Save conversation to database (debounced)
  const saveConversationToDb = useCallback(async (conversation: Conversation) => {
    if (!user) return;

    try {
      // Upsert conversation
      const { error: convError } = await supabase
        .from("conversations")
        .upsert({
          id: conversation.id,
          user_id: user.id,
          title: conversation.title,
          model: conversation.model,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });

      if (convError) {
        console.error("Failed to save conversation:", convError);
        return;
      }

      // Get existing message IDs
      const { data: existingMsgs } = await supabase
        .from("messages")
        .select("id")
        .eq("conversation_id", conversation.id);

      const existingIds = new Set((existingMsgs || []).map(m => m.id));

      // Only insert new complete messages
      const newMessages = conversation.messages
        .filter(m => m.status === "complete" && !existingIds.has(m.id))
        .map(m => ({
          id: m.id,
          conversation_id: conversation.id,
          role: m.role,
          content: m.content,
          thinking: m.thinking || null,
          thinking_duration: m.thinkingDuration || null,
          attachments: m.attachments 
            ? m.attachments.map(a => ({ id: a.id, name: a.name, type: a.type, size: a.size }))
            : null,
        }));

      if (newMessages.length > 0) {
        const { error: msgError } = await supabase
          .from("messages")
          .insert(newMessages);

        if (msgError) {
          console.error("Failed to save messages:", msgError);
        }
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  }, [user]);

  // Delete conversation from database
  const deleteFromDb = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      // Delete messages first
      await supabase
        .from("messages")
        .delete()
        .eq("conversation_id", conversationId);

      // Delete conversation
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to delete conversation:", error);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  }, [user]);

  // Load on auth change
  useEffect(() => {
    loadFromDatabase();
  }, [user, loadFromDatabase]);

  // Save active conversation ID to localStorage
  useEffect(() => {
    if (state.activeConversationId) {
      localStorage.setItem(ACTIVE_CONV_KEY, state.activeConversationId);
    }
  }, [state.activeConversationId]);

  // Auto-save active conversation (debounced)
  useEffect(() => {
    if (isInitialLoad.current || !user) return;

    const activeConv = state.conversations.find(c => c.id === state.activeConversationId);
    if (!activeConv) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save
    saveTimeoutRef.current = setTimeout(() => {
      saveConversationToDb(activeConv);
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state.conversations, state.activeConversationId, user, saveConversationToDb]);

  // Get active conversation
  const activeConversation = state.conversations.find(c => c.id === state.activeConversationId) || null;
  const messages = activeConversation?.messages || [];
  const conversationTitle = activeConversation?.title || "";

  // Create new conversation
  const createConversation = useCallback(() => {
    const newConv: Conversation = {
      id: crypto.randomUUID(),
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

    // Save immediately
    if (user) {
      saveConversationToDb(newConv);
    }
    
    return newConv;
  }, [state.selectedModel.id, user, saveConversationToDb]);

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
      
      return {
        ...prev,
        conversations: filtered,
        activeConversationId: newActiveId,
      };
    });

    // Delete from DB
    deleteFromDb(id);
  }, [deleteFromDb]);

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

  const refreshFromDatabase = useCallback(async () => {
    isInitialLoad.current = true;
    await loadFromDatabase();
  }, [loadFromDatabase]);

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
      refreshFromDatabase,
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
