import { v4 as uuidv4 } from 'uuid';
import { 
  MoodEntry, 
  MoodStats, 
  MoodType, 
  TimeOfDay, 
  MoodPrediction, 
  MoodSuggestion 
} from '../types';
import { addDays, differenceInDays, format, parseISO, subDays } from 'date-fns';

// Weather conditions for mock data
const weatherConditions = ['Sunny', 'Cloudy', 'Rainy', 'Foggy', 'Snowy', 'Windy', 'Clear'];

// Weather temperature ranges (Celsius)
const temperatureRanges = {
  winter: { min: -5, max: 10 },
  spring: { min: 5, max: 20 },
  summer: { min: 15, max: 35 },
  autumn: { min: 5, max: 20 },
};

// Generate a random temperature based on current season
const getRandomTemperature = (): number => {
  const month = new Date().getMonth();
  let season: 'winter' | 'spring' | 'summer' | 'autumn';
  
  // Determine season based on month (Northern Hemisphere)
  if (month >= 2 && month <= 4) {
    season = 'spring';
  } else if (month >= 5 && month <= 7) {
    season = 'summer';
  } else if (month >= 8 && month <= 10) {
    season = 'autumn';
  } else {
    season = 'winter';
  }
  
  const range = temperatureRanges[season];
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
};

// Generate mock mood entries for the past X days
export const generateMockMoodEntries = (days: number): MoodEntry[] => {
  const entries: MoodEntry[] = [];
  const now = new Date();
  const moodTypes: MoodType[] = ['Very Bad', 'Bad', 'Okay', 'Good', 'Very Good'];
  const timeOfDays: TimeOfDay[] = ['morning', 'afternoon', 'evening', 'night', 'full-day'];
  
  // Create a distribution that makes "Okay" and "Good" more common than extremes
  const moodDistribution: MoodType[] = [
    'Very Bad', 'Bad', 'Bad', 
    'Okay', 'Okay', 'Okay', 'Okay', 
    'Good', 'Good', 'Good', 
    'Very Good'
  ];
  
  // Mock notes for different moods
  const moodNotes = {
    'Very Bad': [
      'Feeling terrible today. Nothing seems to be going right.',
      'Had a really rough day. Feeling down and overwhelmed.',
      'Everything feels difficult and exhausting today.',
      'Had a fight with someone important to me. Feeling awful.',
    ],
    'Bad': [
      'Not feeling great today. Low energy and motivation.',
      'Woke up on the wrong side of the bed. Things aren\'t going well.',
      'Feeling stressed about work/school deadlines.',
      'Minor setbacks today. Trying to stay positive.',
    ],
    'Okay': [
      'Just an average day. Nothing special.',
      'Feeling neutral. Not great, not bad.',
      'Got through the day without any major issues.',
      'Some ups and downs, but mostly balanced.',
      'Somewhat productive today.',
    ],
    'Good': [
      'Had a productive day. Feeling accomplished.',
      'Spent time with friends which lifted my mood.',
      'Made progress on a project I care about.',
      'Enjoyed some relaxing time to myself.',
      'Exercise today helped me feel better.',
    ],
    'Very Good': [
      'Feeling fantastic! Everything clicked today.',
      'Great news today that put me in a wonderful mood.',
      'Accomplished something I\'ve been working on for a while.',
      'Perfect balance of productivity and relaxation today.',
      'Connected with loved ones. Feeling grateful and happy.',
    ],
  };
  
  // Generate entries with some patterns
  for (let i = 0; i < days; i++) {
    const date = subDays(now, i);
    const dayOfWeek = date.getDay();
    
    // Generate 1-3 entries per day
    const entriesPerDay = Math.floor(Math.random() * 3) + 1;
    
    // Avoid duplicate time periods
    const usedTimePeriods: TimeOfDay[] = [];
    
    for (let j = 0; j < entriesPerDay; j++) {
      let timeOfDay: TimeOfDay;
      
      // Choose a time period that hasn't been used for this day
      do {
        timeOfDay = timeOfDays[Math.floor(Math.random() * timeOfDays.length)];
      } while (usedTimePeriods.includes(timeOfDay));
      
      usedTimePeriods.push(timeOfDay);
      
      // Create some patterns: weekends tend to have better moods
      let moodIndex: number;
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend (Sunday or Saturday)
        // Higher chance of good moods on weekends
        moodIndex = Math.floor(Math.random() * 5);
        if (moodIndex < 2) moodIndex += 2; // Shift towards better moods
      } else {
        // Regular distribution on weekdays
        moodIndex = Math.floor(Math.random() * moodDistribution.length);
      }
      
      const mood = moodDistribution[moodIndex];
      
      // Get random weather
      const weatherCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
      const temperature = getRandomTemperature();
      const humidity = Math.floor(Math.random() * 50) + 30; // 30-80%
      
      // Get a random note for this mood
      const moodNoteOptions = moodNotes[mood];
      const note = moodNoteOptions[Math.floor(Math.random() * moodNoteOptions.length)];
      
      entries.push({
        id: uuidv4(),
        date: new Date(date.setHours(
          timeOfDay === 'morning' ? 9 : 
          timeOfDay === 'afternoon' ? 14 : 
          timeOfDay === 'evening' ? 19 : 
          timeOfDay === 'night' ? 23 : 12
        )).toISOString(),
        timeOfDay,
        mood,
        notes: note,
        weather: {
          temperature,
          condition: weatherCondition,
          humidity,
        },
      });
    }
  }
  
  return entries;
};

