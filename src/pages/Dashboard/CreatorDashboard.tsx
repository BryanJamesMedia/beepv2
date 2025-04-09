import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Heading,
  Button,
  VStack,
  HStack,
  Avatar,
  Text,
  Divider,
  Center,
  Skeleton,
  SkeletonCircle,
} from '@chakra-ui/react';
import { AddIcon, ChatIcon } from '@chakra-ui/icons';
import TopMenu from '../../components/TopMenu';
import AddFriends from '../../components/Dashboard/AddFriends';
import { supabase } from '../../config/supabase';
import { FiMessageSquare } from 'react-icons/fi';
import useCustomToast from '../../hooks/useCustomToast';

function CreatorDashboard() {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useCustomToast();

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No session found");
        return;
      }

      console.log("User ID:", session.user.id);

      // First check if the table exists by trying to get its schema
      const { error: tableCheckError } = await supabase
        .from('friends')
        .select('id')
        .limit(1);

      if (tableCheckError) {
        console.error("Table check error:", tableCheckError);
        toast({
          title: 'Database table not ready. Please run the SQL setup script.',
          status: 'error',
          duration: 5000,
        });
        setIsLoading(false);
        return;
      }

      // If table exists, query for friends
      const { data, error } = await supabase
        .from('friends')
        .select(`
          member_id,
          member:member_id(id, username, display_name, avatar_url)
        `)
        .eq('creator_id', session.user.id);

      if (error) {
        console.error("Friends query error:", error);
        throw error;
      }
      
      console.log("Friends data:", data);
      setFriends(data || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast({
        title: 'Error loading friends data',
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
        <Heading size="lg">Creator Dashboard</Heading>
        
        {/* Add Friends Section */}
        <AddFriends userRole="creator" />

        {/* Earnings Stats */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Today's Earnings</StatLabel>
                <StatNumber>$0.00</StatNumber>
                <StatHelpText>From all sources</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Balance</StatLabel>
                <StatNumber>$0.00</StatNumber>
                <StatHelpText>Available for withdrawal</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Lifetime Earnings</StatLabel>
                <StatNumber>$0.00</StatNumber>
                <StatHelpText>All time earnings</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Friends List */}
        <Box>
          <Heading size="md" mb={4}>Members</Heading>
          <Card>
            <CardBody>
              {isLoading ? (
                // Loading skeletons
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
                // Friends list
                friends.map((friend, index) => (
                  <Box key={friend.member_id}>
                    <HStack justify="space-between" align="center">
                      <HStack>
                        <Avatar 
                          size="md" 
                          name={friend.member.display_name || friend.member.username} 
                          src={friend.member.avatar_url}
                        />
                        <Box>
                          <Text fontWeight="bold">
                            {friend.member.display_name || friend.member.username}
                          </Text>
                          <Text fontSize="sm" color="gray.500">Member</Text>
                        </Box>
                      </HStack>
                      <Button 
                        leftIcon={<FiMessageSquare />} 
                        colorScheme="blue" 
                        size="sm"
                        onClick={() => startChat(friend.member_id)}
                      >
                        Chat
                      </Button>
                    </HStack>
                    {index < friends.length - 1 && <Divider my={4} />}
                  </Box>
                ))
              ) : (
                // Empty state
                <Center py={8}>
                  <Text color="gray.500">
                    No members added yet. Use the options above to find members.
                  </Text>
                </Center>
              )}
            </CardBody>
          </Card>
        </Box>

        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Quick Actions</Heading>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                <Button leftIcon={<AddIcon />} colorScheme="blue">
                  Create New Channel
                </Button>
                <Button leftIcon={<ChatIcon />} colorScheme="green">
                  Send Announcement
                </Button>
              </Grid>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}

export default CreatorDashboard; 