import { useEffect, Component, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import UnifiedApp from "./pages/UnifiedApp";
import Auth from "./pages/Auth";
import { toast } from "sonner";

const queryClient = new QueryClient();

// Error Boundary to catch rendering errors
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("React Error Boundary caught:", error, errorInfo);
  }

  handleReset = () => {
    // Clear potentially corrupted localStorage data
    localStorage.removeItem("dive-coder-metrics-history");
    localStorage.removeItem("dive-coder-activity-log");
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8">
          <div className="max-w-md text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            >
              Clear Cache & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Global unhandled rejection handler
function GlobalErrorHandler({ children }: { children: ReactNode }) {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled rejection:", event.reason);
      toast.error("An error occurred. Please try again.");
      event.preventDefault();
    };

    window.addEventListener("unhandledrejection", handleRejection);
    return () => window.removeEventListener("unhandledrejection", handleRejection);
  }, []);

  return <>{children}</>;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <GlobalErrorHandler>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/*" element={<UnifiedApp />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </GlobalErrorHandler>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
