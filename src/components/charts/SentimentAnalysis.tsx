import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Grid, 
  Card, 
  CardContent, 
  Chip,
  Divider,
  useTheme,
  alpha,
  LinearProgress
} from '@mui/material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  Legend 
} from 'recharts';
import { useMood } from '../../context/MoodContext';

// Mock sentiment analysis functionality
const analyzeJournalSentiment = (journalText: string) => {
  // In a real application, this would call a sentiment analysis API
  // For this demo, we'll generate mock sentiment scores
  
  const sentiments = [
    { name: 'Joy', score: Math.random() * 0.5 + 0.2 },
    { name: 'Sadness', score: Math.random() * 0.4 },
    { name: 'Anger', score: Math.random() * 0.3 },
    { name: 'Fear', score: Math.random() * 0.3 },
    { name: 'Surprise', score: Math.random() * 0.25 },
    { name: 'Love', score: Math.random() * 0.4 },
    { name: 'Gratitude', score: Math.random() * 0.6 }
  ];
  
  // Sort by score descending
  sentiments.sort((a, b) => b.score - a.score);
  
  return sentiments;
};

const extractKeywords = (journalText: string) => {
  // In a real app, this would use NLP to extract meaningful keywords
  // For this demo, we'll just pick random words
  const words = journalText.split(/\s+/).filter(word => word.length > 3);
  const shuffled = [...words].sort(() => 0.5 - Math.random());
  
  // Get unique "keywords" with frequency
  const keywords: { [word: string]: number } = {};
  shuffled.slice(0, 10).forEach(word => {
    const normalized = word.toLowerCase().replace(/[^\w]/g, '');
    if (normalized && normalized.length > 3) {
      keywords[normalized] = (keywords[normalized] || 0) + Math.floor(Math.random() * 5) + 1;
    }
  });
  
  return Object.entries(keywords)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
};

const EMOTION_COLORS = {
  Joy: '#FFC107',
  Sadness: '#2196F3',
  Anger: '#F44336',
  Fear: '#9C27B0',
  Surprise: '#4CAF50',
  Love: '#E91E63',
  Gratitude: '#8BC34A'
};

const SentimentAnalysis: React.FC = () => {
  const { moodEntries } = useMood();
  const [loading, setLoading] = useState(true);
  const [sentimentData, setSentimentData] = useState<{ name: string; score: number }[]>([]);
  const [keywords, setKeywords] = useState<{ word: string; count: number }[]>([]);
  const theme = useTheme();
  
  useEffect(() => {
    setLoading(true);
    
    // Get all journal entries
    const journalTexts = moodEntries
      .filter(entry => entry.journal && entry.journal.trim().length > 0)
      .map(entry => entry.journal as string);
    
    if (journalTexts.length === 0) {
      setLoading(false);
      return;
    }
    
    // Combine all journal entries into one text for analysis
    const combinedText = journalTexts.join(' ');
    
    // Simulate API delay
    setTimeout(() => {
      const sentiments = analyzeJournalSentiment(combinedText);
      const extractedKeywords = extractKeywords(combinedText);
      
      setSentimentData(sentiments);
      setKeywords(extractedKeywords);
      setLoading(false);
    }, 1500);
  }, [moodEntries]);
  
  const totalJournalEntries = moodEntries.filter(entry => entry.journal && entry.journal.trim().length > 0).length;
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Analyzing your journal entries...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Identifying emotions, themes, and patterns
        </Typography>
      </Box>
    );
  }
  
  if (totalJournalEntries === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, my: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
          No Journal Entries Found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
          Start writing in your journal when logging moods to see sentiment analysis and emotional themes.
        </Typography>
        <Box sx={{ 
          border: '1px dashed rgba(0, 0, 0, 0.12)', 
          p: 3, 
          borderRadius: 2, 
          bgcolor: alpha(theme.palette.background.default, 0.6),
          maxWidth: 600,
          mx: 'auto'
        }}>
          <Typography variant="body2" color="text.secondary">
            Journal entries help you track your thoughts and feelings over time. They provide valuable insights into your emotional patterns and can help identify triggers for mood changes.
          </Typography>
        </Box>
      </Paper>
    );
  }
  
  // Convert sentiment data to format for pie chart
  const pieData = sentimentData.map(item => ({
    name: item.name,
    value: Math.round(item.score * 100)
  }));
  
  // Generate tone description based on primary emotions
  const generateToneDescription = () => {
    if (sentimentData.length === 0) return 'No emotional tone detected.';
    
    const primary = sentimentData[0].name;
    const secondary = sentimentData[1]?.name;
    
    let description = `Your journal entries primarily express ${primary.toLowerCase()}`;
    if (secondary) {
      description += ` with elements of ${secondary.toLowerCase()}`;
    }
    
    // Add random insights based on primary emotion
    const insights: { [key: string]: string } = {
      Joy: 'You tend to focus on positive experiences and maintain an optimistic outlook.',
      Sadness: 'You often reflect deeply on your experiences and show emotional awareness.',
      Anger: 'You express your boundaries clearly and acknowledge your feelings directly.',
      Fear: 'You show thoughtfulness about potential challenges and demonstrate careful consideration.',
      Surprise: 'You remain open to new experiences and demonstrate flexibility in your thinking.',
      Love: 'You value your relationships and express appreciation for those around you.',
      Gratitude: 'You recognize the positive aspects of your life and acknowledge what you value.'
    };
    
    description += `. ${insights[primary] || ''}`;
    
    return description;
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Emotional Themes in Your Journal
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Analysis of {totalJournalEntries} journal entries using natural language processing to identify emotional patterns.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Emotional Composition
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={1}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={EMOTION_COLORS[entry.name as keyof typeof EMOTION_COLORS] || theme.palette.primary.main} 
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => [`${value}%`, 'Intensity']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Emotional Tone Analysis
            </Typography>
            <Typography variant="body2" paragraph>
              {generateToneDescription()}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Primary Emotions
            </Typography>
            
            {sentimentData.slice(0, 5).map((emotion, index) => (
              <Box key={emotion.name} sx={{ mb: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{emotion.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(emotion.score * 100)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={emotion.score * 100}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: alpha(EMOTION_COLORS[emotion.name as keyof typeof EMOTION_COLORS] || theme.palette.primary.main, 0.2),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: EMOTION_COLORS[emotion.name as keyof typeof EMOTION_COLORS] || theme.palette.primary.main
                    }
                  }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Common Themes & Keywords
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {keywords.map((item) => (
                <Chip 
                  key={item.word}
                  label={`${item.word} (${item.count})`}
                  sx={{ 
                    fontSize: 14 + Math.min(item.count, 5),
                    py: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1 + (item.count / 15))
                  }}
                />
              ))}
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Contextual Insights
            </Typography>
            <Typography variant="body2">
              Your journal entries frequently mention activities and experiences that evoke {sentimentData[0]?.name.toLowerCase() || 'positive emotions'}. 
              Consider how these themes relate to your mood patterns and what they reveal about your emotional wellbeing.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SentimentAnalysis; 