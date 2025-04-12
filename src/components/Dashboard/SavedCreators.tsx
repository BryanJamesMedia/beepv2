import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  SimpleGrid,
  Button,
  Icon,
  Text,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  Avatar,
  Center,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { FiSearch, FiShare2, FiGrid, FiBookmark } from 'react-icons/fi';
import useCustomToast from '../../hooks/useCustomToast';
import { useSupabase } from '../../contexts/SupabaseContext';
import { SearchIcon, AddIcon } from '@chakra-ui/icons';

interface Creator {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface ToastParams {
  title: string;
  description?: string;
  status: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

interface SavedCreatorsProps {
  userRole: 'member' | 'creator';
}

const SavedCreators: React.FC<SavedCreatorsProps> = ({ userRole }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Creator[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const inviteDisclosure = useDisclosure();
  const searchDisclosure = useDisclosure();
  const qrDisclosure = useDisclosure();
  const toast = useToast();
  const { supabase, user } = useSupabase();
  
  const buttonBg = useColorModeValue('white', 'gray.700');
  const buttonHoverBg = useColorModeValue('gray.50', 'gray.600');

  // Search for creators
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Get the current session first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Only members can search for creators to save
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('role', 'creator')
        .ilike('username', `%${searchQuery}%`)
        .limit(5);
        
      if (error) {
        console.error('Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      if (!data) {
        console.log('No creators found for search query:', searchQuery);
        setSearchResults([]);
        return;
      }

      console.log('Found creators:', data);
      setSearchResults(data);
    } catch (error: any) {
      console.error('Error searching creators:', error);
      toast({
        title: "Error searching creators",
        description: error?.message || 'An unexpected error occurred',
        status: "error",
        duration: 3000,
      } as ToastParams);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Generate invite link
  const generateInviteLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/signup?invited_by=${userRole}`;
  };

  // Generate QR code link
  const qrCodeValue = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/profile/${userRole}`;
  };

  // Handle saving a creator
  const handleSaveCreator = async (creatorId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_creators')
        .insert({ member_id: user.id, creator_id: creatorId });

      if (error) throw error;

      toast({
        title: "Creator saved",
        description: "You can now start chatting with this creator",
        status: "success",
        duration: 3000,
      } as ToastParams);

      // Clear search results after saving
      setSearchResults([]);
      setSearchQuery('');
    } catch (error: any) {
      console.error('Error saving creator:', error);
      toast({
        title: "Error saving creator",
        description: error?.message || 'An unexpected error occurred',
        status: "error",
        duration: 3000,
      } as ToastParams);
    }
  };

  // Only show this component to members, as only they can save creators
  if (userRole !== 'member') {
    return null;
  }

  return (
    <Box mb={8}>
      <Heading size="md" mb={4}>Find Creators</Heading>
      
      <SimpleGrid columns={3} spacing={4}>
        <Button
          height="100px"
          onClick={inviteDisclosure.onOpen}
          bg={buttonBg}
          _hover={{ bg: buttonHoverBg }}
          boxShadow="md"
          borderRadius="lg"
        >
          <VStack>
            <Icon as={FiShare2} boxSize={6} />
            <Text>Invite</Text>
          </VStack>
        </Button>
        
        <Button
          height="100px"
          onClick={qrDisclosure.onOpen}
          bg={buttonBg}
          _hover={{ bg: buttonHoverBg }}
          boxShadow="md"
          borderRadius="lg"
        >
          <VStack>
            <Icon as={FiGrid} boxSize={6} />
            <Text>QR Code</Text>
          </VStack>
        </Button>
        
        <Button
          height="100px"
          onClick={searchDisclosure.onOpen}
          bg={buttonBg}
          _hover={{ bg: buttonHoverBg }}
          boxShadow="md"
          borderRadius="lg"
        >
          <VStack>
            <Icon as={FiSearch} boxSize={6} />
            <Text>Search</Text>
          </VStack>
        </Button>
      </SimpleGrid>

      {/* Invite Modal */}
      <Modal isOpen={inviteDisclosure.isOpen} onClose={inviteDisclosure.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invite Friends</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Text>Share this link with friends to join:</Text>
              <Box
                p={3}
                borderWidth="1px"
                borderRadius="md"
                width="100%"
                bg="gray.50"
              >
                <Text fontWeight="medium" isTruncated>
                  {generateInviteLink()}
                </Text>
              </Box>
              <Button 
                colorScheme="blue"
                onClick={() => {
                  navigator.clipboard.writeText(generateInviteLink());
                  toast({
                    title: "Link copied",
                    status: "success",
                    duration: 2000,
                  });
                }}
              >
                Copy Link
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* QR Code Modal */}
      <Modal isOpen={qrDisclosure.isOpen} onClose={qrDisclosure.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Your Profile Link</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="center">
              <Text>Share this link with others to find you:</Text>
              
              {/* Replaced QR code component with a simple link display */}
              <Box 
                p={4} 
                bg="gray.50" 
                borderRadius="md" 
                borderWidth="1px" 
                width="100%"
              >
                <Text fontWeight="medium" textAlign="center">
                  {qrCodeValue()}
                </Text>
              </Box>
              
              <Button 
                colorScheme="blue"
                onClick={() => {
                  navigator.clipboard.writeText(qrCodeValue());
                  toast({
                    title: "Link copied",
                    status: "success",
                    duration: 2000,
                  });
                }}
              >
                Copy Link
              </Button>
              
              <Text fontSize="sm" color="gray.500">
                Note: QR code functionality will be added in the next update
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Search Modal */}
      <Modal isOpen={searchDisclosure.isOpen} onClose={searchDisclosure.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Search Creators</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <InputGroup mb={4}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search by username"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </InputGroup>

            {isSearching ? (
              <Center py={4}>
                <Spinner />
              </Center>
            ) : searchResults.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {searchResults.map((creator) => (
                  <HStack key={creator.id} justify="space-between" p={2} borderWidth="1px" borderRadius="md">
                    <HStack>
                      <Avatar size="sm" name={creator.username} src={creator.avatar_url || undefined} />
                      <Text>{creator.username}</Text>
                    </HStack>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleSaveCreator(creator.id)}
                      isLoading={isSaving}
                    >
                      Save
                    </Button>
                  </HStack>
                ))}
              </VStack>
            ) : searchQuery ? (
              <Text textAlign="center" color="gray.500">No creators found</Text>
            ) : null}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SavedCreators; 