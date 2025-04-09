import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  Badge,
  HStack,
  Avatar,
  Divider,
  Button,
  useToast,
  Skeleton,
  SkeletonCircle,
  Center,
} from '@chakra-ui/react';
import TopMenu from '../../components/TopMenu';
import AddFriends from '../../components/Dashboard/AddFriends';
import { FiMessageSquare } from 'react-icons/fi';
import { supabase } from '../../config/supabase';

function MemberDashboard() {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const { data, error } = await supabase
        .from('friends')
        .select(`
          creator_id,
          creator:creator_id(id, username, display_name, avatar_url)
        `)
        .eq('member_id', session.user.id);

      if (error) throw error;
      setFriends(data || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast({
        title: 'Error loading friends',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startChat = (friendId) => {
    // Logic to start a chat with a friend
    console.log('Starting chat with:', friendId);
    // Navigate to chat page with this friend
  };

  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={8} align="stretch">
        <TopMenu />
        <Heading size="lg">Member Dashboard</Heading>

        <AddFriends userRole="member" />

        <Box>
          <Heading size="md" mb={4}>Friends</Heading>
          <Card>
            <CardBody>
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <Box key={i} mb={i < 2 ? 4 : 0}>
                    <HStack>
                      <SkeletonCircle size="50px" />
                      <Box flex="1">
                        <Skeleton height="20px" width="40%" mb={2} />
                        <Skeleton height="16px" width="60%" />
                      </Box>
                      <Skeleton height="40px" width="100px" />
                    </HStack>
                    {i < 2 && <Divider my={4} />}
                  </Box>
                ))
              ) : friends.length > 0 ? (
                friends.map((friend, index) => (
                  <Box key={friend.creator_id}>
                    <HStack justify="space-between" align="center">
                      <HStack>
                        <Avatar 
                          size="md" 
                          name={friend.creator.display_name || friend.creator.username} 
                          src={friend.creator.avatar_url}
                        />
                        <Box>
                          <Text fontWeight="bold">
                            {friend.creator.display_name || friend.creator.username}
                          </Text>
                          <Text fontSize="sm" color="gray.500">Creator</Text>
                        </Box>
                      </HStack>
                      <Button 
                        leftIcon={<FiMessageSquare />} 
                        colorScheme="blue" 
                        size="sm"
                        onClick={() => startChat(friend.creator_id)}
                      >
                        Chat
                      </Button>
                    </HStack>
                    {index < friends.length - 1 && <Divider my={4} />}
                  </Box>
                ))
              ) : (
                <Center py={8}>
                  <Text color="gray.500">
                    No friends added yet. Use the options above to find creators.
                  </Text>
                </Center>
              )}
            </CardBody>
          </Card>
        </Box>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Your Activity</Heading>
                <HStack justify="space-between">
                  <Text>Messages Sent</Text>
                  <Badge colorScheme="blue">0</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text>Communities Joined</Text>
                  <Badge colorScheme="green">0</Badge>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Recent Communities</Heading>
                <Text color="gray.500">No communities joined yet</Text>
              </VStack>
            </CardBody>
          </Card>
        </Grid>
      </VStack>
    </Container>
  );
}

export default MemberDashboard; 