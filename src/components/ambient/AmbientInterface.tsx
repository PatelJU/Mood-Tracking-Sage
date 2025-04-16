import React, { useState, useEffect } from 'react';
import { Box, useTheme as useMuiTheme } from '@mui/material';
import { useMood } from '../../context/MoodContext';
import { useTheme } from '../../context/ThemeContext';
import { MoodType } from '../../types';
import { format, subDays } from 'date-fns';
import { useSettings } from '../../context/SettingsContext';

interface AmbientInterfaceProps {
  children: React.ReactNode;
  enableAmbient: boolean;
}

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

// Convert mood value to display format
const getDisplayMood = (mood: string): MoodType => {
  const moodMap: Record<string, MoodType> = {
    'veryBad': 'Very Bad',
    'bad': 'Bad',
    'neutral': 'Okay',
    'good': 'Good',
    'veryGood': 'Very Good',
    'Very Bad': 'Very Bad',
    'Bad': 'Bad',
    'Okay': 'Okay',
    'Good': 'Good',
    'Very Good': 'Very Good'
  };
  return moodMap[mood] as MoodType || 'Okay';
};

const AmbientInterface: React.FC<AmbientInterfaceProps> = ({ 
  children, 
  enableAmbient = true 
}) => {
  const { moodEntries } = useMood();
  const { moodColors: themeColors } = useTheme();
  const muiTheme = useMuiTheme();
  
  // Define a local moodColors object that has both formats with an index signature
  const moodColors: {
    'Very Bad': string;
    'Bad': string;
    'Okay': string;
    'Good': string;
    'Very Good': string;
    'veryBad': string;
    'bad': string;
    'neutral': string;
    'good': string;
    'veryGood': string;
    [key: string]: string;  // Add index signature to handle string indexing
  } = {
    // Standard format from ThemeContext
    'Very Bad': themeColors['Very Bad'],
    'Bad': themeColors['Bad'],
    'Okay': themeColors['Okay'],
    'Good': themeColors['Good'],
    'Very Good': themeColors['Very Good'],
    // Mapped format
    'veryBad': themeColors['Very Bad'],
    'bad': themeColors['Bad'],
    'neutral': themeColors['Okay'],
    'good': themeColors['Good'],
    'veryGood': themeColors['Very Good']
  };
  
  const [dominantMood, setDominantMood] = useState<MoodType | null>(null);
  const [moodTrend, setMoodTrend] = useState<'improving' | 'declining' | 'stable'>('stable');
  const [backgroundGradient, setBackgroundGradient] = useState<string | null>(null);
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.05);
  
  // Get animation settings from global context
  const { settings } = useSettings();
  const reduceAnimations = settings?.reduceAnimations || false;
  
  // Calculate mood trend and dominant mood
  useEffect(() => {
    if (!enableAmbient || moodEntries.length === 0) return;
    
    const today = new Date();
    const oneWeekAgo = subDays(today, 7);
    
    // Get entries from the past week
    const recentEntries = moodEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= oneWeekAgo && entryDate <= today;
    });
    
    if (recentEntries.length === 0) return;
    
    // Count occurrences of each mood using a display format
    const moodCountsMap: Record<string, number> = {};
    
    recentEntries.forEach(entry => {
      const displayMood = getDisplayMood(entry.mood);
      moodCountsMap[displayMood] = (moodCountsMap[displayMood] || 0) + 1;
    });
    
    // Find dominant mood
    let maxCount = 0;
    let dominant: MoodType = 'Okay';
    
    Object.entries(moodCountsMap).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominant = mood as MoodType;
      }
    });
    
    setDominantMood(dominant);
    
    // Calculate mood trend
    if (recentEntries.length >= 3) {
      // Use a simple mapping for mood values
      const getMoodValue = (mood: MoodType): number => {
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
        return values[mood] || 2; // Default to 'Okay'
      };
      
      // Sort entries by date (oldest first)
      const sortedEntries = [...recentEntries].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Get first half and second half averages
      const midpoint = Math.floor(sortedEntries.length / 2);
      const firstHalf = sortedEntries.slice(0, midpoint);
      const secondHalf = sortedEntries.slice(midpoint);
      
      const firstHalfAvg = firstHalf.reduce((sum, entry) => sum + getMoodValue(entry.mood), 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, entry) => sum + getMoodValue(entry.mood), 0) / secondHalf.length;
      
      // Determine trend
      const difference = secondHalfAvg - firstHalfAvg;
      if (difference > 0.5) {
        setMoodTrend('improving');
      } else if (difference < -0.5) {
        setMoodTrend('declining');
      } else {
        setMoodTrend('stable');
      }
    }
  }, [moodEntries, enableAmbient]);
  
  // Generate background gradient based on mood
  useEffect(() => {
    if (!enableAmbient || !dominantMood) {
      setBackgroundGradient(null);
      return;
    }
    
    // Now we can safely use the mapped mood key since our local moodColors has both formats
    const mappedMood = mapMoodFormat(dominantMood);
    const baseMoodColor = moodColors[mappedMood] || '#888888';
    
    // Choose secondary color based on trend
    let secondaryColor;
    if (moodTrend === 'improving') {
      // Get next better mood color if available
      const moodValues: string[] = ['veryBad', 'bad', 'neutral', 'good', 'veryGood'];
      const currentIndex = moodValues.indexOf(mappedMood);
      const nextMood = currentIndex < moodValues.length - 1 ? moodValues[currentIndex + 1] : mappedMood;
      secondaryColor = moodColors[nextMood] || baseMoodColor;
    } else if (moodTrend === 'declining') {
      // Get next worse mood color if available
      const moodValues: string[] = ['veryBad', 'bad', 'neutral', 'good', 'veryGood'];
      const currentIndex = moodValues.indexOf(mappedMood);
      const prevMood = currentIndex > 0 ? moodValues[currentIndex - 1] : mappedMood;
      secondaryColor = moodColors[prevMood] || baseMoodColor;
    } else {
      // For stable, use a slight variation of the same color
      secondaryColor = baseMoodColor;
    }
    
    // Determine opacity based on theme mode
    const isDarkMode = muiTheme.palette.mode === 'dark';
    const baseOpacity = isDarkMode ? 0.08 : 0.05;
    setBackgroundOpacity(baseOpacity);
    
    // Create gradient
    const gradient = moodTrend === 'stable'
      ? `radial-gradient(circle, ${baseMoodColor}${Math.round(baseOpacity * 100)} 0%, rgba(0,0,0,0) 70%)`
      : `linear-gradient(135deg, ${baseMoodColor}${Math.round(baseOpacity * 100)} 0%, ${secondaryColor}${Math.round(baseOpacity * 70)} 100%)`;
    
    setBackgroundGradient(gradient);
  }, [dominantMood, moodTrend, moodColors, muiTheme.palette.mode, enableAmbient]);
  
  return (
    <Box 
      sx={{ 
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
        transition: reduceAnimations ? 'none' : 'background 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        background: backgroundGradient || 'none'
      }}
    >
      {/* Add subtle animation for improving/declining trend - only if animations enabled */}
      {enableAmbient && !reduceAnimations && dominantMood && moodTrend !== 'stable' && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: backgroundOpacity * 0.5,
            background: `repeating-linear-gradient(
              ${moodTrend === 'improving' ? '45deg' : '-45deg'},
              transparent,
              transparent 100px,
              ${moodColors[mapMoodFormat(dominantMood)]}15 100px,
              ${moodColors[mapMoodFormat(dominantMood)]}15 200px
            )`,
            // Only animate if reduced animations is off
            animation: 'ambientShift 60s linear infinite',
            // Use more performant animations that don't trigger constant repaints
            animationFillMode: 'backwards',
            '@keyframes ambientShift': {
              '0%': {
                backgroundPosition: '0 0'
              },
              '100%': {
                backgroundPosition: moodTrend === 'improving' ? '1000px 1000px' : '-1000px 1000px'
              }
            },
            // Optimize for GPU acceleration
            willChange: 'background-position',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
          }}
        />
      )}
      
      {/* Static version of the animation for reduced animation mode */}
      {enableAmbient && reduceAnimations && dominantMood && moodTrend !== 'stable' && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: backgroundOpacity * 0.5,
            background: `repeating-linear-gradient(
              ${moodTrend === 'improving' ? '45deg' : '-45deg'},
              transparent,
              transparent 100px,
              ${moodColors[mapMoodFormat(dominantMood)]}15 100px,
              ${moodColors[mapMoodFormat(dominantMood)]}15 200px
            )`,
          }}
        />
      )}
      
      {/* Subtle pulsing effect for stable mood - only if animations enabled */}
      {enableAmbient && !reduceAnimations && dominantMood && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: backgroundOpacity * 0.3,
            animation: 'breathe 15s ease-in-out infinite',
            animationFillMode: 'backwards',
            background: `radial-gradient(circle at center, ${moodColors[mapMoodFormat(dominantMood)]}30 0%, transparent 70%)`,
            '@keyframes breathe': {
              '0%, 100%': {
                transform: 'scale(1)',
              },
              '50%': {
                transform: 'scale(1.05)',
              }
            },
            // Optimize for GPU acceleration
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
          }}
        />
      )}
      
      {/* Static version for reduced animation mode */}
      {enableAmbient && reduceAnimations && dominantMood && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: backgroundOpacity * 0.3,
            background: `radial-gradient(circle at center, ${moodColors[mapMoodFormat(dominantMood)]}30 0%, transparent 70%)`,
          }}
        />
      )}
      
      {/* Main content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </Box>
  );
};

export default AmbientInterface; 