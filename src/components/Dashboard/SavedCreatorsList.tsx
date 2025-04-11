import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Divider,
  HStack,
  Avatar,
  Spinner,
  Button,
  Icon,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { FiTrash2 } from 'react-icons/fi';
import { supabase } from '../../config/supabase';

const SavedCreatorsList: React.FC = () => {
  const [savedCreators, setSavedCreators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState(false);
  const toast = useToast();
  const emptyTextColor = useColorModeValue('gray.500', 'gray.400');

  useEffect(() => {
    fetchSavedCreators();
  }, []);

  const fetchSavedCreators = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      // Get saved creator IDs
      const { data: savedData, error: savedError } = await supabase
        .from('saved_creators')
        .select('creator_id')
        .eq('member_id', session.user.id);

      if (savedError) throw savedError;

      if (savedData && savedData.length > 0) {
        // Get creator profiles from the IDs
        const creatorIds = savedData.map(item => item.creator_id);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, display_name')
          .in('id', creatorIds);

        if (profilesError) throw profilesError;
        
        setSavedCreators(profilesData || []);
      } else {
        setSavedCreators([]);
      }
    } catch (error) {
      console.error('Error fetching saved creators:', error);
      toast({
        title: "Error loading saved creators",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeCreator = async (creatorId: string) => {
    setIsRemoving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('saved_creators')
        .delete()
        .eq('member_id', session.user.id)
        .eq('creator_id', creatorId);

      if (error) throw error;

      // Update the list after removing
      setSavedCreators(savedCreators.filter(creator => creator.id !== creatorId));
      
      toast({
        title: "Creator removed from saved list",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error removing saved creator:', error);
      toast({
        title: "Error removing creator",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Box mt={6}>
      <Heading size="md" mb={4}>Saved Creators</Heading>
      
      {isLoading ? (
        <Box textAlign="center" py={8}>
          <Spinner size="xl" color="blue.500" />
          <Text mt={4}>Loading saved creators...</Text>
        </Box>
      ) : savedCreators.length > 0 ? (
        <VStack spacing={2} align="stretch">
          {savedCreators.map((creator, index) => (
            <React.Fragment key={creator.id}>
              <HStack 
                p={4} 
                borderWidth="1px" 
                borderRadius="lg" 
                justify="space-between"
                bg={useColorModeValue('white', 'gray.700')}
                _hover={{ boxShadow: 'md' }}
              >
                <HStack spacing={4}>
                  <Avatar 
                    size="md" 
                    name={creator.display_name || creator.username} 
                    src={creator.avatar_url}
                  />
                  <Box>
                    <Text fontWeight="bold">{creator.display_name || creator.username}</Text>
                    <Text fontSize="sm" color={emptyTextColor}>@{creator.username}</Text>
                  </Box>
                </HStack>
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  leftIcon={<Icon as={FiTrash2} />}
                  onClick={() => removeCreator(creator.id)}
                  isLoading={isRemoving}
                >
                  Remove
                </Button>
              </HStack>
              {index < savedCreators.length - 1 && <Divider my={2} />}
            </React.Fragment>
          ))}
        </VStack>
      ) : (
        <Box 
          py={8} 
          textAlign="center" 
          borderWidth="1px" 
          borderRadius="lg"
          bg={useColorModeValue('white', 'gray.700')}
        >
          <Text color={emptyTextColor}>
            No creators saved yet. Search and save creators you're interested in.
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default SavedCreatorsList; 