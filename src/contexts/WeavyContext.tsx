import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWeavy, WyChat } from '@weavy/uikit-react';
import { supabase } from '../config/supabase';

interface WeavyContextType {
  weavyClient: any | null;
  isConnected: boolean;
}

const WeavyContext = createContext<WeavyContextType>({
  weavyClient: null,
  isConnected: false,
});

export const useWeavyChat = () => useContext(WeavyContext);

export function WeavyProvider({ children }: { children: React.ReactNode }) {
  const [weavyClient, setWeavyClient] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const setupWeavy = async () => {
      try {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('Setting up Weavy with user ID:', session.user.id);
          
          // Initialize Weavy client
          const client = useWeavy({
            url: import.meta.env.VITE_WEAVY_URL,
            tokenFactory: async () => {
              // Get a fresh token from your backend
              const { data: { token }, error } = await supabase.functions.invoke('weavy-token', {
                body: { userId: session.user.id }
              });
              
              if (error) throw error;
              return token;
            }
          });

          setWeavyClient(client);
          setIsConnected(true);
        } else {
          console.error('No user session found');
          setConnectionError('No user session found. Please log in again.');
        }
      } catch (error) {
        console.error('Error connecting to Weavy:', error);
        setIsConnected(false);
        setConnectionError(error instanceof Error ? error.message : 'Unknown connection error');
      }
    };

    setupWeavy();
  }, []);

  return (
    <WeavyContext.Provider value={{ weavyClient, isConnected }}>
      {children}
    </WeavyContext.Provider>
  );
} 