import React, { createContext, useContext, ReactNode } from 'react';
import { useWeavy, WeavyClient } from '@weavy/uikit-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface WeavyContextType {
  weavyClient: WeavyClient;
  isConnected: boolean;
}

const WeavyContext = createContext<WeavyContextType | undefined>(undefined);

export function WeavyProvider({ children }: { children: ReactNode }) {
  const WEAVY_URL = import.meta.env.VITE_WEAVY_URL;
  const supabaseClient = useSupabaseClient();
  
  const { weavy, isConnected } = useWeavy({
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
        throw error;
      }
    }
  });

  return (
    <WeavyContext.Provider value={{ weavyClient: weavy, isConnected }}>
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