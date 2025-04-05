import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress
} from '@mui/material';
import { Message as MessageIcon } from '@mui/icons-material';

function Chat() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          mt: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <MessageIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          
          <Typography variant="h4" component="h1" gutterBottom>
            Chat Coming Soon
          </Typography>
          
          <Typography variant="body1" color="text.secondary" align="center">
            We're working on building an amazing chat experience for you.
            Check back soon!
          </Typography>

          <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Setting up chat functionality...
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Chat; 