import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoodLogger from '../components/mood/MoodLogger';

const MoodJournal = () => {
  const { dateParam } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Parse date from URL if provided
  const selectedDate = dateParam 
    ? new Date(decodeURIComponent(dateParam)) 
    : new Date();
  
  // Handle navigation back
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          borderBottom: '1px solid var(--color-border)',
          pb: 2
        }}
      >
        <IconButton 
          onClick={handleBack}
          sx={{ 
            mr: 2,
            color: 'var(--color-text-secondary)',
            '&:hover': {
              backgroundColor: 'var(--color-hover)',
              color: 'var(--color-primary)'
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="bold">
          Mood Journal
        </Typography>
      </Box>
      
      {/* Mood Logger */}
      <Box 
        sx={{
          maxWidth: '800px',
          mx: 'auto',
          px: { xs: 2, sm: 3 }
        }}
      >
        <MoodLogger initialDate={selectedDate} />
      </Box>
    </Box>
  );
};

export default MoodJournal; 