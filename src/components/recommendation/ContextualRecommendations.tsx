import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Avatar,
  Divider,
  Rating,
  IconButton,
  Tooltip,
  useTheme as useMuiTheme
} from '@mui/material';
import { useMood } from '../../context/MoodContext';
import { useTheme, normalizeMoodType } from '../../context/ThemeContext';
import { MoodType, TimeOfDay } from '../../types';
import { format, parseISO, isSameDay } from 'date-fns';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import NaturePeopleIcon from '@mui/icons-material/NaturePeople';
import SpaIcon from '@mui/icons-material/Spa';
import PeopleIcon from '@mui/icons-material/People';
import BookIcon from '@mui/icons-material/Book';
import MovieIcon from '@mui/icons-material/Movie';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

// Activity categories with icons
const ACTIVITY_CATEGORIES = {
  meditation: { label: 'Meditation', icon: <SelfImprovementIcon /> },
  exercise: { label: 'Exercise', icon: <FitnessCenterIcon /> },
  healthy_eating: { label: 'Healthy Eating', icon: <RestaurantIcon /> },
  music: { label: 'Music', icon: <MusicNoteIcon /> },
  nature: { label: 'Nature', icon: <NaturePeopleIcon /> },
  self_care: { label: 'Self Care', icon: <SpaIcon /> },
  social: { label: 'Social', icon: <PeopleIcon /> },
  learning: { label: 'Learning', icon: <BookIcon /> },
  entertainment: { label: 'Entertainment', icon: <MovieIcon /> }
};

// Mock activity recommendations database
const activityRecommendations = [
  // Very Bad mood activities
  { 
    id: '1', 
    name: '5-minute breathing exercise', 
    description: 'Sit quietly and focus on your breath for 5 minutes to ground yourself',
    category: 'meditation',
    forMoods: ['Very Bad'],
    timeOfDay: ['morning', 'afternoon', 'evening', 'night'],
    duration: 5,
    effectiveness: 4.2
  },
  { 
    id: '2', 
    name: 'Journal negative thoughts', 
    description: 'Write down what you\'re feeling to process difficult emotions',
    category: 'self_care',
    forMoods: ['Very Bad', 'Bad'],
    timeOfDay: ['morning', 'evening', 'night'],
    duration: 10,
    effectiveness: 4.5
  },
  { 
    id: '3', 
    name: 'Call a supportive friend', 
    description: 'Reach out to someone who lifts your spirits',
    category: 'social',
    forMoods: ['Very Bad', 'Bad'],
    timeOfDay: ['afternoon', 'evening'],
    duration: 15,
    effectiveness: 4.7
  },
  
  // Bad mood activities
  { 
    id: '4', 
    name: 'Quick body scan meditation', 
    description: 'Check in with your body to release tension and stress',
    category: 'meditation',
    forMoods: ['Bad', 'Okay'],
    timeOfDay: ['morning', 'afternoon', 'evening', 'night'],
    duration: 7,
    effectiveness: 4.0
  },
  { 
    id: '5', 
    name: 'Listen to uplifting music', 
    description: 'Play songs that boost your energy and mood',
    category: 'music',
    forMoods: ['Bad', 'Okay'],
    timeOfDay: ['morning', 'afternoon', 'evening'],
    duration: 15,
    effectiveness: 4.3
  },
  { 
    id: '6', 
    name: '10-minute walk outside', 
    description: 'Get some fresh air and change your environment',
    category: 'nature',
    forMoods: ['Bad', 'Okay'],
    timeOfDay: ['morning', 'afternoon'],
    duration: 10,
    effectiveness: 4.4
  },
  
  // Okay mood activities
  { 
    id: '7', 
    name: 'Mindful tea/coffee break', 
    description: 'Enjoy a warm drink with full attention to the present moment',
    category: 'self_care',
    forMoods: ['Okay'],
    timeOfDay: ['morning', 'afternoon'],
    duration: 10,
    effectiveness: 3.9
  },
  { 
    id: '8', 
    name: 'Stretching session', 
    description: 'Do some gentle stretches to release physical tension',
    category: 'exercise',
    forMoods: ['Okay', 'Good'],
    timeOfDay: ['morning', 'evening'],
    duration: 10,
    effectiveness: 4.1
  },
  { 
    id: '9', 
    name: 'Learn something new', 
    description: 'Spend time reading an article or watching an educational video',
    category: 'learning',
    forMoods: ['Okay', 'Good'],
    timeOfDay: ['afternoon', 'evening'],
    duration: 20,
    effectiveness: 3.8
  },
  
  // Good mood activities
  { 
    id: '10', 
    name: 'Moderate exercise', 
    description: 'Go for a jog, bike ride, or do a workout that gets your heart pumping',
    category: 'exercise',
    forMoods: ['Good'],
    timeOfDay: ['morning', 'afternoon'],
    duration: 30,
    effectiveness: 4.6
  },
  { 
    id: '11', 
    name: 'Creative project time', 
    description: 'Work on art, writing, music, or any creative outlet',
    category: 'self_care',
    forMoods: ['Good', 'Very Good'],
    timeOfDay: ['afternoon', 'evening'],
    duration: 45,
    effectiveness: 4.3
  },
  { 
    id: '12', 
    name: 'Social gathering', 
    description: 'Arrange to meet friends or family to share your positive energy',
    category: 'social',
    forMoods: ['Good', 'Very Good'],
    timeOfDay: ['afternoon', 'evening'],
    duration: 60,
    effectiveness: 4.5
  },
  
  // Very Good mood activities
  { 
    id: '13', 
    name: 'Gratitude journaling', 
    description: 'Write down things you\'re thankful for to amplify positive feelings',
    category: 'self_care',
    forMoods: ['Very Good'],
    timeOfDay: ['morning', 'evening'],
    duration: 10,
    effectiveness: 4.4
  },
  { 
    id: '14', 
    name: 'Try something challenging', 
    description: 'Push your comfort zone with a new experience or skill',
    category: 'learning',
    forMoods: ['Very Good'],
    timeOfDay: ['morning', 'afternoon', 'evening'],
    duration: 60,
    effectiveness: 4.2
  },
  { 
    id: '15', 
    name: 'Help someone else', 
    description: 'Use your good energy to volunteer or assist someone in need',
    category: 'social',
    forMoods: ['Very Good', 'Good'],
    timeOfDay: ['morning', 'afternoon'],
    duration: 30,
    effectiveness: 4.8
  }
];

