import { useEffect, useCallback } from "react";
import { TabId } from "@/components/monitor/TabNavigation";

export function useKeyboardShortcuts(onTabChange: (tab: TabId) => void, onPauseToggle: () => void, onRefresh: () => void) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (event.key) {
      case '1':
        onTabChange('dashboard' as TabId);
        break;
      case '2':
        onTabChange('activity' as TabId);
        break;
      case '3':
        onTabChange('events' as TabId);
        break;
      case '4':
        onTabChange('settings' as TabId);
        break;
      case ' ':
        event.preventDefault();
        onPauseToggle();
        break;
      case 'r':
      case 'R':
        if (!event.metaKey && !event.ctrlKey) {
          onRefresh();
        }
        break;
    }
  }, [onTabChange, onPauseToggle, onRefresh]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
