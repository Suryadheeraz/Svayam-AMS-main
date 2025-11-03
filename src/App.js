
// src/App.js

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  CssBaseline,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Grid,
  Paper,
  Avatar,
  TextField,
  InputAdornment,
  Stack,
  Menu,
  MenuItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search'; // <--- ADD THIS LINE
import NotificationsIcon from '@mui/icons-material/Notifications';
import { alpha } from '@mui/material/styles';

import EngineerTicketDetail from './components/EngineerTicketDetail';

import Chatbot from './components/Chatbot/Chatbot';
import UserSidebar from './components/UserSidebar';

import AdminManagementPanel from './components/Admin/AdminManagementPanel';
import KnowledgeBaseManagement from './components/Admin/KnowledgeBaseManagement';
import RecentConversationList from './components/Admin/RecentConversationList';
import AdminSidebar from './components/AdminSidebar';

import customLogo from './images/searching.png';

// --- Mock Data for Conversations ---
const initialConversations = [
  {
    id: 'CONV001',
    topic: 'Login Issues with SSO',
    startDate: '2024-01-15',
    isResolved: false,
    messages: [
      { sender: 'user', text: 'I cannot log in using SSO. Password reset not working.' },
      { sender: 'ai', text: 'I understand. Have you tried clearing your browser cache and cookies?' },
      { sender: 'user', text: 'Yes, I tried that and still no luck.' },
      { sender: 'ai', text: 'Okay. Can you verify your username and which SSO provider you are trying to use?' },
    ],
    user: 'John Doe',
    category: 'Account Access',
    priority: 'High',
  },
  {
    id: 'CONV002',
    topic: 'Dashboard Loading Slowly',
    startDate: '2024-01-14',
    isResolved: true,
    resolvedDate: '2024-01-15',
    messages: [
      { sender: 'user', text: 'My dashboard is loading very slowly, takes forever to show data.' },
      { sender: 'ai', text: 'I see. This sounds like a performance issue. Have you tried using a different browser or checking your internet speed?' },
      { sender: 'user', text: 'Yes, confirmed it\'s slow on multiple browsers and my internet is fast.' },
      { sender: 'ai', text: 'Thank you for the details. The engineering team is investigating. In the meantime, try reducing the data range you are viewing. If you need a quick overview, the summarized reports might be faster.' },
      { sender: 'user', text: 'Okay, I\'ll try that. Thanks for the tip!' }
    ],
    resolutionNotes: `Solution for Dashboard Loading Slowly:
1. Try refreshing the page after 5 minutes.
2. Check your internet connection speed.
3. If using a VPN, try disconnecting and reconnecting.
4. Reduce the data range of the dashboard view if possible.
5. The IT team is aware of potential performance issues and is working on database optimization. Your patience is appreciated.`,
    user: 'Alice Smith',
    category: 'Performance',
    priority: 'Medium',
  },
  {
    id: 'CONV003',
    topic: 'API Rate Limiting Error',
    startDate: '2024-01-13',
    isResolved: false,
    messages: [
      { sender: 'user', text: 'Getting 429 errors when making API calls to the external service. Our application is becoming unstable due to this.' },
      { sender: 'ai', text: 'I understand you are encountering API rate limiting issues. Can you provide the API endpoint and the approximate time the errors started?' }
    ],
    user: 'Hrishikesh Kumar',
    category: 'API Integration',
    priority: 'Critical',
  },
  {
    id: 'CONV004',
    topic: 'Email Notifications Failing',
    startDate: '2024-01-16',
    isResolved: false,
    messages: [
      { sender: 'user', text: 'Users are not receiving email notifications for critical system events. Checked email server, seems fine.' },
    ],
    user: 'Bob Engineer',
    category: 'Notifications',
    priority: 'High',
  },
];


// Mock User Data
const initialUsers = [
  { id: 'usr001', name: 'John Doe', email: 'john.doe@company.com', role: 'Admin', lastLogin: '2 hours ago' },
  { id: 'usr002', name: 'Hrishikesh Kumar', email: 'hrishikeskumar@it.com', role: 'Support Agent', lastLogin: '2 days ago' },
  { id: 'usr003', name: 'Alice Smith', email: 'alice.smith@company.com', role: 'Customer', lastLogin: '3 hours ago' },
  { id: 'usr004', name: 'Bob Engineer', email: 'bob@company.com', role: 'Contact', lastLogin: '3 days ago' },
];


