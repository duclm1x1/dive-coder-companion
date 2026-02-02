import { useState } from "react";
import { ChevronDown, ChevronRight, FileText, Database, ExternalLink, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface RetrievedDocument {
  id: string;
  title: string;
  source: string;
  relevanceScore: number;
  excerpt: string;
  url?: string;
  type: "code" | "doc" | "wiki" | "api";
}

interface RAGContextPanelProps {
  documents: RetrievedDocument[];
  isRetrieving?: boolean;
  totalTokens?: number;
  className?: string;
}

export function RAGContextPanel({
  documents,
  isRetrieving = false,
  totalTokens,
  className,
}: RAGContextPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());

  if (!isRetrieving && documents.length === 0) {
    return null;
  }

  const toggleDoc = (id: string) => {
    setExpandedDocs(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getTypeIcon = (type: RetrievedDocument["type"]) => {
    switch (type) {
      case "code": return <FileText className="w-3.5 h-3.5" />;
      case "doc": return <FileText className="w-3.5 h-3.5" />;
      case "wiki": return <Database className="w-3.5 h-3.5" />;
      case "api": return <Sparkles className="w-3.5 h-3.5" />;
      default: return <FileText className="w-3.5 h-3.5" />;
    }
  };

  const getTypeColor = (type: RetrievedDocument["type"]) => {
    switch (type) {
      case "code": return "text-blue-500 bg-blue-500/10";
      case "doc": return "text-emerald-500 bg-emerald-500/10";
      case "wiki": return "text-purple-500 bg-purple-500/10";
      case "api": return "text-amber-500 bg-amber-500/10";
      default: return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className={cn("rounded-lg border border-cyan-500/30 bg-cyan-500/5 overflow-hidden", className)}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-cyan-500/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-500" />
          <span className="text-sm font-medium text-cyan-500">
            RAG Context
          </span>
          <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-500">
            {documents.length} docs
          </Badge>
          {totalTokens && (
            <span className="text-xs text-cyan-500/70">
              ~{totalTokens.toLocaleString()} tokens
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-cyan-500/70" />
        ) : (
          <ChevronRight className="w-4 h-4 text-cyan-500/70" />
        )}
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              {isRetrieving && (
                <div className="flex items-center gap-2 text-xs text-cyan-500">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span>Retrieving relevant documents...</span>
                </div>
              )}

              {documents.map(doc => (
                <div
                  key={doc.id}
                  className="rounded-lg border border-border bg-background/50 overflow-hidden"
                >
                  <button
                    onClick={() => toggleDoc(doc.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <span className={cn("p-1.5 rounded", getTypeColor(doc.type))}>
                      {getTypeIcon(doc.type)}
                    </span>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{doc.source}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-16">
                        <Progress 
                          value={doc.relevanceScore * 100} 
                          className="h-1.5"
                        />
                      </div>
                      <span className="text-xs font-medium text-cyan-500 w-10 text-right">
                        {Math.round(doc.relevanceScore * 100)}%
                      </span>
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 hover:bg-muted rounded"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                        </a>
                      )}
                      {expandedDocs.has(doc.id) ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {expandedDocs.has(doc.id) && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 pt-1">
                          <p className="text-xs text-muted-foreground leading-relaxed bg-muted/50 rounded p-2">
                            {doc.excerpt}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
