import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Button, 
  Container,
  Typography,
  Grid,
  Divider,
  Chip,
  alpha,
  Card,
  CardContent
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parse, parseISO, isSameDay } from 'date-fns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useMood } from '../context/MoodContext';
import { useTheme, normalizeMoodType } from '../context/ThemeContext';
import { MoodEntry } from '../types';

const MoodDetails: React.FC = () => {
  const { dateParam } = useParams<{ dateParam?: string }>();
  const navigate = useNavigate();
  const { moodEntries, getMoodEntriesByDate } = useMood();
  const { moodColors } = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<MoodEntry[]>([]);

  // Parse the date parameter if available (format: yyyy-MM-dd)
  useEffect(() => {
    if (dateParam) {
      try {
        const parsedDate = parse(dateParam, 'yyyy-MM-dd', new Date());
        setSelectedDate(parsedDate);
        
        // Get mood entries for this date
        const entriesForDate = getMoodEntriesByDate(parsedDate);
        setEntries(entriesForDate);
      } catch (error) {
        console.error('Failed to parse date', error);
        setSelectedDate(new Date());
      }
    }
  }, [dateParam, getMoodEntriesByDate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddMood = () => {
    // Navigate to mood entry page with the date
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    navigate(`/mood-entry/${formattedDate}`);
  };

  // Get appropriate time of day icon
  const getTimeOfDayIcon = (timeOfDay: string) => {
    switch(timeOfDay) {
      case 'morning':
        return '🌅';
      case 'afternoon':
        return '☀️';
      case 'evening':
        return '🌆';
      case 'night':
        return '🌙';
      default:
        return '📅';
    }
  };

  // Get emoji for mood
  const getMoodEmoji = (mood: string) => {
    switch(mood) {
      case 'Very Bad':
        return '😢';
      case 'Bad':
        return '😕';
      case 'Okay':
        return '😐';
      case 'Good':
        return '🙂';
      case 'Very Good':
        return '😄';
      default:
        return '😐';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ 
            color: 'var(--color-text-dark)',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.05)'
            }
          }}
        >
          Back to Calendar
        </Button>
        <Typography 
          variant="h5" 
          fontWeight="bold" 
          sx={{ 
            color: 'var(--color-text-dark)', 
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}
        >
          {format(selectedDate, 'MMMM d, yyyy')}
        </Typography>
        <Box sx={{ width: 100 }} />
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 'var(--radius-xl)',
          background: 'var(--surface-glass-light-solid)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          overflow: 'hidden',
          p: 4
        }}
      >
        {entries.length > 0 ? (
          <>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
              Your Mood History for {format(selectedDate, 'MMMM d, yyyy')}
            </Typography>
            
            <Grid container spacing={3}>
              {entries.map((entry) => {
                const moodColor = moodColors[normalizeMoodType(entry.mood)];
                
                return (
                  <Grid item xs={12} key={entry.id}>
                    <Card 
                      elevation={1}
                      sx={{ 
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        position: 'relative',
                        borderLeft: `6px solid ${moodColor}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: 'var(--shadow-lg)'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `linear-gradient(90deg, ${alpha(moodColor, 0.15)}, transparent)`,
                          zIndex: 0
                        }}
                      />
                      
                      <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box 
                                  sx={{ 
                                    width: 50, 
                                    height: 50, 
                                    borderRadius: '50%', 
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: alpha(moodColor, 0.2),
                                    border: `2px solid ${moodColor}`,
                                    fontSize: '1.8rem'
                                  }}
                                >
                                  {getMoodEmoji(entry.mood)}
                                </Box>
                                <Typography variant="h6" fontWeight="600" sx={{ color: moodColor }}>
                                  {entry.mood}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip 
                                  icon={<AccessTimeIcon fontSize="small" />}
                                  label={entry.timeOfDay ? 
                                    `${getTimeOfDayIcon(entry.timeOfDay)} ${entry.timeOfDay.charAt(0).toUpperCase() + entry.timeOfDay.slice(1)}` : 
                                    'Full Day'
                                  }
                                  sx={{ 
                                    bgcolor: alpha(moodColor, 0.1),
                                    color: moodColor,
                                    fontWeight: 500,
                                    '& .MuiChip-icon': {
                                      color: moodColor
                                    }
                                  }}
                                />
                              </Box>
                            </Box>
                          </Grid>
                          
                          {entry.notes && (
                            <Grid item xs={12}>
                              <Paper
                                elevation={0}
                                sx={{ 
                                  p: 2.5, 
                                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                                  borderRadius: 'var(--radius-md)',
                                  border: `1px solid ${alpha(moodColor, 0.2)}`
                                }}
                              >
                                <Typography variant="body1">
                                  {entry.notes}
                                </Typography>
                              </Paper>
                            </Grid>
                          )}
                          
                          {entry.activities && entry.activities.length > 0 && (
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                Activities:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {entry.activities.map((activity, index) => (
                                  <Chip 
                                    key={index}
                                    label={activity}
                                    size="small"
                                    sx={{ 
                                      bgcolor: alpha(moodColor, 0.1),
                                      color: alpha(moodColor, 0.8),
                                      border: `1px solid ${alpha(moodColor, 0.2)}`
                                    }}
                                  />
                                ))}
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
            
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddMood}
                sx={{
                  borderRadius: 'var(--radius-md)',
                  py: 1.5,
                  px: 3,
                  boxShadow: 'var(--shadow-md)',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
              >
                Add Another Entry for This Day
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            py: 6
          }}>
            <Box 
              sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: 'rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <CalendarTodayIcon sx={{ fontSize: 40, color: 'var(--color-primary)' }} />
            </Box>
            
            <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
              No mood entries yet for {format(selectedDate, 'MMMM d, yyyy')}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
              You haven't recorded how you were feeling on this day. Would you like to log your mood now?
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddMood}
              sx={{
                borderRadius: 'var(--radius-md)',
                py: 1.5,
                px: 4,
                boxShadow: 'var(--shadow-md)',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
              }}
            >
              Log Your Mood
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default MoodDetails; 