import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Button,
  useToast,
} from "@chakra-ui/react";
import { FiMessageCircle, FiEye } from "react-icons/fi";
import { useSupabase } from "../../contexts/SupabaseContext";
import { useWeavyChat } from "../../contexts/WeavyContext";
import { useNavigate } from "react-router-dom";

interface SavedCreator {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
}

const SavedCreatorsList: React.FC = () => {
  const [savedCreators, setSavedCreators] = useState<SavedCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { supabase, user } = useSupabase();
  const { weavyClient, isConnected, isLoading: weavyLoading } = useWeavyChat();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchSavedCreators = async () => {
      try {
        // First, get the saved creator IDs
        const { data: savedData, error: savedError } = await supabase
          .from("saved_creators")
          .select("creator_id")
          .eq("member_id", user.id);

        if (savedError) throw savedError;

        if (!savedData || savedData.length === 0) {
          setSavedCreators([]);
          setLoading(false);
          return;
        }

        // Then, get the creator profiles
        const creatorIds = savedData.map(item => item.creator_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, avatar_url, bio")
          .in("id", creatorIds);

        if (profilesError) throw profilesError;

        if (profilesData) {
          setSavedCreators(profilesData.map(profile => ({
            id: profile.id,
            username: profile.username,
            avatar_url: profile.avatar_url,
            bio: profile.bio,
          })));
        }
      } catch (error: any) {
        console.error("Error fetching saved creators:", error);
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

    fetchSavedCreators();
  }, [user, supabase]);

  const handleStartChat = async (creatorId: string, creatorUsername: string) => {
    if (!user || !weavyClient || !isConnected) return;

    try {
      const conversation = await weavyClient.conversations.create({
        title: `Chat with ${creatorUsername}`,
        participants: [user.id, creatorId],
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

  const handleViewProfile = (creatorId: string) => {
    navigate(`/creator/${creatorId}`);
  };

  if (loading) {
    return <Box>Loading...</Box>;
  }

  if (savedCreators.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">No saved creators yet</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {savedCreators.map((creator) => (
        <Box
          key={creator.id}
          p={4}
          borderWidth="1px"
          borderRadius="md"
          _hover={{ bg: "gray.50" }}
        >
          <HStack justify="space-between">
            <HStack spacing={3}>
              <Avatar
                size="md"
                name={creator.username}
                src={creator.avatar_url}
              />
              <Box>
                <Text fontWeight="bold">
                  {creator.username}
                </Text>
                {creator.bio && (
                  <Text fontSize="sm" color="gray.600" noOfLines={1}>
                    {creator.bio}
                  </Text>
                )}
              </Box>
            </HStack>
            <HStack spacing={2}>
              <Button
                leftIcon={<FiEye />}
                colorScheme="blue"
                variant="outline"
                size="sm"
                onClick={() => handleViewProfile(creator.id)}
              >
                View
              </Button>
              <Button
                leftIcon={<FiMessageCircle />}
                colorScheme="blue"
                size="sm"
                onClick={() => handleStartChat(creator.id, creator.username)}
                isLoading={weavyLoading}
                isDisabled={!isConnected}
              >
                Chat
              </Button>
            </HStack>
          </HStack>
        </Box>
      ))}
    </VStack>
  );
};

export default SavedCreatorsList; 