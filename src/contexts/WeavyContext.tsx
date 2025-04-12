import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useWeavy } from '@weavy/uikit-react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

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

const TOKEN_CACHE_KEY = 'weavy_token_cache';
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes in milliseconds

const WeavyContext = createContext<WeavyContextType | undefined>(undefined);

export function WeavyProvider({ children }: { children: ReactNode }) {
  const WEAVY_URL = import.meta.env.VITE_WEAVY_URL;
  const supabaseClient = useSupabaseClient();
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

  const weavyConfig = {
    url: WEAVY_URL,
    tokenFactory: async (refresh?: boolean) => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (!session) {
          clearCachedToken();
          throw new Error('No active session');
        }

        // If not refreshing, try to use cached token
        if (!refresh) {
          const cachedToken = getCachedToken(session.user.id);
          if (cachedToken) {
            return cachedToken.token;
          }
        } else {
          // Clear cached token if refreshing
          clearCachedToken();
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
        setError(error as Error);
        throw error;
      }
    }
  };

  const weavyResult = useWeavy(weavyConfig);

  useEffect(() => {
    if (weavyResult) {
      const { weavy } = weavyResult;
      
      const handleConnectionChange = (connected: boolean) => {
        setIsConnected(connected);
        setIsLoading(false);
      };

      if (weavy) {
        handleConnectionChange(true);
      }

      return () => {
        if (weavy) {
          handleConnectionChange(false);
          // Clear token cache on unmount
          clearCachedToken();
        }
      };
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

  const { weavy } = weavyResult;

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