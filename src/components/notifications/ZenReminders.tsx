import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  IconButton,
  Switch,
  FormControlLabel,
  Tooltip,
  Fade,
  useTheme
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import SpaIcon from '@mui/icons-material/Spa';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import MicroInteraction, { SuccessAction } from '../ui/MicroInteractions';

// Mindfulness prompts organized by categories
const zenPrompts = {
  breathing: [
    "Take three deep breaths, focusing on the sensation of air filling your lungs.",
    "Breathe in for 4 counts, hold for 4, exhale for 6. Repeat three times.",
    "Place one hand on your chest and one on your belly. Take 5 slow breaths, feeling the movement.",
    "Take a moment to notice your natural breathing pattern without trying to change it.",
    "Breathe in through your nose and out through your mouth slowly for 30 seconds."
  ],
  awareness: [
    "Name three things you can see, two things you can touch, and one thing you can hear.",
    "Pause and notice how your body feels in this moment without judgment.",
    "Take a minute to observe your thoughts passing like clouds in the sky.",
    "Focus your attention completely on what you're doing right now.",
    "Notice any areas of tension in your body and imagine breathing into them."
  ],
  gratitude: [
    "Think of one thing you're grateful for that you haven't appreciated lately.",
    "Recall a small moment of joy you experienced in the past few days.",
    "Consider someone who has helped you recently and mentally thank them.",
    "Acknowledge one thing about your body you're thankful for today.",
    "Reflect on a challenge that taught you something valuable."
  ],
  presence: [
    "Take a mindful minute to fully experience your surroundings with all your senses.",
    "Notice the weight of your body against the chair or floor supporting you.",
    "For the next 30 seconds, give your complete attention to the present moment.",
    "Feel the temperature of the air on your skin and your feet connecting to the ground.",
    "Scan your body slowly from head to toe, noticing sensations without labeling them."
  ],
  intention: [
    "Set an intention for the next hour that supports your well-being.",
    "Choose one word to guide you through the rest of your day.",
    "Decide how you want to show up for yourself and others right now.",
    "Consider what you need most in this moment and how you can provide it for yourself.",
    "Think about one small step you can take toward self-care today."
  ]
};

// Settings interface
interface ZenSettings {
  enabled: boolean;
  frequency: number; // minutes
  categories: {
    breathing: boolean;
    awareness: boolean;
    gratitude: boolean;
    presence: boolean;
    intention: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  favoritePrompts: string[];
}

// Default settings
const defaultSettings: ZenSettings = {
  enabled: true,
  frequency: 120, // 2 hours
  categories: {
    breathing: true,
    awareness: true,
    gratitude: true,
    presence: true,
    intention: true
  },
  quietHours: {
    enabled: true,
    start: '22:00', // 10 PM
    end: '08:00' // 8 AM
  },
  favoritePrompts: []
};

const ZenReminders: React.FC = () => {
  const theme = useTheme();
  const [settings, setSettings] = useState<ZenSettings>(defaultSettings);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [lastPromptTime, setLastPromptTime] = useState<Date | null>(null);
  const [timeUntilNext, setTimeUntilNext] = useState<number | null>(null);
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('zenSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);
  
  // Save settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem('zenSettings', JSON.stringify(settings));
  }, [settings]);
  
  // Function to get all active prompts based on category settings
  const getActivePrompts = (): string[] => {
    const activePrompts: string[] = [];
    
    Object.entries(settings.categories).forEach(([category, isEnabled]) => {
      if (isEnabled) {
        // @ts-ignore - Category is typed correctly, but TypeScript doesn't know that it's a key of zenPrompts
        activePrompts.push(...zenPrompts[category]);
      }
    });
    
    return activePrompts;
  };
  
  // Function to get a random prompt from active categories
  const getRandomPrompt = (): string => {
    const activePrompts = getActivePrompts();
    if (activePrompts.length === 0) return "Enable at least one category to receive mindfulness prompts.";
    
    // Get random prompt that's different from the current one
    let newPrompt;
    do {
      const randomIndex = Math.floor(Math.random() * activePrompts.length);
      newPrompt = activePrompts[randomIndex];
    } while (newPrompt === currentPrompt && activePrompts.length > 1);
    
    return newPrompt;
  };
  
  // Function to check if we're in quiet hours
  const isInQuietHours = (): boolean => {
    if (!settings.quietHours.enabled) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const [startHour, startMinute] = settings.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = settings.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    // Handle cases where quiet hours span midnight
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  };
  
  // Function to trigger a zen moment
  const triggerZenMoment = (manual = false) => {
    if (!manual && (!settings.enabled || isInQuietHours())) return;
    
    const newPrompt = getRandomPrompt();
    setCurrentPrompt(newPrompt);
    setShowPrompt(true);
    setLastPromptTime(new Date());
    
    // Schedule auto-dismiss after 30 seconds
    setTimeout(() => {
      setShowPrompt(false);
    }, 30000);
  };
  
