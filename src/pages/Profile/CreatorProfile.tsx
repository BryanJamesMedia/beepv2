import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Avatar,
  Button,
  Divider,
  SimpleGrid,
  Image,
  Badge,
  Spinner,
  Flex,
  useToast,
  Center,
  Icon,
  IconButton,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FiArrowLeft, FiMapPin, FiBookmark, FiImage, FiInfo } from 'react-icons/fi';
import { supabase } from '../../config/supabase';

// Fix the interface to match React Router v6 useParams
interface CreatorProfileParams {
  [key: string]: string | undefined;
}

interface ProfileData {
  id: string;
  username: string;
  bio: string;
  avatar_url: string | null;
  location: string | null;
  age: string | null;
  gender: string | null;
  headline: string | null;
  role: string;
}

interface GalleryImage {
  image_url: string;
}

const CreatorProfile: React.FC = () => {
  const { id } = useParams<CreatorProfileParams>();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savingCreator, setSavingCreator] = useState(false);
  const [viewingGallery, setViewingGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    fetchCreatorProfile();
    checkCurrentUser();
  }, [id]);

  useEffect(() => {
    if (currentUser && profile) {
      checkIfCreatorIsSaved();
    }
  }, [currentUser, profile]);

  const fetchCreatorProfile = async () => {
    try {
      setLoading(true);
      if (!id) return;

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, bio, avatar_url, location, age, gender, headline, role')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;
      if (!profileData) {
        toast({
          title: 'Creator not found',
          status: 'error',
          duration: 3000,
        });
        navigate('/dashboard');
        return;
      }

      if (profileData.role !== 'creator') {
        toast({
          title: 'This profile is not a creator',
          status: 'error',
          duration: 3000,
        });
        navigate('/dashboard');
        return;
      }

      setProfile(profileData);

      // Fetch gallery images
      const { data: galleryData, error: galleryError } = await supabase
        .from('gallery')
        .select('image_url')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (galleryError) throw galleryError;
      if (galleryData) {
        setGalleryImages(galleryData.map(item => item.image_url));
      }
    } catch (error) {
      console.error('Error fetching creator profile:', error);
      toast({
        title: 'Error loading profile',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setCurrentUser(session.user.id);
    }
  };

  const checkIfCreatorIsSaved = async () => {
    try {
      if (!currentUser || !profile) return;

      const { data, error } = await supabase
        .from('saved_creators')
        .select('id')
        .eq('member_id', currentUser)
        .eq('creator_id', profile.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setIsSaved(!!data);
    } catch (error) {
      console.error('Error checking if creator is saved:', error);
    }
  };

  const handleSaveCreator = async () => {
    try {
      setSavingCreator(true);
      if (!currentUser || !profile) return;

      if (isSaved) {
        // Remove creator from saved list
        const { error } = await supabase
          .from('saved_creators')
          .delete()
          .eq('member_id', currentUser)
          .eq('creator_id', profile.id);

        if (error) throw error;

        setIsSaved(false);
        toast({
          title: 'Creator removed from saved list',
          status: 'success',
          duration: 2000,
        });
      } else {
        // Add creator to saved list
        const { error } = await supabase
          .from('saved_creators')
          .insert({
            member_id: currentUser,
            creator_id: profile.id
          });

        if (error) throw error;

        setIsSaved(true);
        toast({
          title: 'Creator saved successfully',
          status: 'success',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error saving/removing creator:', error);
      toast({
        title: 'Error updating saved creators',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSavingCreator(false);
    }
  };

  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setViewingGallery(true);
  };

  const closeGallery = () => {
    setViewingGallery(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  if (loading) {
    return (
      <Center minH="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading creator profile...</Text>
        </VStack>
      </Center>
    );
  }

  if (!profile) {
    return (
      <Center minH="100vh">
        <VStack spacing={4}>
          <Icon as={FiInfo} boxSize={10} color="red.500" />
          <Heading size="md">Creator not found</Heading>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </VStack>
      </Center>
    );
  }

  // Gallery modal view
  if (viewingGallery && galleryImages.length > 0) {
    return (
      <Box 
        position="fixed" 
        top="0" 
        left="0" 
        right="0" 
        bottom="0" 
        bg="rgba(0,0,0,0.9)" 
        zIndex="modal"
        onClick={closeGallery}
      >
        <IconButton
          aria-label="Close gallery"
          icon={<FiArrowLeft />}
          position="absolute"
          top="4"
          left="4"
          onClick={closeGallery}
          zIndex="modal"
        />
        <Flex 
          height="100%" 
          justifyContent="center" 
          alignItems="center"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={galleryImages[currentImageIndex]}
            alt={`Gallery image ${currentImageIndex + 1}`}
            maxH="90vh"
            maxW="90vw"
            objectFit="contain"
          />
          {galleryImages.length > 1 && (
            <>
              <IconButton
                aria-label="Previous image"
                icon={<FiArrowLeft />}
                position="absolute"
                left="4"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
              />
              <IconButton
                aria-label="Next image"
                icon={<FiArrowLeft transform="rotate(180deg)" />}
                position="absolute"
                right="4"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
              />
            </>
          )}
          <Text
            position="absolute"
            bottom="4"
            color="white"
          >
            {currentImageIndex + 1} / {galleryImages.length}
          </Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Button
        leftIcon={<FiArrowLeft />}
        variant="ghost"
        mb={6}
        onClick={() => navigate(-1)}
      >
        Back
      </Button>

      <Box 
        borderWidth="1px" 
        borderRadius="lg" 
        overflow="hidden" 
        bg="white" 
        shadow="md"
      >
        {/* Profile Header */}
        <Box bg="blue.50" p={6}>
          <Flex 
            direction={isMobile ? "column" : "row"}
            align={isMobile ? "center" : "flex-start"}
            justify="space-between"
          >
            <HStack spacing={6} align="center" mb={isMobile ? 4 : 0}>
              <Avatar
                size="2xl"
                name={profile.username}
                src={profile.avatar_url || undefined}
              />
              <VStack align="flex-start" spacing={1}>
                <Heading size="lg">@{profile.username}</Heading>
                {profile.headline && (
                  <Text fontSize="md" fontWeight="medium">{profile.headline}</Text>
                )}
                {profile.location && (
                  <HStack>
                    <Icon as={FiMapPin} color="gray.500" />
                    <Text color="gray.600">{profile.location}</Text>
                  </HStack>
                )}
                <HStack spacing={2} mt={1}>
                  {profile.age && (
                    <Badge colorScheme="blue">{profile.age} years</Badge>
                  )}
                  {profile.gender && (
                    <Badge colorScheme="purple">{profile.gender}</Badge>
                  )}
                  <Badge colorScheme="green">Creator</Badge>
                </HStack>
              </VStack>
            </HStack>

            {currentUser && currentUser !== profile.id && (
              <Button
                leftIcon={<FiBookmark />}
                colorScheme={isSaved ? "red" : "blue"}
                variant={isSaved ? "outline" : "solid"}
                onClick={handleSaveCreator}
                isLoading={savingCreator}
                alignSelf={isMobile ? "stretch" : "flex-start"}
              >
                {isSaved ? "Remove from Saved" : "Save Creator"}
              </Button>
            )}
          </Flex>
        </Box>

        {/* Profile Content */}
        <VStack spacing={6} p={6} align="stretch">
          {/* Bio Section */}
          <Box>
            <Heading size="md" mb={3}>About</Heading>
            <Text>{profile.bio || "This creator hasn't added a bio yet."}</Text>
          </Box>

          <Divider />

          {/* Gallery Section */}
          <Box>
            <Heading size="md" mb={3} display="flex" alignItems="center">
              <Icon as={FiImage} mr={2} />
              Photo Gallery 
              <Badge ml={2} colorScheme="blue">{galleryImages.length} photos</Badge>
            </Heading>

            {galleryImages.length > 0 ? (
              <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={4}>
                {galleryImages.map((imageUrl, index) => (
                  <Box 
                    key={index} 
                    cursor="pointer" 
                    onClick={() => openGallery(index)}
                    borderRadius="md"
                    overflow="hidden"
                  >
                    <Image
                      src={imageUrl}
                      alt={`Gallery image ${index + 1}`}
                      height="150px"
                      width="100%"
                      objectFit="cover"
                      transition="transform 0.2s"
                      _hover={{ transform: 'scale(1.05)' }}
                    />
                  </Box>
                ))}
              </SimpleGrid>
            ) : (
              <Text color="gray.500">This creator hasn't added any photos to their gallery yet.</Text>
            )}
          </Box>
        </VStack>
      </Box>
    </Container>
  );
};

export default CreatorProfile; 