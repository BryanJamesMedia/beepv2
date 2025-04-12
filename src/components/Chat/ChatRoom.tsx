import React from 'react';
import { WyChat } from '@weavy/uikit-react';
import { useWeavyChat } from '../../contexts/WeavyContext';
import { Box, Text } from '@chakra-ui/react';

interface ChatRoomProps {
  roomId: string;
}

export function ChatRoom({ roomId }: ChatRoomProps) {
  const { weavyClient, isConnected } = useWeavyChat();

  if (!isConnected) {
    return (
      <Box p={4}>
        <Text>Connecting to chat service...</Text>
      </Box>
    );
  }

  return (
    <Box h="100%" w="100%">
      <WyChat uid={roomId} client={weavyClient} />
    </Box>
  );
} 