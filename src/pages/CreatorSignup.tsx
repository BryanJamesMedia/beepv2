import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  InputGroup,
  InputRightElement,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  useToast,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

function CreatorSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { supabase } = useSupabase();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            role: 'creator'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create the creator profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              username,
              email,
              role: 'creator'
            }
          ]);

        if (profileError) throw profileError;

        toast({
          title: 'Success',
          description: 'Please check your email for the confirmation link',
          status: 'success',
          duration: 5000,
        });

        navigate('/login');
      }
    } catch (error: any) {
      toast({
        title: 'Error signing up',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={8}>
      <Card>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <Box textAlign="center">
              <Heading size="lg">Create Creator Account</Heading>
              <Text color="gray.600" mt={2}>
                Start building your community
              </Text>
            </Box>

            <form onSubmit={handleSignup}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FormControl>
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={loading}
                  width="full"
                >
                  Sign Up as Creator
                </Button>
              </VStack>
            </form>

            <Text textAlign="center">
              Already have an account?{' '}
              <Link as={RouterLink} to="/login" color="blue.500">
                Log in
              </Link>
            </Text>

            <Text textAlign="center">
              Want to join as a member?{' '}
              <Link as={RouterLink} to="/member-signup" color="blue.500">
                Sign up as Member
              </Link>
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
}

export default CreatorSignup; 