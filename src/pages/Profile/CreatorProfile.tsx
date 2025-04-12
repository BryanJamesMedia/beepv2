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
import { FiArrowLeft, FiMapPin, FiBookmark, FiImage, FiInfo, FiMessageCircle } from 'react-icons/fi';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useWeavyChat } from '../../contexts/WeavyContext';

// Fix the interface to match React Router v6 useParams
interface CreatorProfileParams {
  [key: string]: string | undefined;
}

interface ProfileData {
  id: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  role: string;
}

interface GalleryImage {
  image_url: string;
}

interface CreatorProfileProps {
  creatorId: string;
}

const CreatorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { supabase, user } = useSupabase();
  const { weavyClient, isConnected, isLoading: weavyLoading } = useWeavyChat();
  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState<ProfileData | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [savingCreator, setSavingCreator] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [viewingGallery, setViewingGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isMobile = useBreakpointValue({ base: true, md: false });
  const toast = useToast();

  useEffect(() => {
    if (!user || !id) return;

    const fetchCreatorProfile = async () => {
      try {
        // Fetch creator profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (profileError) throw profileError;

        // Check if creator is saved
        const { data: savedData, error: savedError } = await supabase
          .from("saved_creators")
          .select("*")
          .eq("member_id", user.id)
          .eq("creator_id", id)
          .single();

        if (savedError && savedError.code !== "PGRST116") {
          throw savedError;
        }

        setCreator(profileData);
        setIsSaved(!!savedData);

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
      } catch (error: any) {
        console.error("Error fetching creator profile:", error);
        toast({
          title: "Error",
          description: error.message,
          status: "error",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorProfile();
  }, [id, user, supabase]);

  const handleSaveCreator = async () => {
    if (!user) return;

    try {
      setSavingCreator(true);
      if (isSaved) {
        // Remove from saved creators
        const { error } = await supabase
          .from("saved_creators")
          .delete()
          .eq("member_id", user.id)
          .eq("creator_id", id);

        if (error) throw error;
        setIsSaved(false);
        toast({
          title: "Success",
          description: "Creator removed from saved list",
          status: "success",
          duration: 3000,
        });
      } else {
        // Add to saved creators
        const { error } = await supabase
          .from("saved_creators")
          .insert([{ member_id: user.id, creator_id: id }]);

        if (error) throw error;
        setIsSaved(true);
        toast({
          title: "Success",
          description: "Creator added to saved list",
          status: "success",
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error("Error saving creator:", error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setSavingCreator(false);
    }
  };

  const handleStartChat = async () => {
    if (!user || !creator || !weavyClient || !isConnected) return;

    try {
      const conversation = await weavyClient.conversations.create({
        title: `Chat with ${creator.username}`,
        participants: [user.id, id],
      });

      toast({
        title: "Success",
        description: "Chat started with creator",
        status: "success",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error starting chat:", error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
      });
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

  if (!creator) {
    return (
      <Center minH="100vh">
        <VStack spacing={4}>
          <Icon as={FiInfo} boxSize={10} color="red.500" />
          <Heading size="md">Creator not found</Heading>
          <Button onClick={() => window.history.back()}>Back</Button>
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
        onClick={() => window.history.back()}
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
                name={creator.username}
                src={creator.avatar_url || undefined}
              />
              <VStack align="flex-start" spacing={1}>
                <Heading size="lg">@{creator.username}</Heading>
                {creator.display_name && (
                  <Text fontSize="md" fontWeight="medium">{creator.display_name}</Text>
                )}
                {creator.location && (
                  <HStack>
                    <Icon as={FiMapPin} color="gray.500" />
                    <Text color="gray.600">{creator.location}</Text>
                  </HStack>
                )}
              </VStack>
            </HStack>

            {user && user.id !== creator.id && (
              <VStack spacing={2} alignSelf={isMobile ? "stretch" : "flex-start"}>
                <Button
                  leftIcon={<FiBookmark />}
                  colorScheme={isSaved ? "red" : "blue"}
                  variant={isSaved ? "outline" : "solid"}
                  onClick={handleSaveCreator}
                  isLoading={savingCreator}
                  w="full"
                >
                  {isSaved ? "Remove from Saved" : "Save Creator"}
                </Button>
                
                <Button
                  leftIcon={<FiMessageCircle />}
                  colorScheme="green"
                  onClick={handleStartChat}
                  isLoading={weavyLoading}
                  isDisabled={!isConnected}
                  w="full"
                >
                  {weavyLoading ? "Connecting..." : "Start Chat"}
                </Button>
              </VStack>
            )}
          </Flex>
        </Box>

        {/* Profile Content */}
        <VStack spacing={6} p={6} align="stretch">
          {/* Bio Section */}
          <Box>
            <Heading size="md" mb={3}>About</Heading>
            <Text>{creator.bio || "This creator hasn't added a bio yet."}</Text>
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