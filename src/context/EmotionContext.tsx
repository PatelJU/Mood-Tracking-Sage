import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMood } from './MoodContext';
import { useTheme } from './ThemeContext';

// Emotion types that our interface will respond to
export type EmotionType = 'happy' | 'anxious' | 'neutral' | 'energetic' | 'calm' | 'tired' | 'focused';

// Interface for our emotion context
interface EmotionContextType {
  currentEmotion: EmotionType;
  emotionIntensity: number; // 0-100 scale
  setEmotion: (emotion: EmotionType, intensity: number) => void;
  resetEmotion: () => void;
  getAdaptiveUISettings: () => AdaptiveUISettings;
  applyEmotionBasedTheme: () => void;
}

// UI Settings that can be adapted based on emotion
export interface AdaptiveUISettings {
  colorScheme: string;
  animationSpeed: number; // 0-1 scale, 0 = no animations, 1 = full animations
  fontScale: number; // 1 = normal
  layoutDensity: 'compact' | 'normal' | 'spacious';
  hapticFeedbackIntensity: number; // 0-1 scale
  soundEffects: boolean;
  contrastLevel: number; // 0-1 scale
}

const EmotionContext = createContext<EmotionContextType | undefined>(undefined);

// Hook to use the emotion context
export const useEmotion = () => {
  const context = useContext(EmotionContext);
  if (context === undefined) {
    throw new Error('useEmotion must be used within an EmotionProvider');
  }
  return context;
};

interface EmotionProviderProps {
  children: ReactNode;
}

export const EmotionProvider: React.FC<EmotionProviderProps> = ({ children }) => {
  const { moodEntries } = useMood();
  const { setTheme } = useTheme();
  
  // Default to neutral emotion with medium intensity
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('neutral');
  const [emotionIntensity, setEmotionIntensity] = useState<number>(50);

  // Set emotion and intensity
  const setEmotion = (emotion: EmotionType, intensity: number) => {
    setCurrentEmotion(emotion);
    setEmotionIntensity(Math.min(Math.max(intensity, 0), 100)); // Clamp between 0-100
  };

  // Reset emotion to neutral
  const resetEmotion = () => {
    setCurrentEmotion('neutral');
    setEmotionIntensity(50);
  };

  // Update emotion based on recent mood entries (if available)
  useEffect(() => {
    if (moodEntries.length > 0) {
      const latestMood = moodEntries[moodEntries.length - 1];
      
      // Map mood types to emotion types
      switch(latestMood.mood) {
        case 'Very Good':
          setEmotion('happy', 80);
          break;
        case 'Good':
          setEmotion('energetic', 70);
          break;
        case 'Okay':
          setEmotion('neutral', 50);
          break;
        case 'Bad':
          setEmotion('anxious', 60);
          break;
        case 'Very Bad':
          setEmotion('tired', 75);
          break;
        default:
          setEmotion('neutral', 50);
      }
    }
  }, [moodEntries]);

  // Get adaptive UI settings based on current emotion and intensity
  const getAdaptiveUISettings = (): AdaptiveUISettings => {
    // Default settings
    const defaultSettings: AdaptiveUISettings = {
      colorScheme: 'neutral',
      animationSpeed: 0.5,
      fontScale: 1,
      layoutDensity: 'normal',
      hapticFeedbackIntensity: 0.5,
      soundEffects: true,
      contrastLevel: 0.5
    };

    // Adjust settings based on emotion
    switch(currentEmotion) {
      case 'happy':
        return {
          ...defaultSettings,
          colorScheme: 'vibrant',
          animationSpeed: 0.7 * (emotionIntensity / 100),
          soundEffects: true,
          contrastLevel: 0.6
        };
      case 'anxious':
        return {
          ...defaultSettings,
          colorScheme: 'calm',
          animationSpeed: 0.3,
          fontScale: 1.05,
          layoutDensity: 'spacious',
          hapticFeedbackIntensity: 0.3,
          soundEffects: false,
          contrastLevel: 0.7
        };
      case 'energetic':
        return {
          ...defaultSettings,
          colorScheme: 'energetic',
          animationSpeed: 0.8 * (emotionIntensity / 100),
          layoutDensity: 'compact',
          hapticFeedbackIntensity: 0.7,
          contrastLevel: 0.55
        };
      case 'tired':
        return {
          ...defaultSettings,
          colorScheme: 'relaxed',
          animationSpeed: 0.3,
          fontScale: 1.1,
          layoutDensity: 'spacious',
          hapticFeedbackIntensity: 0.4,
          soundEffects: false,
          contrastLevel: 0.8
        };
      case 'focused':
        return {
          ...defaultSettings,
          colorScheme: 'focused',
          animationSpeed: 0.4,
          layoutDensity: 'compact',
          hapticFeedbackIntensity: 0.5,
          soundEffects: false,
          contrastLevel: 0.6
        };
      case 'calm':
        return {
          ...defaultSettings,
          colorScheme: 'serene',
          animationSpeed: 0.4,
          layoutDensity: 'normal',
          hapticFeedbackIntensity: 0.3,
          soundEffects: true,
          contrastLevel: 0.5
        };
      default:
        return defaultSettings;
    }
  };

  // Apply theme based on current emotion
  const applyEmotionBasedTheme = () => {
    const settings = getAdaptiveUISettings();
    
    // Map color schemes to theme types
    switch(settings.colorScheme) {
      case 'vibrant':
        setTheme('sunset');
        break;
      case 'calm':
        setTheme('ocean');
        break;
      case 'energetic':
        setTheme('forest');
        break;
      case 'relaxed':
        setTheme('pastel');
        break;
      case 'focused':
        setTheme('dark');
        break;
      case 'serene':
        setTheme('light');
        break;
      default:
        setTheme('light');
    }
  };

  const value: EmotionContextType = {
    currentEmotion,
    emotionIntensity,
    setEmotion,
    resetEmotion,
    getAdaptiveUISettings,
    applyEmotionBasedTheme
  };

  return <EmotionContext.Provider value={value}>{children}</EmotionContext.Provider>;
}; 