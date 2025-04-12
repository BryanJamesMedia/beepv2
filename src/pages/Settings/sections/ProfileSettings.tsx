import React, { useState, useEffect } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Avatar,
  Box,
  Text,
  useToast,
  HStack,
  FormErrorMessage,
  Input as FileInput,
  IconButton,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useSupabase } from '../../../contexts/SupabaseContext';
import { debounce } from 'lodash';

interface ProfileData {
  id: string;
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
}

const ProfileSettings: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const toast = useToast();
  const { supabase, user } = useSupabase();

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setProfile({
            id: data.id,
            username: data.username,
            display_name: data.display_name,
            bio: data.bio,
            avatar_url: data.avatar_url,
            location: data.location,
          });
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error',
          description: error.message,
          status: 'error',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, supabase]);

  const checkUsernameAvailability = async (username: string) => {
    if (!user) return false;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .neq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !data;
    } catch (error: any) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setSaving(true);
    try {
      const isAvailable = await checkUsernameAvailability(profile.username);
      if (!isAvailable) {
        setUsernameError('Username is already taken');
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          display_name: profile.display_name,
          bio: profile.bio,
          location: profile.location,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || !e.target.files[0] || !profile) return;

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile({
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        avatar_url: publicUrl,
      } as ProfileData);

      toast({
        title: "Success",
        description: "Avatar updated successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error updating avatar:", error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteAvatar = async () => {
    if (!profile || !profile.avatar_url) return;
    
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Extract file name from URL
      const fileName = profile.avatar_url.split('/').pop();
      
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([`avatars/${fileName}`]);

      if (deleteError) throw deleteError;

      setProfile({
        ...profile,
        avatar_url: undefined
      });

      toast({
        title: 'Profile picture removed',
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Error deleting avatar:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Box>Loading...</Box>;
  }

  if (!profile) {
    return <Box>Profile not found</Box>;
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            Profile Picture
          </Text>
          <VStack spacing={4}>
            <Avatar
              size="xl"
              name={profile?.username ?? ""}
              src={profile?.avatar_url ?? undefined}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
              id="avatar-upload"
            />
            <Button
              as="label"
              htmlFor="avatar-upload"
              colorScheme="blue"
              variant="outline"
            >
              Change Avatar
            </Button>
          </VStack>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!usernameError}>
              <FormLabel>Username</FormLabel>
              <Input
                placeholder="username"
                value={profile.username}
                onChange={(e) => {
                  setUsernameError("");
                  setProfile({ ...profile, username: e.target.value });
                }}
              />
              {usernameError && (
                <Text color="red.500" fontSize="sm">
                  {usernameError}
                </Text>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Display Name</FormLabel>
              <Input
                placeholder="How you want to be known"
                value={profile.display_name || ''}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Bio</FormLabel>
              <Input
                placeholder="Tell us about yourself"
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Location</FormLabel>
              <Input
                placeholder="Where you are"
                value={profile.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              isLoading={saving}
              loadingText="Saving..."
              isDisabled={!!usernameError || saving}
            >
              Save Changes
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default ProfileSettings; 