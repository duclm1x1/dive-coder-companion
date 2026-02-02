import { useState, useRef, useCallback, useEffect } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DEFAULT_CHAT_SETTINGS, type ChatSettings } from "@/lib/dive-coder-config";
import { AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  thinking?: string;
  thinkingDuration?: number;
}

interface Conversation {
  id: string;
  title: string;
  model: string;
  updated_at: string;
  messages: Message[];
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [settings] = useState<ChatSettings>(DEFAULT_CHAT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (pendingPrompt && activeConversationId) {
      sendMessage(pendingPrompt);
      setPendingPrompt(null);
    }
  }, [pendingPrompt, activeConversationId]);

  const createNewChat = () => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: "New Chat",
      model: settings.model,
      updated_at: new Date().toISOString(),
      messages: [],
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  };

  const updateConversationTitle = (conversationId: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
    setConversations(prev =>
      prev.map(c => c.id === conversationId ? { ...c, title } : c)
    );
  };

  const sendMessage = async (content: string) => {
    if (!activeConversationId) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };

    // Add user message
    setConversations(prev =>
      prev.map(c =>
        c.id === activeConversationId
          ? { ...c, messages: [...c.messages, userMessage], updated_at: new Date().toISOString() }
          : c
      )
    );
    setIsLoading(true);

    // Update title if first message
    if (messages.length === 0) {
      updateConversationTitle(activeConversationId, content);
    }

    // Simulate AI response (mock for now)
    const thinkingStartTime = Date.now();
    setIsThinking(true);
    setIsStreaming(true);

    // Simulate thinking
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const thinkingDuration = Date.now() - thinkingStartTime;
    setIsThinking(false);

    // Simulate streaming response
    const responses = [
      "I've analyzed your request. Here's what I found:\n\n**Analysis:**\n- Your code structure looks solid\n- Consider adding error handling\n- Performance could be improved with memoization\n\n```typescript\nconst optimizedCode = useMemo(() => {\n  return processData(data);\n}, [data]);\n```\n\nWould you like me to elaborate on any of these points?",
      "Great question! Let me break this down:\n\n1. **First**, we need to understand the problem\n2. **Then**, we can design a solution\n3. **Finally**, implement and test\n\nHere's a sample implementation:\n\n```typescript\nfunction solve(input: string[]): Result {\n  return input\n    .filter(item => item.length > 0)\n    .map(item => transform(item));\n}\n```",
      "I've completed the code review. Here are my findings:\n\n✅ **Strengths:**\n- Clean code structure\n- Good naming conventions\n- Proper TypeScript types\n\n⚠️ **Suggestions:**\n- Add unit tests\n- Consider edge cases\n- Document complex functions\n\nOverall score: **92/100**"
    ];

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: responses[Math.floor(Math.random() * responses.length)],
      thinking: "Analyzing the request... Processing context... Generating response...",
      thinkingDuration,
    };

    // Simulate streaming delay
    await new Promise(resolve => setTimeout(resolve, 500));

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConversationId
          ? { ...c, messages: [...c.messages, assistantMessage] }
          : c
      )
    );

    setIsStreaming(false);
    setIsLoading(false);
  };

  const handlePromptClick = (prompt: string) => {
    setPendingPrompt(prompt);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
        onNewChat={createNewChat}
        onDelete={deleteConversation}
        onSettingsClick={() => setShowSettings(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!activeConversationId ? (
          <WelcomeScreen onNewChat={createNewChat} onPromptClick={handlePromptClick} />
        ) : (
          <>
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    thinking={message.thinking}
                    thinkingDuration={message.thinkingDuration}
                    showThinking={settings.showThinking}
                  />
                ))}
                <AnimatePresence>
                  {isLoading && <TypingIndicator />}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <ChatInput
              onSend={sendMessage}
              disabled={isLoading}
              placeholder="Ask Dive Coder anything..."
            />
          </>
        )}
      </div>
    </div>
  );
}
