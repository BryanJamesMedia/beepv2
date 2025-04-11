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
          // Initialize Ably with autoConnect option
          ablyInstance = new Ably.Realtime({
            key: import.meta.env.VITE_ABLY_API_KEY,
            clientId: session.user.id,
            autoConnect: true
          });

          // Wait for the Ably connection to be established
          await new Promise<void>((resolve, reject) => {
            ablyInstance?.connection.once('connected', () => {
              console.log('Ably connection established');
              resolve();
            });
            
            ablyInstance?.connection.once('failed', (err) => {
              reject(new Error(`Ably connection failed: ${err}`));
            });
            
            // If already connected, resolve immediately
            if (ablyInstance?.connection.state === 'connected') {
              resolve();
            }
            
            // Set a timeout to avoid waiting forever
            const timeout = setTimeout(() => {
              reject(new Error('Ably connection timeout'));
            }, 10000);
            
            return () => clearTimeout(timeout);
          });

          // Initialize Chat Client after connection is established
          try {
            // @ts-ignore - Workaround for ChatClient type issues
            chatInstance = new ChatClient(ablyInstance);
            setChatClient(chatInstance);
            setIsConnected(true);
            console.log('Ably Chat client initialized successfully');
          } catch (err) {
            console.error('Error initializing chat client:', err);
            throw err;
          }
        }
      } catch (error) {
        console.error('Error connecting to Ably:', error);
        setIsConnected(false);
      }
    };

    setupAbly();

    return () => {
      // Cleanup
      if (chatInstance) {
        try {
          // Only call destroy if it exists
          if (typeof chatInstance.destroy === 'function') {
            chatInstance.destroy();
          }
        } catch (err) {
          console.error('Error destroying chat instance:', err);
        }
      }
      
      if (ablyInstance) {
        try {
          ablyInstance.close();
        } catch (err) {
          console.error('Error closing Ably instance:', err);
        }
      }
    };
  }, []);

  return (
    <AblyContext.Provider value={{ chatClient, isConnected }}>
      {children}
    </AblyContext.Provider>
  );
} 