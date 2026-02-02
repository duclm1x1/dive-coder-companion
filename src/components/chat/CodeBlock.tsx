import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  language?: string;
  children: string;
  className?: string;
}

export function CodeBlock({ language, children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const detectedLanguage = language || "text";

  return (
    <div className={cn("relative group rounded-lg overflow-hidden my-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b border-border">
        <span className="text-xs font-mono text-muted-foreground">{detectedLanguage}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-success" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      
      {/* Code */}
      <SyntaxHighlighter
        language={detectedLanguage}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.8125rem",
          lineHeight: 1.6,
          background: "hsl(var(--muted))",
        }}
        codeTagProps={{
          style: {
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          },
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}
