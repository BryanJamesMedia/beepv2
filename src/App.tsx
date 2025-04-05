import React from 'react';
import * as Ably from 'ably';
import { ChatClient, ChatClientProvider, ChatRoomProvider } from '@ably/chat';
import { Messages } from './Messages';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme/theme';
import Layout from './components/Layout';

// Initialize an Ably Realtime client
const ablyClient = new Ably.Realtime({
  clientId: 'ably-chat',
  key: 'NG-WuQ.Vu-PjQ:PobNc11IPxjtkjRtIvD2ElwE8fn_MzoT7VOy_Ji56gc'
});

// Create the chat client
const chatClient = new ChatClient(ablyClient, {});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ChatClientProvider client={chatClient}>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/chat" element={<Chat />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ChatClientProvider>
    </ThemeProvider>
  );
}

export default App;