// Activity feedback type
interface ActivityFeedback {
  activityId: string;
  mood: MoodType;
  date: string;
  rating: number;
}

const ContextualRecommendations: React.FC = () => {
  const { moodEntries } = useMood();
  const { moodColors } = useTheme();
  const muiTheme = useMuiTheme();
  
  const [currentTimeOfDay, setCurrentTimeOfDay] = useState<TimeOfDay>('full-day');
  const [latestMood, setLatestMood] = useState<MoodType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [activityFeedback, setActivityFeedback] = useState<ActivityFeedback[]>([]);
  
  // Detect current time of day
  useEffect(() => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      setCurrentTimeOfDay('morning');
    } else if (hour >= 12 && hour < 17) {
      setCurrentTimeOfDay('afternoon');
    } else if (hour >= 17 && hour < 21) {
      setCurrentTimeOfDay('evening');
    } else {
      setCurrentTimeOfDay('night');
    }
  }, []);
  
  // Get latest mood
  useEffect(() => {
    if (moodEntries.length === 0) {
      setLoading(false);
      return;
    }
    
    // Sort by date, newest first
    const sortedEntries = [...moodEntries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Use today's mood if available
    const today = new Date();
    const todaysEntry = sortedEntries.find(entry => isSameDay(parseISO(entry.date), today));
    
    if (todaysEntry) {
      setLatestMood(todaysEntry.mood);
    } else if (sortedEntries.length > 0) {
      // Otherwise use the most recent mood
      setLatestMood(sortedEntries[0].mood);
    }
    
    setLoading(false);
  }, [moodEntries]);
  
  // Get activity recommendations
  useEffect(() => {
    if (!latestMood) return;
    
    // Get stored feedback if any
    const storedFeedback = localStorage.getItem('activityFeedback');
    if (storedFeedback) {
      setActivityFeedback(JSON.parse(storedFeedback));
    }
    
    // Recommend activities based on mood and time of day
    let selectedActivities = activityRecommendations.filter(activity => 
      activity.forMoods.includes(latestMood) && 
      activity.timeOfDay.includes(currentTimeOfDay)
    );
    
    // If not enough recommendations, expand to any time of day
    if (selectedActivities.length < 3) {
      selectedActivities = activityRecommendations.filter(activity => 
        activity.forMoods.includes(latestMood)
      );
    }
    
    // If still not enough, expand to adjacent moods
    if (selectedActivities.length < 3) {
      const moodValues = {
        'Very Bad': 0,
        'Bad': 1,
        'Okay': 2,
        'Good': 3,
        'Very Good': 4
      };
      
      const currentMoodValue = moodValues[latestMood];
      const adjacentMoods = Object.entries(moodValues)
        .filter(([_, value]) => Math.abs(value - currentMoodValue) <= 1)
        .map(([mood]) => mood as MoodType);
      
      selectedActivities = activityRecommendations.filter(activity => 
        activity.forMoods.some(mood => adjacentMoods.includes(mood as MoodType))
      );
    }
    
    // Sort by effectiveness
    selectedActivities.sort((a, b) => b.effectiveness - a.effectiveness);
    
    // Use feedback data to influence ordering
    if (activityFeedback.length > 0) {
      selectedActivities.sort((a, b) => {
        const aFeedback = activityFeedback.find(f => f.activityId === a.id);
        const bFeedback = activityFeedback.find(f => f.activityId === b.id);
        
        // Prioritize activities with high ratings
        if (aFeedback && bFeedback) {
          return bFeedback.rating - aFeedback.rating;
        } else if (aFeedback) {
          return aFeedback.rating >= 4 ? -1 : 1;
        } else if (bFeedback) {
          return bFeedback.rating >= 4 ? 1 : -1;
        } 
        
        return 0;
      });
    }
    
    setRecommendations(selectedActivities.slice(0, 5));
  }, [latestMood, currentTimeOfDay]);
  
  // Handle activity feedback
  const handleActivityFeedback = (activityId: string, rating: number) => {
    const today = new Date().toISOString();
    
    const newFeedback = {
      activityId,
      mood: latestMood as MoodType,
      date: today,
      rating
    };
    
    const updatedFeedback = [...activityFeedback.filter(f => f.activityId !== activityId), newFeedback];
    setActivityFeedback(updatedFeedback);
    
    // Store feedback
    localStorage.setItem('activityFeedback', JSON.stringify(updatedFeedback));
  };
  
  // Get activity category icon
  const getActivityIcon = (category: string) => {
    // @ts-ignore: category might not be in the mapping
    return ACTIVITY_CATEGORIES[category]?.icon || <LocalActivityIcon />;
  };
  
  // Get activity category label
  const getActivityCategoryLabel = (category: string) => {
    // @ts-ignore: category might not be in the mapping
    return ACTIVITY_CATEGORIES[category]?.label || category;
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocalActivityIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" fontWeight="bold">
            Suggested Activities
          </Typography>
        </Box>
        
        {latestMood && (
          <Chip 
            label={latestMood} 
            sx={{ 
              bgcolor: `${moodColors[normalizeMoodType(latestMood)]}20`,
              borderColor: moodColors[normalizeMoodType(latestMood)],
              border: '1px solid',
              fontWeight: 'medium'
            }} 
          />
        )}
      </Box>
      
      <Typography variant="body2" paragraph sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 3 }}>
        <InfoOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
        Personalized activity recommendations based on your current mood, time of day, and what has worked for you in the past.
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress />
        </Box>
      ) : !latestMood ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" gutterBottom>
            No mood data available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Log your mood to get personalized activity recommendations.
          </Typography>
        </Box>
      ) : recommendations.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" gutterBottom>
            No recommendations available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            We couldn't find suitable activities for your current mood and time of day.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {recommendations.map((activity) => {
            const feedback = activityFeedback.find(f => f.activityId === activity.id);
            
            return (
              <Grid item xs={12} md={6} key={activity.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main', 
                          color: 'primary.contrastText',
                          mr: 2
                        }}
                      >
                        {getActivityIcon(activity.category)}
                      </Avatar>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {activity.name}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {activity.description}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', mt: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: { xs: 1, sm: 0 } }}>
                        <Chip 
                          label={`${activity.duration} min`}
                          size="small"
                          sx={{ 
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' 
                          }}
                        />
                        
                        <Chip 
                          label={getActivityCategoryLabel(activity.category)}
                          size="small"
                          sx={{ 
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' 
                          }}
                        />
                      </Box>
                      
                      {feedback ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ mr: 1 }}>
                            Your rating:
                          </Typography>
                          <Rating value={feedback.rating} readOnly size="small" />
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Not helpful">
                            <IconButton 
                              size="small" 
                              onClick={() => handleActivityFeedback(activity.id, 1)}
                              sx={{ color: 'text.secondary' }}
                            >
                              <ThumbDownIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Helpful">
                            <IconButton 
                              size="small" 
                              onClick={() => handleActivityFeedback(activity.id, 5)}
                              sx={{ color: 'primary.main' }}
                            >
                              <ThumbUpIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
          
          <Grid item xs={12} md={6}>
            <Card 
              variant="outlined" 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 3,
                textAlign: 'center',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                border: '1px dashed',
                borderColor: 'divider'
              }}
            >
              <AddIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Add Custom Activity
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Create your own activities and track what works best for your moods
              </Typography>
              <Button variant="outlined" startIcon={<AddIcon />}>
                Add Activity
              </Button>
            </Card>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

export default ContextualRecommendations; 