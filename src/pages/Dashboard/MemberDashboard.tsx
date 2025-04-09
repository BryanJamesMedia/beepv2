import React from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  Badge,
  HStack,
} from '@chakra-ui/react';
import TopMenu from '../../components/TopMenu';
import AddFriends from '../../components/Dashboard/AddFriends';

function MemberDashboard() {
  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={6} align="stretch">
        <TopMenu />
        <Heading size="lg">Member Dashboard</Heading>

        <AddFriends userRole="member" />

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Your Activity</Heading>
                <HStack justify="space-between">
                  <Text>Messages Sent</Text>
                  <Badge colorScheme="blue">0</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text>Communities Joined</Text>
                  <Badge colorScheme="green">0</Badge>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">Recent Communities</Heading>
                <Text color="gray.500">No communities joined yet</Text>
              </VStack>
            </CardBody>
          </Card>
        </Grid>
      </VStack>
    </Container>
  );
}

export default MemberDashboard; 