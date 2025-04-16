import React, { useState, useCallback } from 'react';
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
  CircularProgress,
  Card,
  CardContent,
  Fade
} from '@mui/material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Sector 
} from 'recharts';
import { useMood } from '../../context/MoodContext';
import { useTheme, normalizeMoodType } from '../../context/ThemeContext';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { format, subDays, subWeeks, subMonths, startOfToday } from 'date-fns';

const renderActiveShape = (props: any) => {
  const { 
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value, name
  } = props;

  // Calculate text position for better readability
  const textPositionMultiplier = 0.82;
  const textX = cx + (outerRadius + 15) * Math.cos(-Math.PI / 2 + (startAngle + endAngle) / 2);
  const textY = cy + (outerRadius + 15) * Math.sin(-Math.PI / 2 + (startAngle + endAngle) / 2);
  
  // Add a subtle pulse animation for the active segment
  const animatedOuterRadius = outerRadius + 5;

  return (
    <g>
      {/* Background segment with lower opacity */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={alpha(fill, 0.3)}
      />
      
      {/* Active segment with enhanced appearance */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={animatedOuterRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
      />
      
      {/* Center text for the selected mood */}
      <text
        x={cx}
        y={cy - 10}
        dy={8}
        textAnchor="middle"
        fill="#333"
        fontWeight="bold"
        fontSize="1.2rem"
      >
        {name}
      </text>
      
      {/* Count and percentage below the mood name */}
      <text
        x={cx}
        y={cy + 20}
        textAnchor="middle"
        fill="#666"
        fontSize="0.9rem"
      >
        {value} entries ({(percent * 100).toFixed(1)}%)
      </text>
    </g>
  );
};

const MoodDistributionDonut: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [timeFrame, setTimeFrame] = useState<string>('week');
  const [loading, setLoading] = useState<boolean>(false);
  
  const { moodEntries } = useMood();
  const { moodColors } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  
  const handleTimeFrameChange = (event: React.MouseEvent<HTMLElement>, newTimeFrame: string) => {
    if (newTimeFrame !== null) {
      setTimeFrame(newTimeFrame);
      setLoading(true);
      // Simulate loading for a smooth transition
      setTimeout(() => setLoading(false), 500);
    }
  };
  
  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);
  
  // Filter entries based on selected time frame
  const filterEntriesByTimeFrame = () => {
    const today = startOfToday();
    let startDate: Date;
    
    switch (timeFrame) {
      case 'week':
        startDate = subWeeks(today, 1);
        break;
      case 'month':
        startDate = subMonths(today, 1);
        break;
      case 'quarter':
        startDate = subMonths(today, 3);
        break;
      default:
        startDate = subDays(today, 7);
    }
    
    return moodEntries.filter(entry => new Date(entry.date) >= startDate);
  };
  
  // Prepare data for the donut chart
  const getChartData = () => {
    const filteredEntries = filterEntriesByTimeFrame();
    const moodCounts: Record<string, number> = {};
    
    // Count occurrences of each mood
    filteredEntries.forEach(entry => {
      const normalizedMood = normalizeMoodType(entry.mood);
      moodCounts[normalizedMood] = (moodCounts[normalizedMood] || 0) + 1;
    });
    
    // Convert to array format for Recharts
    return Object.entries(moodCounts).map(([mood, count]) => ({
      name: mood,
      value: count,
      color: moodColors[mood as keyof typeof moodColors] || '#999'
    })).sort((a, b) => b.value - a.value); // Sort by count descending
  };
  
  const chartData = getChartData();
  
  // Get time frame title for display
  const getTimeFrameTitle = () => {
    switch(timeFrame) {
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'quarter': return 'Last 3 Months';
      default: return 'Last 7 Days';
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
          Mood Distribution
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
          <ToggleButton value="week" aria-label="last week">
            <Tooltip title="Last 7 Days">
              <DateRangeIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="month" aria-label="last month">
            <Tooltip title="Last 30 Days">
              <CalendarMonthIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="quarter" aria-label="last quarter">
            <Tooltip title="Last 3 Months">
              <EventNoteIcon fontSize="small" />
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
        {getTimeFrameTitle()} - {chartData.length === 0 ? 'No entries yet' : `${chartData.reduce((acc, item) => acc + item.value, 0)} entries`}
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <CircularProgress size={40} />
        </Box>
      ) : chartData.length === 0 ? (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 300,
            bgcolor: 'rgba(0, 0, 0, 0.02)',
            borderRadius: '12px'
          }}
        >
          <Typography color="text.secondary">
            No mood entries found for this period
          </Typography>
        </Box>
      ) : (
        <Box sx={{ height: 350, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 70 : 90}
                outerRadius={isMobile ? 90 : 110}
                dataKey="value"
                onMouseEnter={onPieEnter}
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Box>
      )}
      
      {chartData.length > 0 && (
        <Fade in={!loading} timeout={500}>
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 1.5, 
                color: '#64748b',
                fontWeight: 600
              }}
            >
              Mood Insights
            </Typography>
            
            <Card 
              variant="outlined" 
              sx={{ 
                borderRadius: '12px', 
                border: `1px solid ${alpha(chartData[activeIndex]?.color || '#4361ee', 0.3)}`,
                bgcolor: alpha(chartData[activeIndex]?.color || '#4361ee', 0.05)
              }}
            >
              <CardContent>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155' }}>
                  {chartData[activeIndex]?.name} mood appears {chartData[activeIndex]?.value} times 
                  ({((chartData[activeIndex]?.value / chartData.reduce((acc, item) => acc + item.value, 0)) * 100).toFixed(1)}% of entries).
                  {chartData[activeIndex]?.name === "Very Good" && " You're having a great period!"}
                  {chartData[activeIndex]?.name === "Good" && " Things are going well for you."}
                  {chartData[activeIndex]?.name === "Okay" && " You're maintaining a balanced mood."}
                  {chartData[activeIndex]?.name === "Bad" && " You might want to practice some self-care activities."}
                  {chartData[activeIndex]?.name === "Very Bad" && " Consider reaching out for support if needed."}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Fade>
      )}
    </Paper>
  );
};

export default MoodDistributionDonut; 