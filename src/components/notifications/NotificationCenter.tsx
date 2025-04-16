import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Divider,
  Chip,
  Badge,
  Tabs,
  Tab,
  Button,
  Menu,
  MenuItem,
  Fade,
  Tooltip,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Icons
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import BarChartIcon from '@mui/icons-material/BarChart';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CelebrationIcon from '@mui/icons-material/Celebration';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import { format } from 'date-fns';

// Styled components
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}));

// Types
interface Notification {
  id: string;
  type: 'achievement' | 'reminder' | 'insight' | 'streak' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  icon?: React.ReactNode;
}

// Helper function to get the icon for a notification type
const getNotificationIcon = (type: Notification['type'], theme: any) => {
  switch (type) {
    case 'achievement':
      return <EmojiEventsIcon sx={{ color: theme.palette.warning.main }} />;
    case 'reminder':
      return <NotificationsIcon sx={{ color: theme.palette.info.main }} />;
    case 'insight':
      return <TipsAndUpdatesIcon sx={{ color: theme.palette.success.main }} />;
    case 'streak':
      return <CelebrationIcon sx={{ color: theme.palette.secondary.main }} />;
    case 'system':
      return <PersonIcon sx={{ color: theme.palette.grey[600] }} />;
    default:
      return <NotificationsIcon sx={{ color: theme.palette.primary.main }} />;
  }
};

// Helper function to format timestamps
const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const differenceInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (differenceInHours < 1) {
      return 'Just now';
    } else if (differenceInHours < 24) {
      return `${differenceInHours} ${differenceInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (differenceInHours < 48) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d, yyyy');
    }
  } catch (error) {
    return 'Unknown date';
  }
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`notifications-tabpanel-${index}`}
      aria-labelledby={`notifications-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 1 }}>
          {children}
        </Box>
      )}
    </Box>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `notifications-tab-${index}`,
    'aria-controls': `notifications-tabpanel-${index}`,
  };
};

