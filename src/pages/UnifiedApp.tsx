import { useState, useCallback } from "react";
import { UnifiedHeader } from "@/components/unified/UnifiedHeader";
import { MainTabs, MainTabId } from "@/components/unified/MainTabs";
import { DashboardView } from "@/components/unified/DashboardView";
import { ActivityView } from "@/components/unified/ActivityView";
import { SettingsView } from "@/components/unified/SettingsView";
import { ChatProvider } from "@/contexts/ChatContext";

export interface SharedStats {
  totalRuns: number;
  successRate: number;
  completedRuns: number;
  totalCost: number;
  apiCalls: number;
  activeProvider: string;
}

export interface SharedPerformance {
  totalTime: number;
  toolExecution: number;
  llmProcessing: number;
  characters: number;
  maxCharacters: number;
  inputTokens: number;
  outputTokens: number;
  p50Latency: number;
  p95Latency: number;
}

function UnifiedAppContent() {
  const [activeTab, setActiveTab] = useState<MainTabId>("activity");
  const [isConnected, setIsConnected] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  // Shared stats synced from ActivityView
  const [sharedStats, setSharedStats] = useState<SharedStats>({
    totalRuns: 0,
    successRate: 100,
    completedRuns: 0,
    totalCost: 0,
    apiCalls: 0,
    activeProvider: "Gemini 3 Flash",
  });

  // Shared performance synced from ActivityView
  const [sharedPerformance, setSharedPerformance] = useState<SharedPerformance>({
    totalTime: 0,
    toolExecution: 0,
    llmProcessing: 0,
    characters: 0,
    maxCharacters: 128000,
    inputTokens: 0,
    outputTokens: 0,
    p50Latency: 0,
    p95Latency: 0,
  });

  // Callback to update stats from ActivityView
  const handleStatsUpdate = useCallback((newStats: Partial<SharedStats>) => {
    setSharedStats(prev => ({ ...prev, ...newStats }));
    setIsConnected(true);
  }, []);

  // Callback to update performance from ActivityView
  const handlePerformanceUpdate = useCallback((newPerf: Partial<SharedPerformance>) => {
    setSharedPerformance(prev => ({ ...prev, ...newPerf }));
  }, []);

  const handleToggleRun = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      setIsConnected(true);
    }
  };

  const handleRefresh = () => {
    console.log("Refreshing...");
  };

  const handleExport = () => {
    console.log("Exporting...");
  };

  const handleSendCommand = (command: string) => {
    // Increment API calls when command is sent
    setSharedStats(prev => ({
      ...prev,
      totalRuns: prev.totalRuns + 1,
      apiCalls: prev.apiCalls + 1,
    }));
    console.log("Command:", command);
  };

  return (
    <div className="flex flex-col h-screen bg-background-secondary">
      <UnifiedHeader
        isConnected={isConnected}
        isRunning={isRunning}
        onToggleRun={handleToggleRun}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />
      <MainTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-hidden">
        {activeTab === "dashboard" && (
          <DashboardView isConnected={isConnected} stats={sharedStats} />
        )}
        {activeTab === "activity" && (
          <ActivityView
            performance={sharedPerformance}
            onSendCommand={handleSendCommand}
            onStatsUpdate={handleStatsUpdate}
            onPerformanceUpdate={handlePerformanceUpdate}
          />
        )}
        {activeTab === "settings" && <SettingsView />}
      </main>
    </div>
  );
}

export default function UnifiedApp() {
  return (
    <ChatProvider>
      <UnifiedAppContent />
    </ChatProvider>
  );
}
