import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  useTheme as useMuiTheme
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { useMood } from '../../context/MoodContext';
import { MoodType } from '../../types';
import { format, addDays, parseISO, differenceInDays } from 'date-fns';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';

// Add a helper function to standardize mood format
const mapMoodFormat = (mood: MoodType): string => {
  const moodMap: Record<string, string> = {
    'Very Bad': 'veryBad',
    'Bad': 'bad',
    'Okay': 'neutral',
    'Good': 'good',
    'Very Good': 'veryGood',
    'veryBad': 'veryBad',
    'bad': 'bad',
    'neutral': 'neutral',
    'good': 'good',
    'veryGood': 'veryGood'
  };
  return moodMap[mood] || 'neutral';
};

// Convert mood string to numerical value for chart
const moodToValue = (mood: MoodType): number => {
  const values: Record<string, number> = {
    'Very Bad': 0,
    'Bad': 1,
    'Okay': 2,
    'Good': 3,
    'Very Good': 4,
    'veryBad': 0,
    'bad': 1,
    'neutral': 2,
    'good': 3,
    'veryGood': 4
  };
  return values[mood] || 2; // Default to neutral
};

// Convert numerical value back to mood label
const valueToMood = (value: number): string => {
  if (value <= 0.5) return 'Very Bad';
  if (value <= 1.5) return 'Bad';
  if (value <= 2.5) return 'Neutral';
  if (value <= 3.5) return 'Good';
  return 'Very Good';
};

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <Box sx={{ 
        bgcolor: 'background.paper', 
        p: 1.5, 
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        boxShadow: 3
      }}>
        <Typography variant="body2" sx={{ mb: 0.5 }} fontWeight="medium">
          {data.date}
        </Typography>
        
        {data.actualValue !== undefined && (
          <Typography variant="body2" color="primary.main">
            Actual: {valueToMood(data.actualValue)}
          </Typography>
        )}
        
        {data.predictedValue !== undefined && (
          <Typography variant="body2" color="secondary.main">
            Predicted: {valueToMood(data.predictedValue)}
          </Typography>
        )}
        
        {data.lowerBound !== undefined && data.upperBound !== undefined && (
          <Typography variant="caption" color="text.secondary">
            Range: {valueToMood(data.lowerBound)} to {valueToMood(data.upperBound)}
          </Typography>
        )}
      </Box>
    );
  }
  return null;
};

// Define interfaces for chart data
interface ChartDataPoint {
  date: string;
  fullDate: Date;
  actualValue?: number;
  predictedValue: number;
  mood?: MoodType;
  actualMood?: MoodType;
  predictedMood: string;
  isHistorical: boolean;
  lowerBound?: number;
  upperBound?: number;
}

interface ConfidenceDataPoint {
  date: string;
  lowerBound: number;
  upperBound: number;
}

// Simple linear regression for prediction
const linearRegression = (data: number[]) => {
  const n = data.length;
  if (n < 5) return null;
  
  const indices = Array.from({ length: n }, (_, i) => i);
  
  const sumX = indices.reduce((sum, x) => sum + x, 0);
  const sumY = data.reduce((sum, y) => sum + y, 0);
  const sumXY = indices.reduce((sum, x, i) => sum + x * data[i], 0);
  const sumXX = indices.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
};

const moodColors: Record<string, string> = {
  veryBad: '#F44336',
  bad: '#FF9800',
  neutral: '#FFC107',
  good: '#8BC34A',
  veryGood: '#4CAF50',
  default: '#3f51b5',
  'Very Bad': '#F44336',
  'Bad': '#FF9800',
  'Neutral': '#FFC107',
  'Okay': '#CDDC39',
  'Good': '#8BC34A',
  'Very Good': '#4CAF50'
};

