import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  TextField,
  Button,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  CircularProgress,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TimelineIcon from '@mui/icons-material/Timeline';
import InsightsIcon from '@mui/icons-material/Insights';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import EmailIcon from '@mui/icons-material/Email';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PersonIcon from '@mui/icons-material/Person';

// Context
import { useUser, User } from '../../context/UserContext';
import { format } from 'date-fns';

// Styled components
const ProfileHeader = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  background: `linear-gradient(120deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  marginBottom: theme.spacing(2),
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[3],
  marginBottom: theme.spacing(2),
  fontSize: '3rem',
  backgroundColor: theme.palette.secondary.main,
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const BadgeAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.warning.light,
  color: theme.palette.warning.contrastText,
  marginRight: theme.spacing(2),
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0]?.toUpperCase() || '')
    .join('')
    .substring(0, 2);
};

const UserProfile: React.FC = () => {
  const theme = useTheme();
  const { user, isLoading, updateUser, updatePreference } = useUser();
  const [tabValue, setTabValue] = useState(0);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        bio: user.bio || '',
      });
    }
    setEditing(false);
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    try {
      setSaveStatus('saving');
      await updateUser({
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
      });
      setSaveStatus('success');
      setEditing(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = async (key: keyof User['preferences']) => {
    if (!user) return;
    
    try {
      await updatePreference(key, !user.preferences[key]);
    } catch (error) {
      console.error(`Error toggling ${String(key)}:`, error);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress aria-label="Loading profile data" />
      </Box>
    );
  }

  if (!user) {
    return (
      <Alert severity="warning">
        You must be logged in to view your profile.
      </Alert>
    );
  }

  return (
    <Box sx={{ 
      padding: 0, 
      width: '100%', 
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 1
    }}>
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', mb: 4, maxWidth: '100%', boxSizing: 'border-box' }}>
        {/* Profile Header */}
        <ProfileHeader>
          <ProfileAvatar>{getInitials(user.name)}</ProfileAvatar>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ color: 'white' }}>
            {user.name}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'white', mt: 0.5 }}>
            <EmailIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
            {user.email}
          </Typography>
          <Box sx={{ mt: 1, mb: 1 }}>
            <Chip 
              icon={<DateRangeIcon />} 
              label={`Joined ${format(new Date(user.joined), 'MMMM yyyy')}`} 
              variant="outlined" 
              size="small"
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(255,255,255,0.5)',
                m: 0.5
              }}
            />
          </Box>
        </ProfileHeader>
        
        {/* Tabs Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="Profile tabs"
            variant="fullWidth"
            scrollButtons="auto"
          >
            <Tab label="Overview" icon={<PersonIcon />} iconPosition="start" {...a11yProps(0)} />
            <Tab label="Achievements" icon={<EmojiEventsIcon />} iconPosition="start" {...a11yProps(1)} />
            <Tab label="Settings" icon={<SecurityIcon />} iconPosition="start" {...a11yProps(2)} />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            {/* User Bio section */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'medium' }}>About</Typography>
                {!editing && (
                  <IconButton onClick={handleEdit} aria-label="Edit profile" size="small" sx={{ ml: 1 }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              
              {editing ? (
                <Box component="form" sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    size="small"
                    type="email"
                  />
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    margin="normal"
                    variant="outlined"
                    multiline
                    rows={3}
                    placeholder="Tell us about yourself"
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      onClick={handleCancel}
                      startIcon={<CloseIcon />}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleSave}
                      startIcon={<SaveIcon />}
                      disabled={saveStatus === 'saving'}
                    >
                      {saveStatus === 'saving' ? 'Saving...' : 'Save'}
                    </Button>
                  </Box>
                  {saveStatus === 'success' && (
                    <Alert severity="success" sx={{ mt: 2 }}>Profile updated successfully!</Alert>
                  )}
                  {saveStatus === 'error' && (
                    <Alert severity="error" sx={{ mt: 2 }}>Failed to update profile. Please try again.</Alert>
                  )}
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                    {user.bio || "No bio added yet. Click the edit button to add your bio."}
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Stats Grid */}
            <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 2 }}>Your Stats</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <StatsCard raised>
                  <CalendarTodayIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h5" component="div" color="primary" sx={{ fontWeight: 'bold' }}>
                    {user.stats.totalEntries}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Total Entries</Typography>
                </StatsCard>
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatsCard raised>
                  <TimelineIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h5" component="div" color="secondary" sx={{ fontWeight: 'bold' }}>
                    {user.stats.streakDays}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Day Streak</Typography>
                </StatsCard>
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatsCard raised>
                  <EmojiEventsIcon sx={{ fontSize: 40, mb: 1, color: theme.palette.warning.main }} />
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: theme.palette.warning.main }}>
                    {user.badges.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Badges Earned</Typography>
                </StatsCard>
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatsCard raised>
                  <InsightsIcon sx={{ fontSize: 40, mb: 1, color: theme.palette.info.main }} />
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: theme.palette.info.main }}>
                    {user.stats.insightsGenerated}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Insights</Typography>
                </StatsCard>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Achievements Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>Your Badges</Typography>
            <List>
              {user.badges.map((badge) => (
                <ListItem 
                  key={badge.id}
                  component={Paper}
                  variant="outlined"
                  sx={{ 
                    mb: 2, 
                    borderRadius: 1,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    }
                  }}
                >
                  <ListItemAvatar>
                    <BadgeAvatar>
                      <EmojiEventsIcon />
                    </BadgeAvatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={badge.name}
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                          {badge.description}
                        </Typography>
                        <Typography component="div" variant="caption" sx={{ mt: 0.5 }}>
                          Earned on {format(new Date(badge.dateEarned), 'MMMM d, yyyy')}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>Notification Settings</Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 4 }}>
              <List disablePadding>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <NotificationsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Daily Reminders" 
                    secondary="Receive reminders to log your mood"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={user.preferences.dailyReminders}
                      onChange={() => handlePreferenceChange('dailyReminders')}
                      inputProps={{
                        'aria-label': 'Toggle daily reminders',
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                      <EmojiEventsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Achievement Alerts" 
                    secondary="Get notified when you earn badges"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={user.preferences.achievementAlerts}
                      onChange={() => handlePreferenceChange('achievementAlerts')}
                      inputProps={{
                        'aria-label': 'Toggle achievement alerts',
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                      <InsightsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Weekly Insights" 
                    secondary="Receive weekly mood analysis reports"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={user.preferences.weeklyInsights}
                      onChange={() => handlePreferenceChange('weeklyInsights')}
                      inputProps={{
                        'aria-label': 'Toggle weekly insights',
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Paper>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>Privacy & Security</Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <List disablePadding>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                      <SecurityIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary="Data Sharing" 
                    secondary="Allow anonymous data for research"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={user.preferences.dataSharing}
                      onChange={() => handlePreferenceChange('dataSharing')}
                      inputProps={{
                        'aria-label': 'Toggle data sharing',
                      }}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Paper>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default UserProfile; 