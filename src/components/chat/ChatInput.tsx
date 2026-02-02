import { useState, useRef, KeyboardEvent } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = "Type your message..." }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "min-h-[52px] max-h-[200px] resize-none pr-12",
                "bg-background-secondary border-border focus:border-primary",
                "placeholder:text-muted-foreground"
              )}
              rows={1}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 bottom-2 w-8 h-8 text-muted-foreground hover:text-primary"
              disabled
            >
              <Paperclip className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className="h-[52px] px-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-center text-2xs text-muted-foreground mt-2">
          Dive Coder V19.5 • Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
