import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  TextField,
  Button,
  Chip,
  IconButton,
  Card,
  CardContent,
  Grid,
  Divider,
  useTheme as useMuiTheme
} from '@mui/material';
import { useMood } from '../../context/MoodContext';
import { useTheme } from '../../context/ThemeContext';
import { MoodEntry } from '../../types';
import { parseISO, format, subDays } from 'date-fns';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SendIcon from '@mui/icons-material/Send';

// Mock sentiment analysis function (in a real app would use NLP/AI service)
const analyzeSentiment = (text: string): {
  score: number;
  keywords: { word: string; sentiment: 'positive' | 'negative' | 'neutral'; weight: number }[];
  emotions: { emotion: string; intensity: number }[];
} => {
  // Simple keyword-based scoring (very basic example)
  const positiveWords = ['happy', 'joy', 'excited', 'grateful', 'love', 'wonderful', 'great', 'good', 'relaxed', 'peaceful', 'calm', 'energetic'];
  const negativeWords = ['sad', 'angry', 'anxious', 'stressed', 'depressed', 'worried', 'upset', 'frustrated', 'exhausted', 'fear', 'hate', 'bad'];
  const emotions = [
    { name: 'Joy', keywords: ['happy', 'joy', 'excited', 'laugh'] },
    { name: 'Gratitude', keywords: ['grateful', 'thankful', 'appreciate'] },
    { name: 'Serenity', keywords: ['peace', 'calm', 'relax', 'tranquil'] },
    { name: 'Interest', keywords: ['curious', 'fascinated', 'interested'] },
    { name: 'Hope', keywords: ['hope', 'optimistic', 'look forward'] },
    { name: 'Pride', keywords: ['proud', 'accomplished', 'achievement'] },
    { name: 'Amusement', keywords: ['fun', 'funny', 'amused', 'laugh'] },
    { name: 'Inspiration', keywords: ['inspired', 'motivated', 'creative'] },
    { name: 'Sadness', keywords: ['sad', 'down', 'blue', 'depressed', 'lonely'] },
    { name: 'Fear', keywords: ['afraid', 'scared', 'anxious', 'worried', 'fear'] },
    { name: 'Anger', keywords: ['angry', 'mad', 'frustrated', 'irritated'] },
    { name: 'Disgust', keywords: ['disgusted', 'revolted', 'gross'] },
    { name: 'Shame', keywords: ['ashamed', 'guilty', 'embarrassed'] },
    { name: 'Boredom', keywords: ['bored', 'monotonous', 'dull'] }
  ];
  
  const words = text.toLowerCase().split(/\W+/);
  let score = 0;
  const foundKeywords: { word: string; sentiment: 'positive' | 'negative' | 'neutral'; weight: number }[] = [];
  const emotionScores: Record<string, number> = {};
  
  // Initialize all emotions with zero
  emotions.forEach(emotion => {
    emotionScores[emotion.name] = 0;
  });
  
  // Process each word
  words.forEach(word => {
    if (positiveWords.includes(word)) {
      score += 0.1;
      foundKeywords.push({ word, sentiment: 'positive', weight: 0.1 });
    } else if (negativeWords.includes(word)) {
      score -= 0.1;
      foundKeywords.push({ word, sentiment: 'negative', weight: 0.1 });
    }
    
    // Check for emotions
    emotions.forEach(emotion => {
      if (emotion.keywords.includes(word)) {
        emotionScores[emotion.name] += 1;
      }
    });
  });
  
  // Normalize to -1 to 1 range
  score = Math.max(-1, Math.min(1, score));
  
  // Convert emotion scores to array with intensity
  const emotionResults = Object.entries(emotionScores)
    .filter(([_, value]) => value > 0)
    .map(([emotion, count]) => ({
      emotion,
      intensity: count / words.length * 10 // Scale by text length
    }))
    .sort((a, b) => b.intensity - a.intensity);
  
  return {
    score,
    keywords: foundKeywords,
    emotions: emotionResults
  };
};

// Get theme-appropriate sentiment icon
const getSentimentIcon = (score: number, size: 'small' | 'medium' | 'large' = 'medium') => {
  if (score <= -0.6) return <SentimentVeryDissatisfiedIcon fontSize={size} />;
  if (score <= -0.2) return <SentimentDissatisfiedIcon fontSize={size} />;
  if (score < 0.2) return <SentimentNeutralIcon fontSize={size} />;
  if (score < 0.6) return <SentimentSatisfiedIcon fontSize={size} />;
  return <SentimentVerySatisfiedIcon fontSize={size} />;
};

// Get sentiment label
const getSentimentLabel = (score: number): string => {
  if (score <= -0.6) return 'Very Negative';
  if (score <= -0.2) return 'Negative';
  if (score < 0.2) return 'Neutral';
  if (score < 0.6) return 'Positive';
  return 'Very Positive';
};

