import { MoodEntry, MoodType, TimeOfDay } from '../types';
import { addDays, format, parseISO, startOfDay, subDays, isSameDay } from 'date-fns';
import { calculateMoodStats } from './moodService';

/**
 * Types for insight generation
 */
export interface MoodPattern {
  type: 'timeOfDay' | 'dayOfWeek' | 'weather' | 'consecutive' | 'improvement' | 'decline';
  description: string;
  confidence: number; // 0-1
  data?: any;
}

export interface PersonalizedInsight {
  id: string;
  title: string;
  description: string;
  actionItem?: string;
  category: 'pattern' | 'suggestion' | 'achievement' | 'warning';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  related?: {
    type: 'moodEntry' | 'moodType' | 'date' | 'timeOfDay';
    value: string;
  };
}

/**
 * Generate personalized insights from mood entries
 */
export const generateInsights = (entries: MoodEntry[]): PersonalizedInsight[] => {
  if (entries.length < 5) {
    return [{
      id: 'not-enough-data',
      title: 'Keep Logging Your Mood',
      description: 'We need more data to generate personalized insights. Keep logging your mood daily.',
      category: 'suggestion',
      priority: 'medium',
      createdAt: new Date().toISOString(),
    }];
  }
  
  const insights: PersonalizedInsight[] = [];
  
  // Detect time of day patterns
  const timeOfDayPatterns = detectTimeOfDayPatterns(entries);
  insights.push(...timeOfDayPatterns);
  
  // Detect day of week patterns
  const dayOfWeekPatterns = detectDayOfWeekPatterns(entries);
  insights.push(...dayOfWeekPatterns);
  
  // Detect weather impacts
  const weatherInsights = detectWeatherImpacts(entries);
  insights.push(...weatherInsights);
  
  // Detect consecutive mood patterns
  const consecutivePatterns = detectConsecutiveMoodPatterns(entries);
  insights.push(...consecutivePatterns);
  
  // Detect mood improvements and declines
  const moodChanges = detectMoodChanges(entries);
  insights.push(...moodChanges);
  
  // Generate streak achievements
  const streakAchievements = generateStreakAchievements(entries);
  insights.push(...streakAchievements);
  
  // Sort insights by priority and recency
  return insights.sort((a, b) => {
    // First by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    // Then by date (most recent first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

/**
 * Detect patterns related to time of day
 */
const detectTimeOfDayPatterns = (entries: MoodEntry[]): PersonalizedInsight[] => {
  const insights: PersonalizedInsight[] = [];
  const timeOfDayMoods: Record<TimeOfDay, { values: number[], count: number }> = {
    'morning': { values: [], count: 0 },
    'afternoon': { values: [], count: 0 },
    'evening': { values: [], count: 0 },
    'night': { values: [], count: 0 },
    'full-day': { values: [], count: 0 },
  };
  
  // Map mood types to numerical values
  const moodToValue = (mood: MoodType): number => {
    switch (mood) {
      case 'Very Bad': return 0;
      case 'Bad': return 1;
      case 'Okay': return 2;
      case 'Good': return 3;
      case 'Very Good': return 4;
      default: return 2; // Default to 'Okay'
    }
  };
  
  // Map numerical values back to mood types
  const valueToMood = (value: number): MoodType => {
    const rounded = Math.round(value);
    switch (rounded) {
      case 0: return 'Very Bad';
      case 1: return 'Bad';
      case 2: return 'Okay';
      case 3: return 'Good';
      case 4: return 'Very Good';
      default: return 'Okay';
    }
  };
  
  // Calculate average mood by time of day
  entries.forEach(entry => {
    const value = moodToValue(entry.mood);
    timeOfDayMoods[entry.timeOfDay].values.push(value);
    timeOfDayMoods[entry.timeOfDay].count++;
  });
  
  // Calculate averages
  const averages: Record<TimeOfDay, number> = {} as Record<TimeOfDay, number>;
  
  Object.entries(timeOfDayMoods).forEach(([timeOfDay, data]) => {
    if (data.count >= 5) { // Only consider time periods with enough data
      const sum = data.values.reduce((acc, val) => acc + val, 0);
      averages[timeOfDay as TimeOfDay] = sum / data.count;
    }
  });
  
  // Find best and worst times
  let bestTime: TimeOfDay | null = null;
  let worstTime: TimeOfDay | null = null;
  let bestAvg = -1;
  let worstAvg = 5;
  
  Object.entries(averages).forEach(([timeOfDay, avg]) => {
    if (avg > bestAvg) {
      bestAvg = avg;
      bestTime = timeOfDay as TimeOfDay;
    }
    if (avg < worstAvg) {
      worstAvg = avg;
      worstTime = timeOfDay as TimeOfDay;
    }
  });
  
  // Only add insights if there's a significant difference
  if (bestTime && worstTime && bestTime !== worstTime && (bestAvg - worstAvg >= 1.0)) {
    // Best time insight
    insights.push({
      id: `best-time-${Date.now()}`,
      title: `You Feel Best During the ${bestTime}`,
      description: `Based on your logs, you tend to feel ${valueToMood(bestAvg)} during the ${bestTime}.`,
      actionItem: `Try to schedule important activities or tasks during the ${bestTime} when possible.`,
      category: 'pattern',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      related: {
        type: 'timeOfDay',
        value: bestTime,
      },
    });
    
    // Worst time insight
    insights.push({
      id: `worst-time-${Date.now()}`,
      title: `You Feel Less Positive During the ${worstTime}`,
      description: `Your mood tends to be ${valueToMood(worstAvg)} during the ${worstTime}.`,
      actionItem: `Consider adding mood-boosting activities to your ${worstTime} routine.`,
      category: 'pattern',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      related: {
        type: 'timeOfDay',
        value: worstTime,
      },
    });
  }
  
  return insights;
};

/**
 * Detect patterns related to day of week
 */
const detectDayOfWeekPatterns = (entries: MoodEntry[]): PersonalizedInsight[] => {
  const insights: PersonalizedInsight[] = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayMoods: Record<string, number[]> = {};
  
  // Initialize arrays
  dayNames.forEach((_, index) => {
    dayMoods[index.toString()] = [];
  });
  
  // Map mood types to numerical values
  const moodToValue = (mood: MoodType): number => {
    switch (mood) {
      case 'Very Bad': return 0;
      case 'Bad': return 1;
      case 'Okay': return 2;
      case 'Good': return 3;
      case 'Very Good': return 4;
      default: return 2; // Default to 'Okay'
    }
  };
  
  // Group moods by day of week
  entries.forEach(entry => {
    const date = parseISO(entry.date);
    const dayOfWeek = date.getDay().toString();
    dayMoods[dayOfWeek].push(moodToValue(entry.mood));
  });
  
  // Calculate average mood for each day
  const averageMoods: Record<string, number> = {};
  Object.entries(dayMoods).forEach(([day, moods]) => {
    if (moods.length >= 3) { // Only consider days with enough data
      averageMoods[day] = moods.reduce((acc, val) => acc + val, 0) / moods.length;
    }
  });
  
  // Find the best and worst days
  let bestDay: string | null = null;
  let worstDay: string | null = null;
  let bestAvg = -1;
  let worstAvg = 5;
  
  Object.entries(averageMoods).forEach(([day, avg]) => {
    if (avg > bestAvg) {
      bestAvg = avg;
      bestDay = day;
    }
    if (avg < worstAvg) {
      worstAvg = avg;
      worstDay = day;
    }
  });
  
  // Only add insights if there's a significant difference
  if (bestDay && worstDay && bestDay !== worstDay && (bestAvg - worstAvg >= 0.8)) {
    // Convert back to mood words
    const bestMoodWord = bestAvg >= 3.5 ? 'very good' : bestAvg >= 2.5 ? 'good' : bestAvg >= 1.5 ? 'okay' : 'not great';
    const worstMoodWord = worstAvg >= 2.5 ? 'okay' : worstAvg >= 1.5 ? 'not great' : 'poor';
    
    insights.push({
      id: `day-pattern-${Date.now()}`,
      title: `${dayNames[parseInt(bestDay)]}s Are Your Best Day`,
      description: `Your mood is typically ${bestMoodWord} on ${dayNames[parseInt(bestDay)]}s and ${worstMoodWord} on ${dayNames[parseInt(worstDay)]}s.`,
      actionItem: `Consider what makes ${dayNames[parseInt(bestDay)]}s better and try to bring those elements to other days.`,
      category: 'pattern',
      priority: 'medium',
      createdAt: new Date().toISOString(),
    });
  }
  
  return insights;
};

/**
 * Detect weather impacts on mood
 */
const detectWeatherImpacts = (entries: MoodEntry[]): PersonalizedInsight[] => {
  const insights: PersonalizedInsight[] = [];
  
  // Only proceed if we have weather data
  const entriesWithWeather = entries.filter(e => e.weather && e.weather.condition);
  if (entriesWithWeather.length < 10) {
    return [];
  }
  
  // Map mood types to numerical values
  const moodToValue = (mood: MoodType): number => {
    switch (mood) {
      case 'Very Bad': return 0;
      case 'Bad': return 1;
      case 'Okay': return 2;
      case 'Good': return 3;
      case 'Very Good': return 4;
      default: return 2; // Default to 'Okay'
    }
  };
  
  // Group by weather condition
  const weatherMoods: Record<string, number[]> = {};
  entriesWithWeather.forEach(entry => {
    const condition = entry.weather?.condition || 'Unknown';
    if (!weatherMoods[condition]) {
      weatherMoods[condition] = [];
    }
    weatherMoods[condition].push(moodToValue(entry.mood));
  });
  
  // Calculate average mood for each weather condition
  const weatherAverages: Record<string, { avg: number; count: number }> = {};
  Object.entries(weatherMoods).forEach(([condition, moods]) => {
    if (moods.length >= 3) { // Only consider conditions with enough data
      weatherAverages[condition] = {
        avg: moods.reduce((acc, val) => acc + val, 0) / moods.length,
        count: moods.length
      };
    }
  });
  
  // Find the best and worst weather conditions
  let bestWeather: string | null = null;
  let worstWeather: string | null = null;
  let bestAvg = -1;
  let worstAvg = 5;
  
  Object.entries(weatherAverages).forEach(([condition, data]) => {
    if (data.avg > bestAvg && data.count >= 3) {
      bestAvg = data.avg;
      bestWeather = condition;
    }
    if (data.avg < worstAvg && data.count >= 3) {
      worstAvg = data.avg;
      worstWeather = condition;
    }
  });
  
  // Only add an insight if there's a significant difference
  if (bestWeather && worstWeather && bestWeather !== worstWeather && (bestAvg - worstAvg >= 0.8)) {
    insights.push({
      id: `weather-impact-${Date.now()}`,
      title: `Weather Affects Your Mood`,
      description: `You tend to feel better on ${bestWeather} days compared to ${worstWeather} days.`,
      actionItem: bestWeather === 'Sunny' || bestWeather === 'Clear' 
        ? `Try to get more sunlight on ${worstWeather} days to help boost your mood.`
        : `Be aware that weather may affect how you feel and plan mood-boosting activities on ${worstWeather} days.`,
      category: 'pattern',
      priority: 'medium',
      createdAt: new Date().toISOString(),
    });
  }
  
  return insights;
};

/**
 * Detect consecutive mood patterns
 */
const detectConsecutiveMoodPatterns = (entries: MoodEntry[]): PersonalizedInsight[] => {
  const insights: PersonalizedInsight[] = [];
  
  // Not enough data
  if (entries.length < 7) {
    return [];
  }
  
  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Look for consecutive days with the same mood category
  const negativeCategories: MoodType[] = ['Very Bad', 'Bad'];
  const positiveCategories: MoodType[] = ['Good', 'Very Good'];
  
  let consecutiveNegative = 0;
  let consecutivePositive = 0;
  let lastNegativeDate: Date | null = null;
  let lastPositiveDate: Date | null = null;
  
  // Group entries by day
  const entriesByDay: Record<string, MoodEntry[]> = {};
  sortedEntries.forEach(entry => {
    const dateString = format(parseISO(entry.date), 'yyyy-MM-dd');
    if (!entriesByDay[dateString]) {
      entriesByDay[dateString] = [];
    }
    entriesByDay[dateString].push(entry);
  });
  
  // Convert to array of days with averaged mood
  const dayMoods: { date: Date; mood: MoodType }[] = [];
  
  Object.entries(entriesByDay).forEach(([dateString, dayEntries]) => {
    // Calculate the most common mood for the day
    const moodCounts = {
      'Very Bad': 0,
      'Bad': 0,
      'Okay': 0,
      'Good': 0,
      'Very Good': 0,
      // Add camelCase versions
      'veryBad': 0,
      'bad': 0,
      'neutral': 0,
      'good': 0,
      'veryGood': 0
    };
    
    dayEntries.forEach(entry => {
      moodCounts[entry.mood]++;
    });
    
    let mostCommonMood: MoodType = 'Okay';
    let maxCount = 0;
    
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonMood = mood as MoodType;
      }
    });
    
    dayMoods.push({
      date: parseISO(dateString),
      mood: mostCommonMood,
    });
  });
  
  // Sort by date
  dayMoods.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Check for consecutive patterns
  for (let i = 0; i < dayMoods.length; i++) {
    const { date, mood } = dayMoods[i];
    
    if (negativeCategories.includes(mood)) {
      consecutiveNegative++;
      lastNegativeDate = date;
      consecutivePositive = 0;
    } else if (positiveCategories.includes(mood)) {
      consecutivePositive++;
      lastPositiveDate = date;
      consecutiveNegative = 0;
    } else {
      consecutiveNegative = 0;
      consecutivePositive = 0;
    }
    
    // Generate insights for significant streaks
    if (consecutiveNegative === 3) {
      insights.push({
        id: `negative-streak-${Date.now()}`,
        title: 'You\'ve Had Several Challenging Days',
        description: `You've logged negative moods for 3 consecutive days, ending on ${format(lastNegativeDate!, 'MMM d, yyyy')}.`,
        actionItem: 'Consider reaching out to a friend or trying a new self-care activity to break this cycle.',
        category: 'warning',
        priority: 'high',
        createdAt: new Date().toISOString(),
      });
    }
    
    if (consecutivePositive === 3) {
      insights.push({
        id: `positive-streak-${Date.now()}`,
        title: 'You\'re On a Positive Streak!',
        description: `You've logged positive moods for 3 consecutive days, ending on ${format(lastPositiveDate!, 'MMM d, yyyy')}.`,
        actionItem: 'Reflect on what\'s been contributing to this positive streak and try to maintain these factors.',
        category: 'achievement',
        priority: 'medium',
        createdAt: new Date().toISOString(),
      });
    }
  }
  
  return insights;
};

