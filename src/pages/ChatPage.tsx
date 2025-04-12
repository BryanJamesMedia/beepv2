import React, { useEffect, useState } from 'react';
import { Box, VStack, Text, Button, useToast } from '@chakra-ui/react';
import { useWeavyChat } from '../contexts/WeavyContext';
import { WyChatList } from '@weavy/uikit-react';
import { supabase } from '../config/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

interface ChatMember {
  id: string;
  name: string;
}

interface Chat {
  uid: string;
  members: ChatMember[];
}

export function ChatPage() {
  const { weavyClient, isConnected } = useWeavyChat();
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

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
          Your Chats
        </Text>
        <Box flex={1} w="100%">
          <WyChatList
            client={weavyClient}
            onChatSelect={(chat: Chat) => {
              // Navigate to the selected chat
              navigate(`/chat/${chat.uid}`, {
                state: {
                  chatId: chat.uid,
                  otherUserId: chat.members[0].id,
                  otherUserName: chat.members[0].name
                }
              });
            }}
          />
        </Box>
      </VStack>
    </Box>
  );
} 