  // Update the time until next reminder
  useEffect(() => {
    if (!settings.enabled || !lastPromptTime) return;
    
    const updateTimeUntilNext = () => {
      if (!lastPromptTime) return;
      
      const now = new Date();
      const nextPromptTime = new Date(lastPromptTime.getTime() + settings.frequency * 60000);
      const diffMs = nextPromptTime.getTime() - now.getTime();
      
      if (diffMs > 0) {
        setTimeUntilNext(Math.floor(diffMs / 60000));
      } else {
        setTimeUntilNext(0);
      }
    };
    
    // Update immediately and then every minute
    updateTimeUntilNext();
    const intervalId = setInterval(updateTimeUntilNext, 60000);
    
    return () => clearInterval(intervalId);
  }, [lastPromptTime, settings.frequency, settings.enabled]);
  
  // Schedule next zen moment
  useEffect(() => {
    if (!settings.enabled) return;
    
    let timeoutId: NodeJS.Timeout;
    
    const scheduleNext = () => {
      if (lastPromptTime) {
        const nextTime = new Date(lastPromptTime.getTime() + settings.frequency * 60000);
        const now = new Date();
        const delayMs = Math.max(0, nextTime.getTime() - now.getTime());
        
        timeoutId = setTimeout(() => {
          if (!isInQuietHours()) {
            triggerZenMoment();
          } else {
            // If in quiet hours, check again in 15 minutes
            setLastPromptTime(new Date());
          }
        }, delayMs);
      } else {
        // If no last prompt time, schedule one soon (in 2 minutes)
        timeoutId = setTimeout(() => {
          if (!isInQuietHours()) {
            triggerZenMoment();
          } else {
            // Set a time so we keep checking
            setLastPromptTime(new Date());
          }
        }, 120000);
      }
    };
    
    scheduleNext();
    
    return () => clearTimeout(timeoutId);
  }, [settings.enabled, settings.frequency, lastPromptTime]);
  
