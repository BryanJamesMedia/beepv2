import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  Text,
  Flex,
  Circle,
  Divider,
  Skeleton,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { supabase } from '../../config/supabase';
import { formatMessageTime } from '../../utils/dateFormat';

interface ChatPreview {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface ChatListProps {
  onSelectChat: (chat: ChatPreview) => void;
  selectedChatId?: string;
}

function ChatList({ onSelectChat, selectedChatId }: ChatListProps) {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // This is a placeholder query - you'll need to adjust based on your actual database structure
      const { data: chatsData, error } = await supabase
        .from('chats')
        .select(`
          id,
          participants (
            user_id,
            profile:profiles (
              username,
              avatar_url
            )
          ),
          messages (
            content,
            created_at,
            read
          )
        `)
        .eq('participants.user_id', session.user.id)
        .order('messages.created_at', { ascending: false });

      if (error) throw error;

      // Transform the data into ChatPreview format
      // This is placeholder transformation - adjust based on your data structure
      const transformedChats = chatsData.map(chat => ({
        id: chat.id,
        participantId: chat.participants[0].user_id,
        participantName: chat.participants[0].profile.username,
        participantAvatar: chat.participants[0].profile.avatar_url,
        lastMessage: chat.messages[0]?.content || '',
        lastMessageTime: chat.messages[0]?.created_at || '',
        unreadCount: chat.messages.filter(m => !m.read).length,
      }));

      setChats(transformedChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxW="full" py={6} px={4}>
      <VStack spacing={4} align="stretch">
        {/* Search Bar */}
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg="white"
            borderRadius="full"
          />
        </InputGroup>

        {/* Chat List */}
        <VStack spacing={0} align="stretch">
          {isLoading ? (
            // Loading skeletons
            Array(5).fill(0).map((_, i) => (
              <Box key={i} p={4}>
                <Flex align="center" gap={4}>
                  <Skeleton borderRadius="full" boxSize="48px" />
                  <VStack align="start" flex={1} spacing={2}>
                    <Skeleton height="20px" width="120px" />
                    <Skeleton height="16px" width="200px" />
                  </VStack>
                  <Skeleton height="24px" width="24px" borderRadius="full" />
                </Flex>
                {i < 4 && <Divider mt={4} />}
              </Box>
            ))
          ) : filteredChats.length > 0 ? (
            filteredChats.map((chat, index) => (
              <Box 
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                bg={selectedChatId === chat.id ? 'gray.100' : 'transparent'}
                _hover={{ bg: 'gray.50' }}
                cursor="pointer"
                transition="background-color 0.2s"
              >
                <Flex p={4} align="center">
                  <Avatar
                    size="md"
                    name={chat.participantName}
                    src={chat.participantAvatar}
                    mr={4}
                  />

                  <Box flex={1}>
                    <Flex justify="space-between" align="center">
                      <Text fontWeight="bold" fontSize="md">
                        {chat.participantName}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {formatMessageTime(chat.lastMessageTime)}
                      </Text>
                    </Flex>
                    <Text fontSize="sm" color="gray.600" noOfLines={1}>
                      {chat.lastMessage}
                    </Text>
                  </Box>

                  {chat.unreadCount > 0 && (
                    <Circle
                      size="24px"
                      bg="blue.500"
                      color="white"
                      fontSize="xs"
                      fontWeight="bold"
                      ml={4}
                    >
                      {chat.unreadCount}
                    </Circle>
                  )}
                </Flex>
                {index < filteredChats.length - 1 && <Divider />}
              </Box>
            ))
          ) : (
            <Box p={8} textAlign="center">
              <Text color="gray.500">No chats found</Text>
            </Box>
          )}
        </VStack>
      </VStack>
    </Container>
  );
}

export default ChatList; 