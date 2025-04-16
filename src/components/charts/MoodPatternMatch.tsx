import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  ToggleButtonGroup, 
  ToggleButton, 
  useMediaQuery,
  alpha,
  Tooltip,
  useTheme as useMuiTheme,
  LinearProgress,
  Chip,
  Stack,
  Card,
  CardContent,
  Divider,
  IconButton,
  Collapse,
  Avatar
} from '@mui/material';
// Custom timeline components instead of @mui/lab
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import WeekendIcon from '@mui/icons-material/Weekend';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { 
  format, 
  parseISO, 
  isSameDay, 
  subDays, 
  subWeeks, 
  subMonths, 
  startOfToday,
  isMonday,
  isTuesday,
  isWednesday,
  isThursday,
  isFriday,
  isSaturday,
  isSunday,
  getHours,
  getDay
} from 'date-fns';
import { useMood } from '../../context/MoodContext';
import { useTheme, normalizeMoodType } from '../../context/ThemeContext';

// Custom Timeline Components
const Timeline: React.FC<{ children: React.ReactNode, position?: 'left' | 'right' | 'alternate' }> = ({ 
  children, 
  position = 'right' 
}) => {
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      gap: 1
    }}>
      {children}
    </Box>
  );
};

const TimelineItem: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ 
      display: 'flex',
      alignItems: 'flex-start',
      mb: 2
    }}>
      {children}
    </Box>
  );
};

const TimelineSeparator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      mr: 2
    }}>
      {children}
    </Box>
  );
};

const TimelineConnector: React.FC = () => {
  return (
    <Box sx={{ 
      width: 2,
      backgroundColor: 'rgba(0, 0, 0, 0.12)',
      flexGrow: 1,
      my: 1
    }} />
  );
};

const TimelineDot: React.FC<{ 
  children?: React.ReactNode, 
  sx?: any
}> = ({ children, sx }) => {
  return (
    <Avatar
      sx={{ 
        width: 36, 
        height: 36,
        bgcolor: 'primary.main',
        color: 'white',
        ...sx
      }}
    >
      {children}
    </Avatar>
  );
};

const TimelineContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ flex: 1 }}>
      {children}
    </Box>
  );
};

interface PatternInfo {
  type: string;
  description: string;
  frequency: number;
  confidence: number; // 0-100
  moodSequence: string[];
  color: string;
  examples: {
    date: string;
    mood: string;
  }[];
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MoodPatternMatch: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState<string>('month');
  const [loading, setLoading] = useState<boolean>(true);
  const [patterns, setPatterns] = useState<PatternInfo[]>([]);
  const [expandedPattern, setExpandedPattern] = useState<number | null>(null);
  
  const { moodEntries } = useMood();
  const { moodColors } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  
  const handleTimeFrameChange = (event: React.MouseEvent<HTMLElement>, newTimeFrame: string) => {
    if (newTimeFrame !== null) {
      setTimeFrame(newTimeFrame);
      setLoading(true);
      analyzePatterns(newTimeFrame);
    }
  };

  const togglePatternDetails = (index: number) => {
    setExpandedPattern(expandedPattern === index ? null : index);
  };
  