  // Toggle setting for a category
  const toggleCategory = (category: keyof ZenSettings['categories']) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: !prev.categories[category]
      }
    }));
  };
  
  // Toggle a prompt in favorites
  const toggleFavorite = (prompt: string) => {
    setSettings(prev => {
      const isFavorite = prev.favoritePrompts.includes(prompt);
      
      if (isFavorite) {
        return {
          ...prev,
          favoritePrompts: prev.favoritePrompts.filter(p => p !== prompt)
        };
      } else {
        return {
          ...prev,
          favoritePrompts: [...prev.favoritePrompts, prompt]
        };
      }
    });
  };
  
  // Get a category chip color
  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'breathing': return theme.palette.primary.main;
      case 'awareness': return theme.palette.secondary.main;
      case 'gratitude': return '#ff9800';
      case 'presence': return '#2196f3';
      case 'intention': return '#9c27b0';
      default: return theme.palette.primary.main;
    }
  };
  
  // Get the category of a prompt
  const getPromptCategory = (prompt: string): string => {
    for (const [category, prompts] of Object.entries(zenPrompts)) {
      if (prompts.includes(prompt)) return category;
    }
    return 'breathing'; // Default fallback
  };
  
  // Render the settings section
  const renderSettings = () => (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="h2">Zen Reminder Settings</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={settings.enabled}
                onChange={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                color="primary"
              />
            }
            label={settings.enabled ? "Enabled" : "Disabled"}
          />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>Reminder Frequency</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Chip 
            label="1 hour" 
            onClick={() => setSettings(prev => ({ ...prev, frequency: 60 }))}
            variant={settings.frequency === 60 ? "filled" : "outlined"}
            sx={{ mr: 1 }}
          />
          <Chip 
            label="2 hours" 
            onClick={() => setSettings(prev => ({ ...prev, frequency: 120 }))}
            variant={settings.frequency === 120 ? "filled" : "outlined"}
            sx={{ mr: 1 }}
          />
          <Chip 
            label="4 hours" 
            onClick={() => setSettings(prev => ({ ...prev, frequency: 240 }))}
            variant={settings.frequency === 240 ? "filled" : "outlined"}
          />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>Quiet Hours</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.quietHours.enabled}
                onChange={() => setSettings(prev => ({
                  ...prev,
                  quietHours: {
                    ...prev.quietHours,
                    enabled: !prev.quietHours.enabled
                  }
                }))}
                size="small"
              />
            }
            label="Enable quiet hours"
          />
        </Box>
        
        {settings.quietHours.enabled && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" sx={{ mr: 2 }}>From</Typography>
            <input
              type="time"
              value={settings.quietHours.start}
              onChange={e => setSettings(prev => ({
                ...prev,
                quietHours: {
                  ...prev.quietHours,
                  start: e.target.value
                }
              }))}
              style={{
                padding: '8px',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '4px',
                marginRight: '12px',
                backgroundColor: 'transparent',
                color: theme.palette.text.primary
              }}
            />
            <Typography variant="body2" sx={{ mx: 2 }}>To</Typography>
            <input
              type="time"
              value={settings.quietHours.end}
              onChange={e => setSettings(prev => ({
                ...prev,
                quietHours: {
                  ...prev.quietHours,
                  end: e.target.value
                }
              }))}
              style={{
                padding: '8px',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '4px',
                backgroundColor: 'transparent',
                color: theme.palette.text.primary
              }}
            />
          </Box>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>Prompt Categories</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {Object.entries(settings.categories).map(([category, isEnabled]) => (
            <Chip
              key={category}
              label={category.charAt(0).toUpperCase() + category.slice(1)}
              onClick={() => toggleCategory(category as keyof ZenSettings['categories'])}
              variant={isEnabled ? "filled" : "outlined"}
              sx={{ 
                bgcolor: isEnabled ? `${getCategoryColor(category)}20` : 'transparent',
                borderColor: isEnabled ? getCategoryColor(category) : 'divider',
                '& .MuiChip-label': {
                  color: isEnabled ? getCategoryColor(category) : theme.palette.text.secondary
                }
              }}
            />
          ))}
        </Box>
      </CardContent>
      <CardActions>
        <Button 
          startIcon={<SpaIcon />} 
          onClick={() => triggerZenMoment(true)}
          variant="outlined"
          size="small"
        >
          Try Now
        </Button>
        
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          {lastPromptTime && settings.enabled && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Next: {timeUntilNext !== null ? `${timeUntilNext} min` : 'calculating...'}
              </Typography>
            </Box>
          )}
          
          <Button 
            startIcon={settings.enabled ? <NotificationsActiveIcon /> : <NotificationsOffIcon />} 
            onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
            color={settings.enabled ? 'primary' : 'inherit'}
            variant="text"
            size="small"
          >
            {settings.enabled ? 'On' : 'Off'}
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
  
  // Render a favorite prompt card
  const renderFavoritePrompt = (prompt: string) => {
    const category = getPromptCategory(prompt);
    
    return (
      <Card key={prompt} variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Chip 
              label={category.charAt(0).toUpperCase() + category.slice(1)} 
              size="small"
              sx={{ 
                bgcolor: `${getCategoryColor(category)}20`,
                borderColor: getCategoryColor(category),
                '& .MuiChip-label': {
                  color: getCategoryColor(category)
                }
              }}
            />
            
            <IconButton 
              size="small" 
              onClick={() => toggleFavorite(prompt)}
              color="primary"
            >
              <BookmarkIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Typography variant="body2">{prompt}</Typography>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Box>
      {/* Settings Panel */}
      {renderSettings()}
      
      {/* Current prompt display */}
      <MicroInteraction
        transition="fade"
        in={showPrompt}
        duration={0.5}
      >
        <Paper 
          elevation={4} 
          sx={{ 
            p: 3, 
            mb: 3, 
            position: 'relative',
            borderLeft: currentPrompt ? `4px solid ${getCategoryColor(getPromptCategory(currentPrompt))}` : 'none',
          }}
        >
          <IconButton 
            size="small" 
            onClick={() => setShowPrompt(false)} 
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SpaIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Moment of Zen</Typography>
          </Box>
          
          {currentPrompt && (
            <>
              <Typography variant="body1" paragraph sx={{ pr: 4 }}>
                {currentPrompt}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Chip 
                  label={getPromptCategory(currentPrompt).charAt(0).toUpperCase() + getPromptCategory(currentPrompt).slice(1)} 
                  size="small"
                  sx={{ 
                    bgcolor: `${getCategoryColor(getPromptCategory(currentPrompt))}20`,
                    borderColor: getCategoryColor(getPromptCategory(currentPrompt)),
                    '& .MuiChip-label': {
                      color: getCategoryColor(getPromptCategory(currentPrompt))
                    }
                  }}
                />
                
                <SuccessAction>
                  <IconButton 
                    color="primary" 
                    onClick={() => toggleFavorite(currentPrompt)}
                    size="small"
                  >
                    {settings.favoritePrompts.includes(currentPrompt) ? 
                      <BookmarkIcon fontSize="small" /> : 
                      <BookmarkBorderIcon fontSize="small" />
                    }
                  </IconButton>
                </SuccessAction>
              </Box>
            </>
          )}
        </Paper>
      </MicroInteraction>
      
      {/* Favorites Section */}
      {settings.favoritePrompts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Saved Prompts
          </Typography>
          
          {settings.favoritePrompts.map(prompt => renderFavoritePrompt(prompt))}
        </Box>
      )}
    </Box>
  );
};

export default ZenReminders; 