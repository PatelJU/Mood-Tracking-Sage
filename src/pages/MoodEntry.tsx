import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Button, 
  Container,
  Typography
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parse } from 'date-fns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import MoodLogger from '../components/mood/MoodLogger';

const MoodEntry: React.FC = () => {
  const { dateParam } = useParams<{ dateParam?: string }>();
  const navigate = useNavigate();
  const [initialDate, setInitialDate] = useState<Date | null>(new Date());

  // Parse the date parameter if available (format: yyyy-MM-dd)
  useEffect(() => {
    if (dateParam) {
      try {
        const parsedDate = parse(dateParam, 'yyyy-MM-dd', new Date());
        setInitialDate(parsedDate);
      } catch (error) {
        console.error('Failed to parse date', error);
        setInitialDate(new Date());
      }
    }
  }, [dateParam]);

  const handleSaveSuccess = () => {
    // Navigate back to calendar page after successful save
    navigate('/calendar');
  };

  const handleBack = () => {
    navigate(-1);
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
          Back
        </Button>
        <Typography 
          variant="h5" 
          fontWeight="bold" 
          sx={{ 
            color: 'var(--color-text-dark)', 
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}
        >
          {initialDate ? `Log Mood for ${format(initialDate, 'MMMM d, yyyy')}` : 'Log Mood'}
        </Typography>
        <Box sx={{ width: 100 }} /> {/* Empty box for layout balance */}
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 'var(--radius-xl)',
          background: 'var(--surface-glass-light-solid)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          overflow: 'hidden'
        }}
      >
        <MoodLogger 
          initialDate={initialDate || undefined} 
          onSaveSuccess={handleSaveSuccess}
        />
      </Paper>
    </Container>
  );
};

export default MoodEntry; 