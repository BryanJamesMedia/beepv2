import React, { useEffect, useState } from 'react';
import { useAbly } from '../../contexts/AblyContext';
import { Message } from '@ably/chat';
import {
  Box,
  VStack,
  Input,
  Button,
  Text,
  Flex,
  Avatar,
  IconButton,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';

// Define extended interfaces to handle potential SDK version differences
interface ExtendedRoom {
  id: string;
  name?: string;
  subscribe: any; // Using any since signatures differ between versions
  publish?: (message: string) => Promise<void>;
  sendMessage?: (message: { content: string }) => Promise<void>;
  getMessages?: () => Promise<Message[]>;
  [key: string]: any; // Other potential properties
}

interface ExtendedSubscription {
  unsubscribe?: () => void;
  [key: string]: any;
}

interface ChatRoomProps {
  roomId: string;
  participant: {
    id: string;
    name: string;
  };
  onBack: () => void;
}

export function ChatRoom({ roomId, participant, onBack }: ChatRoomProps) {
  const { chatClient } = useAbly();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [room, setRoom] = useState<ExtendedRoom | null>(null);

  useEffect(() => {
    if (!chatClient) return;
    let cleanup: (() => void) | undefined;

    const setupRoom = async () => {
      try {
        console.log('Setting up chat room with ID:', roomId);
        
        // Get the room - for Ably Chat SDK v0.5.1
        const chatRoom = await chatClient.getRoom(roomId) as ExtendedRoom;
        console.log('Room obtained:', chatRoom);
        setRoom(chatRoom);

        // Check if the subscribe method exists
        if (typeof chatRoom.subscribe === 'function') {
          try {
            // Try the simpler subscribe method first
            const subscription = chatRoom.subscribe((message: Message) => {
              console.log('New message received:', message);
              setMessages(prev => [...prev, message]);
            }) as ExtendedSubscription;

            // Set cleanup function
            cleanup = () => {
              if (subscription && typeof subscription.unsubscribe === 'function') {
                subscription.unsubscribe();
              }
            };
          } catch (subError) {
            console.error('Error subscribing to messages:', subError);
            
            // Alternative subscribe method (for Ably v0.5.1)
            try {
              // @ts-ignore - Ignoring type error for different SDK versions
              const subscription = chatRoom.subscribe('message', (message: Message) => {
                console.log('New message received (v2):', message);
                setMessages(prev => [...prev, message]);
              }) as ExtendedSubscription;
              
              cleanup = () => {
                if (subscription && typeof subscription.unsubscribe === 'function') {
                  subscription.unsubscribe();
                }
              };
            } catch (altSubError) {
              console.error('Alternative subscription also failed:', altSubError);
            }
          }
        } else {
          console.error('Room object does not have a subscribe method');
        }

        // Try to get message history if the method exists
        try {
          if (chatRoom.getMessages && typeof chatRoom.getMessages === 'function') {
            const history = await chatRoom.getMessages();
            console.log('Message history loaded:', history);
            setMessages(history);
          } else {
            console.log('getMessages method not available on this room object');
          }
        } catch (historyError) {
          console.error('Error loading message history:', historyError);
        }
      } catch (error) {
        console.error('Error setting up chat room:', error);
      }
    };

    setupRoom();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [chatClient, roomId]);

  const handleSendMessage = async () => {
    if (!room || !newMessage.trim()) return;

    try {
      // Try different message sending methods based on the SDK version
      if (typeof room.sendMessage === 'function') {
        await room.sendMessage({
          content: newMessage,
        });
      } else if (typeof room.publish === 'function') {
        await room.publish(newMessage);
      } else {
        throw new Error('No valid method to send messages found');
      }
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Box h="full">
      {/* Chat Header */}
      <Flex
        p={4}
        bg="white"
        borderBottom="1px"
        borderColor="gray.200"
        align="center"
        gap={4}
      >
        <IconButton
          icon={<ArrowBackIcon />}
          aria-label="Back to chat list"
          variant="ghost"
          display={{ base: 'flex', md: 'none' }}
          onClick={onBack}
        />
        <Avatar size="sm" name={participant.name} />
        <Text fontWeight="bold">{participant.name}</Text>
      </Flex>

      {/* Existing chat room content */}
      <Box p={4} h="calc(100vh - 144px)" overflowY="auto">
        <VStack spacing={4} align="stretch">
          {/* Messages */}
          {messages.map((message) => (
            <Flex
              key={message.id}
              w="full"
              alignItems="start"
              gap={2}
            >
              <Avatar
                size="sm"
                name={message.sender?.id}
              />
              <Box
                bg="gray.100"
                p={3}
                borderRadius="lg"
                maxW="80%"
              >
                <Text fontSize="sm" fontWeight="bold">
                  {message.sender?.id}
                </Text>
                <Text>{message.content}</Text>
              </Box>
            </Flex>
          ))}
        </VStack>
      </Box>

      {/* Message Input */}
      <Box p={4} borderTop="1px" borderColor="gray.200" bg="white">
        <Flex gap={2}>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <Button
            colorScheme="blue"
            onClick={handleSendMessage}
          >
            Send
          </Button>
        </Flex>
      </Box>
    </Box>
  );
} 