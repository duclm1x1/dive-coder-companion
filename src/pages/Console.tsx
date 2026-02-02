import { useState, useRef, useEffect } from "react";
import { Terminal, Play, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  type: "command" | "output" | "error" | "success" | "info";
  content: string;
  timestamp: Date;
}

const initialLogs: LogEntry[] = [
  { id: "1", type: "info", content: "Dive Coder Console V19.5 initialized", timestamp: new Date() },
  { id: "2", type: "info", content: "Dual Thinking Engine: ACTIVE", timestamp: new Date() },
  { id: "3", type: "info", content: "Type 'help' for available commands", timestamp: new Date() },
];

const commands: Record<string, { output: string; type: "output" | "error" | "success" }> = {
  help: {
    output: `Available commands:
  /vibe-status    - Check system status
  /vibe-review    - Run code review
  /vibe-build     - Build project
  /vibe-autopatch - Auto-fix issues
  /vibe-baseline  - Create baseline
  /vibe-sarif     - Generate SARIF report
  clear           - Clear console
  help            - Show this help`,
    type: "output",
  },
  "/vibe-status": {
    output: `╔══════════════════════════════════════════╗
║      DIVE CODER V19.5 STATUS             ║
╠══════════════════════════════════════════╣
║ Engine:       Dual Thinking (ACTIVE)     ║
║ Mode:         Balanced                   ║
║ Confidence:   92%                        ║
║ Memory:       67% used                   ║
║ Tasks:        247 completed              ║
║ Uptime:       4h 23m                     ║
╚══════════════════════════════════════════╝`,
    type: "success",
  },
  "/vibe-review": {
    output: `[REVIEW] Starting code review...
[SCAN] Analyzing 156 files...
[CHECK] Running 47 quality checks...

Results:
✅ Passed:   44 checks
⚠️ Warnings: 3 items
  - Line 42: Unused variable 'temp'
  - Line 89: Consider using const
  - Line 156: Magic number detected
❌ Errors:   0 items

Overall Score: 92/100
Use /vibe-autopatch to fix warnings automatically.`,
    type: "success",
  },
  "/vibe-build": {
    output: `[BUILD] Starting build process...
[INFO] Compiling TypeScript...
[INFO] Bundling assets...
[INFO] Optimizing output...
[SUCCESS] Build completed in 2.34s

Output: dist/
Size: 1.2MB (gzipped: 384KB)`,
    type: "success",
  },
  "/vibe-autopatch": {
    output: `[PATCH] Analyzing issues...
[FIX] Applying 3 patches...
  ✓ Fixed unused variable on line 42
  ✓ Converted let to const on line 89
  ✓ Extracted magic number to constant on line 156
[SUCCESS] All issues resolved!`,
    type: "success",
  },
};

export default function Console() {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    
    const commandEntry: LogEntry = {
      id: Date.now().toString(),
      type: "command",
      content: `$ ${cmd}`,
      timestamp: new Date(),
    };
    setLogs((prev) => [...prev, commandEntry]);

    if (trimmedCmd === "clear") {
      setLogs(initialLogs);
      return;
    }

    const response = commands[trimmedCmd];
    if (response) {
      const outputEntry: LogEntry = {
        id: (Date.now() + 1).toString(),
        type: response.type,
        content: response.output,
        timestamp: new Date(),
      };
      setTimeout(() => {
        setLogs((prev) => [...prev, outputEntry]);
      }, 300);
    } else {
      const errorEntry: LogEntry = {
        id: (Date.now() + 1).toString(),
        type: "error",
        content: `Command not found: ${cmd}\nType 'help' for available commands.`,
        timestamp: new Date(),
      };
      setTimeout(() => {
        setLogs((prev) => [...prev, errorEntry]);
      }, 100);
    }

    setHistory((prev) => [cmd, ...prev.slice(0, 49)]);
    setHistoryIndex(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    executeCommand(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  const copyLogs = () => {
    const text = logs.map((l) => l.content).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const typeStyles: Record<string, string> = {
    command: "text-primary font-bold",
    output: "text-foreground",
    error: "text-destructive",
    success: "text-success",
    info: "text-muted-foreground italic",
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Dive Console</h1>
            <p className="text-xs text-muted-foreground">Interactive Terminal • V19.5</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={copyLogs}
            className="text-muted-foreground hover:text-primary"
          >
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLogs(initialLogs)}
            className="text-muted-foreground hover:text-primary"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        className="flex-1 p-4 overflow-y-auto scrollbar-thin bg-background-secondary font-mono text-sm cursor-text"
      >
        {logs.map((log) => (
          <div key={log.id} className="mb-1">
            <pre className={cn("whitespace-pre-wrap break-words", typeStyles[log.type])}>
              {log.content}
            </pre>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card">
        <div className="flex items-center gap-2 font-mono">
          <span className="text-primary font-bold">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command..."
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
          <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
            <Play className="w-3 h-3" />
          </Button>
        </div>
      </form>
    </div>
  );
}
