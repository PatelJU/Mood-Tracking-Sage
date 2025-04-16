import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Grid,
  Fade,
  Tooltip,
  alpha,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  SelectChangeEvent,
  Stack,
  Checkbox
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { 
  Close as CloseIcon, 
  Save as SaveIcon, 
  Lightbulb as TipIcon,
  WbSunny as MorningIcon,
  WbTwilight as AfternoonIcon,
  NightsStay as NightIcon,
  Brightness2 as EveningIcon,
  Today as FullDayIcon,
  AddCircleOutline as AddIcon
} from '@mui/icons-material';
import { useMood } from '../../context/MoodContext';
import { MoodType, TimeOfDay } from '../../types';

interface MoodLoggerProps {
  initialDate?: Date | null;
  onSaveSuccess?: () => void;
}

// Modern 2025 Mood Tracker Component
const MoodLogger: React.FC<MoodLoggerProps> = ({ initialDate, onSaveSuccess }) => {
  const [date, setDate] = useState<Date | null>(initialDate || new Date());
  const [mood, setMood] = useState<MoodType>('Okay');
  const [notes, setNotes] = useState<string>('');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('full-day');
  const [activities, setActivities] = useState<string[]>([]);
  const [customActivity, setCustomActivity] = useState<string>('');
  const [customActivities, setCustomActivities] = useState<string[]>([]);
  const [saveCustom, setSaveCustom] = useState<boolean>(false);
  const { addMoodEntry } = useMood();
  
  // Update date if initialDate prop changes
  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
    }
  }, [initialDate]);

  // Add useEffect to load saved custom activities from localStorage on mount
  useEffect(() => {
    const savedActivities = localStorage.getItem('customActivities');
    if (savedActivities) {
      setCustomActivities(JSON.parse(savedActivities));
    }
  }, []);

  // Modern flat mood icons with better visibility
  const moodOptions = [
    { 
      value: 'Very Bad', 
      color: '#e53935',
      gradient: 'linear-gradient(135deg, #e53935, #d32f2f)',
      description: "I'm feeling very low and struggling today"
    },
    { 
      value: 'Bad', 
      color: '#f57c00',
      gradient: 'linear-gradient(135deg, #f57c00, #ef6c00)',
      description: "I'm not feeling great today"
    },
    { 
      value: 'Okay', 
      color: '#ffc107',
      gradient: 'linear-gradient(135deg, #ffc107, #ffb300)',
      description: "I'm feeling neutral today"
    },
    { 
      value: 'Good', 
      color: '#43a047',
      gradient: 'linear-gradient(135deg, #43a047, #388e3c)',
      description: "I'm feeling pretty good today"
    },
    { 
      value: 'Very Good', 
      color: '#1e88e5',
      gradient: 'linear-gradient(135deg, #1e88e5, #1976d2)',
      description: "I'm feeling amazing today!"
    }
  ];

  // Time of day options with colors and icons
  const timeOptions = [
    { value: 'morning', label: 'Morning', icon: <MorningIcon />, color: '#FF9800' },
    { value: 'afternoon', label: 'Afternoon', icon: <AfternoonIcon />, color: '#2196F3' },
    { value: 'evening', label: 'Evening', icon: <EveningIcon />, color: '#673AB7' },
    { value: 'night', label: 'Night', icon: <NightIcon />, color: '#3F51B5' },
    { value: 'full-day', label: 'Full Day', icon: <FullDayIcon />, color: '#4CAF50' }
  ];

  // Find the selected mood option
  const selectedMood = moodOptions.find(option => option.value === mood) || moodOptions[2];
  
  // Find selected time option
  const selectedTime = timeOptions.find(option => option.value === timeOfDay) || timeOptions[4];

  // Predefined list of common activities
  const commonActivities = [
    'Exercise', 'Reading', 'Meditation', 'Social', 'Work', 'Family', 
    'Outdoors', 'Shopping', 'Cooking', 'Movies', 'Music', 'Gaming',
    'Studying', 'Cleaning', 'Travel', 'Sports', 'Art', 'Yoga'
  ];

  const handleTimeChange = (event: SelectChangeEvent<TimeOfDay>) => {
    setTimeOfDay(event.target.value as TimeOfDay);
  };

  const handleMoodChange = (newMood: string) => {
    setMood(newMood as MoodType);
  };

  // Add a function to save custom activities permanently
  const handleSaveCustomActivity = (activity: string) => {
    if (!customActivities.includes(activity)) {
      const updatedCustomActivities = [...customActivities, activity];
      setCustomActivities(updatedCustomActivities);
      localStorage.setItem('customActivities', JSON.stringify(updatedCustomActivities));
    }
  };

  // Modify the handleAddCustomActivity function to optionally save the activity
  const handleAddCustomActivity = () => {
    if (customActivity.trim() !== '' && !activities.includes(customActivity.trim())) {
      setActivities([...activities, customActivity.trim()]);
      
      // If saveCustom is true, permanently save the activity
      if (saveCustom) {
        handleSaveCustomActivity(customActivity.trim());
        setSaveCustom(false); // Reset after saving
      }
      
      setCustomActivity('');
    }
  };
  
  // Handle removing an activity
  const handleRemoveActivity = (activity: string) => {
    setActivities(activities.filter(a => a !== activity));
  };

  const handleSave = () => {
    if (date) {
      // Preserve the time portion if we're using initialDate
      const formattedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        new Date().getHours(),
        new Date().getMinutes()
      );
      
      addMoodEntry({
        date: formattedDate.toISOString(),
        mood,
        notes,
        timeOfDay: timeOfDay,
        activities: activities.length > 0 ? activities : undefined
      });
      
      // Reset form
      setNotes('');
      setActivities([]);
      
      // Call the success callback if provided
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    }
  };

  const handleClear = () => {
    setDate(initialDate || new Date());
    setMood('Okay');
    setNotes('');
    setTimeOfDay('full-day');
    setActivities([]);
    setCustomActivity('');
  };

  // Get appropriate suggestion based on mood
  const getMoodSuggestion = () => {
    switch(mood) {
      case 'Very Bad': 
        return "Consider a short mindfulness session or reaching out to someone you trust.";
      case 'Bad': 
        return "A brief walk or your favorite music might help lift your spirits.";
      case 'Okay': 
        return "This is a good time to focus on small wins and achievements.";
      case 'Good': 
        return "Reflect on what's working well for you today!";
      case 'Very Good': 
        return "Wonderful! What activities could you do to maintain this feeling?";
      default: 
        return "Take a moment to reflect on what influenced your mood today.";
    }
  };

  // Icon components for each mood
  const renderMoodIcon = (moodType: string, isSelected: boolean) => {
    const size = isSelected ? 48 : 40;
    
    switch(moodType) {
      case 'Very Bad':
        return (
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <path d="M16 32C16 32 20 26 24 26C28 26 32 32 32 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="16" cy="18" r="2.5" fill="currentColor" />
            <circle cx="32" cy="18" r="2.5" fill="currentColor" />
          </svg>
        );
      case 'Bad':
        return (
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <path d="M14 30C14 30 19 28 24 28C29 28 34 30 34 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="16" cy="18" r="2.5" fill="currentColor" />
            <circle cx="32" cy="18" r="2.5" fill="currentColor" />
          </svg>
        );
      case 'Okay':
        return (
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <path d="M16 30H32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="16" cy="18" r="2.5" fill="currentColor" />
            <circle cx="32" cy="18" r="2.5" fill="currentColor" />
          </svg>
        );
      case 'Good':
        return (
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <path d="M16 28C16 28 19 32 24 32C29 32 32 28 32 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="16" cy="18" r="2.5" fill="currentColor" />
            <circle cx="32" cy="18" r="2.5" fill="currentColor" />
          </svg>
        );
      case 'Very Good':
        return (
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <path d="M16 26C16 26 19 34 24 34C29 34 32 26 32 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="16" cy="18" r="2.5" fill="currentColor" />
            <circle cx="32" cy="18" r="2.5" fill="currentColor" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 'var(--radius-2xl)',
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(var(--blur-lg))',
        WebkitBackdropFilter: 'blur(var(--blur-lg))',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: 'var(--shadow-xl)',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      {/* Animated background pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.07,
          background: 'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%231e88e5\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z\' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          zIndex: -1
        }}
      />

      <Box 
        sx={{ 
          p: { xs: 2.5, md: 3.5 },
          position: 'relative',
          zIndex: 1,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              mb: 3,
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              position: 'relative',
              letterSpacing: '-0.5px',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80px',
                height: '4px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))'
              }
            }}
          >
            How are you feeling today?
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Date
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Entry Date"
                  value={date}
                  onChange={(newDate) => setDate(newDate)}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      variant: "outlined", 
                      sx: {
                        bgcolor: 'rgba(255,255,255,0.7)',
                        backdropFilter: 'blur(var(--blur-sm))',
                        borderRadius: 'var(--radius-lg)',
                        '& .MuiInputBase-root': {
                          borderRadius: 'var(--radius-lg)',
                          boxShadow: 'var(--shadow-sm)',
                          border: '1px solid rgba(255,255,255,0.8)',
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: 'var(--shadow-md)'
                          }
                        }
                      }
                    } 
                  }}
                />
              </LocalizationProvider>
            </Grid>

            {/* Time of Day Selection */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Time of Day
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={timeOfDay}
                  onChange={handleTimeChange}
                  displayEmpty
                  variant="outlined"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(var(--blur-sm))',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid rgba(255,255,255,0.8)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: 'var(--shadow-md)'
                    },
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1.5,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(var(--blur-lg))',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid rgba(255,255,255,0.6)',
                        mt: 1
                      }
                    }
                  }}
                >
                  {timeOptions.map((option) => (
                    <MenuItem 
                      key={option.value} 
                      value={option.value}
                      sx={{
                        borderRadius: '12px',
                        my: 0.5,
                        transition: 'all 0.2s ease',
                        '&.Mui-selected': {
                          backgroundColor: alpha(option.color, 0.1),
                          '&:hover': {
                            backgroundColor: alpha(option.color, 0.15)
                          }
                        },
                        '&:hover': {
                          backgroundColor: alpha(option.color, 0.05)
                        },
                        px: 1.5
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                        <Box 
                          sx={{ 
                            color: option.color, 
                            display: 'flex', 
                            alignItems: 'center',
                            '& .MuiSvgIcon-root': {
                              filter: `drop-shadow(0 0 3px ${alpha(option.color, 0.3)})`,
                              fontSize: '1.3rem'
                            }
                          }}
                        >
                          {option.icon}
                        </Box>
                        <Typography variant="body1" sx={{ 
                          fontWeight: timeOfDay === option.value ? 600 : 400,
                          fontSize: '0.9rem'
                        }}>
                          {option.label}
                        </Typography>
                        
                        {timeOfDay === option.value && (
                          <Chip 
                            label="Selected" 
                            size="small" 
                            sx={{ 
                              ml: 'auto', 
                              backgroundColor: alpha(option.color, 0.1),
                              color: option.color,
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }} 
                          />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Mood Selection */}
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Box sx={{ mb: 0.5 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    mb: 2,
                    color: '#1e293b'
                  }}
                >
                  How would you describe your mood?
                </Typography>
                
                {/* New Mood Selector */}
                <Box 
                  sx={{ 
                    mb: 3, 
                    position: 'relative',
                    mx: 'auto',
                    maxWidth: '750px'
                  }}
                >
                  {/* Mood options */}
                  <Grid container spacing={1} sx={{ position: 'relative', zIndex: 1 }}>
                    {moodOptions.map((option, index) => (
                      <Grid item xs={12/5} key={option.value}>
                        <Tooltip 
                          title={option.description}
                          arrow
                          placement="top"
                        >
                          <Box
                            onClick={() => handleMoodChange(option.value)}
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              cursor: 'pointer',
                              p: 1.5,
                              borderRadius: '12px',
                              transition: 'all 0.3s ease',
                              background: mood === option.value ? alpha(option.color, 0.08) : 'transparent',
                              border: mood === option.value ? `1px solid ${alpha(option.color, 0.12)}` : '1px solid transparent',
                              '&:hover': {
                                background: alpha(option.color, 0.08),
                                transform: 'translateY(-3px)'
                              }
                            }}
                          >
                            <Box
                              sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 1,
                                background: option.gradient,
                                border: mood === option.value ? `2px solid ${option.color}` : '2px solid transparent',
                                boxShadow: mood === option.value ? `0 0 15px ${alpha(option.color, 0.5)}` : 'none',
                                transition: 'all 0.3s ease',
                                transform: mood === option.value ? 'scale(1.1)' : 'scale(1)',
                              }}
                            >
                              {/* Mood Icons for each option */}
                              {index === 0 && (
                                <Typography sx={{ fontSize: 28 }}>😢</Typography>
                              )}
                              {index === 1 && (
                                <Typography sx={{ fontSize: 28 }}>😕</Typography>
                              )}
                              {index === 2 && (
                                <Typography sx={{ fontSize: 28 }}>😐</Typography>
                              )}
                              {index === 3 && (
                                <Typography sx={{ fontSize: 28 }}>🙂</Typography>
                              )}
                              {index === 4 && (
                                <Typography sx={{ fontSize: 28 }}>😄</Typography>
                              )}
                            </Box>
                            
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: mood === option.value ? 700 : 500,
                                fontSize: '0.85rem',
                                color: option.color,
                                textAlign: 'center',
                                transition: 'all 0.3s ease',
                                opacity: mood === option.value ? 1 : 0.85
                              }}
                            >
                              {option.value}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </Grid>
                    ))}
                  </Grid>
                  
                  {/* Track line in the middle */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '32px',
                      left: '8%',
                      width: '84%',
                      height: '3px',
                      background: 'linear-gradient(to right, #e53935, #f57c00, #ffc107, #43a047, #1e88e5)',
                      borderRadius: '4px',
                      opacity: 0.2,
                      zIndex: 0
                    }}
                  />
                  
                  {/* Current mood indicator */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '29px',
                      left: `calc(${moodOptions.findIndex(option => option.value === mood) * 20 + 8}% + 10px)`,
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      background: selectedMood.color,
                      boxShadow: `0 0 8px ${selectedMood.color}`,
                      zIndex: 2,
                      transition: 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  />
                </Box>

                {/* Mood Insight/Suggestion based on selected mood - always visible */}
                <Fade in={true} timeout={500}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: '10px',
                      border: `1px dashed ${alpha(selectedMood.color, 0.3)}`,
                      bgcolor: alpha(selectedMood.color, 0.03),
                      display: 'flex',
                      gap: 2,
                      alignItems: 'center',
                      my: 3
                    }}
                  >
                    <Box 
                      sx={{ 
                        bgcolor: alpha(selectedMood.color, 0.1),
                        color: selectedMood.color,
                        width: 38,
                        height: 38,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: `0 0 10px ${alpha(selectedMood.color, 0.25)}`
                      }}
                    >
                      <TipIcon />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight="700" 
                        sx={{ color: selectedMood.color, fontSize: '1rem', mb: 0.5 }}
                      >
                        Mood Insight
                      </Typography>
                      <Typography 
                        variant="body2"
                        sx={{ 
                          color: '#1e293b', 
                          fontWeight: 500,
                          fontSize: '0.9rem',
                          lineHeight: 1.5
                        }}
                      >
                        {getMoodSuggestion()}
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              </Box>
            </Grid>

            {/* Activities Section */}
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 1.5, 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                Activities
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                What activities were you doing? (helps with mood correlation analysis)
              </Typography>
              
              {/* Selected activities chips */}
              <Box 
                sx={{
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1, 
                  mb: 2,
                  borderRadius: 'var(--radius-lg)',
                  p: activities.length > 0 ? 2 : 0,
                  transition: 'all 0.3s ease',
                  bgcolor: activities.length > 0 ? alpha(selectedMood.color, 0.08) : 'transparent',
                  border: activities.length > 0 ? `1px solid ${alpha(selectedMood.color, 0.2)}` : 'none',
                  boxShadow: activities.length > 0 ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {activities.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', p: 2 }}>
                    No activities selected
                  </Typography>
                ) : (
                  <>
                    <Typography variant="subtitle2" sx={{ width: '100%', mb: 1, fontWeight: 600, color: selectedMood.color }}>
                      Your Selected Activities:
                    </Typography>
                    
                    {activities.map((activity) => (
                      <Chip
                        key={activity}
                        label={activity}
                        onDelete={() => handleRemoveActivity(activity)}
                        sx={{
                          bgcolor: alpha(selectedMood.color, 0.1),
                          color: alpha(selectedMood.color, 0.8),
                          fontWeight: 500,
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${alpha(selectedMood.color, 0.2)}`,
                          '& .MuiChip-deleteIcon': {
                            color: alpha(selectedMood.color, 0.6),
                            '&:hover': {
                              color: alpha(selectedMood.color, 1),
                            }
                          }
                        }}
                      />
                    ))}
                  </>
                )}
              </Box>
              
              {/* Add custom activity */}
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs>
                    <TextField
                      fullWidth
                      value={customActivity}
                      onChange={(e) => setCustomActivity(e.target.value)}
                      placeholder="Type your own activity..."
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: <AddIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.7)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-sm)',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 'var(--radius-lg)',
                          border: '1px solid rgba(255,255,255,0.8)',
                        }
                      }}
                    />
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      onClick={handleAddCustomActivity}
                      disabled={!customActivity.trim()}
                      sx={{
                        borderRadius: 'var(--radius-lg)',
                        background: customActivity.trim() 
                          ? `linear-gradient(135deg, ${selectedMood.color}, ${alpha(selectedMood.color, 0.8)})`
                          : 'rgba(0,0,0,0.1)',
                        color: customActivity.trim() ? 'white' : 'text.disabled',
                        fontWeight: 600,
                        textTransform: 'none',
                        boxShadow: customActivity.trim() ? 'var(--shadow-md)' : 'none',
                        py: 1,
                        '&:hover': {
                          boxShadow: 'var(--shadow-lg)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Add Activity
                    </Button>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  <Checkbox
                    checked={saveCustom}
                    onChange={(e) => setSaveCustom(e.target.checked)}
                    size="small"
                    sx={{ 
                      color: alpha(selectedMood.color, 0.6),
                      '&.Mui-checked': { color: selectedMood.color } 
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Save this activity permanently to your collection
                  </Typography>
                </Box>
              </Box>
              
              {/* Activities Categories Section - Redesigned for 2025 */}
              <Box sx={{ 
                mt: 2, 
                borderRadius: 'var(--radius-xl)',
                p: 2,
                bgcolor: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(var(--blur-sm))',
                border: '1px solid rgba(255,255,255,0.8)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 2
                }}>
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    bgcolor: '#4F46E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    flexShrink: 0,
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    P
                  </Box>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#4F46E5' }}>
                    Physical
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {['Exercise', 'Walking', 'Running', 'Cycling', 'Swimming', 'Yoga', 'Sports'].map((activity) => (
                    <Chip
                      key={activity}
                      label={activity}
                      onClick={() => !activities.includes(activity) && setActivities([...activities, activity])}
                      color={activities.includes(activity) ? "primary" : "default"}
                      variant={activities.includes(activity) ? "filled" : "outlined"}
                      sx={{
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 500,
                        bgcolor: activities.includes(activity) 
                          ? alpha('#4F46E5', 0.9) 
                          : alpha('#4F46E5', 0.05),
                        color: activities.includes(activity) ? 'white' : '#4F46E5',
                        border: activities.includes(activity) 
                          ? 'none' 
                          : `1px solid ${alpha('#4F46E5', 0.3)}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: activities.includes(activity) 
                            ? alpha('#4F46E5', 1) 
                            : alpha('#4F46E5', 0.1),
                          transform: 'translateY(-2px)',
                          boxShadow: 'var(--shadow-sm)'
                        }
                      }}
                    />
                  ))}
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 2,
                  mt: 3
                }}>
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    bgcolor: '#0891B2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    flexShrink: 0,
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    M
                  </Box>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#0891B2' }}>
                    Mental
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {['Reading', 'Meditation', 'Studying', 'Learning', 'Planning', 'Problem Solving'].map((activity) => (
                    <Chip
                      key={activity}
                      label={activity}
                      onClick={() => !activities.includes(activity) && setActivities([...activities, activity])}
                      color={activities.includes(activity) ? "secondary" : "default"}
                      variant={activities.includes(activity) ? "filled" : "outlined"}
                      sx={{
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 500,
                        bgcolor: activities.includes(activity) 
                          ? alpha('#0891B2', 0.9) 
                          : alpha('#0891B2', 0.05),
                        color: activities.includes(activity) ? 'white' : '#0891B2',
                        border: activities.includes(activity) 
                          ? 'none' 
                          : `1px solid ${alpha('#0891B2', 0.3)}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: activities.includes(activity) 
                            ? alpha('#0891B2', 1) 
                            : alpha('#0891B2', 0.1),
                          transform: 'translateY(-2px)',
                          boxShadow: 'var(--shadow-sm)'
                        }
                      }}
                    />
                  ))}
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 2,
                  mt: 3
                }}>
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    bgcolor: '#e57373',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    flexShrink: 0,
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    S
                  </Box>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#d32f2f' }}>
                    Social
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {['Friends', 'Family', 'Dating', 'Party', 'Networking', 'Conversation', 'Helping Others'].map((activity) => (
                    <Chip
                      key={activity}
                      label={activity}
                      onClick={() => !activities.includes(activity) && setActivities([...activities, activity])}
                      sx={{
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 500,
                        bgcolor: activities.includes(activity) 
                          ? '#e57373' 
                          : alpha('#e57373', 0.05),
                        color: activities.includes(activity) ? 'white' : '#d32f2f',
                        border: activities.includes(activity) 
                          ? 'none' 
                          : `1px solid ${alpha('#e57373', 0.3)}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: activities.includes(activity) 
                            ? '#ef5350' 
                            : alpha('#e57373', 0.1),
                          transform: 'translateY(-2px)',
                          boxShadow: 'var(--shadow-sm)'
                        }
                      }}
                    />
                  ))}
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 2,
                  mt: 3
                }}>
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    bgcolor: '#66bb6a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    flexShrink: 0,
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    L
                  </Box>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#388e3c' }}>
                    Leisure
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {['Movies', 'Music', 'Gaming', 'Shopping', 'Cooking', 'Gardening', 'Art', 'Travel', 'Relaxing'].map((activity) => (
                    <Chip
                      key={activity}
                      label={activity}
                      onClick={() => !activities.includes(activity) && setActivities([...activities, activity])}
                      sx={{
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 500,
                        bgcolor: activities.includes(activity) 
                          ? '#66bb6a' 
                          : alpha('#66bb6a', 0.05),
                        color: activities.includes(activity) ? 'white' : '#388e3c',
                        border: activities.includes(activity) 
                          ? 'none' 
                          : `1px solid ${alpha('#66bb6a', 0.3)}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: activities.includes(activity) 
                            ? '#4caf50' 
                            : alpha('#66bb6a', 0.1),
                          transform: 'translateY(-2px)',
                          boxShadow: 'var(--shadow-sm)'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Notes Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                Notes
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="Add any details about how you're feeling..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{
                  mb: 4,
                  bgcolor: 'rgba(255,255,255,0.9)',
                  '& .MuiInputBase-root': {
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-sm)',
                  }
                }}
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{
            display: 'flex', 
            gap: 2,
            justifyContent: 'space-between',
            mt: 'auto',
            pt: 2
          }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<CloseIcon />}
              onClick={handleClear}
              sx={{
                py: 1.5,
                px: 3,
                borderRadius: 'var(--radius-md)',
                borderWidth: '2px',
                flex: 1,
                fontSize: '0.95rem',
                fontWeight: 600,
                '&:hover': {
                  borderWidth: '2px',
                }
              }}
            >
              Clear
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              sx={{
                py: 1.5,
                px: 3,
                borderRadius: 'var(--radius-md)',
                flex: 1,
                fontSize: '0.95rem',
                fontWeight: 600,
                boxShadow: 'var(--shadow-md)',
                '&:hover': {
                  boxShadow: 'var(--shadow-lg)',
                }
              }}
            >
              Save Mood Entry
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default MoodLogger; 