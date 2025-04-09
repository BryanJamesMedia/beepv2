import React from 'react';
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
} from '@chakra-ui/react';
import { AddIcon, ChatIcon } from '@chakra-ui/icons';
import TopMenu from '../../components/TopMenu';

function CreatorDashboard() {
  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={6} align="stretch">
        <TopMenu />
        <Heading size="lg">Creator Dashboard</Heading>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Members</StatLabel>
                <StatNumber>0</StatNumber>
                <StatHelpText>Active community members</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Messages Today</StatLabel>
                <StatNumber>0</StatNumber>
                <StatHelpText>Across all channels</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Active Channels</StatLabel>
                <StatNumber>0</StatNumber>
                <StatHelpText>Chat channels</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

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