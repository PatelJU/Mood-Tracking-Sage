import { MoodEntry, MoodType } from '../types';
import { parseISO, format, differenceInDays } from 'date-fns';

export interface MoodInsight {
  type: 'pattern' | 'trigger' | 'recommendation';
  description: string;
  confidence: number;
  data?: any;
}

export const generateAIInsights = (entries: MoodEntry[]): MoodInsight[] => {
  const insights: MoodInsight[] = [];
  
  // Analyze time patterns
  const timePatterns = analyzeTimePatterns(entries);
  if (timePatterns) insights.push(timePatterns);
  
  // Analyze activity patterns
  const activityPatterns = analyzeActivityPatterns(entries);
  if (activityPatterns) insights.push(activityPatterns);
  
  // Analyze weather impacts
  const weatherInsights = analyzeWeatherImpact(entries);
  if (weatherInsights) insights.push(weatherInsights);
  
  // Generate personalized recommendations
  const recommendations = generateRecommendations(entries);
  insights.push(...recommendations);
  
  return insights;
};

const analyzeTimePatterns = (entries: MoodEntry[]): MoodInsight | null => {
  const timeOfDayMoods: { [key: string]: number[] } = {
    morning: [],
    afternoon: [],
    evening: [],
    night: []
  };
  
  entries.forEach(entry => {
    if (entry.timeOfDay !== 'full-day') {
      timeOfDayMoods[entry.timeOfDay].push(moodToValue(entry.mood));
    }
  });
  
  let bestTime = '';
  let highestAvg = -1;
  
  Object.entries(timeOfDayMoods).forEach(([time, moods]) => {
    if (moods.length > 0) {
      const avg = moods.reduce((a, b) => a + b, 0) / moods.length;
      if (avg > highestAvg) {
        highestAvg = avg;
        bestTime = time;
      }
    }
  });
  
  if (bestTime) {
    return {
      type: 'pattern',
      description: `You tend to feel best during the ${bestTime}. Consider scheduling important activities during this time.`,
      confidence: 0.7 + (Object.values(timeOfDayMoods).reduce((a, b) => a + b.length, 0) / 100),
      data: { timeOfDayMoods }
    };
  }
  
  return null;
};

const analyzeActivityPatterns = (entries: MoodEntry[]): MoodInsight | null => {
  // Analyze notes for common activities and their correlation with mood
  const activityKeywords = ['exercise', 'work', 'sleep', 'social', 'family', 'hobby'];
  const activityMoods: { [key: string]: number[] } = {};
  
  entries.forEach(entry => {
    const notesLower = entry.notes.toLowerCase();
    activityKeywords.forEach(activity => {
      if (notesLower.includes(activity)) {
        if (!activityMoods[activity]) activityMoods[activity] = [];
        activityMoods[activity].push(moodToValue(entry.mood));
      }
    });
  });
  
  let mostPositiveActivity = '';
  let highestAvg = -1;
  
  Object.entries(activityMoods).forEach(([activity, moods]) => {
    if (moods.length >= 3) { // Minimum threshold for significance
      const avg = moods.reduce((a, b) => a + b, 0) / moods.length;
      if (avg > highestAvg) {
        highestAvg = avg;
        mostPositiveActivity = activity;
      }
    }
  });
  
  if (mostPositiveActivity) {
    return {
      type: 'trigger',
      description: `${mostPositiveActivity.charAt(0).toUpperCase() + mostPositiveActivity.slice(1)} appears to have a positive impact on your mood.`,
      confidence: 0.6 + (activityMoods[mostPositiveActivity].length / 20),
      data: { activity: mostPositiveActivity, correlation: highestAvg }
    };
  }
  
  return null;
};

const analyzeWeatherImpact = (entries: MoodEntry[]): MoodInsight | null => {
  const weatherMoods: { [key: string]: number[] } = {};
  
  entries.forEach(entry => {
    if (entry.weather?.condition) {
      const condition = entry.weather.condition;
      if (!weatherMoods[condition]) weatherMoods[condition] = [];
      weatherMoods[condition].push(moodToValue(entry.mood));
    }
  });
  
  let significantCondition = '';
  let highestCorrelation = 0;
  
  Object.entries(weatherMoods).forEach(([condition, moods]) => {
    if (moods.length >= 5) {
      const avg = moods.reduce((a, b) => a + b, 0) / moods.length;
      const correlation = Math.abs(avg - 2); // Distance from neutral mood
      if (correlation > highestCorrelation) {
        highestCorrelation = correlation;
        significantCondition = condition;
      }
    }
  });
  
  if (significantCondition) {
    const impact = weatherMoods[significantCondition].reduce((a, b) => a + b, 0) / weatherMoods[significantCondition].length > 2 ? 'positive' : 'negative';
    return {
      type: 'pattern',
      description: `${significantCondition} weather tends to have a ${impact} impact on your mood.`,
      confidence: 0.5 + (weatherMoods[significantCondition].length / 20),
      data: { condition: significantCondition, impact }
    };
  }
  
  return null;
};

const generateRecommendations = (entries: MoodEntry[]): MoodInsight[] => {
  const recommendations: MoodInsight[] = [];
  const recentEntries = entries.filter(entry => 
    differenceInDays(new Date(), parseISO(entry.date)) <= 14
  );
  
  if (recentEntries.length === 0) return recommendations;
  
  // Calculate average recent mood
  const avgMood = recentEntries.reduce((sum, entry) => sum + moodToValue(entry.mood), 0) / recentEntries.length;
  
  if (avgMood < 2) {
    // Recommendations for low mood
    recommendations.push({
      type: 'recommendation',
      description: 'Consider starting a daily gratitude practice - write down 3 things you\'re grateful for each day.',
      confidence: 0.8,
      data: { category: 'mental_health', priority: 'high' }
    });
    
    recommendations.push({
      type: 'recommendation',
      description: 'Regular exercise, even just a 10-minute walk, can help improve your mood.',
      confidence: 0.9,
      data: { category: 'physical_health', priority: 'high' }
    });
  }
  
  // Check for irregular logging patterns
  const hasIrregularLogging = recentEntries.length < 7;
  if (hasIrregularLogging) {
    recommendations.push({
      type: 'recommendation',
      description: 'Regular mood tracking helps identify patterns. Try setting a daily reminder.',
      confidence: 0.85,
      data: { category: 'habit_formation', priority: 'medium' }
    });
  }
  
  return recommendations;
};

const moodToValue = (mood: MoodType): number => {
  const moodValues = {
    'Very Bad': 0,
    'Bad': 1,
    'Okay': 2,
    'Good': 3,
    'Very Good': 4,
    // Add camelCase versions
    'veryBad': 0,
    'bad': 1,
    'neutral': 2,
    'good': 3,
    'veryGood': 4
  };
  
  return moodValues[mood];
}; 