/**
 * Detect mood improvements or declines
 */
const detectMoodChanges = (entries: MoodEntry[]): PersonalizedInsight[] => {
  const insights: PersonalizedInsight[] = [];
  
  if (entries.length < 14) { // Need at least 2 weeks of data
    return [];
  }
  
  // Map mood types to numerical values
  const moodToValue = (mood: MoodType): number => {
    switch (mood) {
      case 'Very Bad': return 0;
      case 'Bad': return 1;
      case 'Okay': return 2;
      case 'Good': return 3;
      case 'Very Good': return 4;
      default: return 2; // Default to 'Okay'
    }
  };
  
  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Get entries from last 7 days and previous 7 days
  const now = new Date();
  const oneWeekAgo = subDays(now, 7);
  const twoWeeksAgo = subDays(now, 14);
  
  const recentEntries = sortedEntries.filter(entry => {
    const entryDate = parseISO(entry.date);
    return entryDate >= oneWeekAgo && entryDate <= now;
  });
  
  const previousEntries = sortedEntries.filter(entry => {
    const entryDate = parseISO(entry.date);
    return entryDate >= twoWeeksAgo && entryDate < oneWeekAgo;
  });
  
  // Need enough entries in both periods
  if (recentEntries.length < 3 || previousEntries.length < 3) {
    return [];
  }
  
  // Calculate average mood for both periods
  const recentAvg = recentEntries.reduce((acc, entry) => acc + moodToValue(entry.mood), 0) / recentEntries.length;
  const previousAvg = previousEntries.reduce((acc, entry) => acc + moodToValue(entry.mood), 0) / previousEntries.length;
  
  // Calculate the difference
  const difference = recentAvg - previousAvg;
  
  // Generate insights based on significant changes
  if (difference >= 0.7) {
    insights.push({
      id: `mood-improvement-${Date.now()}`,
      title: 'Your Mood Has Been Improving',
      description: 'Your average mood has significantly improved over the past week compared to the previous week.',
      actionItem: 'Reflect on what positive changes you\'ve made recently and continue these practices.',
      category: 'achievement',
      priority: 'high',
      createdAt: new Date().toISOString(),
    });
  } else if (difference <= -0.7) {
    insights.push({
      id: `mood-decline-${Date.now()}`,
      title: 'Your Mood Has Been Lower Recently',
      description: 'Your average mood has been lower over the past week compared to the previous week.',
      actionItem: 'Consider what factors might be affecting your mood and try introducing more self-care activities.',
      category: 'warning',
      priority: 'high',
      createdAt: new Date().toISOString(),
    });
  }
  
  return insights;
};

