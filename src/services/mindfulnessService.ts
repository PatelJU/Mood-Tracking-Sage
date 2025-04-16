import { MoodType } from '../types';

export interface MeditationSession {
  id: string;
  type: 'guided' | 'unguided' | 'breathing';
  duration: number; // in minutes
  completed: boolean;
  timestamp: string;
  notes?: string;
}

export interface MindfulnessExercise {
  id: string;
  title: string;
  description: string;
  duration: number;
  steps: string[];
  moodCategory: MoodType[];
  audioUrl?: string;
}

export const mindfulnessExercises: MindfulnessExercise[] = [
  {
    id: 'breathing-space',
    title: '3-Minute Breathing Space',
    description: 'A quick mindfulness practice for busy moments',
    duration: 3,
    moodCategory: ['Bad', 'Okay'],
    steps: [
      'Find a comfortable position and close your eyes',
      'Become aware of your thoughts, feelings, and bodily sensations',
      'Focus your attention on your breath',
      'Expand awareness to your whole body',
      'Open your eyes and carry this awareness with you'
    ]
  },
  {
    id: 'body-scan',
    title: 'Progressive Body Scan',
    description: 'Reduce physical tension and mental stress',
    duration: 10,
    moodCategory: ['Very Bad', 'Bad'],
    steps: [
      'Lie down in a comfortable position',
      'Focus on your breath for a few moments',
      'Bring attention to your toes and feet',
      'Slowly move attention up through your body',
      'Notice any tension or discomfort',
      'Release tension with each exhale',
      'Complete the scan at the top of your head'
    ]
  },
  {
    id: 'gratitude',
    title: 'Gratitude Meditation',
    description: 'Foster positive emotions through gratitude',
    duration: 5,
    moodCategory: ['Okay', 'Good'],
    steps: [
      'Sit comfortably and take a few deep breaths',
      'Think of something you\'re grateful for',
      'Notice how gratitude feels in your body',
      'Send well-wishes to yourself and others',
      'Open your eyes when ready'
    ]
  }
];

export const getExerciseForMood = (mood: MoodType): MindfulnessExercise[] => {
  return mindfulnessExercises.filter(exercise => 
    exercise.moodCategory.includes(mood)
  );
};

export const generateBreathingPattern = (
  intensity: 'calm' | 'energize' | 'balance'
): { inhale: number; hold: number; exhale: number; cycles: number } => {
  switch (intensity) {
    case 'calm':
      return { inhale: 4, hold: 7, exhale: 8, cycles: 5 }; // 4-7-8 breathing
    case 'energize':
      return { inhale: 6, hold: 0, exhale: 2, cycles: 10 }; // Energizing breath
    case 'balance':
      return { inhale: 4, hold: 4, exhale: 4, cycles: 8 }; // Box breathing
    default:
      return { inhale: 4, hold: 4, exhale: 4, cycles: 6 };
  }
};

export const getMindfulnessPrompt = (mood: MoodType): string => {
  const prompts = {
    'Very Bad': [
      'Notice your thoughts without judgment. They\'re like clouds passing by.',
      'Feel your feet on the ground. This moment is your anchor.',
      'Breathe in for 4, hold for 4, exhale for 6. Repeat until you feel centered.',
      'Place your hand on your heart. Feel it beating. You are alive and that matters.',
      'What one small thing can you do right now to take care of yourself?'
    ],
    'Bad': [
      'Pause and notice three things you can see, three you can hear, and three you can feel.',
      'Imagine your tension as a color. With each breath, watch it slowly fade.',
      'Gentle movement can shift your energy. Stretch your arms up, then let them float down.',
      'Your feelings are like weather - they pass. What small ray of light can you find?',
      'Think of one thing, no matter how small, that you\'re grateful for right now.'
    ],
    'Okay': [
      'Take this neutral moment to check in with your body. Where do you feel ease?',
      'What would make this moment just a little better? Can you give yourself that?',
      'Notice the quality of your thoughts right now. Are they serving you?',
      'This is a good time to set a small intention for the rest of your day.',
      'Take three breaths, making each exhale longer than the last.'
    ],
    'Good': [
      'Savor this positive feeling. Where do you notice it in your body?',
      'What contributed to this good mood? Acknowledge those elements with gratitude.',
      'Imagine sending some of this positive energy to someone who needs it today.',
      'Take a mental snapshot of this feeling to revisit when you need it.',
      'How might you extend or build on this good feeling?'
    ],
    'Very Good': [
      'Let this wonderful feeling expand through your whole body with each breath.',
      'What truth about yourself does this excellent mood reveal?',
      'How might you channel this energy into something meaningful today?',
      'Take a moment to fully appreciate this state - these peaks are precious.',
      'Consider journaling about what led to this high point for future reference.'
    ],
    // Add camelCase versions
    'veryBad': [
      'Notice your thoughts without judgment. They\'re like clouds passing by.',
      'Feel your feet on the ground. This moment is your anchor.',
      'Breathe in for 4, hold for 4, exhale for 6. Repeat until you feel centered.',
      'Place your hand on your heart. Feel it beating. You are alive and that matters.',
      'What one small thing can you do right now to take care of yourself?'
    ],
    'bad': [
      'Pause and notice three things you can see, three you can hear, and three you can feel.',
      'Imagine your tension as a color. With each breath, watch it slowly fade.',
      'Gentle movement can shift your energy. Stretch your arms up, then let them float down.',
      'Your feelings are like weather - they pass. What small ray of light can you find?',
      'Think of one thing, no matter how small, that you\'re grateful for right now.'
    ],
    'neutral': [
      'Take this neutral moment to check in with your body. Where do you feel ease?',
      'What would make this moment just a little better? Can you give yourself that?',
      'Notice the quality of your thoughts right now. Are they serving you?',
      'This is a good time to set a small intention for the rest of your day.',
      'Take three breaths, making each exhale longer than the last.'
    ],
    'good': [
      'Savor this positive feeling. Where do you notice it in your body?',
      'What contributed to this good mood? Acknowledge those elements with gratitude.',
      'Imagine sending some of this positive energy to someone who needs it today.',
      'Take a mental snapshot of this feeling to revisit when you need it.',
      'How might you extend or build on this good feeling?'
    ],
    'veryGood': [
      'Let this wonderful feeling expand through your whole body with each breath.',
      'What truth about yourself does this excellent mood reveal?',
      'How might you channel this energy into something meaningful today?',
      'Take a moment to fully appreciate this state - these peaks are precious.',
      'Consider journaling about what led to this high point for future reference.'
    ]
  };
  
  const options = prompts[mood];
  return options[Math.floor(Math.random() * options.length)];
};

export const calculateMindfulnessDuration = (sessions: MeditationSession[]): number => {
  return sessions.reduce((total, session) => {
    return total + (session.completed ? session.duration : 0);
  }, 0);
};

export const generateMindfulnessStreak = (sessions: MeditationSession[]): number => {
  let streak = 0;
  let currentStreak = 0;
  let lastDate: Date | null = null;
  
  // Sort sessions by date
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  sortedSessions.forEach(session => {
    const sessionDate = new Date(session.timestamp);
    
    if (!lastDate) {
      currentStreak = 1;
    } else {
      const dayDiff = Math.floor(
        (lastDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (dayDiff === 1) {
        currentStreak++;
      } else {
        if (currentStreak > streak) {
          streak = currentStreak;
        }
        currentStreak = 1;
      }
    }
    
    lastDate = sessionDate;
  });
  
  return Math.max(streak, currentStreak);
}; 