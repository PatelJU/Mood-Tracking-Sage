import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Stack,
  TextField,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Divider,
  Switch,
  Tooltip
} from '@mui/material';
import { 
  checkNotificationSupport, 
  requestNotificationPermission, 
  scheduleMoodReminders,
  clearMoodReminders,
  setCustomReminderTimes
} from '../../services/notificationService';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const NotificationSettings: React.FC = () => {
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'twice-daily' | 'custom'>('daily');
  const [customTimes, setCustomTimes] = useState<{ hour: number; minute: number }[]>([
    { hour: 20, minute: 0 }
  ]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newHour, setNewHour] = useState(9);
  const [newMinute, setNewMinute] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize state from localStorage/browser permissions
  useEffect(() => {
    const isSupported = checkNotificationSupport();
    setNotificationsSupported(isSupported);
    
    if (isSupported) {
      setNotificationsEnabled(Notification.permission === 'granted');
      
      // Load saved frequency
      const savedFrequency = localStorage.getItem('reminderFrequency') as 'daily' | 'twice-daily' | 'custom';
      if (savedFrequency) {
        setFrequency(savedFrequency);
      }
      
      // Load custom times
      const savedCustomTimes = localStorage.getItem('customReminderTimes');
      if (savedCustomTimes) {
        setCustomTimes(JSON.parse(savedCustomTimes));
      }
    }
  }, []);

  // Handle enable/disable notifications
  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      clearMoodReminders();
      setNotificationsEnabled(false);
      setSuccess('Notifications have been disabled');
    } else {
      try {
        const granted = await requestNotificationPermission();
        setNotificationsEnabled(granted);
        
        if (granted) {
          scheduleMoodReminders(frequency);
          setSuccess('Notifications have been enabled');
        } else {
          setError('Permission denied. Please enable notifications in your browser settings.');
        }
      } catch (err) {
        console.error('Error requesting notification permission:', err);
        setError('Failed to enable notifications. Please try again.');
      }
    }
  };

  // Handle frequency change
  const handleFrequencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFrequency = event.target.value as 'daily' | 'twice-daily' | 'custom';
    setFrequency(newFrequency);
    
    if (notificationsEnabled) {
      scheduleMoodReminders(newFrequency);
      setSuccess(`Reminder frequency updated to ${newFrequency}`);
    }
  };

  // Open dialog to add new custom time
  const handleAddTime = () => {
    setNewHour(9);
    setNewMinute(0);
    setOpenDialog(true);
  };

  // Save new custom time
  const handleSaveTime = () => {
    // Validate time
    if (newHour < 0 || newHour > 23 || newMinute < 0 || newMinute > 59) {
      setError('Please enter a valid time');
      return;
    }
    
    // Add to custom times
    const updatedTimes = [...customTimes, { hour: newHour, minute: newMinute }];
    
    // Sort by time of day
    updatedTimes.sort((a, b) => {
      if (a.hour !== b.hour) return a.hour - b.hour;
      return a.minute - b.minute;
    });
    
    setCustomTimes(updatedTimes);
    setCustomReminderTimes(updatedTimes);
    setOpenDialog(false);
    setSuccess('Custom reminder time added');
    
    // Update reminders if using custom frequency
    if (frequency === 'custom' && notificationsEnabled) {
      scheduleMoodReminders('custom');
    }
  };

  // Delete a custom time
  const handleDeleteTime = (index: number) => {
    const updatedTimes = customTimes.filter((_, i) => i !== index);
    setCustomTimes(updatedTimes);
    setCustomReminderTimes(updatedTimes);
    
    // Update reminders if using custom frequency
    if (frequency === 'custom' && notificationsEnabled) {
      scheduleMoodReminders('custom');
    }
  };

  // Format time for display
  const formatTime = (hour: number, minute: number): string => {
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  if (!notificationsSupported) {
    return (
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardHeader 
          title="Notification Settings" 
          avatar={<NotificationsActiveIcon color="primary" />}
        />
        <CardContent>
          <Alert severity="warning">
            Your browser does not support notifications. Please try a different browser to use this feature.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={3} sx={{ mb: 4 }}>
      <CardHeader 
        title="Notification Settings" 
        avatar={<NotificationsActiveIcon color="primary" />}
      />
      
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
        
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1">Enable Mood Logging Reminders</Typography>
            <Switch
              checked={notificationsEnabled}
              onChange={handleToggleNotifications}
              color="primary"
            />
          </Box>
          
          <Divider />
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Reminder Frequency
              <Tooltip title="How often would you like to receive reminders to log your mood?">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            
            <FormControl component="fieldset" disabled={!notificationsEnabled}>
              <RadioGroup value={frequency} onChange={handleFrequencyChange}>
                <FormControlLabel 
                  value="daily" 
                  control={<Radio />} 
                  label="Once a day (8:00 PM)" 
                />
                <FormControlLabel 
                  value="twice-daily" 
                  control={<Radio />} 
                  label="Twice a day (9:00 AM and 8:00 PM)" 
                />
                <FormControlLabel 
                  value="custom" 
                  control={<Radio />} 
                  label="Custom schedule" 
                />
              </RadioGroup>
            </FormControl>
          </Box>
          
          {frequency === 'custom' && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Custom Reminder Times
              </Typography>
              
              <Stack spacing={1} sx={{ mb: 2 }}>
                {customTimes.map((time, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1
                    }}
                  >
                    <Typography>{formatTime(time.hour, time.minute)}</Typography>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleDeleteTime(index)}
                      disabled={!notificationsEnabled || customTimes.length <= 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
              
              <Button 
                startIcon={<AddIcon />} 
                variant="outlined" 
                onClick={handleAddTime}
                disabled={!notificationsEnabled}
              >
                Add Reminder Time
              </Button>
            </Box>
          )}
          
          {notificationsEnabled && (
            <Alert severity="info">
              Your browser must be open to receive notifications. For best results, consider enabling this app as a PWA or keeping a tab open.
            </Alert>
          )}
        </Stack>
      </CardContent>
      
      {/* Dialog for adding custom time */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Reminder Time</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1, minWidth: '300px' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Hour (0-23)"
                type="number"
                value={newHour}
                onChange={(e) => setNewHour(parseInt(e.target.value, 10))}
                inputProps={{ min: 0, max: 23 }}
                fullWidth
              />
              <TextField
                label="Minute (0-59)"
                type="number"
                value={newMinute}
                onChange={(e) => setNewMinute(parseInt(e.target.value, 10))}
                inputProps={{ min: 0, max: 59 }}
                fullWidth
              />
            </Box>
            
            <Typography variant="body2">
              This will add a reminder at {formatTime(newHour, newMinute)}.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveTime} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default NotificationSettings; 