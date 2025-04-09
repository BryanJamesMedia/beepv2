import React from 'react';
import {
  Box,
  VStack,
  Heading,
  SimpleGrid,
  Button,
  Icon,
  Text,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  Avatar,
  useToast,
} from '@chakra-ui/react';
import { FiUserPlus, FiSearch, FiShare2 } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../../config/supabase';

const toast = useToast();

const AddFriends = () => {
  // ... rest of the component code

  // Replace QRCode component with QRCodeSVG
  <QRCodeSVG value={qrCodeValue()} size={200} />

  // ... rest of the component code
};

export default AddFriends; 