const PredictiveTrendAnalysis: React.FC = () => {
  const { moodEntries } = useMood();
  const theme = useTheme();
  const muiTheme = useMuiTheme();
  
  const [timePeriod, setTimePeriod] = useState<string>('3M');
  const [predictionPeriod, setPredictionPeriod] = useState<string>('2W');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [confidenceData, setConfidenceData] = useState<ConfidenceDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewType, setViewType] = useState<'line' | 'area'>('area');
  
  const handleTimePeriodChange = (event: SelectChangeEvent) => {
    setTimePeriod(event.target.value as string);
  };
  
  const handlePredictionPeriodChange = (event: SelectChangeEvent) => {
    setPredictionPeriod(event.target.value as string);
  };
  
  const handleViewTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewType: 'line' | 'area',
  ) => {
    if (newViewType !== null) {
      setViewType(newViewType);
    }
  };

  useEffect(() => {
    if (moodEntries.length < 5) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // Sort entries by date
    const sortedEntries = [...moodEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Filter entries based on selected time period
    let filteredEntries = sortedEntries;
    if (timePeriod !== 'ALL') {
      const cutoffDate = new Date();
      const months = parseInt(timePeriod.replace('M', ''));
      cutoffDate.setMonth(cutoffDate.getMonth() - months);
      
      filteredEntries = sortedEntries.filter(entry => 
        new Date(entry.date) >= cutoffDate
      );
    }
    
    if (filteredEntries.length < 5) {
      setChartData([]);
      setLoading(false);
      return;
    }
    
    // Convert to numerical values for regression
    const moodValues = filteredEntries.map(entry => moodToValue(entry.mood));
    
    // Perform linear regression
    const regression = linearRegression(moodValues);
    
    if (!regression) {
      setChartData([]);
      setLoading(false);
      return;
    }
    
    // Prepare data for chart
    const chartPoints: ChartDataPoint[] = [];
    const confidencePoints: ConfidenceDataPoint[] = [];
    
    // Add historical data points
    filteredEntries.forEach((entry, index) => {
      const entryDate = new Date(entry.date);
      
      chartPoints.push({
        date: format(entryDate, 'MMM d'),
        fullDate: entryDate,
        actualValue: moodToValue(entry.mood),
        predictedValue: Math.max(0, Math.min(4, regression.intercept + regression.slope * index)),
        mood: entry.mood,
        actualMood: entry.mood,
        predictedMood: valueToMood(Math.max(0, Math.min(4, regression.intercept + regression.slope * index))),
        isHistorical: true
      });
    });
    
    // Calculate mean squared error for confidence interval
    const mse = moodValues.reduce((sum, value, i) => {
      const predicted = regression.intercept + regression.slope * i;
      return sum + Math.pow(value - predicted, 2);
    }, 0) / moodValues.length;
    
    const stdDev = Math.sqrt(mse);
    
    // Add confidence interval to historical data
    chartPoints.forEach((point, i) => {
      if (point.isHistorical) {
        point.lowerBound = Math.max(0, point.predictedValue - 1.96 * stdDev);
        point.upperBound = Math.min(4, point.predictedValue + 1.96 * stdDev);
        
        confidencePoints.push({
          date: point.date,
          lowerBound: point.lowerBound,
          upperBound: point.upperBound
        });
      }
    });
    
    // Add prediction data points
    const lastDate = new Date(filteredEntries[filteredEntries.length - 1].date);
    const daysToPredict = predictionPeriod === '1W' ? 7 : 
                          predictionPeriod === '2W' ? 14 : 30;
    
    for (let i = 1; i <= daysToPredict; i++) {
      const predictionDate = addDays(lastDate, i);
      const predictionIndex = filteredEntries.length - 1 + i;
      const predictedValue = Math.max(0, Math.min(4, regression.intercept + regression.slope * predictionIndex));
      const lowerBound = Math.max(0, predictedValue - 1.96 * stdDev);
      const upperBound = Math.min(4, predictedValue + 1.96 * stdDev);
      
      chartPoints.push({
        date: format(predictionDate, 'MMM d'),
        fullDate: predictionDate,
        predictedValue,
        predictedMood: valueToMood(predictedValue),
        isHistorical: false,
        lowerBound,
        upperBound
      });
      
      confidencePoints.push({
        date: format(predictionDate, 'MMM d'),
        lowerBound,
        upperBound
      });
    }
    
    setChartData(chartPoints);
    setConfidenceData(confidencePoints);
    setLoading(false);
  }, [moodEntries, timePeriod, predictionPeriod]);

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="600">
          Mood Trend Prediction
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>History</InputLabel>
            <Select
              value={timePeriod}
              label="History"
              onChange={handleTimePeriodChange}
            >
              <MenuItem value="1M">1 Month</MenuItem>
              <MenuItem value="3M">3 Months</MenuItem>
              <MenuItem value="6M">6 Months</MenuItem>
              <MenuItem value="ALL">All Time</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Forecast</InputLabel>
            <Select
              value={predictionPeriod}
              label="Forecast"
              onChange={handlePredictionPeriodChange}
            >
              <MenuItem value="1W">1 Week</MenuItem>
              <MenuItem value="2W">2 Weeks</MenuItem>
              <MenuItem value="1M">1 Month</MenuItem>
            </Select>
          </FormControl>
          
          <ToggleButtonGroup
            value={viewType}
            exclusive
            onChange={handleViewTypeChange}
            size="small"
          >
            <ToggleButton value="line">
              <Tooltip title="Line View">
                <TimelineIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="area">
              <Tooltip title="Area View with Confidence">
                <BarChartIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
      
      <Typography
        variant="body2"
        color="text.secondary"
        paragraph
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <InfoOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
        This chart predicts your future mood trends based on historical patterns.
        Shaded area represents the prediction confidence interval.
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      ) : chartData.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 400, 
          flexDirection: 'column',
          border: '1px dashed rgba(0, 0, 0, 0.12)',
          borderRadius: 2,
          p: 3,
          my: 3
        }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Not enough data to generate predictions
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 450 }}>
            Log your mood for at least 5 days to see trend predictions. The more consistent your logging, the more accurate the predictions will be.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ height: 400, width: '100%', mt: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            {viewType === 'line' ? (
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={muiTheme.palette.divider} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: muiTheme.palette.text.secondary }}
                  tickMargin={10} 
                />
                <YAxis 
                  domain={[0, 4]} 
                  tickFormatter={(value) => valueToMood(value)} 
                  tick={{ fill: muiTheme.palette.text.secondary }}
                  tickMargin={10}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Actual historical mood data */}
                <Line
                  type="monotone"
                  dataKey="actualValue"
                  stroke={muiTheme.palette.primary.main}
                  strokeWidth={2}
                  dot={{ r: 4, fill: muiTheme.palette.primary.main }}
                  activeDot={{ r: 6 }}
                  name="Actual Mood"
                  connectNulls
                />
                
                {/* Predicted trend line */}
                <Line
                  type="monotone"
                  dataKey="predictedValue"
                  stroke={muiTheme.palette.secondary.main}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: muiTheme.palette.secondary.main }}
                  name="Predicted Mood"
                />
                
                {/* Confidence interval - lower bound */}
                <Line
                  type="monotone"
                  dataKey="lowerBound"
                  stroke={muiTheme.palette.secondary.light}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                  name="Lower Bound"
                />
                
                {/* Confidence interval - upper bound */}
                <Line
                  type="monotone"
                  dataKey="upperBound"
                  stroke={muiTheme.palette.secondary.light}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                  name="Upper Bound"
                />
              </LineChart>
            ) : (
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={muiTheme.palette.divider} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: muiTheme.palette.text.secondary }}
                  tickMargin={10} 
                />
                <YAxis 
                  domain={[0, 4]} 
                  tickFormatter={(value) => valueToMood(value)} 
                  tick={{ fill: muiTheme.palette.text.secondary }}
                  tickMargin={10}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Confidence area */}
                {confidenceData.length > 0 && (
                  <Area
                    dataKey="upperBound"
                    data={confidenceData}
                    stroke="transparent"
                    fill={muiTheme.palette.mode === 'dark' ? 'rgba(128, 128, 128, 0.3)' : 'rgba(200, 200, 200, 0.3)'}
                    name="Confidence Interval"
                  />
                )}
                {confidenceData.length > 0 && (
                  <Area
                    dataKey="lowerBound"
                    data={confidenceData}
                    stroke="transparent"
                    fill="rgba(150, 150, 150, 0.2)"
                    name=""
                  />
                )}
                
                {/* Actual historical mood data */}
                <Line
                  type="monotone"
                  dataKey="actualValue"
                  stroke={muiTheme.palette.primary.main}
                  strokeWidth={2}
                  dot={{ r: 4, fill: muiTheme.palette.primary.main }}
                  activeDot={{ r: 6 }}
                  name="Actual Mood"
                  connectNulls
                />
                
                {/* Predicted trend line */}
                <Line
                  type="monotone"
                  dataKey="predictedValue"
                  stroke={muiTheme.palette.secondary.main}
                  strokeWidth={2}
                  dot={{ r: 3, fill: muiTheme.palette.secondary.main }}
                  name="Predicted Mood"
                />
                
                {/* Reference lines for mood levels */}
                <ReferenceLine y={0} stroke={moodColors['Very Bad']} strokeDasharray="3 3" />
                <ReferenceLine y={1} stroke={moodColors['Bad']} strokeDasharray="3 3" />
                <ReferenceLine y={2} stroke={moodColors['Okay']} strokeDasharray="3 3" />
                <ReferenceLine y={3} stroke={moodColors['Good']} strokeDasharray="3 3" />
                <ReferenceLine y={4} stroke={moodColors['Very Good']} strokeDasharray="3 3" />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
};

export default PredictiveTrendAnalysis; 