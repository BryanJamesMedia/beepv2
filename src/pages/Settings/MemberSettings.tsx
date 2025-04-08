import React, { useState } from 'react';
import {
  Container,
  VStack,
  HStack,
  Box,
  Heading,
  Text,
  Icon,
  Divider,
  useColorModeValue,
  useBreakpointValue,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { FiUser, FiSettings, FiLock, FiUsers, FiBell, FiHelpCircle, FiMenu } from 'react-icons/fi';
import { BiWallet, BiQr } from 'react-icons/bi';
import { MdPayment } from 'react-icons/md';
import { ProfileSettings } from './sections/ProfileSettings';

// Define the menu items and their icons
const menuItems = [
  { id: 'profile', label: 'Profile', icon: FiUser, component: 'Profile Settings' },
  { id: 'account', label: 'Account', icon: FiSettings, component: 'Account Settings' },
  { id: 'privacy', label: 'Privacy', icon: FiLock, component: 'Privacy Settings' },
  { id: 'billing', label: 'Billing', icon: MdPayment, component: 'Billing Settings' },
  { id: 'wallet', label: 'Wallet', icon: BiWallet, component: 'Wallet Settings' },
  { id: 'qr-code', label: 'QR Code', icon: BiQr, component: 'QR Code Settings' },
  { id: 'friends', label: 'Friends', icon: FiUsers, component: 'Friends Settings' },
  { id: 'notifications', label: 'Notifications', icon: FiBell, component: 'Notification Settings' },
  { id: 'help', label: 'Help Center', icon: FiHelpCircle, component: 'Help Center' },
];

function MemberSettings() {
  const [activeSection, setActiveSection] = useState('profile');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.600', 'blue.200');

  const MenuItems = () => (
    <VStack align="stretch" spacing={1}>
      {menuItems.map((item) => (
        <Box
          key={item.id}
          p={3}
          cursor="pointer"
          borderRadius="md"
          bg={activeSection === item.id ? activeBg : 'transparent'}
          color={activeSection === item.id ? activeColor : 'inherit'}
          onClick={() => {
            setActiveSection(item.id);
            if (isMobile) onClose();
          }}
          _hover={{ bg: activeSection === item.id ? activeBg : hoverBg }}
          transition="all 0.2s"
        >
          <HStack spacing={3}>
            <Icon as={item.icon} boxSize={5} />
            <Text fontWeight={activeSection === item.id ? "semibold" : "normal"}>
              {item.label}
            </Text>
          </HStack>
        </Box>
      ))}
    </VStack>
  );

  const renderContent = () => {
    console.log('renderContent called, activeSection:', activeSection);
    switch(activeSection) {
      case 'profile':
        console.log('Rendering ProfileSettings component');
        return <ProfileSettings />;
      // Add other cases for different sections
      default:
        return (
          <Text color="gray.500">
            Select a section from the menu
          </Text>
        );
    }
  };

  return (
    <Container maxW="container.xl" py={6}>
      {/* Mobile Header */}
      {isMobile && (
        <HStack mb={6} justify="space-between">
          <Heading size="lg">{menuItems.find(item => item.id === activeSection)?.label}</Heading>
          <IconButton
            aria-label="Open menu"
            icon={<FiMenu />}
            onClick={onOpen}
            variant="ghost"
          />
        </HStack>
      )}

      {/* Desktop Header */}
      {!isMobile && <Heading mb={6}>Member Settings</Heading>}

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Settings Menu</DrawerHeader>
          <DrawerCloseButton />
          <DrawerBody>
            <MenuItems />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Desktop Layout */}
      <HStack align="start" spacing={8}>
        {/* Settings Menu - Only show on desktop */}
        {!isMobile && (
          <Box
            w="250px"
            borderRight="1px"
            borderColor={borderColor}
            pr={4}
            position="sticky"
            top="20px"
          >
            <MenuItems />
          </Box>
        )}

        {/* Settings Content */}
        <Box flex="1">
          <Box
            bg="white"
            borderRadius="lg"
            p={6}
            boxShadow="sm"
            borderWidth="1px"
            borderColor={borderColor}
          >
            {!isMobile && (
              <Heading size="md" mb={6}>
                {menuItems.find(item => item.id === activeSection)?.label}
              </Heading>
            )}
            
            {renderContent()}
          </Box>
        </Box>
      </HStack>
    </Container>
  );
}

export default MemberSettings; 