import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useWeavy } from '@weavy/uikit-react';
import { useSupabase } from './SupabaseContext';

interface WeavyContextType {
  weavyClient: any;
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
}

interface CachedToken {
  token: string;
  expiresAt: number;
  userId: string;
}

interface WeavyConfig {
  url: string;
  tokenFactory: () => Promise<string>;
}

interface WeavyInstance {
  weavy: any;
  error?: Error;
}

const TOKEN_CACHE_KEY = 'weavy_token_cache';
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes in milliseconds

const WeavyContext = createContext<WeavyContextType | undefined>(undefined);

function useWeavyContext() {
  const context = useContext(WeavyContext);
  if (!context) {
    throw new Error('useWeavyContext must be used within a WeavyProvider');
  }
  return context;
}

function useWeavyChat() {
  const context = useWeavyContext();
  
  if (!context.weavyClient) {
    throw new Error('Weavy client is not initialized');
  }

  const startChat = async (userId: string) => {
    try {
      if (!context.weavyClient) {
        throw new Error('Weavy client is not initialized');
      }

      // Create or get existing conversation
      const conversation = await context.weavyClient.conversation({
        uid: `chat-${userId}`,
        type: 'messenger'
      });

      return conversation;
    } catch (error) {
      console.error('Error starting chat:', error);
      throw error;
    }
  };

  return {
    startChat,
    isConnected: context.isConnected,
    isLoading: context.isLoading,
    error: context.error
  };
}

function WeavyProvider({ children }: { children: ReactNode }) {
  const WEAVY_URL = import.meta.env.VITE_WEAVY_URL;
  const { supabase } = useSupabase();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Function to get cached token
  const getCachedToken = (userId: string): CachedToken | null => {
    try {
      const cached = localStorage.getItem(TOKEN_CACHE_KEY);
      if (cached) {
        const parsedCache = JSON.parse(cached) as CachedToken;
        if (
          parsedCache.userId === userId &&
          parsedCache.expiresAt > Date.now() + TOKEN_EXPIRY_BUFFER
        ) {
          return parsedCache;
        }
      }
    } catch (error) {
      console.error('Error reading cached token:', error);
    }
    return null;
  };

  // Function to cache token
  const cacheToken = (token: string, userId: string, expiresIn: number) => {
    try {
      const tokenCache: CachedToken = {
        token,
        userId,
        expiresAt: Date.now() + expiresIn * 1000
      };
      localStorage.setItem(TOKEN_CACHE_KEY, JSON.stringify(tokenCache));
    } catch (error) {
      console.error('Error caching token:', error);
    }
  };

  // Function to clear cached token
  const clearCachedToken = () => {
    try {
      localStorage.removeItem(TOKEN_CACHE_KEY);
    } catch (error) {
      console.error('Error clearing token cache:', error);
    }
  };

  const getValidToken = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        clearCachedToken();
        throw new Error('No active session');
      }

      // If not refreshing, try to use cached token
      const cachedToken = getCachedToken(session.user.id);
      if (cachedToken) {
        return cachedToken.token;
      }

      // Get new token from backend
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

      const data = await response.json();
      
      // Cache the new token
      if (data.token && data.expiresIn) {
        cacheToken(data.token, session.user.id, data.expiresIn);
      }

      return data.token;
    } catch (error) {
      console.error('Error generating Weavy token:', error);
      setError(error instanceof Error ? error : new Error('Failed to get token'));
      throw error;
    }
  };

  const tokenFactory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session found');
      }
      return session.access_token;
    } catch (err) {
      const newError = err instanceof Error ? err : new Error('Failed to get token');
      setError(newError);
      return null;
    }
  };

  const weavyConfig = {
    url: WEAVY_URL,
    tokenFactory
  };

  const weavy = useWeavy(weavyConfig);

  useEffect(() => {
    if (weavy) {
      (weavy as any).on('connected', () => {
        setIsConnected(true);
        setIsLoading(false);
      });

      (weavy as any).on('error', (e: Error) => {
        setError(e);
        setIsLoading(false);
      });
    }
  }, [weavy]);

  const value: WeavyContextType = {
    weavyClient: weavy,
    isLoading,
    isConnected,
    error
  };

  return (
    <WeavyContext.Provider value={value}>
      {children}
    </WeavyContext.Provider>
  );
}

export { WeavyContext as default, WeavyProvider, useWeavyContext, useWeavyChat }; 