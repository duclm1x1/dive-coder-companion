import { useState } from "react";
import { 
  Plus, MessageSquare, Trash2, Edit2, Check, X, Search, 
  ChevronLeft, ChevronRight, Clock, MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChatContext, Conversation } from "@/contexts/ChatContext";
import { formatDistanceToNow } from "date-fns";

interface ChatHistorySidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function ChatHistorySidebar({ collapsed = false, onToggle }: ChatHistorySidebarProps) {
  const { 
    state, 
    activeConversation, 
    createConversation, 
    selectConversation, 
    deleteConversation,
    renameConversation 
  } = useChatContext();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const filteredConversations = state.conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group conversations by date
  const groupedConversations = filteredConversations.reduce((groups, conv) => {
    const now = new Date();
    const convDate = new Date(conv.updatedAt);
    const diffDays = Math.floor((now.getTime() - convDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let group: string;
    if (diffDays === 0) {
      group = "Today";
    } else if (diffDays === 1) {
      group = "Yesterday";
    } else if (diffDays <= 7) {
      group = "Previous 7 Days";
    } else if (diffDays <= 30) {
      group = "Previous 30 Days";
    } else {
      group = "Older";
    }
    
    if (!groups[group]) groups[group] = [];
    groups[group].push(conv);
    return groups;
  }, {} as Record<string, Conversation[]>);

  const groupOrder = ["Today", "Yesterday", "Previous 7 Days", "Previous 30 Days", "Older"];

  const handleStartEdit = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      renameConversation(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this conversation?")) {
      deleteConversation(id);
    }
  };

  if (collapsed) {
    return (
      <div className="w-12 border-r border-border bg-card flex flex-col items-center py-3 gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => createConversation()}
          className="h-8 w-8"
        >
          <Plus className="w-4 h-4" />
        </Button>
        <div className="flex-1" />
        <div className="text-[10px] text-muted-foreground -rotate-90 whitespace-nowrap">
          {state.conversations.length} chats
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Chat History</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => createConversation()}
            className="h-7 w-7"
            title="New Chat"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-7 w-7"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="pl-8 h-8 text-sm bg-muted/50"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {state.conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => createConversation()}
                className="mt-3 gap-2"
              >
                <Plus className="w-4 h-4" />
                Start New Chat
              </Button>
            </div>
          ) : (
            groupOrder.map(group => {
              const convs = groupedConversations[group];
              if (!convs?.length) return null;
              
              return (
                <div key={group}>
                  <div className="flex items-center gap-2 px-2 py-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      {group}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {convs.map(conv => (
                      <div
                        key={conv.id}
                        className={cn(
                          "group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors",
                          activeConversation?.id === conv.id
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => selectConversation(conv.id)}
                      >
                        <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-60" />
                        
                        <div className="flex-1 min-w-0">
                          {editingId === conv.id ? (
                            <div className="flex items-center gap-1">
                              <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveEdit();
                                  if (e.key === "Escape") handleCancelEdit();
                                }}
                                className="h-6 text-xs"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveEdit();
                                }}
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEdit();
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm truncate">{conv.title}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {conv.messages.length} messages • {formatDistanceToNow(conv.updatedAt, { addSuffix: true })}
                              </p>
                            </>
                          )}
                        </div>

                        {editingId !== conv.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(conv);
                              }}>
                                <Edit2 className="w-3 h-3 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(conv.id);
                                }}
                              >
                                <Trash2 className="w-3 h-3 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t border-border text-center">
        <p className="text-[10px] text-muted-foreground">
          {state.conversations.length} conversation{state.conversations.length !== 1 ? 's' : ''} saved locally
        </p>
      </div>
    </div>
  );
}
