import React, { useEffect, useState } from 'react';
import { Box, VStack, Text, Button, useToast } from '@chakra-ui/react';
import { useWeavyChat } from '../../contexts/WeavyContext';
import { WyChat } from '@weavy/uikit-react';
import { useSupabase } from '../../contexts/SupabaseContext';

interface ChatRoomProps {
  chatId: string;
  otherUserId: string;
  otherUserName: string;
}

export function ChatRoom({ chatId, otherUserId, otherUserName }: ChatRoomProps) {
  const { weavyClient, isConnected } = useWeavyChat();
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const { supabase, user } = useSupabase();

  useEffect(() => {
    if (!isConnected) {
      toast({
        title: 'Connection Error',
        description: 'Unable to connect to chat service. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isConnected, toast]);

  if (!isConnected) {
    return (
      <Box p={4}>
        <Text>Connecting to chat service...</Text>
      </Box>
    );
  }

  return (
    <Box p={4} h="100%">
      <VStack spacing={4} h="100%">
        <Text fontSize="xl" fontWeight="bold">
          Chat with {otherUserName}
        </Text>
        <Box flex={1} w="100%">
          <WyChat
            client={weavyClient}
            uid={chatId}
            options={{
              members: [otherUserId],
              title: `Chat with ${otherUserName}`,
            }}
          />
        </Box>
      </VStack>
    </Box>
  );
} 