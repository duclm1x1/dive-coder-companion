import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  file: File;
}

interface Message {
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

interface AIModel {
  id: string;
  name: string;
  provider: string;
  badge?: string;
  color: string;
}

interface ChatState {
  messages: Message[];
  conversationTitle: string;
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
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setConversationTitle: (title: string) => void;
  setSessionCost: (cost: number | ((prev: number) => number)) => void;
  setLatencyHistory: (history: number[] | ((prev: number[]) => number[])) => void;
  setSelectedModel: (model: AIModel) => void;
  setLocalPerformance: (perf: Partial<ChatState["localPerformance"]> | ((prev: ChatState["localPerformance"]) => ChatState["localPerformance"])) => void;
  clearChat: () => void;
}

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
  messages: [],
  conversationTitle: "",
  sessionCost: 0,
  latencyHistory: [],
  selectedModel: defaultModel,
  localPerformance: defaultPerformance,
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ChatState>(defaultState);

  const setMessages = useCallback((messages: Message[] | ((prev: Message[]) => Message[])) => {
    setState(prev => ({
      ...prev,
      messages: typeof messages === "function" ? messages(prev.messages) : messages,
    }));
  }, []);

  const setConversationTitle = useCallback((title: string) => {
    setState(prev => ({ ...prev, conversationTitle: title }));
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
    setState(defaultState);
  }, []);

  return (
    <ChatContext.Provider value={{
      state,
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
