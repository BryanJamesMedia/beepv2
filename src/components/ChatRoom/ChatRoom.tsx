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
  const [room, setRoom] = useState<any>(null);

  useEffect(() => {
    if (!chatClient) return;

    const setupRoom = async () => {
      try {
        // Get or create the room
        const chatRoom = await chatClient.getRoom(roomId);
        setRoom(chatRoom);

        // Subscribe to new messages
        const subscription = chatRoom.subscribe('message', (message) => {
          setMessages(prev => [...prev, message]);
        });

        // Get message history
        const history = await chatRoom.getMessages();
        setMessages(history);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up chat room:', error);
      }
    };

    setupRoom();
  }, [chatClient, roomId]);

  const handleSendMessage = async () => {
    if (!room || !newMessage.trim()) return;

    try {
      await room.sendMessage({
        content: newMessage,
      });
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