// const drawerWidth = 280;
// const collapsedDrawerWidth = 60;
// const adminSidebarWidth = 240;
const appBarHeight = 64;

function App() {
  const [conversations, setConversations] = useState(initialConversations);
  const [users, setUsers] = useState(initialUsers);
  const [currentUserRole, setCurrentUserRole] = useState('user');
  const [selectedConversationForAdmin, setSelectedConversationForAdmin] = useState(null);
  const [selectedAdminTab, setSelectedAdminTab] = useState('dashboard');

  const [currentConversationId, setCurrentConversationId] = useState(
    initialConversations.length > 0 ? initialConversations[0].id : null
  );
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [anchorEl, setAnchorEl] = useState(null);
  const openRoleMenu = Boolean(anchorEl);

  // Define global user information for the header
  // This will dynamically change based on the currentUserRole
  const globalUserDisplayName = currentUserRole === 'admin' ? 'Admin User' : 'John Doe';
  const globalUserEmail = currentUserRole === 'admin' ? 'admin@it.com' : 'johndoe@it.com';


  // Stats calculation
  const stats = useMemo(() => {
    const totalConversations = conversations.length;
    const openConversations = conversations.filter(c => !c.isResolved).length;
    const resolvedConversations = conversations.filter(c => c.isResolved).length;
    const aiAssistedConversations = conversations.filter(c => c.messages.some(m => m.sender === 'ai')).length;
    const aiCosts = conversations.reduce((sum, c) => {
        const aiMessagesCount = c.messages.filter(m => m.sender === 'ai').length;
        return sum + (aiMessagesCount * 0.005);
    }, 0);

    return {
      open: openConversations,
      inProgress: 0,
      resolved: resolvedConversations,
      total: totalConversations,
      aiAssisted: aiAssistedConversations,
      aiCosts: aiCosts
    };
  }, [conversations]);

  useEffect(() => {
    if (currentUserRole === 'user' && !currentConversationId && conversations.length > 0) {
      setCurrentConversationId(conversations[0].id);
    }
    if (currentUserRole !== 'admin' && selectedConversationForAdmin) {
      setSelectedConversationForAdmin(null);
    }
    if (currentUserRole !== 'user' && currentConversationId) {
      setCurrentConversationId(null);
    }
  }, [currentUserRole, currentConversationId, conversations, selectedConversationForAdmin]);


  const handleRoleChange = (newRole) => {
    if (newRole !== null) {
      setCurrentUserRole(newRole);
      setSelectedConversationForAdmin(null);
      if (newRole === 'user') {
          const firstUnresolvedConv = initialConversations.find(conv => !conv.isResolved);
          setCurrentConversationId(firstUnresolvedConv ? firstUnresolvedConv.id : null);
      } else {
          setCurrentConversationId(null);
      }
    }
    handleCloseRoleMenu();
  };

  const handleNewChat = () => {
    const newConvId = `CONV${String(conversations.length + 1).padStart(3, '0')}`;
    const newConversation = {
      id: newConvId,
      topic: 'New Chat',
      startDate: new Date().toISOString().split('T')[0],
      isResolved: false,
      messages: [{ sender: 'ai', text: "Hello! How can I help you with a new issue today?" }],
      user: 'John Doe',
      category: 'General Inquiry',
      priority: 'Low',
    };
    setConversations((prevConversations) => [newConversation, ...prevConversations]);
    setCurrentConversationId(newConvId);
  };

  const handleSendMessageToChatbot = async (message) => {
    if (message.trim() === '' || !currentConversationId) return;

    setChatLoading(true);
    const userMessage = message.trim();

    setConversations(prev => prev.map(conv =>
      conv.id === currentConversationId
        ? { ...conv, messages: [...conv.messages, { sender: 'user', text: userMessage }] }
        : conv
    ));

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const dummyChatResponses = [
        "Hello! I'm your TicketAI assistant. How can I help you today?",
        "Please provide more details.",
        "I can summarize information or suggest next steps.",
        "That's an interesting problem. Let me check the knowledge base...",
        "Could you elaborate more on the symptoms?",
        "Thank you for the information. I'm processing your request.",
        "I am just a demo chatbot for now, but I can simulate helpful responses!",
      ];
      const randomIndex = Math.floor(Math.random() * dummyChatResponses.length);
      const aiResponseText = dummyChatResponses[randomIndex];

      setConversations(prev => prev.map(conv =>
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, { sender: 'ai', text: aiResponseText }] }
          : conv
      ));
    } catch (error) {
      console.error('Error simulating chatbot response:', error);
      setConversations(prev => prev.map(conv =>
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, { sender: 'ai', text: 'Oops! Something went wrong. Please try again.' }] }
          : conv
      ));
    } finally {
      setChatLoading(false);
      setChatInput('');
    }
  };

  const handleMarkConversationResolved = (conversationId, solutionText) => {
    setConversations(prevConversations =>
      prevConversations.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            isResolved: true,
            resolvedDate: new Date().toLocaleDateString(),
            resolutionNotes: solutionText,
            messages: [...conv.messages, {sender: 'ai', text: `This conversation was marked as resolved by the user.`}],
            feedbackGiven: false,
          };
        }
        return conv;
      })
    );
    alert(`Conversation ${conversationId} marked as resolved!`);
  };

  const handleResolveConversationForAdmin = (conversationId, resolutionNotes) => {
    setConversations(prevConversations =>
      prevConversations.map(conv =>
        conv.id === conversationId && !conv.isResolved
          ? {
              ...conv,
              isResolved: true,
              resolvedDate: new Date().toLocaleDateString(),
              messages: [...conv.messages, {sender: 'ai', text: `This conversation was marked as resolved by Admin with notes: "${resolutionNotes}"`}],
              resolutionNotes: resolutionNotes,
              feedbackGiven: false,
            }
          : conv
      )
    );
    setSelectedConversationForAdmin(null);
    alert(`Conversation ${conversationId} resolved successfully by Admin!`);
  };

  const handleAddUser = (newUser) => {
    const newId = `usr${String(users.length + 1).padStart(3, '0')}`;
    setUsers((prevUsers) => [...prevUsers, { ...newUser, id: newId, lastLogin: 'Just now' }]);
  };

  const handleUpdateUser = (userId, updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === userId ? updatedUser : user))
    );
  };

  const handleDeleteUser = (userId) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
  };

  const handleOpenRoleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseRoleMenu = () => {
    setAnchorEl(null);
  };


  const currentConversation = useMemo(() => {
    return conversations.find(conv => conv.id === currentConversationId) || null;
  }, [currentConversationId, conversations]);

  const adminSelectedConversation = useMemo(() => {
    return conversations.find(conv => conv.id === selectedConversationForAdmin?.id) || null;
  }, [selectedConversationForAdmin, conversations]);


  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', bgcolor: '#f8fafc' }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          borderBottom: '1px solid',
          borderColor: '#e2e8f0',
          borderRadius: 0,
        }}
        elevation={0}
      >
        <Toolbar>
          {currentUserRole === 'user' && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              edge="start"
              sx={{ mr: 2, color: '#1e293b' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Branding and Global Controls in AppBar */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            {/* Left section: Logo and App Name */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                component="img"
                src={customLogo}
                alt="SVAYAM-AMS Logo"
                sx={{
                  height: 32,
                  width: 'auto',
                  color: 'primary.main',
                }}
              />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', whiteSpace: 'nowrap' }}>
                SVAYAM-AMS: Intelligent Support Specialist
              </Typography>
            </Stack>

            {/* Right section: Global User Info & Role Switcher */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton sx={{ color: '#64748b' }}>
                <NotificationsIcon />
              </IconButton>
              {/* Make Avatar and Text clickable to open role menu */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                onClick={handleOpenRoleMenu}
                sx={{ cursor: 'pointer', p: 0.5, borderRadius: 1, '&:hover': { bgcolor: 'grey.100' } }}
              >
                {/* Dynamically get avatar initial and name/email */}
                <Avatar sx={{ bgcolor: 'grey.300', color: 'text.primary', fontWeight: 'bold', width: 36, height: 36 }}>
                  {globalUserDisplayName?.charAt(0) || 'JD'}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    {globalUserDisplayName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {globalUserEmail}
                  </Typography>
                </Box>
              </Stack>

              {/* Role Menu */}
              <Menu
                id="role-menu"
                anchorEl={anchorEl}
                open={openRoleMenu}
                onClose={handleCloseRoleMenu}
                MenuListProps={{
                  'aria-labelledby': 'role-button',
                }}
              >
                <MenuItem onClick={() => handleRoleChange('user')} selected={currentUserRole === 'user'}>
                  User
                </MenuItem>
                <MenuItem onClick={() => handleRoleChange('admin')} selected={currentUserRole === 'admin'}>
                  Admin
                </MenuItem>
              </Menu>

            </Stack>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flexGrow: 1, mt: `${appBarHeight}px`, width: '100%' }}>

        {currentUserRole === 'user' && (
          <>
            <UserSidebar
              conversations={conversations}
              onNewChat={handleNewChat}
              onSelectConversation={setCurrentConversationId}
              currentConversationId={currentConversationId}
              // userDisplayName="John Doe" // REMOVED
              // userEmail="johndoe@it.com" // REMOVED
              sidebarOpen={sidebarOpen}
              appBarHeight={appBarHeight}
            />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                bgcolor: '#f8fafc',
                // ml: sidebarOpen ? `${drawerWidth}px` : `${collapsedDrawerWidth}px`, // REMOVED
                transition: (theme) => theme.transitions.create('margin', {
                  easing: theme.transitions.easing.easeOut,
                  duration: theme.transitions.duration.enteringScreen,
                }),
                display: 'flex',
                flexDirection: 'column',
                height: `calc(100vh - ${appBarHeight}px)`,
                overflow: 'hidden',
              }}
            >
              <Chatbot
                currentConversation={currentConversation}
                onSendMessage={handleSendMessageToChatbot}
                chatInput={chatInput}
                setChatInput={setChatInput}
                chatLoading={chatLoading}
                onMarkConversationResolved={handleMarkConversationResolved}
              />
            </Box>
          </>
        )}

        {/* ADMIN DASHBOARD WITH SIDEBAR */}
        {currentUserRole === 'admin' && (
          <>
            <AdminSidebar
              selectedTab={selectedAdminTab}
              onTabChange={setSelectedAdminTab}
              appBarHeight={appBarHeight}
            />
            <Box // Admin content area
              component="main"
              sx={{
                flexGrow: 1,
                bgcolor: '#f1f5f9',
                p: 4,
                minHeight: `calc(100vh - ${appBarHeight}px)`,
                overflow: 'auto',
                boxSizing: 'border-box',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f5f9',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#cbd5e1',
                  borderRadius: '4px',
                },
              }}
            >
              {/* DASHBOARD TAB */}
              {selectedAdminTab === 'dashboard' && (
                <>
                  {/* Dashboard Header - now only shows title, the user/notifications elements are in AppBar */}
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Dashboard
                    </Typography>
                    {/* Placeholder for any other elements you might want to add here later */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    </Box>
                  </Box>

                  {/* Search Bar */}
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#94a3b8' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        bgcolor: '#ffffff',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1,
                          '& fieldset': {
                            borderColor: '#e2e8f0',
                          },
                        }
                      }}
                    />
                  </Box>

                  {/* Stats Cards */}
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper elevation={0} sx={{ p: 3, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 1 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
                          {users.length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                          Total Users
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper elevation={0} sx={{ p: 3, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 1 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
                          {stats.open}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                          Open Tickets
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper elevation={0} sx={{ p: 3, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 1 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
                          {stats.resolved}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                          Resolved Tickets
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper elevation={0} sx={{ p: 3, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 1 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
                          875
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                          Articles in KB
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* User Management and Knowledge Base Side by Side */}
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} lg={6}>
                      <Paper elevation={0} sx={{
                        bgcolor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        height: 600,
                        overflow: 'hidden',
                      }}>
                        <AdminManagementPanel
                          users={users}
                          onAddUser={handleAddUser}
                          onUpdateUser={handleUpdateUser}
                          onDeleteUser={handleDeleteUser}
                        />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} lg={6}>
                      <Paper elevation={0} sx={{
                        bgcolor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 1,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        height: 600
                      }}>
                        <KnowledgeBaseManagement />
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Recent Conversations */}
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Paper elevation={0} sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 1, overflow: 'hidden' }}>
                        <Box sx={{
                          p: 2.5,
                          borderBottom: '1px solid #e2e8f0'
                        }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            Recent Conversations
                          </Typography>
                        </Box>
                        <Box sx={{ p: 3 }}>
                          <RecentConversationList
                            conversations={conversations}
                            users={users}
                            onConversationClick={(conv) => setSelectedConversationForAdmin(conv)}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Conversation Detail View (if selected) */}
                  {adminSelectedConversation && (
                    <Paper
                      elevation={0}
                      sx={{
                        mt: 3,
                        border: '1px solid #e2e8f0',
                        borderRadius: 1,
                        overflow: 'hidden',
                        bgcolor: '#ffffff'
                      }}
                    >
                      <Box sx={{
                        p: 3,
                        bgcolor: alpha('#3b82f6', 0.03),
                        borderBottom: '1px solid #e2e8f0'
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          Conversation Details
                        </Typography>
                      </Box>
                      <Box sx={{ p: 3 }}>
                        <EngineerTicketDetail
                          ticket={{
                            id: adminSelectedConversation.id,
                            title: adminSelectedConversation.topic,
                            description: adminSelectedConversation.messages.map(m => `${m.sender}: ${m.text}`).join('\n\n'),
                            status: adminSelectedConversation.isResolved ? 'resolved' : 'open',
                            priority: adminSelectedConversation.priority || 'Medium',
                            user: adminSelectedConversation.user,
                            createdAt: adminSelectedConversation.startDate,
                            engineerNotes: adminSelectedConversation.resolutionNotes || '',
                            llmSuggestion: 'AI Chat conversation. Review messages above.',
                            llmCost: 0,
                            llmTokens: 0,
                            llmModel: '',
                          }}
                          onBack={() => setSelectedConversationForAdmin(null)}
                          onResolveTicket={(convId, resolutionNotes) => handleResolveConversationForAdmin(convId, resolutionNotes)}
                          onLLMSuggestion={() => alert('LLM Suggestion not directly applicable here; conversation history provides context.')}
                        />
                      </Box>
                    </Paper>
                  )}
                </>
              )}

              {/* USERS TAB */}
              {selectedAdminTab === 'users' && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      User Management
                    </Typography>
                  </Box>
                  <Paper elevation={0} sx={{
                    bgcolor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: 'calc(100vh - 200px)',
                    overflow: 'hidden',
                  }}>
                    <AdminManagementPanel
                      users={users}
                      onAddUser={handleAddUser}
                      onUpdateUser={handleUpdateUser}
                      onDeleteUser={handleDeleteUser}
                    />
                  </Paper>
                </>
              )}

              {/* KNOWLEDGE BASE TAB */}
              {selectedAdminTab === 'knowledge-base' && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Knowledge Base
                    </Typography>
                  </Box>
                  <Paper elevation={0} sx={{
                    bgcolor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 1,
                    overflow: 'hidden',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    height: 'calc(100vh - 200px)'
                  }}>
                    <KnowledgeBaseManagement />
                  </Paper>
                </>
              )}

              {/* CONVERSATIONS TAB */}
              {selectedAdminTab === 'conversations' && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      All Conversations
                    </Typography>
                  </Box>
                  <Paper elevation={0} sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 1, overflow: 'hidden' }}>
                    <Box sx={{
                      p: 2.5,
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        Conversation List
                      </Typography>
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <RecentConversationList
                        conversations={conversations}
                        users={users}
                        onConversationClick={(conv) => setSelectedConversationForAdmin(conv)}
                      />
                    </Box>
                  </Paper>

                  {/* Conversation Detail View (if selected) */}
                  {adminSelectedConversation && (
                    <Paper
                      elevation={0}
                      sx={{
                        mt: 3,
                        border: '1px solid #e2e8f0',
                        borderRadius: 1,
                        overflow: 'hidden',
                        bgcolor: '#ffffff'
                      }}
                    >
                      <Box sx={{
                        p: 3,
                        bgcolor: alpha('#3b82f6', 0.03),
                        borderBottom: '1px solid #e2e8f0'
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          Conversation Details
                        </Typography>
                      </Box>
                      <Box sx={{ p: 3 }}>
                        <EngineerTicketDetail
                          ticket={{
                            id: adminSelectedConversation.id,
                            title: adminSelectedConversation.topic,
                            description: adminSelectedConversation.messages.map(m => `${m.sender}: ${m.text}`).join('\n\n'),
                            status: adminSelectedConversation.isResolved ? 'resolved' : 'open',
                            priority: adminSelectedConversation.priority || 'Medium',
                            user: adminSelectedConversation.user,
                            createdAt: adminSelectedConversation.startDate,
                            engineerNotes: adminSelectedConversation.resolutionNotes || '',
                            llmSuggestion: 'AI Chat conversation. Review messages above.',
                            llmCost: 0,
                            llmTokens: 0,
                            llmModel: '',
                          }}
                          onBack={() => setSelectedConversationForAdmin(null)}
                          onResolveTicket={(convId, resolutionNotes) => handleResolveConversationForAdmin(convId, resolutionNotes)}
                          onLLMSuggestion={() => alert('LLM Suggestion not directly applicable here; conversation history provides context.')}
                        />
                      </Box>
                    </Paper>
                  )}
                </>
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

export default App;