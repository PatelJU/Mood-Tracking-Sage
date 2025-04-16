import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Slide, Fade } from '@mui/material';
import { useEmotion, AdaptiveUISettings } from '../../context/EmotionContext';
import { alpha, useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme } from '../../context/ThemeContext';

// Component that applies adaptive UI changes based on detected emotions
const AdaptiveInterface: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentEmotion, emotionIntensity, getAdaptiveUISettings } = useEmotion();
  const muiTheme = useMuiTheme();
  const { currentTheme } = useTheme();
  const [settings, setSettings] = useState<AdaptiveUISettings>(getAdaptiveUISettings());
  const [showEmotionFeedback, setShowEmotionFeedback] = useState(false);
  const [lastEmotion, setLastEmotion] = useState<string>('');
  
  // Update settings when emotion changes
  useEffect(() => {
    const newSettings = getAdaptiveUISettings();
    setSettings(newSettings);
    
    // Show feedback when emotion changes
    if (currentEmotion !== lastEmotion) {
      setLastEmotion(currentEmotion);
      setShowEmotionFeedback(true);
      
      // Hide feedback after 3 seconds
      const timeoutId = setTimeout(() => {
        setShowEmotionFeedback(false);
      }, 3000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentEmotion, emotionIntensity, getAdaptiveUISettings, lastEmotion]);
  
  // Generate the CSS variables for the adaptive UI
  const generateAdaptiveStyles = () => {
    // Get primary and secondary colors from the current theme
    const primary = muiTheme.palette.primary.main;
    const secondary = muiTheme.palette.secondary.main;
    
    // Adjust animation speeds based on settings
    const transitionBase = 0.2 + (1 - settings.animationSpeed) * 0.3; // 0.2s-0.5s
    
    // Adjust spacing based on layout density
    let spacing = '16px';
    switch (settings.layoutDensity) {
      case 'compact':
        spacing = '12px';
        break;
      case 'spacious':
        spacing = '24px';
        break;
      default:
        spacing = '16px';
    }
    
    // Create micro-interactions based on emotion
    let focusRingColor = primary;
    let hoverTransform = 'scale(1.02)';
    let buttonPressScale = 'scale(0.98)';
    
    switch (currentEmotion) {
      case 'happy':
        focusRingColor = secondary;
        hoverTransform = 'scale(1.05) rotate(1deg)';
        buttonPressScale = 'scale(0.95)';
        break;
      case 'anxious':
        focusRingColor = alpha(primary, 0.7);
        hoverTransform = 'scale(1.01)';
        buttonPressScale = 'scale(0.99)';
        break;
      case 'tired':
        focusRingColor = alpha(primary, 0.6);
        hoverTransform = 'none';
        buttonPressScale = 'scale(0.99)';
        break;
      case 'energetic':
        focusRingColor = secondary;
        hoverTransform = 'scale(1.05) translateY(-2px)';
        buttonPressScale = 'scale(0.93)';
        break;
    }
    
    return {
      '--adaptive-transition-speed': `${transitionBase}s`,
      '--adaptive-transition-function': currentEmotion === 'anxious' ? 'cubic-bezier(0.4, 0, 0.2, 1)' : 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      '--adaptive-spacing': spacing,
      '--adaptive-border-radius': settings.layoutDensity === 'compact' ? '8px' : '12px',
      '--adaptive-focus-ring-color': focusRingColor,
      '--adaptive-hover-transform': hoverTransform,
      '--adaptive-button-press-scale': buttonPressScale,
      '--adaptive-font-scale': settings.fontScale,
      '--adaptive-contrast-multiplier': settings.contrastLevel,
      // Add subtle background hue based on emotion
      '--adaptive-emotion-hue': getEmotionHue(),
    };
  };
  
  // Generate color hue based on emotion
  const getEmotionHue = (): string => {
    switch(currentEmotion) {
      case 'happy':
        return alpha(muiTheme.palette.success.light, 0.03);
      case 'anxious':
        return alpha(muiTheme.palette.info.light, 0.03);
      case 'energetic':
        return alpha(muiTheme.palette.warning.light, 0.03);
      case 'tired':
        return alpha(muiTheme.palette.text.disabled, 0.02);
      case 'focused':
        return alpha(muiTheme.palette.primary.light, 0.03);
      case 'calm':
        return alpha(muiTheme.palette.info.light, 0.02);
      default:
        return 'transparent';
    }
  };
  
  // Get text feedback based on current emotion
  const getEmotionFeedback = (): string => {
    switch(currentEmotion) {
      case 'happy':
        return 'You seem happy! Enhancing the interface with vibrant elements.';
      case 'anxious':
        return 'Detecting anxiety. Adjusting to a calmer interface with less stimuli.';
      case 'neutral':
        return 'Neutral state detected. Using balanced interface settings.';
      case 'energetic':
        return 'You seem energetic! Using dynamic interface elements.';
      case 'calm':
        return 'Calm state detected. Using serene interface settings.';
      case 'tired':
        return 'You seem tired. Adjusting to a more relaxed interface with larger text.';
      case 'focused':
        return 'Focus detected. Minimizing distractions in the interface.';
      default:
        return '';
    }
  };
  
  // Get emoji for current emotion
  const getEmotionEmoji = (): string => {
    switch(currentEmotion) {
      case 'happy': return '😊';
      case 'anxious': return '😟';
      case 'neutral': return '😐';
      case 'energetic': return '😃';
      case 'calm': return '😌';
      case 'tired': return '😴';
      case 'focused': return '🧐';
      default: return '😐';
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        ...generateAdaptiveStyles(),
        '& button': {
          transition: 'transform var(--adaptive-transition-speed) var(--adaptive-transition-function)',
          '&:hover': {
            transform: 'var(--adaptive-hover-transform)',
          },
          '&:active': {
            transform: 'var(--adaptive-button-press-scale)',
          }
        },
        '& .MuiPaper-root': {
          borderRadius: 'var(--adaptive-border-radius)',
          padding: 'var(--adaptive-spacing)',
          transition: 'all var(--adaptive-transition-speed) var(--adaptive-transition-function)',
          background: `linear-gradient(to bottom right, ${alpha(muiTheme.palette.background.paper, 0.9)}, ${alpha(muiTheme.palette.background.paper, 1)}), var(--adaptive-emotion-hue)`,
        },
        '& .MuiTypography-root': {
          fontSize: `calc(1em * var(--adaptive-font-scale))`,
          transition: 'font-size var(--adaptive-transition-speed) var(--adaptive-transition-function)',
        },
        '& .MuiFab-root, & .MuiButton-root': {
          transition: 'all var(--adaptive-transition-speed) var(--adaptive-transition-function)',
        },
        '& *:focus-visible': {
          boxShadow: `0 0 0 2px var(--adaptive-focus-ring-color)`,
          outline: 'none',
        }
      }}
    >
      {/* Emotion change notification */}
      <Slide direction="down" in={showEmotionFeedback} mountOnEnter unmountOnExit>
        <Paper
          sx={{
            position: 'fixed',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1200,
            padding: '8px 16px',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            boxShadow: 'var(--shadow-md)',
            backgroundColor: alpha(muiTheme.palette.background.paper, 0.9),
            backdropFilter: 'blur(8px)',
            maxWidth: '90vw',
            width: 'auto',
          }}
        >
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ fontSize: '1.5em' }}>{getEmotionEmoji()}</span>
            {getEmotionFeedback()}
          </Typography>
        </Paper>
      </Slide>
      
      {/* The actual UI content */}
      <Fade in={true} timeout={300}>
        <Box>{children}</Box>
      </Fade>
    </Box>
  );
};

export default AdaptiveInterface; 