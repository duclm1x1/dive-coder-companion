import { useState, useEffect, useCallback } from "react";

export interface AIModel {
  id: string;
  name: string;
  context_length?: number;
  pricing?: {
    input: number;
    output: number;
  };
}

export interface APIProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  models: AIModel[];
  status: "connected" | "disconnected" | "testing" | "error";
  latency?: number;
  lastChecked?: string;
  isDefault?: boolean;
  error?: string;
}

const DEFAULT_PROVIDERS: APIProvider[] = [
  {
    id: "v98api",
    name: "V98API",
    baseUrl: "https://v98store.com/v1",
    apiKey: "",
    models: [],
    status: "disconnected",
    isDefault: true,
  },
  {
    id: "aicoding",
    name: "AICoding",
    baseUrl: "https://aicoding.io.vn/v1",
    apiKey: "",
    models: [],
    status: "disconnected",
  },
];

const STORAGE_KEY = "dive-coder-api-providers";

export function useAPIProviders() {
  const [providers, setProviders] = useState<APIProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load providers from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProviders(JSON.parse(saved));
      } catch {
        setProviders(DEFAULT_PROVIDERS);
      }
    } else {
      setProviders(DEFAULT_PROVIDERS);
    }
    setIsLoading(false);
  }, []);

  // Save providers to localStorage
  const saveProviders = useCallback((newProviders: APIProvider[]) => {
    setProviders(newProviders);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProviders));
  }, []);

  // Add new provider
  const addProvider = useCallback((provider: Omit<APIProvider, "id" | "models" | "status">) => {
    const newProvider: APIProvider = {
      ...provider,
      id: `provider-${Date.now()}`,
      models: [],
      status: "disconnected",
    };
    saveProviders([...providers, newProvider]);
    return newProvider;
  }, [providers, saveProviders]);

  // Update provider
  const updateProvider = useCallback((id: string, updates: Partial<APIProvider>) => {
    const updated = providers.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    saveProviders(updated);
  }, [providers, saveProviders]);

  // Delete provider
  const deleteProvider = useCallback((id: string) => {
    const filtered = providers.filter(p => p.id !== id);
    saveProviders(filtered);
  }, [providers, saveProviders]);

  // Set default provider
  const setDefaultProvider = useCallback((id: string) => {
    const updated = providers.map(p => ({
      ...p,
      isDefault: p.id === id,
    }));
    saveProviders(updated);
  }, [providers, saveProviders]);

  // Test connection and fetch models
  const testConnection = useCallback(async (id: string): Promise<{
    success: boolean;
    latency: number;
    models: AIModel[];
    error?: string;
  }> => {
    const provider = providers.find(p => p.id === id);
    if (!provider || !provider.apiKey) {
      return { success: false, latency: 0, models: [], error: "API key required" };
    }

    // Update status to testing
    updateProvider(id, { status: "testing" });

    const startTime = performance.now();
    
    try {
      // Try to fetch models from OpenAI-compatible endpoint
      const response = await fetch(`${provider.baseUrl}/models`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${provider.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      const latency = Math.round(performance.now() - startTime);

      if (!response.ok) {
        const errorText = await response.text();
        updateProvider(id, { 
          status: "error", 
          latency,
          lastChecked: new Date().toISOString(),
          error: `HTTP ${response.status}: ${errorText.slice(0, 100)}`,
        });
        return { success: false, latency, models: [], error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      const models: AIModel[] = (data.data || data.models || []).map((m: any) => ({
        id: m.id || m.name,
        name: m.id || m.name,
        context_length: m.context_length,
        pricing: m.pricing,
      }));

      updateProvider(id, {
        status: "connected",
        latency,
        models,
        lastChecked: new Date().toISOString(),
        error: undefined,
      });

      return { success: true, latency, models };
    } catch (error) {
      const latency = Math.round(performance.now() - startTime);
      const errorMessage = error instanceof Error ? error.message : "Connection failed";
      
      updateProvider(id, {
        status: "error",
        latency,
        lastChecked: new Date().toISOString(),
        error: errorMessage,
      });

      return { success: false, latency, models: [], error: errorMessage };
    }
  }, [providers, updateProvider]);

  // Run speedtest on all providers
  const runSpeedtest = useCallback(async (): Promise<Map<string, number>> => {
    const results = new Map<string, number>();
    
    for (const provider of providers) {
      if (provider.apiKey) {
        const result = await testConnection(provider.id);
        results.set(provider.id, result.latency);
      }
    }

    return results;
  }, [providers, testConnection]);

  // Get fastest available provider
  const getFastestProvider = useCallback((): APIProvider | null => {
    const connected = providers
      .filter(p => p.status === "connected" && p.latency !== undefined)
      .sort((a, b) => (a.latency || 999999) - (b.latency || 999999));
    
    return connected[0] || null;
  }, [providers]);

  // Get default provider
  const getDefaultProvider = useCallback((): APIProvider | null => {
    return providers.find(p => p.isDefault) || providers[0] || null;
  }, [providers]);

  return {
    providers,
    isLoading,
    addProvider,
    updateProvider,
    deleteProvider,
    setDefaultProvider,
    testConnection,
    runSpeedtest,
    getFastestProvider,
    getDefaultProvider,
  };
}
