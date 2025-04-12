import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useWeavy } from '@weavy/uikit-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface WeavyContextType {
  weavyClient: any;
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
}

const WeavyContext = createContext<WeavyContextType | undefined>(undefined);

export function WeavyProvider({ children }: { children: ReactNode }) {
  const WEAVY_URL = import.meta.env.VITE_WEAVY_URL;
  const supabaseClient = useSupabaseClient();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const weavyConfig = {
    url: WEAVY_URL,
    tokenFactory: async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (!session) {
          throw new Error('No active session');
        }

        const response = await fetch('https://nmeducgrjydnzlqkyxtf.supabase.co/functions/v1/weavy-token', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch Weavy token');
        }

        const { token } = await response.json();
        return token;
      } catch (error) {
        console.error('Error generating Weavy token:', error);
        setError(error as Error);
        throw error;
      }
    }
  };

  const weavyResult = useWeavy(weavyConfig);

  useEffect(() => {
    if (weavyResult) {
      setIsLoading(false);
    }
  }, [weavyResult]);

  if (!weavyResult) {
    return (
      <WeavyContext.Provider value={{ 
        weavyClient: null, 
        isConnected: false, 
        isLoading: true,
        error 
      }}>
        {children}
      </WeavyContext.Provider>
    );
  }

  const { weavy, isConnected } = weavyResult;

  return (
    <WeavyContext.Provider value={{ 
      weavyClient: weavy, 
      isConnected, 
      isLoading,
      error 
    }}>
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