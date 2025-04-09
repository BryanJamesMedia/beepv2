import React from 'react';
import {
  Container,
  VStack,
  Card,
  CardBody,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Button,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { CreatorProfileSettings } from './sections/CreatorProfileSettings';

function CreatorSettings() {
  const toast = useToast();

  return (
    <Container maxW="container.md" py={6}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Creator Settings</Heading>
        <CreatorProfileSettings />
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Creator Name</FormLabel>
                <Input placeholder="Your creator name" />
              </FormControl>

              <FormControl>
                <FormLabel>Bio</FormLabel>
                <Input placeholder="Tell your community about yourself" />
              </FormControl>

              <Divider />

              <Heading size="md">Community Settings</Heading>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Allow Direct Messages</FormLabel>
                <Switch />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Community Notifications</FormLabel>
                <Switch />
              </FormControl>

              <Button colorScheme="blue">Save Changes</Button>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}

export default CreatorSettings; 