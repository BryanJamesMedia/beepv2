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
  GridItem,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, ChatIcon } from '@chakra-ui/icons';
import TopMenu from '../../components/TopMenu';
import { useSupabase } from '../../contexts/SupabaseContext';
import { FiMessageSquare } from 'react-icons/fi';

// Define the types for follower data
interface FollowerMember {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
}

interface Follower {
  member_id: string;
  member: FollowerMember;
}

function CreatorDashboard() {
  const [savedCreators, setSavedCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { supabase, user } = useSupabase();

  useEffect(() => {
    async function fetchSavedCreators() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('saved_creators')
          .select(`
            creator:profiles (
              id,
              username,
              avatar_url,
              display_name,
              headline
            )
          `)
          .eq('member_id', user.id);

        if (error) throw error;

        setSavedCreators(data?.map(item => item.creator) || []);
      } catch (error: any) {
        console.error('Error fetching saved creators:', error);
        toast({
          title: 'Error',
          description: error.message,
          status: 'error',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSavedCreators();
  }, [user, supabase]);

  const startChat = (memberId: string) => {
    // Logic to start a chat with a follower
    console.log('Starting chat with:', memberId);
    // Navigate to chat page with this member
  };

  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={8} align="stretch">
        <TopMenu />
        <Heading size="lg">Creator Dashboard</Heading>

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
                <StatLabel>Total Followers</StatLabel>
                <StatNumber>{savedCreators.length}</StatNumber>
                <StatHelpText>Members who saved your profile</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Followers List */}
        <Box>
          <Heading size="md" mb={4}>Your Followers</Heading>
          <Card>
            <CardBody>
              {loading ? (
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
              ) : savedCreators.length > 0 ? (
                // Followers list
                savedCreators.map((creator, index) => (
                  <Box key={creator.id}>
                    <HStack justify="space-between" align="center">
                      <HStack>
                        <Avatar 
                          size="md" 
                          name={creator.display_name || creator.username} 
                          src={creator.avatar_url}
                        />
                        <Box>
                          <Text fontWeight="bold">
                            {creator.display_name || creator.username}
                          </Text>
                          <Text fontSize="sm" color="gray.500">{creator.headline}</Text>
                        </Box>
                      </HStack>
                      <Button 
                        leftIcon={<FiMessageSquare />} 
                        colorScheme="blue" 
                        size="sm"
                        onClick={() => startChat(creator.id)}
                      >
                        Chat
                      </Button>
                    </HStack>
                    {index < savedCreators.length - 1 && <Divider my={4} />}
                  </Box>
                ))
              ) : (
                // Empty state
                <Center py={8}>
                  <Text color="gray.500">
                    No followers yet. Share your profile with potential followers.
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