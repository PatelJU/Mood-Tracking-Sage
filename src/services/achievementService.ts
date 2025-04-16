import { MoodEntry, Achievement, MoodStreak } from '../types';
import { differenceInDays, parseISO, isSameDay } from 'date-fns';

const achievements: Achievement[] = [
  {
    id: 'first-entry',
    name: 'Getting Started',
    description: 'Log your first mood entry',
    icon: '🌱',
    reward: 10,
    criteria: (entries: MoodEntry[]) => entries.length >= 1
  },
  {
    id: 'week-streak',
    name: 'Week Warrior',
    description: 'Log your mood every day for a week',
    icon: '📅',
    reward: 50,
    criteria: (entries: MoodEntry[]) => calculateLongestStreak(entries) >= 7
  },
  {
    id: 'improvement',
    name: 'Mood Master',
    description: 'Show improvement in mood over 2 weeks',
    icon: '📈',
    reward: 100,
    criteria: (entries: MoodEntry[]) => checkMoodImprovement(entries, 14)
  },
  {
    id: 'detailed-logger',
    name: 'Detailed Observer',
    description: 'Log 5 entries with detailed notes',
    icon: '📝',
    reward: 30,
    criteria: (entries: MoodEntry[]) => entries.filter(e => e.notes.length > 50).length >= 5
  },
  {
    id: 'weather-tracker',
    name: 'Weather Watcher',
    description: 'Log 10 entries with weather information',
    icon: '🌤️',
    reward: 40,
    criteria: (entries: MoodEntry[]) => entries.filter(e => e.weather?.condition).length >= 10
  }
];

export const checkAchievements = (entries: MoodEntry[]): Achievement[] => {
  return achievements.filter(achievement => achievement.criteria(entries));
};

export const calculateStreaks = (entries: MoodEntry[]): MoodStreak[] => {
  const streaks: MoodStreak[] = [];
  
  // Sort entries by date
  const sortedEntries = [...entries].sort(
    (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
  );
  
  let currentStreak: MoodStreak | null = null;
  let previousDate: Date | null = null;
  
  sortedEntries.forEach(entry => {
    const entryDate = parseISO(entry.date);
    
    // Check if this entry continues the streak
    if (previousDate && differenceInDays(entryDate, previousDate) === 1) {
      if (currentStreak) {
        currentStreak.count++;
        currentStreak.endDate = entry.date;
      }
    } else {
      // Start new streak
      if (currentStreak) {
        streaks.push(currentStreak);
      }
      currentStreak = {
        type: 'logging',
        count: 1,
        startDate: entry.date,
        endDate: entry.date
      };
    }
    
    previousDate = entryDate;
  });
  
  // Add the last streak if it exists
  if (currentStreak) {
    streaks.push(currentStreak);
  }
  
  return streaks;
};

const calculateLongestStreak = (entries: MoodEntry[]): number => {
  const streaks = calculateStreaks(entries);
  return Math.max(...streaks.map(streak => streak.count), 0);
};

const checkMoodImprovement = (entries: MoodEntry[], days: number): boolean => {
  const recentEntries = entries.filter(entry => {
    const entryDate = parseISO(entry.date);
    return differenceInDays(new Date(), entryDate) <= days;
  });
  
  if (recentEntries.length < days / 2) return false;
  
  const moodValues = {
    'Very Bad': 0,
    'Bad': 1,
    'Okay': 2,
    'Good': 3,
    'Very Good': 4
  };
  
  const firstHalf = recentEntries.slice(0, Math.floor(recentEntries.length / 2));
  const secondHalf = recentEntries.slice(Math.floor(recentEntries.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, entry) => sum + moodValues[entry.mood as keyof typeof moodValues], 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, entry) => sum + moodValues[entry.mood as keyof typeof moodValues], 0) / secondHalf.length;
  
  return secondHalfAvg > firstHalfAvg + 0.5; // Significant improvement threshold
}; 