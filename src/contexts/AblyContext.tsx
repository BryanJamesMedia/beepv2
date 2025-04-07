import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Ably from 'ably';
import { ChatClient } from '@ably/chat';
import { supabase } from '../config/supabase';

interface AblyContextType {
  chatClient: ChatClient | null;
  isConnected: boolean;
}

const AblyContext = createContext<AblyContextType>({
  chatClient: null,
  isConnected: false,
});

export const useAbly = () => useContext(AblyContext);

export function AblyProvider({ children }: { children: React.ReactNode }) {
  const [chatClient, setChatClient] = useState<ChatClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let ablyInstance: Ably.Realtime | null = null;
    let chatInstance: ChatClient | null = null;

    const setupAbly = async () => {
      try {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Initialize Ably
          ablyInstance = new Ably.Realtime({
            key: import.meta.env.VITE_ABLY_API_KEY,
            clientId: session.user.id
          });

          // Initialize Chat Client
          chatInstance = new ChatClient(ablyInstance);
          
          // Connect to Ably
          await chatInstance.connect();
          
          setChatClient(chatInstance);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error connecting to Ably:', error);
      }
    };

    setupAbly();

    return () => {
      // Cleanup
      if (ablyInstance) {
        ablyInstance.close();
      }
      if (chatInstance) {
        chatInstance.destroy();
      }
    };
  }, []);

  return (
    <AblyContext.Provider value={{ chatClient, isConnected }}>
      {children}
    </AblyContext.Provider>
  );
} 