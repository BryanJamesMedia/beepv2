import React, { createContext, useContext, ReactNode } from 'react';
import { useWeavy } from '@weavy/uikit-react';

interface WeavyContextType {
  weavyClient: any;
  isConnected: boolean;
}

const WeavyContext = createContext<WeavyContextType | undefined>(undefined);

export function WeavyProvider({ children }: { children: ReactNode }) {
  const WEAVY_URL = import.meta.env.VITE_WEAVY_URL;
  
  const { weavy: weavyClient, isConnected } = useWeavy({
    url: WEAVY_URL,
    tokenFactory: async () => {
      // For now, we'll use a placeholder token
      // In production, you should generate a proper JWT token
      return 'placeholder-token';
    }
  });

  return (
    <WeavyContext.Provider value={{ weavyClient, isConnected }}>
      {children}
    </WeavyContext.Provider>
  );
}

export function useWeavyChat() {
  const context = useContext(WeavyContext);
  if (context === undefined) {
    throw new Error('useWeavyChat must be used within a WeavyProvider');
  }
  return context;
} 