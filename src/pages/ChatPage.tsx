import React, { useEffect, useState } from 'react';
import { Box, VStack, Text, Button, useToast, Spinner, Center } from '@chakra-ui/react';
import { useWeavyChat } from '../contexts/WeavyContext';
import { WyChat } from '@weavy/uikit-react';
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

interface NavigationState {
  selectedChat?: {
    participantId: string;
    participantName: string;
  };
}

export function ChatPage() {
  const { weavyClient, isConnected, isLoading, error } = useWeavyChat();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as NavigationState;
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user.id);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Connection Error',
        description: error.message || 'Unable to connect to chat service. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Connecting to chat service...</Text>
        </VStack>
      </Center>
    );
  }

  if (!isConnected || !weavyClient) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Text color="red.500">Unable to connect to chat service</Text>
          <Button onClick={() => window.location.reload()}>
            Retry Connection
          </Button>
        </VStack>
      </Center>
    );
  }

  // If we have a selected chat from navigation, show that chat
  if (state?.selectedChat && currentUser) {
    return (
      <Box p={4} h="100%">
        <VStack spacing={4} h="100%">
          <Text fontSize="xl" fontWeight="bold">
            Chat with {state.selectedChat.participantName}
          </Text>
          <Box flex={1} w="100%">
            <WyChat
              client={weavyClient}
              options={{
                members: [state.selectedChat.participantId],
                title: `Chat with ${state.selectedChat.participantName}`,
              }}
            />
          </Box>
        </VStack>
      </Box>
    );
  }

  // Otherwise show the chat list
  return (
    <Box p={4} h="100%">
      <VStack spacing={4} h="100%">
        <Text fontSize="xl" fontWeight="bold">
          Your Chats
        </Text>
        <Box flex={1} w="100%">
          <WyChat
            client={weavyClient}
            options={{
              list: true,
              onChatSelect: (chat: Chat) => {
                navigate(`/chat/${chat.uid}`, {
                  state: {
                    chatId: chat.uid,
                    otherUserId: chat.members[0].id,
                    otherUserName: chat.members[0].name
                  }
                });
              }
            }}
          />
        </Box>
      </VStack>
    </Box>
  );
} 