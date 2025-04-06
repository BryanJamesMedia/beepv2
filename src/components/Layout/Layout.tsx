import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  // Don't show header on auth pages
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <Box minH="100vh">
      <Container maxW="container.xl" py={4}>
        {children}
      </Container>
    </Box>
  );
}

export default Layout; 