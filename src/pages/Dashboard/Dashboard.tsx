import React from 'react';
import { Box, Container, Heading } from '@chakra-ui/react';

function Dashboard() {
  return (
    <Container maxW="container.lg" py={6}>
      <Box>
        <Heading size="lg">Dashboard</Heading>
        {/* Add your dashboard content here */}
      </Box>
    </Container>
  );
}

export default Dashboard; 