// Get color for sentiment score
const getSentimentColor = (score: number): string => {
  if (score <= -0.6) return '#F44336'; // Very negative (red)
  if (score <= -0.2) return '#FF9800'; // Negative (orange)
  if (score < 0.2) return '#FFC107'; // Neutral (yellow)
  if (score < 0.6) return '#8BC34A'; // Positive (light green)
  return '#4CAF50'; // Very positive (green)
};

const SentimentAnalysis: React.FC = () => {
  const { moodEntries } = useMood();
  const { moodColors } = useTheme();
  const muiTheme = useMuiTheme();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [entriesWithSentiment, setEntriesWithSentiment] = useState<(MoodEntry & { 
    sentiment: { 
      score: number; 
      keywords: { word: string; sentiment: 'positive' | 'negative' | 'neutral'; weight: number }[];
      emotions: { emotion: string; intensity: number }[];
    } 
  })[]>([]);
  
  // Analyze notes from mood entries
  useEffect(() => {
    if (moodEntries.length === 0) return;
    
    const oneMonthAgo = subDays(new Date(), 30);
    
    // Get recent entries with notes
    const recentEntries = moodEntries
      .filter(entry => new Date(entry.date) >= oneMonthAgo && entry.notes.trim().length > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Add sentiment analysis to each entry
    const entriesWithAnalysis = recentEntries.map(entry => ({
      ...entry,
      sentiment: analyzeSentiment(entry.notes)
    }));
    
    setEntriesWithSentiment(entriesWithAnalysis);
  }, [moodEntries]);
  
  const handleAnalyzeCustomText = () => {
    if (!customText.trim()) return;
    
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const result = analyzeSentiment(customText);
      setAnalysis(result);
      setLoading(false);
    }, 1000);
  };
  
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomText(event.target.value);
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AnalyticsIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5" fontWeight="bold">
          Sentiment Analysis
        </Typography>
      </Box>
      
      <Typography variant="body2" paragraph sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 3 }}>
        <InfoOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
        This tool analyzes the emotions and sentiment in your journal entries to help you better understand patterns in your written thoughts.
      </Typography>
      
      {/* Custom text analysis section */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Analyze Text
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Enter some text to analyze the emotions and sentiment..."
            value={customText}
            onChange={handleTextChange}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              onClick={handleAnalyzeCustomText}
              disabled={loading || !customText.trim()}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </Box>
          
          {analysis && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  color: getSentimentColor(analysis.score),
                  display: 'flex',
                  alignItems: 'center',
                  mr: 1
                }}>
                  {getSentimentIcon(analysis.score, 'large')}
                </Box>
                
                <Typography variant="h6">
                  Overall Sentiment: <strong>{getSentimentLabel(analysis.score)}</strong>
                </Typography>
              </Box>
              
              {/* Emotions */}
              {analysis.emotions.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                    Detected Emotions:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {analysis.emotions.map((emotion: any, index: number) => (
                      <Chip
                        key={index}
                        label={`${emotion.emotion} (${emotion.intensity.toFixed(1)})`}
                        sx={{ 
                          bgcolor: `${getSentimentColor(analysis.score)}20`,
                          borderColor: getSentimentColor(analysis.score),
                          border: '1px solid'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              
              {/* Keywords */}
              {analysis.keywords.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                    Key Words:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {analysis.keywords.map((keyword: any, index: number) => (
                      <Chip
                        key={index}
                        label={keyword.word}
                        size="small"
                        sx={{ 
                          bgcolor: keyword.sentiment === 'positive' ? '#4CAF5020' : 
                            keyword.sentiment === 'negative' ? '#F4433620' : '#9E9E9E20',
                          borderColor: keyword.sentiment === 'positive' ? '#4CAF50' : 
                            keyword.sentiment === 'negative' ? '#F44336' : '#9E9E9E',
                          border: '1px solid'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Recent entries analysis */}
      <Typography variant="h6" gutterBottom>
        Recent Journal Entries Analysis
      </Typography>
      
      {entriesWithSentiment.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body1" color="text.secondary">
            No entries with notes found in the past 30 days.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add notes to your mood entries to see sentiment analysis.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {entriesWithSentiment.map((entry, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {format(parseISO(entry.date), 'MMM d, yyyy')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {entry.timeOfDay.charAt(0).toUpperCase() + entry.timeOfDay.slice(1)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label={entry.mood} 
                        size="small"
                        sx={{ 
                          bgcolor: `${moodColors[entry.mood]}20`,
                          borderColor: moodColors[entry.mood],
                          border: '1px solid',
                          mr: 1
                        }} 
                      />
                      
                      <Box sx={{ color: getSentimentColor(entry.sentiment.score) }}>
                        {getSentimentIcon(entry.sentiment.score)}
                      </Box>
                    </Box>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {entry.notes}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  {/* Top emotions */}
                  {entry.sentiment.emotions.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {entry.sentiment.emotions.slice(0, 3).map((emotion, idx) => (
                        <Chip
                          key={idx}
                          label={emotion.emotion}
                          size="small"
                          sx={{ 
                            height: 24,
                            fontSize: '0.7rem',
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

export default SentimentAnalysis; 