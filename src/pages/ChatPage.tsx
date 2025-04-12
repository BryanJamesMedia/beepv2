import React, { useEffect, useState } from 'react';
import { 
  Box, 
  VStack, 
  Text, 
  Button, 
  useToast, 
  Spinner, 
  Center,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Avatar,
  HStack,
  Badge,
  Flex,
  Divider
} from '@chakra-ui/react';
import { FiPlus, FiMessageCircle } from 'react-icons/fi';
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

interface SavedCreator {
  id: string;
  username: string;
  avatar_url: string | null;
  headline: string | null;
}

export function ChatPage() {
  const { weavyClient, isConnected, isLoading, error } = useWeavyChat();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as NavigationState;
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [savedCreators, setSavedCreators] = useState<SavedCreator[]>([]);
  const [loadingCreators, setLoadingCreators] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

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
    if (currentUser) {
      fetchSavedCreators();
    }
  }, [currentUser]);

  const fetchSavedCreators = async () => {
    try {
      setLoadingCreators(true);
      const { data, error } = await supabase
        .from('saved_creators')
        .select(`
          creator:profiles (
            id,
            username,
            avatar_url,
            headline
          )
        `)
        .eq('member_id', currentUser);

      if (error) throw error;

      const creators = data?.map(item => item.creator) || [];
      setSavedCreators(creators);
    } catch (error) {
      console.error('Error fetching saved creators:', error);
      toast({
        title: 'Error',
        description: 'Failed to load saved creators',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoadingCreators(false);
    }
  };

  const handleStartChat = (creator: SavedCreator) => {
    navigate('/chat', {
      state: {
        selectedChat: {
          participantId: creator.id,
          participantName: creator.username
        }
      }
    });
    onClose();
  };

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

  // Show chat list with new chat button
  return (
    <Box p={4} h="100%">
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="xl" fontWeight="bold">
          Your Chats
        </Text>
        <IconButton
          aria-label="Start new chat"
          icon={<FiPlus />}
          colorScheme="blue"
          onClick={onOpen}
          isRound
        />
      </Flex>

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

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Start New Chat</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {loadingCreators ? (
              <Center p={4}>
                <Spinner />
              </Center>
            ) : savedCreators.length === 0 ? (
              <Text textAlign="center" p={4}>
                You haven't saved any creators yet.
              </Text>
            ) : (
              <VStack spacing={4} align="stretch">
                {savedCreators.map((creator) => (
                  <Box key={creator.id}>
                    <HStack spacing={3} p={2} _hover={{ bg: 'gray.50' }} cursor="pointer" onClick={() => handleStartChat(creator)}>
                      <Avatar
                        size="md"
                        name={creator.username}
                        src={creator.avatar_url || undefined}
                      />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text fontWeight="medium">{creator.username}</Text>
                        {creator.headline && (
                          <Text fontSize="sm" color="gray.600">{creator.headline}</Text>
                        )}
                      </VStack>
                      <IconButton
                        aria-label="Start chat"
                        icon={<FiMessageCircle />}
                        colorScheme="blue"
                        variant="ghost"
                      />
                    </HStack>
                    <Divider />
                  </Box>
                ))}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
} 