const NotificationCenter: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);
  
  // Mock notifications data (in a real app, this would come from an API/context)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'reminder',
      title: 'Time to log your mood',
      message: "Don't forget to log your mood for today and keep your streak going!",
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: '/log-mood',
      actionText: 'Log Mood'
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Badge Earned!',
      message: "Congratulations! You've earned the 'Week Warrior' badge for logging your mood 7 days in a row.",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      read: true,
      actionUrl: '/profile'
    },
    {
      id: '3',
      type: 'insight',
      title: 'New Mood Insight',
      message: 'We noticed you tend to feel better on Fridays and Saturdays. Plan enjoyable activities on other days to boost your mood!',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      actionUrl: '/analytics',
      actionText: 'View Insights'
    },
    {
      id: '4',
      type: 'streak',
      title: 'Streak Achievement!',
      message: "You're on a 5-day streak! Keep it up to unlock the 'Week Warrior' badge.",
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: '5',
      type: 'system',
      title: 'Welcome to Mood Tracker',
      message: 'Thanks for joining! Start tracking your mood daily to get personalized insights and earn badges.',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      actionUrl: '/log-mood',
      actionText: 'Get Started'
    }
  ]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, notificationId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notificationId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
    handleMenuClose();
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter(notif => notif.id !== notificationId));
    handleMenuClose();
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // Filter notifications for tabs
  const unreadNotifications = notifications.filter(notif => !notif.read);
  const allNotifications = [...notifications].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <StyledBadge 
            badgeContent={unreadNotifications.length} 
            max={99}
            sx={{ mr: 1 }}
          >
            <NotificationsIcon fontSize="large" />
          </StyledBadge>
          <Typography variant="h5" component="h1" fontWeight="bold">
            Notifications
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            size="small"
            variant="outlined"
            color="inherit"
            onClick={handleMarkAllAsRead}
            disabled={unreadNotifications.length === 0}
            sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
            aria-label="Mark all as read"
          >
            <CheckCircleIcon sx={{ mr: 0.5 }} fontSize="small" />
            Mark All Read
          </Button>
          
          <Button 
            size="small"
            variant="outlined"
            color="inherit"
            onClick={handleClearAllNotifications}
            disabled={notifications.length === 0}
            sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
            aria-label="Clear all notifications"
          >
            <DeleteIcon sx={{ mr: 0.5 }} fontSize="small" />
            Clear All
          </Button>
        </Box>
      </Box>

      {/* Tabs and Notification Lists */}
      <Box>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="Notification tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" component="span">All</Typography>
                <Chip 
                  size="small" 
                  label={notifications.length} 
                  sx={{ ml: 1, height: 20, minWidth: 20 }} 
                />
              </Box>
            } 
            {...a11yProps(0)} 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" component="span">Unread</Typography>
                <Chip 
                  size="small" 
                  label={unreadNotifications.length} 
                  sx={{ ml: 1, height: 20, minWidth: 20 }} 
                  color="primary"
                />
              </Box>
            } 
            {...a11yProps(1)} 
          />
        </Tabs>

        {/* All Notifications Tab */}
        <TabPanel value={tabValue} index={0}>
          {notifications.length > 0 ? (
            <List sx={{ p: 0 }}>
              {allNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem 
                    alignItems="flex-start"
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        aria-label="notification options"
                        onClick={(e) => handleMenuOpen(e, notification.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    }
                    sx={{ 
                      bgcolor: notification.read ? 'inherit' : 'action.hover',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        bgcolor: 'action.selected'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: notification.read ? 'action.selected' : 'primary.light' }}>
                        {getNotificationIcon(notification.type, theme)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            variant="subtitle1" 
                            component="span"
                            fontWeight={notification.read ? 'regular' : 'bold'}
                          >
                            {notification.title}
                          </Typography>
                          {!notification.read && (
                            <Chip
                              label="New"
                              size="small"
                              color="primary"
                              sx={{ height: 20 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                            sx={{ display: 'block', mb: 0.5 }}
                          >
                            {notification.message}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatTimestamp(notification.timestamp)}
                            </Typography>
                            
                            {notification.actionUrl && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                href={notification.actionUrl}
                                sx={{ minWidth: 'auto', ml: 2 }}
                              >
                                {notification.actionText || 'View'}
                              </Button>
                            )}
                          </Box>
                        </React.Fragment>
                      }
                      secondaryTypographyProps={{ component: 'span' }}
                    />
                  </ListItem>
                  {index < allNotifications.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsOffIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You don't have any notifications at the moment.
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Unread Notifications Tab */}
        <TabPanel value={tabValue} index={1}>
          {unreadNotifications.length > 0 ? (
            <List sx={{ p: 0 }}>
              {unreadNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem 
                    alignItems="flex-start"
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        aria-label="notification options"
                        onClick={(e) => handleMenuOpen(e, notification.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    }
                    sx={{ 
                      bgcolor: 'action.hover',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        bgcolor: 'action.selected'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        {getNotificationIcon(notification.type, theme)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            variant="subtitle1" 
                            component="span"
                            fontWeight="bold"
                          >
                            {notification.title}
                          </Typography>
                          <Chip
                            label="New"
                            size="small"
                            color="primary"
                            sx={{ height: 20 }}
                          />
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                            sx={{ display: 'block', mb: 0.5 }}
                          >
                            {notification.message}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatTimestamp(notification.timestamp)}
                            </Typography>
                            
                            {notification.actionUrl && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                href={notification.actionUrl}
                                sx={{ minWidth: 'auto', ml: 2 }}
                              >
                                {notification.actionText || 'View'}
                              </Button>
                            )}
                          </Box>
                        </React.Fragment>
                      }
                      secondaryTypographyProps={{ component: 'span' }}
                    />
                  </ListItem>
                  {index < unreadNotifications.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" gutterBottom>
                All Caught Up!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You have no unread notifications.
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Box>

      {/* Notification Actions Menu */}
      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        TransitionComponent={Fade}
      >
        <MenuItem 
          onClick={() => selectedNotification && handleMarkAsRead(selectedNotification)}
          disabled={selectedNotification ? notifications.find(n => n.id === selectedNotification)?.read : true}
        >
          <ListItemAvatar>
            <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.light' }}>
              <CheckCircleIcon fontSize="small" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Mark as read" />
        </MenuItem>
        <MenuItem onClick={() => selectedNotification && handleDeleteNotification(selectedNotification)}>
          <ListItemAvatar>
            <Avatar sx={{ width: 24, height: 24, bgcolor: 'error.light' }}>
              <DeleteIcon fontSize="small" />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default NotificationCenter; 