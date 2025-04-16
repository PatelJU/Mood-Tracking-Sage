import React from 'react';
import { Box, Typography, Tooltip, Paper } from '@mui/material';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import { useTheme } from '../../context/ThemeContext';

interface MoodSelectorProps {
  selectedMood: string;
  onMoodSelect: (mood: string) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onMoodSelect }) => {
  const { moodColors } = useTheme();
  
  const moods = [
    { value: 'Very Bad', icon: <SentimentVeryDissatisfiedIcon fontSize="large" /> },
    { value: 'Bad', icon: <SentimentDissatisfiedIcon fontSize="large" /> },
    { value: 'Okay', icon: <SentimentNeutralIcon fontSize="large" /> },
    { value: 'Good', icon: <SentimentSatisfiedIcon fontSize="large" /> },
    { value: 'Very Good', icon: <SentimentVerySatisfiedIcon fontSize="large" /> }
  ];
  
  const getMoodColor = (mood: string) => {
    switch(mood) {
      case 'Very Bad': return '#d32f2f';
      case 'Bad': return '#f57c00';
      case 'Okay': return '#ffd600';
      case 'Good': return '#4caf50';
      case 'Very Good': return '#2196f3';
      default: return '#ffd600';
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '600px',
          mx: 'auto'
        }}
      >
        {moods.map((mood) => (
          <Tooltip title={mood.value} key={mood.value}>
            <Box
              onClick={() => onMoodSelect(mood.value)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                p: { xs: 1, sm: 2 },
                borderRadius: 2,
                bgcolor: selectedMood === mood.value ? `${getMoodColor(mood.value)}20` : 'transparent',
                border: selectedMood === mood.value ? `2px solid ${getMoodColor(mood.value)}` : '2px solid transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: `${getMoodColor(mood.value)}10`,
                  transform: 'translateY(-3px)'
                },
              }}
            >
              <Box sx={{ color: getMoodColor(mood.value) }}>
                {mood.icon}
              </Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  mt: 1,
                  fontWeight: selectedMood === mood.value ? 'bold' : 'normal',
                  fontSize: { xs: '0.7rem', sm: '0.8rem' }
                }}
              >
                {mood.value}
              </Typography>
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Paper>
  );
};

export default MoodSelector; 