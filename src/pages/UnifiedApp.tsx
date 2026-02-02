import { useState } from "react";
import { UnifiedHeader } from "@/components/unified/UnifiedHeader";
import { MainTabs, MainTabId } from "@/components/unified/MainTabs";
import { DashboardView } from "@/components/unified/DashboardView";
import { ActivityView } from "@/components/unified/ActivityView";
import { SettingsView } from "@/components/unified/SettingsView";

export default function UnifiedApp() {
  const [activeTab, setActiveTab] = useState<MainTabId>("dashboard");
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Mock stats
  const stats = {
    totalRuns: 0,
    successRate: 0,
    completedRuns: 0,
    totalCost: 0,
    apiCalls: 0,
    activeProvider: isConnected ? "OpenAI" : "",
  };

  // Mock performance
  const performance = {
    totalTime: 0,
    toolExecution: 0,
    llmProcessing: 0,
    characters: 0,
    maxCharacters: 128000,
    inputTokens: 0,
    outputTokens: 0,
    p50Latency: 0,
    p95Latency: 0,
  };

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
          <DashboardView isConnected={isConnected} stats={stats} />
        )}
        {activeTab === "activity" && (
          <ActivityView
            performance={performance}
            onSendCommand={handleSendCommand}
          />
        )}
        {activeTab === "settings" && <SettingsView />}
      </main>
    </div>
  );
}