/**
 * Generate streak achievements
 */
const generateStreakAchievements = (entries: MoodEntry[]): PersonalizedInsight[] => {
  const insights: PersonalizedInsight[] = [];
  
  // Calculate current streak
  const entriesByDay = new Map<string, boolean>();
  
  // Mark days that have entries
  entries.forEach(entry => {
    const dateStr = format(parseISO(entry.date), 'yyyy-MM-dd');
    entriesByDay.set(dateStr, true);
  });
  
  // Calculate current streak
  let currentStreak = 0;
  let today = startOfDay(new Date());
  
  while (entriesByDay.has(format(today, 'yyyy-MM-dd'))) {
    currentStreak++;
    today = subDays(today, 1);
  }
  
  // Generate achievements based on streak milestones
  if (currentStreak === 3) {
    insights.push({
      id: `streak-3-${Date.now()}`,
      title: '3-Day Streak!',
      description: 'You\'ve logged your mood for 3 consecutive days!',
      actionItem: 'Keep the momentum going!',
      category: 'achievement',
      priority: 'low',
      createdAt: new Date().toISOString(),
    });
  } else if (currentStreak === 7) {
    insights.push({
      id: `streak-7-${Date.now()}`,
      title: 'One Week Streak!',
      description: 'You\'ve logged your mood every day for a full week!',
      actionItem: 'This consistent tracking will lead to better insights. Keep it up!',
      category: 'achievement',
      priority: 'medium',
      createdAt: new Date().toISOString(),
    });
  } else if (currentStreak === 14) {
    insights.push({
      id: `streak-14-${Date.now()}`,
      title: 'Two Week Streak!',
      description: 'You\'ve logged your mood every day for two weeks straight!',
      actionItem: 'You\'re building a great habit. Your data is becoming more meaningful every day.',
      category: 'achievement',
      priority: 'medium',
      createdAt: new Date().toISOString(),
    });
  } else if (currentStreak === 30) {
    insights.push({
      id: `streak-30-${Date.now()}`,
      title: 'Monthly Master!',
      description: 'Incredible! You\'ve logged your mood every day for a full month!',
      actionItem: 'Your commitment is impressive. Check your analytics to see the patterns emerging from your consistent tracking.',
      category: 'achievement',
      priority: 'high',
      createdAt: new Date().toISOString(),
    });
  } else if (currentStreak >= 60 && currentStreak % 30 === 0) {
    const months = currentStreak / 30;
    insights.push({
      id: `streak-${currentStreak}-${Date.now()}`,
      title: `${months} Month Milestone!`,
      description: `Wow! You've logged your mood consistently for ${months} months straight!`,
      actionItem: 'Your long-term data is incredibly valuable. Compare your mood charts across months to see your emotional journey.',
      category: 'achievement',
      priority: 'high',
      createdAt: new Date().toISOString(),
    });
  }
  
  return insights;
}; 