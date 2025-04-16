export type MoodType = 'Very Bad' | 'Bad' | 'Okay' | 'Good' | 'Very Good';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'full-day';

export interface MoodEntry {
  id: string;
  date: string; // ISO string format
  timeOfDay: TimeOfDay;
  mood: MoodType;
  notes: string;
  customCategory?: string;
  time?: string; // Time in HH:MM format
  journal?: string; // Journal entry text
  activities?: string[]; // List of activities
  weather?: {
    temperature?: number;
    condition?: string;
    humidity?: number;
  };
}

export interface CustomMoodCategory {
  id: string;
  name: string;
  color: string;
  emoji: string;
  description: string;
  value: number;
  createdAt: string;
}

export interface CustomTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  background: string;
  paper: string;
  text: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  reward: number;
  criteria: (entries: MoodEntry[]) => boolean;
}

export interface MoodStreak {
  type: string;
  count: number;
  startDate: string;
  endDate: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  points: number; // For rewards system
  badges: Badge[];
  settings: UserSettings;
  moodEntries?: MoodEntry[]; // Collection of user's mood entries
  stats?: {
    currentStreak?: number;
    longestStreak?: number;
    totalEntries?: number;
    averageMood?: number;
  }; // User statistics
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  criteria: string;
  points: number;
  tier: string;
  earnedAt?: string;
}

export interface UserSettings {
  theme: ThemeType;
  enableWeatherTracking: boolean;
  enablePredictions: boolean;
  location?: {
    city: string;
    country: string;
    lat: number;
    lon: number;
  };
}

export type ThemeType = 'dark' | 'light' | 'ocean' | 'sunset' | 'forest' | 'pastel';

export interface MoodSuggestion {
  forMood: MoodType;
  suggestion: string;
}

export interface MoodPrediction {
  date: string;
  predictedMood: MoodType;
  confidence: number; // 0-1
}

export interface MoodStats {
  averageMoodByDay: { [key: string]: number }; // 0-4 for Very Bad to Very Good
  averageMoodByTimeOfDay: { [key in TimeOfDay]: number };
  moodCountByType: { [key in MoodType]: number };
  mostFrequentMood: MoodType;
  moodTrend: 'improving' | 'declining' | 'stable';
  moodCorrelations: {
    weather?: {
      temperature?: number; // correlation coefficient
      condition?: { [key: string]: number }; // sunny, rainy, etc. with avg mood
    };
    dayOfWeek?: { [key: string]: number }; // day of week with avg mood
  };
} 