// Calculate mood statistics from entries
export const calculateMoodStats = (entries: MoodEntry[]): MoodStats => {
  // Helper function to convert mood to numeric value for calculations
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
  
  // Helper function to convert numeric value back to mood
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

  // Count moods by type
  const moodCounts = {
    'Very Bad': 0,
    'Bad': 0,
    'Okay': 0,
    'Good': 0,
    'Very Good': 0
  };
  
  entries.forEach(entry => {
    moodCounts[entry.mood]++;
  });
  
  // Calculate mood by day of week (0 = Sunday, 6 = Saturday)
  const dayOfWeekMoods: { [key: string]: number[] } = {
    '0': [], '1': [], '2': [], '3': [], '4': [], '5': [], '6': []
  };
  
  entries.forEach(entry => {
    const date = parseISO(entry.date);
    const dayOfWeek = date.getDay().toString();
    dayOfWeekMoods[dayOfWeek].push(moodToValue(entry.mood));
  });
  
  const averageMoodByDay: { [key: string]: number } = {};
  Object.keys(dayOfWeekMoods).forEach(day => {
    const moods = dayOfWeekMoods[day];
    averageMoodByDay[day] = moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : 0;
  });
  
  // Calculate mood by time of day
  const timeOfDayMoods: { [key in TimeOfDay]: number[] } = {
    'morning': [],
    'afternoon': [],
    'evening': [],
    'night': [],
    'full-day': [],
  };
  
  entries.forEach(entry => {
    timeOfDayMoods[entry.timeOfDay].push(moodToValue(entry.mood));
  });
  
  const averageMoodByTimeOfDay: { [key in TimeOfDay]: number } = {
    'morning': 0,
    'afternoon': 0,
    'evening': 0,
    'night': 0,
    'full-day': 0,
  };
  
  (Object.keys(timeOfDayMoods) as TimeOfDay[]).forEach(time => {
    const moods = timeOfDayMoods[time];
    averageMoodByTimeOfDay[time] = moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : 0;
  });
  
  // Find most frequent mood
  let maxCount = 0;
  let mostFrequentMood: MoodType = 'Okay';
  
  Object.entries(moodCounts).forEach(([mood, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequentMood = mood as MoodType;
    }
  });
  
  // Calculate trend based on recent entries
  let trendDirection: 'improving' | 'declining' | 'stable' = 'stable';
  
  if (entries.length > 5) {
    // Sort entries by date
    const sortedEntries = [...entries].sort(
      (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
    );
    
    // Get average mood for first half and second half of entries
    const midpoint = Math.floor(sortedEntries.length / 2);
    const firstHalf = sortedEntries.slice(0, midpoint);
    const secondHalf = sortedEntries.slice(midpoint);
    
    const firstHalfAvg = firstHalf
      .map(entry => moodToValue(entry.mood))
      .reduce((a, b) => a + b, 0) / firstHalf.length;
      
    const secondHalfAvg = secondHalf
      .map(entry => moodToValue(entry.mood))
      .reduce((a, b) => a + b, 0) / secondHalf.length;
    
    // Determine trend direction
    const threshold = 0.2; // Minimum difference to indicate a trend
    if (secondHalfAvg - firstHalfAvg > threshold) {
      trendDirection = 'improving';
    } else if (firstHalfAvg - secondHalfAvg > threshold) {
      trendDirection = 'declining';
    }
  }
  
  // Calculate weather correlations
  const weatherConditionMoods: { [key: string]: number[] } = {};
  const temperatureMoods: number[][] = []; // Array of [temp, mood value] pairs
  
  entries.forEach(entry => {
    if (entry.weather) {
      // Weather condition correlations
      if (entry.weather.condition) {
        if (!weatherConditionMoods[entry.weather.condition]) {
          weatherConditionMoods[entry.weather.condition] = [];
        }
        weatherConditionMoods[entry.weather.condition].push(moodToValue(entry.mood));
      }
      
      // Temperature correlations
      if (typeof entry.weather.temperature === 'number') {
        temperatureMoods.push([entry.weather.temperature, moodToValue(entry.mood)]);
      }
    }
  });
  
  // Calculate average mood for each weather condition
  const weatherConditionCorrelation: { [key: string]: number } = {};
  Object.keys(weatherConditionMoods).forEach(condition => {
    const moods = weatherConditionMoods[condition];
    weatherConditionCorrelation[condition] = moods.length 
      ? moods.reduce((a, b) => a + b, 0) / moods.length
      : 0;
  });
  
  // Calculate temperature correlation (simplified correlation coefficient)
  let temperatureCorrelation = 0;
  if (temperatureMoods.length > 5) {
    // Calculate means
    const tempSum = temperatureMoods.reduce((sum, pair) => sum + pair[0], 0);
    const moodSum = temperatureMoods.reduce((sum, pair) => sum + pair[1], 0);
    const tempMean = tempSum / temperatureMoods.length;
    const moodMean = moodSum / temperatureMoods.length;
    
    // Calculate covariance and variances
    let covariance = 0;
    let tempVariance = 0;
    let moodVariance = 0;
    
    temperatureMoods.forEach(pair => {
      const tempDiff = pair[0] - tempMean;
      const moodDiff = pair[1] - moodMean;
      
      covariance += tempDiff * moodDiff;
      tempVariance += tempDiff * tempDiff;
      moodVariance += moodDiff * moodDiff;
    });
    
    covariance /= temperatureMoods.length;
    tempVariance /= temperatureMoods.length;
    moodVariance /= temperatureMoods.length;
    
    // Calculate correlation coefficient
    if (tempVariance > 0 && moodVariance > 0) {
      temperatureCorrelation = covariance / (Math.sqrt(tempVariance) * Math.sqrt(moodVariance));
    }
  }
  
  return {
    averageMoodByDay,
    averageMoodByTimeOfDay,
    moodCountByType: moodCounts,
    mostFrequentMood,
    moodTrend: trendDirection,
    moodCorrelations: {
      weather: {
        temperature: temperatureCorrelation,
        condition: weatherConditionCorrelation,
      },
      dayOfWeek: averageMoodByDay,
    },
  };
};

// Predict mood for a specific day
export const predictMood = (entries: MoodEntry[], targetDate: Date): MoodPrediction => {
  // This is a simplified prediction model
  // In a real app, you would use more sophisticated machine learning
  
  // Get day of week for the target date
  const dayOfWeek = targetDate.getDay().toString();
  
  // Calculate average mood for this day of week
  const dayMoods: number[] = [];
  entries.forEach(entry => {
    const entryDate = parseISO(entry.date);
    if (entryDate.getDay().toString() === dayOfWeek) {
      const moodValue = getMoodValue(entry.mood);
      dayMoods.push(moodValue);
    }
  });
  
  let predictedValue = 2; // Default to 'Okay'
  let confidence = 0.5; // Default confidence
  
  if (dayMoods.length > 0) {
    // Calculate average mood for this day of week
    predictedValue = dayMoods.reduce((a, b) => a + b, 0) / dayMoods.length;
    
    // Higher confidence with more data points
    confidence = Math.min(0.2 + (dayMoods.length / 20), 0.9);
    
    // Consider recent trends for the prediction
    const recentEntries = entries
      .filter(entry => {
        const entryDate = parseISO(entry.date);
        return differenceInDays(targetDate, entryDate) <= 14; // Last two weeks
      })
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
    
    if (recentEntries.length > 3) {
      const recentMoods = recentEntries.slice(0, 3).map(entry => getMoodValue(entry.mood));
      const recentAvg = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length;
      
      // Blend the day-of-week average with recent mood trend
      predictedValue = (predictedValue * 0.6) + (recentAvg * 0.4);
      
      // Higher confidence with consistent recent moods
      const recentVariance = calculateVariance(recentMoods);
      if (recentVariance < 1) {
        confidence += 0.1;
      }
    }
  }
  
  // Round to get a valid mood type
  const predictedMood = getMoodFromValue(Math.round(predictedValue));
  
  return {
    date: format(targetDate, 'yyyy-MM-dd'),
    predictedMood,
    confidence,
  };
};

// Helper function to convert mood to numeric value
function getMoodValue(mood: MoodType): number {
  switch (mood) {
    case 'Very Bad': return 0;
    case 'Bad': return 1;
    case 'Okay': return 2;
    case 'Good': return 3;
    case 'Very Good': return 4;
    default: return 2;
  }
}

// Helper function to convert numeric value to mood
function getMoodFromValue(value: number): MoodType {
  switch (value) {
    case 0: return 'Very Bad';
    case 1: return 'Bad';
    case 2: return 'Okay';
    case 3: return 'Good';
    case 4: return 'Very Good';
    default: return 'Okay';
  }
}

// Calculate variance of an array of numbers
function calculateVariance(array: number[]): number {
  if (array.length <= 1) return 0;
  
  const mean = array.reduce((a, b) => a + b, 0) / array.length;
  const squareDiffs = array.map(value => {
    const diff = value - mean;
    return diff * diff;
  });
  
  return squareDiffs.reduce((a, b) => a + b, 0) / array.length;
}

// Mood improvement suggestions
export const getMoodSuggestions = (): MoodSuggestion[] => {
  return [
    {
      forMood: 'Very Bad',
      suggestion: 'Take five minutes to practice deep breathing. Inhale for 4 counts, hold for 7, exhale for 8.'
    },
    {
      forMood: 'Very Bad',
      suggestion: 'Call a friend or family member who makes you feel supported and understood.'
    },
    {
      forMood: 'Very Bad',
      suggestion: 'Go outside for a 10-minute walk. Fresh air and movement can help shift your mood.'
    },
    {
      forMood: 'Very Bad',
      suggestion: 'Listen to uplifting music that you know has improved your mood in the past.'
    },
    {
      forMood: 'Very Bad',
      suggestion: 'Write down three things you\'re grateful for, no matter how small.'
    },
    {
      forMood: 'Bad',
      suggestion: 'Watch a funny video or comedy show that makes you laugh.'
    },
    {
      forMood: 'Bad',
      suggestion: 'Make yourself a cup of tea or your favorite beverage and sip it slowly, focusing on the taste.'
    },
    {
      forMood: 'Bad',
      suggestion: 'Practice a simple self-care ritual like taking a warm shower or applying lotion.'
    },
    {
      forMood: 'Bad',
      suggestion: 'Set a timer for 15 minutes and do something productive. Sometimes small accomplishments help.'
    },
    {
      forMood: 'Bad',
      suggestion: 'Look at photos from a happy memory or event that brings you joy.'
    },
    {
      forMood: 'Okay',
      suggestion: 'Try something creative - draw, write, or make music for 20 minutes.'
    },
    {
      forMood: 'Okay',
      suggestion: 'Plan something to look forward to later this week, even if it\'s small.'
    },
    {
      forMood: 'Okay',
      suggestion: 'Do a quick declutter of a small space in your home. A tidy environment can lift your mood.'
    },
    {
      forMood: 'Okay',
      suggestion: 'Take a break from screens for an hour and do something tactile instead.'
    },
    {
      forMood: 'Okay',
      suggestion: 'Try learning something new for 30 minutes - a language, skill, or interesting topic.'
    },
    {
      forMood: 'Good',
      suggestion: 'Build on this good mood by doing something you love that you\'ve been putting off.'
    },
    {
      forMood: 'Good',
      suggestion: 'Share your positive energy - reach out to someone who might need a boost today.'
    },
    {
      forMood: 'Good',
      suggestion: 'Use this good energy to tackle something challenging that you\'ve been avoiding.'
    },
    {
      forMood: 'Good',
      suggestion: 'Journal about what contributed to your good mood so you can reference it later.'
    },
    {
      forMood: 'Good',
      suggestion: 'Go outside and connect with nature to enhance your positive feelings.'
    },
    {
      forMood: 'Very Good',
      suggestion: 'Celebrate this excellent mood! Do something special for yourself as a reward.'
    },
    {
      forMood: 'Very Good',
      suggestion: 'Channel this great energy into a creative project or something meaningful to you.'
    },
    {
      forMood: 'Very Good',
      suggestion: 'Share your happiness with others - kindness and generosity amplify positive feelings.'
    },
    {
      forMood: 'Very Good',
      suggestion: 'Take a moment to appreciate what led to this great mood and how you can recreate it.'
    },
    {
      forMood: 'Very Good',
      suggestion: 'Set an intention or goal while in this positive mindset - it\'s a great time for clarity.'
    },
  ];
}; 