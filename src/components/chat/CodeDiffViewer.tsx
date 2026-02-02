import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Minus, FileCode, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface DiffLine {
  type: "add" | "remove" | "context";
  content: string;
  lineNumber?: number;
  oldLineNumber?: number;
  newLineNumber?: number;
}

interface DiffHunk {
  header: string;
  lines: DiffLine[];
}

interface CodeDiffViewerProps {
  fileName: string;
  language?: string;
  hunks: DiffHunk[];
  additions?: number;
  deletions?: number;
  className?: string;
}

export function CodeDiffViewer({
  fileName,
  language = "typescript",
  hunks,
  additions = 0,
  deletions = 0,
  className,
}: CodeDiffViewerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const copyDiff = () => {
    const diffText = hunks
      .map(hunk => 
        `${hunk.header}\n${hunk.lines.map(l => {
          const prefix = l.type === "add" ? "+" : l.type === "remove" ? "-" : " ";
          return `${prefix}${l.content}`;
        }).join("\n")}`
      )
      .join("\n\n");
    
    navigator.clipboard.writeText(diffText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("rounded-lg border border-border bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 hover:text-primary transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <FileCode className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{fileName}</span>
          <span className="text-xs text-muted-foreground">({language})</span>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-emerald-500">
              <Plus className="w-3 h-3" />
              {additions}
            </span>
            <span className="flex items-center gap-1 text-red-500">
              <Minus className="w-3 h-3" />
              {deletions}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={copyDiff}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Diff Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="overflow-x-auto">
              {hunks.map((hunk, hunkIdx) => (
                <div key={hunkIdx}>
                  {/* Hunk header */}
                  <div className="px-3 py-1 bg-primary/5 text-xs text-primary font-mono border-y border-border">
                    {hunk.header}
                  </div>
                  
                  {/* Lines */}
                  <div className="font-mono text-xs">
                    {hunk.lines.map((line, lineIdx) => (
                      <div
                        key={lineIdx}
                        className={cn(
                          "flex",
                          line.type === "add" && "bg-emerald-500/10",
                          line.type === "remove" && "bg-red-500/10"
                        )}
                      >
                        {/* Line numbers */}
                        <div className="flex-shrink-0 w-20 flex text-muted-foreground/50 select-none border-r border-border">
                          <span className="w-10 px-2 py-0.5 text-right">
                            {line.type !== "add" && line.oldLineNumber}
                          </span>
                          <span className="w-10 px-2 py-0.5 text-right">
                            {line.type !== "remove" && line.newLineNumber}
                          </span>
                        </div>
                        
                        {/* Change indicator */}
                        <div className={cn(
                          "w-6 flex-shrink-0 flex items-center justify-center",
                          line.type === "add" && "text-emerald-500",
                          line.type === "remove" && "text-red-500"
                        )}>
                          {line.type === "add" && <Plus className="w-3 h-3" />}
                          {line.type === "remove" && <Minus className="w-3 h-3" />}
                        </div>
                        
                        {/* Code */}
                        <pre className={cn(
                          "flex-1 px-2 py-0.5 whitespace-pre overflow-x-auto",
                          line.type === "add" && "text-emerald-700 dark:text-emerald-300",
                          line.type === "remove" && "text-red-700 dark:text-red-300"
                        )}>
                          {line.content}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper to parse unified diff format
export function parseDiff(diffText: string): { fileName: string; hunks: DiffHunk[]; additions: number; deletions: number } {
  const lines = diffText.split("\n");
  const hunks: DiffHunk[] = [];
  let currentHunk: DiffHunk | null = null;
  let fileName = "file";
  let additions = 0;
  let deletions = 0;
  let oldLine = 0;
  let newLine = 0;

  for (const line of lines) {
    if (line.startsWith("---")) {
      fileName = line.replace("--- a/", "").replace("--- ", "");
    } else if (line.startsWith("+++")) {
      fileName = line.replace("+++ b/", "").replace("+++ ", "");
    } else if (line.startsWith("@@")) {
      const match = line.match(/@@ -(\d+),?\d* \+(\d+),?\d* @@/);
      if (match) {
        oldLine = parseInt(match[1], 10);
        newLine = parseInt(match[2], 10);
      }
      currentHunk = { header: line, lines: [] };
      hunks.push(currentHunk);
    } else if (currentHunk) {
      if (line.startsWith("+") && !line.startsWith("+++")) {
        currentHunk.lines.push({
          type: "add",
          content: line.slice(1),
          newLineNumber: newLine++,
        });
        additions++;
      } else if (line.startsWith("-") && !line.startsWith("---")) {
        currentHunk.lines.push({
          type: "remove",
          content: line.slice(1),
          oldLineNumber: oldLine++,
        });
        deletions++;
      } else if (line.startsWith(" ") || line === "") {
        currentHunk.lines.push({
          type: "context",
          content: line.slice(1) || "",
          oldLineNumber: oldLine++,
          newLineNumber: newLine++,
        });
      }
    }
  }

  return { fileName, hunks, additions, deletions };
}
