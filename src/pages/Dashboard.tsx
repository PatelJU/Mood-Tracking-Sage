import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Card, 
  CardContent,
  Divider,
  alpha,
  Stack,
  Fade,
  Zoom,
  useMediaQuery,
  useTheme as useMuiTheme,
  IconButton,
  Tooltip,
  LinearProgress,
  Container
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useMood } from '../context/MoodContext';
import { useTheme, normalizeMoodType } from '../context/ThemeContext';
import { format, parseISO, isToday, isYesterday, subDays, differenceInDays } from 'date-fns';
import MoodLogger from '../components/mood/MoodLogger';
import MoodCalendar from '../components/mood/MoodCalendar';
import { MoodType } from '../types';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { moodEntries, moodStats, getMoodSuggestion } = useMood();
  const { moodColors } = useTheme();
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [streakCount, setStreakCount] = useState(0);
  
  // Get today's mood entries
  const todayEntries = moodEntries.filter(entry => isToday(parseISO(entry.date)));
  
  // Get last 7 days entries
  const lastWeekEntries = moodEntries.filter(entry => {
    const entryDate = parseISO(entry.date);
    const sevenDaysAgo = subDays(new Date(), 7);
    return entryDate >= sevenDaysAgo;
  });
  
  // Get most recent mood
  const mostRecentMood = moodEntries.length > 0 
    ? moodEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].mood
    : null;
    
  // Calculate streak
  useEffect(() => {
    if (moodEntries.length === 0) {
      setStreakCount(0);
      return;
    }

    // Sort entries by date (newest first)
    const sortedEntries = [...moodEntries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    
    // Check if there's an entry today
    const hasEntryToday = sortedEntries.some(entry => isToday(parseISO(entry.date)));
    if (!hasEntryToday) {
      // If no entry today, start checking from yesterday
      currentDate = subDays(currentDate, 1);
    } else {
      streak = 1; // Count today
    }

    // Check consecutive days
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = parseISO(sortedEntries[i].date);
      
      // Skip if we've already counted today
      if (streak === 1 && isToday(entryDate)) continue;
      
      const daysDifference = differenceInDays(currentDate, entryDate);
      
      if (daysDifference === 0 || daysDifference === 1) {
        if (daysDifference === 1) currentDate = entryDate;
        streak++;
      } else {
        break;
      }
    }

    setStreakCount(streak);
  }, [moodEntries]);
    
  // Format user's name
  const userName = currentUser?.username || 'there';
  const firstName = userName.split(' ')[0];
  
  // Get current time period greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  // Get trend icon and color
  const getTrendInfo = () => {
    if (!moodStats) return { icon: null, color: '#4361ee' };
    
    let icon, color;
    
    switch (moodStats.moodTrend) {
      case 'improving':
        icon = <TrendingUpIcon fontSize="medium" />;
        color = '#43a047';
        break;
      case 'declining':
        icon = <TrendingDownIcon fontSize="medium" />;
        color = '#e53935';
        break;
      case 'stable':
      default:
        icon = <TrendingFlatIcon fontSize="medium" />;
        color = '#4361ee';
    }
    
    return { icon, color };
  };
  
  const trendInfo = getTrendInfo();

  // Calculate completion percentage for today
  const completionPercentage = () => {
    // Example logic - can be adjusted based on your goals
    if (todayEntries.length >= 3) return 100;
    return (todayEntries.length / 3) * 100;
  };
  
  return (
    <Container maxWidth="xl" sx={{ position: 'relative', py: 3 }}>
      <Grid container spacing={3}>
        {/* Top Row: Welcome + How you feel today */}
        <Grid item xs={12} md={8}>
          {/* Welcome Banner & Today Status */}
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 3, md: 3 },
              mb: 3,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8))',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.04), 0 1px 5px rgba(0, 0, 0, 0.02)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              position: 'relative', 
              zIndex: 2,
              mb: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px',
                  bgcolor: alpha('#4361ee', 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4361ee',
                  mr: 2
                }}>
                  <MeetingRoomOutlinedIcon />
                </Box>
                <Box>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: { xs: '1.5rem', md: '1.7rem' },
                      lineHeight: 1.2,
                      color: '#1e293b',
                      mb: 0.5
                    }}
                  >
                    {getGreeting()}, {firstName}!
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#64748b',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {format(new Date(), 'EEEE, MMMM d, yyyy')}
                    <Box 
                      component="span" 
                      sx={{ 
                        display: 'inline-block', 
                        width: '4px', 
                        height: '4px', 
                        borderRadius: '50%', 
                        bgcolor: '#94a3b8', 
                        mx: 1.5 
                      }} 
                    />
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: (todayEntries.length > 0) ? moodColors[normalizeMoodType(todayEntries[0].mood)] : '#94a3b8',
                          mr: 1
                        }} 
                      />
                      {todayEntries.length > 0 ? `Feeling ${todayEntries[0].mood}` : "How are you feeling?"}
                    </Box>
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Visualizations">
                  <IconButton 
                    sx={{ 
                      bgcolor: alpha('#4361ee', 0.1), 
                      '&:hover': { bgcolor: alpha('#4361ee', 0.15) } 
                    }}
                    onClick={() => navigate('/visualizations')}
                  >
                    <BubbleChartIcon sx={{ color: '#4361ee' }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Daily progress */}
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>
                  Today's tracking progress
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 500, color: '#94a3b8' }}>
                  {todayEntries.length} {todayEntries.length === 1 ? 'entry' : 'entries'}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={completionPercentage()} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: alpha('#e2e8f0', 0.8),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: todayEntries.length > 0 
                      ? moodColors[normalizeMoodType(todayEntries[0].mood)] 
                      : '#4361ee',
                    borderRadius: 4
                  }
                }} 
              />
            </Box>

            {/* Stats row */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Streak card */}
              <Grid item xs={6} md={3}>
                <Card variant="outlined" sx={{ 
                  borderRadius: 3, 
                  bgcolor: alpha('#4361ee', 0.05),
                  border: '1px solid', 
                  borderColor: alpha('#4361ee', 0.1),
                  boxShadow: 'none',
                  p: 1.5
                }}>
                  <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                    STREAK
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.1 }}>
                      {streakCount}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', mb: 0.5 }}>
                      {streakCount === 1 ? 'day' : 'days'}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
              
              {/* Weekly entries */}
              <Grid item xs={6} md={3}>
                <Card variant="outlined" sx={{ 
                  borderRadius: 3, 
                  bgcolor: alpha('#0ea5e9', 0.05),
                  border: '1px solid', 
                  borderColor: alpha('#0ea5e9', 0.1),
                  boxShadow: 'none',
                  p: 1.5
                }}>
                  <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                    WEEKLY
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.1 }}>
                      {lastWeekEntries.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', mb: 0.5 }}>
                      entries
                    </Typography>
                  </Box>
                </Card>
              </Grid>
              
              {/* Trend card */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ 
                  borderRadius: 3, 
                  bgcolor: alpha(trendInfo.color, 0.05),
                  border: '1px solid', 
                  borderColor: alpha(trendInfo.color, 0.15),
                  boxShadow: 'none',
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: '8px',
                        bgcolor: alpha(trendInfo.color, 0.15),
                        color: trendInfo.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 1.5
                      }}
                    >
                      {trendInfo.icon}
                    </Box>
                    <Box>
                      <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.5px', display: 'block' }}>
                        MOOD TREND
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: trendInfo.color, lineHeight: 1.1 }}>
                        {moodStats?.moodTrend === 'improving' 
                          ? 'Getting better!' 
                          : moodStats?.moodTrend === 'declining'
                            ? 'Needs attention'
                            : 'Staying stable'}
                      </Typography>
                    </Box>
                  </Box>
                  <Button 
                    size="small" 
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      color: '#64748b',
                      '&:hover': { bgcolor: alpha('#64748b', 0.05) }
                    }}
                    onClick={() => navigate('/visualizations')}
                  >
                    Details
                  </Button>
                </Card>
              </Grid>
            </Grid>
            
            {/* Action buttons */}
            <Stack 
              direction="row" 
              spacing={2} 
              sx={{ 
                mt: 2,
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'rgba(0,0,0,0.06)'
              }}
            >
              <Button 
                variant="outlined" 
                startIcon={<CalendarMonthRoundedIcon />}
                onClick={() => navigate('/calendar')}
                sx={{
                  flex: 1,
                  py: 1,
                  borderRadius: 2,
                  borderColor: '#a5b4fc',
                  color: '#3730a3',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#4361ee',
                    backgroundColor: '#eff6ff'
                  }
                }}
              >
                Calendar
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<BarChartRoundedIcon />}
                onClick={() => navigate('/analytics')}
                sx={{
                  flex: 1,
                  py: 1,
                  borderRadius: 2,
                  borderColor: '#a5d8ff',
                  color: '#0c4a6e',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#4cc9f0',
                    backgroundColor: '#ecfeff'
                  }
                }}
              >
                Analytics
              </Button>
            </Stack>
          </Paper>
        </Grid>
          
        {/* Mood Summary Card */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{ 
              borderRadius: '16px',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8))',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.04), 0 1px 5px rgba(0, 0, 0, 0.02)',
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px',
                  bgcolor: alpha('#7c3aed', 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7c3aed',
                  mr: 2
                }}>
                  <LightbulbOutlinedIcon />
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    color: '#1e293b'
                  }}
                >
                  Your Mood Summary
                </Typography>
              </Box>
              <Tooltip title="Options">
                <IconButton size="small">
                  <MoreHorizIcon sx={{ color: '#64748b' }} />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: '#64748b',
                  fontWeight: 600,
                  mb: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>Today's Entries</span>
                {todayEntries.length > 0 && (
                  <Typography 
                    component="span"
                    variant="caption" 
                    sx={{ 
                      fontWeight: 500,
                      color: '#94a3b8',
                      ml: 1
                    }}
                  >
                    {todayEntries.length} {todayEntries.length === 1 ? 'entry' : 'entries'}
                  </Typography>
                )}
              </Typography>
              
              {todayEntries.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {todayEntries.map(entry => (
                    <Fade in={true} key={entry.date}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          bgcolor: alpha(moodColors[normalizeMoodType(entry.mood)], 0.1),
                          border: `1px solid ${alpha(moodColors[normalizeMoodType(entry.mood)], 0.2)}`,
                          borderRadius: 2,
                          px: 2,
                          py: 1.5
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box 
                            sx={{ 
                              width: 10, 
                              height: 10, 
                              borderRadius: '50%', 
                              bgcolor: moodColors[normalizeMoodType(entry.mood)],
                              mr: 1.5
                            }} 
                          />
                          <Typography 
                            variant="body2"
                            sx={{ 
                              fontWeight: 600,
                              color: '#1e293b'
                            }}
                          >
                            {entry.mood}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 500,
                            color: '#64748b'
                          }}
                        >
                          {format(parseISO(entry.date), 'h:mm a')}
                        </Typography>
                      </Box>
                    </Fade>
                  ))}
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    p: 2.5, 
                    bgcolor: alpha('#f1f5f9', 0.5),
                    borderRadius: 2,
                    border: '1px solid #f1f5f9',
                    textAlign: 'center'
                  }}
                >
                  <Typography 
                    variant="body2"
                    sx={{ 
                      color: '#64748b',
                      fontWeight: 500
                    }}
                  >
                    No entries yet today
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: '#94a3b8',
                      mt: 0.5
                    }}
                  >
                    How are you feeling right now?
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* Daily Inspiration */}
            <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: '#64748b',
                  fontWeight: 600,
                  mb: 1.5,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <LightbulbOutlinedIcon sx={{ fontSize: '1rem', mr: 0.75, color: '#f59e0b' }} />
                Daily Inspiration
              </Typography>
              
              <Card
                variant="outlined"
                sx={{ 
                  borderRadius: 2, 
                  border: '1px dashed rgba(0,0,0,0.1)',
                  bgcolor: alpha('#fffbeb', 0.7)
                }}
              >
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#78350f', fontStyle: 'italic' }}>
                    "Your emotions are valuable data. Track them, understand them, and let them guide you to a better tomorrow."
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Paper>
        </Grid>
        
        {/* Mood Logger */}
        <Grid item xs={12}>
          <MoodLogger />
        </Grid>
        
        {/* Calendar Preview - Full Width */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{ 
              borderRadius: '16px',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8))',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.04), 0 1px 5px rgba(0, 0, 0, 0.02)',
              p: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '10px',
                bgcolor: alpha('#0ea5e9', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0ea5e9',
                mr: 2
              }}>
                <CalendarMonthRoundedIcon />
              </Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: '#1e293b'
                }}
              >
                Your Mood Calendar
              </Typography>
            </Box>
            
            <MoodCalendar />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 