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
  Badge,
  useToast,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useSupabase } from '../../contexts/SupabaseContext';
import { formatMessageTime } from '../../utils/dateFormat';
import { generateChatRoomId } from '../../utils/chatUtils';

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

// Interface for creator profile
interface CreatorProfile {
  username: string;
  avatar_url: string | null;
}

// Interface for saved creator entry
interface SavedCreator {
  id: string;
  creator_id: string;
  creator: CreatorProfile;
}

function ChatList({ onSelectChat, selectedChatId }: ChatListProps) {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const { supabase, user } = useSupabase();

  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      try {
        const { data, error } = await supabase
          .from("chats")
          .select(`
            id,
            last_message,
            last_message_time,
            unread_count,
            other_user:profiles!chats_other_user_id_fkey (
              id,
              username,
              avatar_url
            )
          `)
          .eq("user_id", user.id)
          .order("last_message_time", { ascending: false });

        if (error) throw error;

        // Convert chat data to our ChatPreview format
        const existingChats = (data || []).map(chat => {
          return {
            id: chat.id,
            participantId: chat.other_user.id,
            participantName: chat.other_user.username,
            participantAvatar: chat.other_user.avatar_url || '',
            lastMessage: chat.last_message || 'Start chatting...',
            lastMessageTime: chat.last_message_time || chat.created_at,
            unreadCount: chat.unread_count || 0,
          };
        });
        
        // Now fetch saved creators that are not already in our chat list
        const existingChatIds = new Set(existingChats.map(chat => chat.participantId));
        
        const { data: savedCreatorsData, error: savedError } = await supabase
          .from('saved_creators')
          .select(`
            id,
            creator_id,
            creator:profiles!saved_creators_creator_id_fkey (
              username,
              avatar_url
            )
          `)
          .eq('member_id', user.id);

        if (savedError) {
          console.error('Error fetching saved creators:', savedError);
          throw savedError;
        }
        
        // Make TypeScript happy by asserting the type
        const savedCreators = savedCreatorsData as unknown as SavedCreator[];

        // Transform saved creators to ChatPreview format (only those not already in chat)
        const savedCreatorChats = savedCreators
          .filter(item => !existingChatIds.has(item.creator_id))
          .map(item => {
            // Generate room ID using the utility function
            const roomId = generateChatRoomId(user.id, item.creator_id);
            
            return {
              id: roomId,
              participantId: item.creator_id,
              participantName: item.creator.username || 'Unknown',
              participantAvatar: item.creator.avatar_url || '',
              lastMessage: 'Start chatting...',
              lastMessageTime: new Date().toISOString(),
              unreadCount: 0,
            };
          });

        // Combine both sources of chats, prioritizing active chats
        setChats([...existingChats, ...savedCreatorChats]);
      } catch (error: any) {
        console.error('Error fetching chats:', error);
        toast({
          title: 'Error',
          description: error.message,
          status: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [user, supabase]);

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