  // Filter entries based on selected time frame
  const filterEntriesByTimeFrame = (selectedTimeFrame: string) => {
    const today = startOfToday();
    let startDate: Date;
    
    switch (selectedTimeFrame) {
      case 'week':
        startDate = subWeeks(today, 1);
        break;
      case 'month':
        startDate = subMonths(today, 1);
        break;
      case 'quarter':
        startDate = subMonths(today, 3);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate = subMonths(today, 1);
    }
    
    return moodEntries.filter(entry => new Date(entry.date) >= startDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Analyze mood patterns in the data
  const analyzePatterns = useCallback((selectedTimeFrame: string) => {
    setLoading(true);
    
    // Simulate analysis delay for better UX
    setTimeout(() => {
      const filteredEntries = filterEntriesByTimeFrame(selectedTimeFrame);
      const discoveredPatterns: PatternInfo[] = [];
      
      // Skip analysis if not enough entries
      if (filteredEntries.length < 3) {
        setPatterns([]);
        setLoading(false);
        return;
      }
      
      // 1. Analyze day of week patterns
      const moodsByDayOfWeek: Record<number, { moods: string[], avgScore: number }> = {};
      
      // Initialize for all days of the week
      for (let i = 0; i < 7; i++) {
        moodsByDayOfWeek[i] = { moods: [], avgScore: 0 };
      }
      
      // Group moods by day of week
      filteredEntries.forEach(entry => {
        const date = parseISO(entry.date);
        const dayOfWeek = getDay(date);
        moodsByDayOfWeek[dayOfWeek].moods.push(entry.mood);
      });
      
      // Calculate average mood score for each day
      const moodScores: Record<string, number> = {
        'Very Bad': 0,
        'Bad': 1,
        'Okay': 2,
        'Good': 3,
        'Very Good': 4
      };
      
      for (let day = 0; day < 7; day++) {
        const { moods } = moodsByDayOfWeek[day];
        if (moods.length > 0) {
          const totalScore = moods.reduce((sum, mood) => sum + (moodScores[mood] || 2), 0);
          moodsByDayOfWeek[day].avgScore = totalScore / moods.length;
        }
      }
      
      // Find best and worst days
      let bestDay = -1;
      let worstDay = -1;
      let bestScore = -1;
      let worstScore = 5;
      
      for (let day = 0; day < 7; day++) {
        const { avgScore, moods } = moodsByDayOfWeek[day];
        
        // Only consider days with enough data points
        if (moods.length >= 2) {
          if (avgScore > bestScore) {
            bestScore = avgScore;
            bestDay = day;
          }
          
          if (avgScore < worstScore) {
            worstScore = avgScore;
            worstDay = day;
          }
        }
      }
      
      // Add best day pattern if found
      if (bestDay !== -1 && bestScore >= 2.5) {
        const bestDayEntries = filteredEntries.filter(entry => 
          getDay(parseISO(entry.date)) === bestDay
        );
        
        const examples = bestDayEntries.slice(0, 3).map(entry => ({
          date: entry.date,
          mood: entry.mood
        }));
        
        discoveredPatterns.push({
          type: 'weekday',
          description: `${DAYS_OF_WEEK[bestDay]} is your best day`,
          frequency: moodsByDayOfWeek[bestDay].moods.length,
          confidence: Math.min(95, 60 + moodsByDayOfWeek[bestDay].moods.length * 5),
          moodSequence: moodsByDayOfWeek[bestDay].moods.slice(0, 5),
          color: '#4caf50',
          examples
        });
      }
      
      // Add worst day pattern if found
      if (worstDay !== -1 && worstScore <= 1.5 && worstDay !== bestDay) {
        const worstDayEntries = filteredEntries.filter(entry => 
          getDay(parseISO(entry.date)) === worstDay
        );
        
        const examples = worstDayEntries.slice(0, 3).map(entry => ({
          date: entry.date,
          mood: entry.mood
        }));
        
        discoveredPatterns.push({
          type: 'weekday',
          description: `${DAYS_OF_WEEK[worstDay]} is your most challenging day`,
          frequency: moodsByDayOfWeek[worstDay].moods.length,
          confidence: Math.min(95, 60 + moodsByDayOfWeek[worstDay].moods.length * 5),
          moodSequence: moodsByDayOfWeek[worstDay].moods.slice(0, 5),
          color: '#f44336',
          examples
        });
      }
      
      // 2. Analyze weekend vs weekday patterns
      const weekdayMoods: string[] = [];
      const weekendMoods: string[] = [];
      
      filteredEntries.forEach(entry => {
        const date = parseISO(entry.date);
        const day = getDay(date);
        
        if (day === 0 || day === 6) {
          weekendMoods.push(entry.mood);
        } else {
          weekdayMoods.push(entry.mood);
        }
      });
      
      if (weekdayMoods.length >= 3 && weekendMoods.length >= 2) {
        const weekdayScore = weekdayMoods.reduce((sum, mood) => sum + (moodScores[mood] || 2), 0) / weekdayMoods.length;
        const weekendScore = weekendMoods.reduce((sum, mood) => sum + (moodScores[mood] || 2), 0) / weekendMoods.length;
        
        // If significant difference between weekend and weekday moods
        if (Math.abs(weekendScore - weekdayScore) >= 0.8) {
          const better = weekendScore > weekdayScore ? 'weekends' : 'weekdays';
          const examples = filteredEntries
            .filter(entry => {
              const day = getDay(parseISO(entry.date));
              return better === 'weekends' ? (day === 0 || day === 6) : (day !== 0 && day !== 6);
            })
            .slice(0, 3)
            .map(entry => ({
              date: entry.date,
              mood: entry.mood
            }));
          
          discoveredPatterns.push({
            type: 'weekend',
            description: `You generally feel better on ${better}`,
            frequency: better === 'weekends' ? weekendMoods.length : weekdayMoods.length,
            confidence: Math.min(90, 60 + Math.abs(weekendScore - weekdayScore) * 20),
            moodSequence: better === 'weekends' ? weekendMoods.slice(0, 5) : weekdayMoods.slice(0, 5),
            color: '#2196f3',
            examples
          });
        }
      }
      
      // 3. Analyze time of day patterns
      const moodsByTimeOfDay: Record<string, string[]> = {
        'morning': [],
        'afternoon': [],
        'evening': [],
        'night': []
      };
      
      filteredEntries.forEach(entry => {
        if (entry.timeOfDay && entry.timeOfDay !== 'full-day') {
          moodsByTimeOfDay[entry.timeOfDay].push(entry.mood);
        } else {
          // If full-day, estimate based on timestamp
          const hour = getHours(parseISO(entry.date));
          if (hour >= 5 && hour < 12) {
            moodsByTimeOfDay['morning'].push(entry.mood);
          } else if (hour >= 12 && hour < 17) {
            moodsByTimeOfDay['afternoon'].push(entry.mood);
          } else if (hour >= 17 && hour < 22) {
            moodsByTimeOfDay['evening'].push(entry.mood);
          } else {
            moodsByTimeOfDay['night'].push(entry.mood);
          }
        }
      });
      
      // Find best and worst times of day
      const timeOfDayScores: Record<string, number> = {};
      let bestTimeOfDay = '';
      let worstTimeOfDay = '';
      let bestTimeScore = -1;
      let worstTimeScore = 5;
      
      Object.entries(moodsByTimeOfDay).forEach(([timeOfDay, moods]) => {
        if (moods.length >= 3) {
          const score = moods.reduce((sum, mood) => sum + (moodScores[mood] || 2), 0) / moods.length;
          timeOfDayScores[timeOfDay] = score;
          
          if (score > bestTimeScore) {
            bestTimeScore = score;
            bestTimeOfDay = timeOfDay;
          }
          
          if (score < worstTimeScore) {
            worstTimeScore = score;
            worstTimeOfDay = timeOfDay;
          }
        }
      });
      
      // Add time of day patterns if found
      if (bestTimeOfDay && bestTimeScore >= 2.5) {
        const bestTimeEntries = filteredEntries.filter(entry => 
          entry.timeOfDay === bestTimeOfDay || 
          (entry.timeOfDay === 'full-day' && getTimeOfDayFromHour(getHours(parseISO(entry.date))) === bestTimeOfDay)
        );
        
        const examples = bestTimeEntries.slice(0, 3).map(entry => ({
          date: entry.date,
          mood: entry.mood
        }));
        
        discoveredPatterns.push({
          type: 'timeOfDay',
          description: `You tend to feel best during the ${formatTimeOfDay(bestTimeOfDay)}`,
          frequency: moodsByTimeOfDay[bestTimeOfDay].length,
          confidence: Math.min(90, 60 + moodsByTimeOfDay[bestTimeOfDay].length * 3),
          moodSequence: moodsByTimeOfDay[bestTimeOfDay].slice(0, 5),
          color: '#9c27b0',
          examples
        });
      }
      
      if (worstTimeOfDay && worstTimeScore <= 1.5 && worstTimeOfDay !== bestTimeOfDay) {
        const worstTimeEntries = filteredEntries.filter(entry => 
          entry.timeOfDay === worstTimeOfDay || 
          (entry.timeOfDay === 'full-day' && getTimeOfDayFromHour(getHours(parseISO(entry.date))) === worstTimeOfDay)
        );
        
        const examples = worstTimeEntries.slice(0, 3).map(entry => ({
          date: entry.date,
          mood: entry.mood
        }));
        
        discoveredPatterns.push({
          type: 'timeOfDay',
          description: `You often feel lower during the ${formatTimeOfDay(worstTimeOfDay)}`,
          frequency: moodsByTimeOfDay[worstTimeOfDay].length,
          confidence: Math.min(90, 60 + moodsByTimeOfDay[worstTimeOfDay].length * 3),
          moodSequence: moodsByTimeOfDay[worstTimeOfDay].slice(0, 5),
          color: '#ff9800',
          examples
        });
      }
      
      // Sort patterns by confidence
      discoveredPatterns.sort((a, b) => b.confidence - a.confidence);
      
      setPatterns(discoveredPatterns);
      setLoading(false);
    }, 1200);
  }, [moodEntries, moodColors]);

  // Helper function to get time of day from hour
  const getTimeOfDayFromHour = (hour: number): string => {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  };
  
  // Helper function to format time of day
  const formatTimeOfDay = (timeOfDay: string): string => {
    return timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1);
  };
  
  // Initialize pattern analysis
  useEffect(() => {
    analyzePatterns(timeFrame);
  }, [analyzePatterns, timeFrame]);
  
  // Get time frame title for display
  const getTimeFrameTitle = () => {
    switch(timeFrame) {
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'quarter': return 'Last 3 Months';
      case 'all': return 'All Time';
      default: return 'Last 30 Days';
    }
  };

  // Get appropriate icon for pattern type
  const getPatternIcon = (type: string) => {
    switch(type) {
      case 'weekday': return <DateRangeIcon />;
      case 'weekend': return <WeekendIcon />;
      case 'timeOfDay': return <EventRepeatIcon />;
      default: return <DateRangeIcon />;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05), 0 1px 8px rgba(0, 0, 0, 0.02)',
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            fontSize: '1.1rem',
            color: '#1e293b',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-8px',
              left: 0,
              width: '40px',
              height: '3px',
              borderRadius: '4px',
              background: '#4361ee'
            }
          }}
        >
          Mood Pattern Analysis
        </Typography>
        
        <ToggleButtonGroup
          size="small"
          value={timeFrame}
          exclusive
          onChange={handleTimeFrameChange}
          aria-label="time frame selection"
          sx={{ 
            '& .MuiToggleButtonGroup-grouped': {
              border: '1px solid #e0e7ff !important',
              '&.Mui-selected': {
                backgroundColor: '#4361ee',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#3730a3',
                }
              }
            }
          }}
        >
          <ToggleButton value="month" aria-label="last month">
            <Tooltip title="Last 30 Days">
              <DateRangeIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="quarter" aria-label="last quarter">
            <Tooltip title="Last 3 Months">
              <CalendarMonthIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="all" aria-label="all time">
            <Tooltip title="All Time">
              <EventRepeatIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <Typography 
        variant="body2" 
        sx={{ 
          color: '#64748b',
          mb: 2,
          fontWeight: 500
        }}
      >
        {getTimeFrameTitle()} - Pattern detection requires at least 5-7 entries
      </Typography>
      
      {loading ? (
        <Box sx={{ width: '100%', mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, color: '#64748b' }}>
            Analyzing your mood patterns...
          </Typography>
          <LinearProgress />
        </Box>
      ) : patterns.length === 0 ? (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 300,
            bgcolor: 'rgba(0, 0, 0, 0.02)',
            borderRadius: '12px',
            p: 3
          }}
        >
          <Typography color="text.secondary" sx={{ mb: 1, textAlign: 'center' }}>
            Not enough data to detect patterns
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
            Continue logging your moods. Pattern detection works best with at least 7-10 entries over different days and times.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Timeline position="right">
            {patterns.map((pattern, index) => (
              <TimelineItem key={`pattern-${index}`}>
                <TimelineSeparator>
                  <TimelineDot sx={{ bgcolor: pattern.color }}>
                    {getPatternIcon(pattern.type)}
                  </TimelineDot>
                  {index < patterns.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                
                <TimelineContent>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      mb: 2, 
                      borderRadius: '12px',
                      border: `1px solid ${alpha(pattern.color, 0.3)}`,
                      '&:hover': {
                        boxShadow: `0 4px 12px ${alpha(pattern.color, 0.15)}`
                      },
                      transition: 'box-shadow 0.2s ease-in-out'
                    }}
                  >
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, color: '#334155' }}>
                          {pattern.description}
                        </Typography>
                        
                        <IconButton 
                          size="small" 
                          onClick={() => togglePatternDetails(index)}
                          sx={{ mt: -0.5, mr: -1 }}
                        >
                          {expandedPattern === index ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                      
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip 
                          label={`${pattern.confidence}% confidence`}
                          size="small"
                          sx={{ 
                            bgcolor: alpha(pattern.color, 0.1),
                            color: pattern.color,
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }}
                        />
                        <Chip 
                          label={`${pattern.frequency} entries`}
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(0, 0, 0, 0.05)',
                            color: '#64748b',
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }}
                        />
                      </Stack>
                      
                      <Collapse in={expandedPattern === index}>
                        <Box sx={{ mt: 2 }}>
                          <Divider sx={{ my: 1 }} />
                          
                          <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, color: '#64748b' }}>
                            Pattern Details
                          </Typography>
                          
                          <Box sx={{ mb: 2 }}>
                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                              {pattern.moodSequence.slice(0, 5).map((mood, i) => (
                                <Chip 
                                  key={`mood-${i}`}
                                  label={mood}
                                  size="small"
                                  sx={{ 
                                    bgcolor: alpha(moodColors[normalizeMoodType(mood)], 0.1),
                                    color: moodColors[normalizeMoodType(mood)],
                                    fontWeight: 500,
                                    border: `1px solid ${alpha(moodColors[normalizeMoodType(mood)], 0.3)}`
                                  }}
                                />
                              ))}
                            </Stack>
                            
                            <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
                              Examples from your entries:
                            </Typography>
                            
                            <Box sx={{ ml: 1, mt: 1 }}>
                              {pattern.examples.map((example, i) => (
                                <Box 
                                  key={`example-${i}`} 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    mb: 0.5 
                                  }}
                                >
                                  <Box 
                                    sx={{ 
                                      width: 8, 
                                      height: 8, 
                                      borderRadius: '50%', 
                                      bgcolor: moodColors[normalizeMoodType(example.mood)],
                                      mr: 1
                                    }} 
                                  />
                                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                                    {format(parseISO(example.date), 'MMM d, yyyy')} - {format(parseISO(example.date), 'h:mm a')} - {example.mood}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        </Box>
                      </Collapse>
                    </CardContent>
                  </Card>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Box>
      )}
      
      {patterns.length > 0 && (
        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              mb: 1, 
              color: '#64748b',
              fontWeight: 600
            }}
          >
            Insight
          </Typography>
          
          <Card 
            variant="outlined" 
            sx={{ 
              borderRadius: '12px', 
              bgcolor: alpha('#4361ee', 0.05),
              border: `1px solid ${alpha('#4361ee', 0.2)}`
            }}
          >
            <CardContent>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155' }}>
                {patterns.length === 1 
                  ? "We've identified one pattern in your mood entries. Continue logging to discover more insights."
                  : `${patterns.length} patterns detected in your mood entries. Click on a pattern to see more details.`}
                {patterns.some(p => p.type === 'weekday') && " Days of the week seem to influence your mood."}
                {patterns.some(p => p.type === 'weekend') && " There's a noticeable difference between your weekday and weekend moods."}
                {patterns.some(p => p.type === 'timeOfDay') && " Different times of day appear to affect how you feel."}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </Paper>
  );
};

export default MoodPatternMatch; 