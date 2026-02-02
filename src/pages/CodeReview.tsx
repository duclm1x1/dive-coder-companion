import { useState } from "react";
import { FileCode, Play, CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ReviewIssue {
  id: string;
  type: "error" | "warning" | "info";
  message: string;
  file: string;
  line: number;
  suggestion?: string;
}

const mockIssues: ReviewIssue[] = [
  {
    id: "1",
    type: "warning",
    message: "Unused variable 'tempData'",
    file: "src/utils/helpers.ts",
    line: 42,
    suggestion: "Remove the unused variable or use it in your code",
  },
  {
    id: "2",
    type: "warning",
    message: "Consider using 'const' instead of 'let'",
    file: "src/components/Dashboard.tsx",
    line: 89,
    suggestion: "const config = {...}",
  },
  {
    id: "3",
    type: "info",
    message: "Magic number detected - consider extracting to constant",
    file: "src/api/client.ts",
    line: 156,
    suggestion: "const TIMEOUT_MS = 5000;",
  },
  {
    id: "4",
    type: "error",
    message: "Potential null reference - add null check",
    file: "src/hooks/useAuth.ts",
    line: 23,
    suggestion: "if (user?.id) { ... }",
  },
];

export default function CodeReview() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [reviewComplete, setReviewComplete] = useState(false);

  const runReview = () => {
    setIsRunning(true);
    setProgress(0);
    setReviewComplete(false);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          setReviewComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const issueConfig = {
    error: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Error" },
    warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning-background", label: "Warning" },
    info: { icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10", label: "Info" },
  };

  const stats = {
    errors: mockIssues.filter((i) => i.type === "error").length,
    warnings: mockIssues.filter((i) => i.type === "warning").length,
    info: mockIssues.filter((i) => i.type === "info").length,
    score: 92,
  };

  return (
    <div className="p-6 space-y-6 bg-background-secondary min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Code Review</h1>
            <p className="text-xs text-muted-foreground">Vibe Coder Analysis • V19.5</p>
          </div>
        </div>
        <Button
          onClick={runReview}
          disabled={isRunning}
          className="bg-primary hover:bg-primary/90"
        >
          <Play className="w-4 h-4 mr-2" />
          {isRunning ? "Running..." : "Run Review"}
        </Button>
      </div>

      {/* Progress */}
      {isRunning && (
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-foreground">Analyzing codebase...</span>
            <span className="text-sm text-primary font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 [&>div]:bg-primary" />
          <div className="mt-3 text-xs text-muted-foreground space-y-1 font-mono">
            {progress >= 20 && <p>✓ Scanning 156 files...</p>}
            {progress >= 40 && <p>✓ Running 47 quality checks...</p>}
            {progress >= 60 && <p>✓ Analyzing code patterns...</p>}
            {progress >= 80 && <p>✓ Generating recommendations...</p>}
            {progress >= 100 && <p className="text-success">✓ Review complete!</p>}
          </div>
        </div>
      )}

      {/* Results */}
      {reviewComplete && (
        <>
          {/* Score Card */}
          <div className="p-6 rounded-xl bg-card border border-primary/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-foreground">Code Health Score</h2>
                <p className="text-sm text-muted-foreground mt-1">Based on 47 quality checks</p>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-primary">{stats.score}</p>
                <p className="text-sm text-muted-foreground">/100</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="p-3 rounded-lg bg-destructive/10 text-center">
                <p className="text-2xl font-bold text-destructive">{stats.errors}</p>
                <p className="text-xs text-muted-foreground">Errors</p>
              </div>
              <div className="p-3 rounded-lg bg-warning-background text-center">
                <p className="text-2xl font-bold text-warning">{stats.warnings}</p>
                <p className="text-xs text-muted-foreground">Warnings</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 text-center">
                <p className="text-2xl font-bold text-primary">{stats.info}</p>
                <p className="text-xs text-muted-foreground">Info</p>
              </div>
            </div>
          </div>

          {/* Issues List */}
          <div className="p-5 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">Issues Found</h3>
              <Button variant="outline" size="sm" className="border-border text-xs">
                Auto-fix All
              </Button>
            </div>
            <div className="space-y-2">
              {mockIssues.map((issue) => {
                const config = issueConfig[issue.type];
                const Icon = config.icon;
                const isExpanded = expandedIssue === issue.id;

                return (
                  <div
                    key={issue.id}
                    className="rounded-lg border border-border overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <div className={cn("p-1.5 rounded", config.bg)}>
                        <Icon className={cn("w-3.5 h-3.5", config.color)} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm text-foreground">{issue.message}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {issue.file}:{issue.line}
                        </p>
                      </div>
                      <span className={cn("px-2 py-0.5 rounded text-xs font-medium", config.bg, config.color)}>
                        {config.label}
                      </span>
                    </button>
                    {isExpanded && issue.suggestion && (
                      <div className="px-4 pb-3 pl-12 border-t border-border bg-muted/30">
                        <p className="text-xs text-muted-foreground mt-3 mb-2">Suggestion:</p>
                        <code className="block p-2 rounded bg-muted text-xs text-primary font-mono">
                          {issue.suggestion}
                        </code>
                        <Button size="sm" variant="outline" className="mt-3 text-xs border-border">
                          Apply Fix
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!isRunning && !reviewComplete && (
        <div className="text-center py-16">
          <FileCode className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-lg font-medium mb-2 text-foreground">Ready to Review</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Click "Run Review" to analyze your codebase with the Vibe Coder engine.
            The review will check for code quality, security issues, and best practices.
          </p>
        </div>
      )}
    </div>
  );
}
