import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useMood } from './MoodContext';
import { MoodEntry, MoodType } from '../types';

// Types for challenges
export type ChallengeCategory = 'mood' | 'mindfulness' | 'activity' | 'social' | 'growth';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: 1 | 2 | 3; // 1 = easy, 2 = medium, 3 = hard
  icon: string; // emoji or icon name
  pointsReward: number;
  duration: number; // in days
  completedDays: number;
  isActive: boolean;
  isCompleted: boolean;
  startDate?: string;
  completionDate?: string;
  streak: number;
  targetMood?: MoodType;
  dailyGoal?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: string;
  pointsRewarded: number;
  category: ChallengeCategory;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface ChallengesContextType {
  challenges: Challenge[];
  activeChallenge: Challenge | null;
  achievements: Achievement[];
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  addChallenge: (challenge: Omit<Challenge, 'id' | 'isCompleted' | 'completedDays' | 'streak'>) => void;
  startChallenge: (challengeId: string) => void;
  completeChallenge: (challengeId: string) => void;
  incrementChallengeProgress: (challengeId: string) => void;
  generatePersonalizedChallenges: () => Challenge[];
  getRecommendedChallenges: () => Challenge[];
}

const ChallengesContext = createContext<ChallengesContextType | undefined>(undefined);

export const useChallenges = () => {
  const context = useContext(ChallengesContext);
  if (context === undefined) {
    throw new Error('useChallenges must be used within a ChallengesProvider');
  }
  return context;
};

interface ChallengesProviderProps {
  children: ReactNode;
}

export const ChallengesProvider: React.FC<ChallengesProviderProps> = ({ children }) => {
  const { moodEntries } = useMood();
  
  // States
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  
  // Load data from localStorage on mount
  useEffect(() => {
    const savedChallenges = localStorage.getItem('challenges');
    const savedAchievements = localStorage.getItem('achievements');
    const savedPoints = localStorage.getItem('challengePoints');
    const savedStreak = localStorage.getItem('currentStreak');
    const savedLongestStreak = localStorage.getItem('longestStreak');
    
    if (savedChallenges) {
      setChallenges(JSON.parse(savedChallenges));
    }
    
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }
    
    if (savedPoints) {
      setTotalPoints(JSON.parse(savedPoints));
    }
    
    if (savedStreak) {
      setCurrentStreak(JSON.parse(savedStreak));
    }
    
    if (savedLongestStreak) {
      setLongestStreak(JSON.parse(savedLongestStreak));
    }
    
    // If there are no challenges, generate some default ones
    if (!savedChallenges || JSON.parse(savedChallenges).length === 0) {
      const defaultChallenges = generateDefaultChallenges();
      setChallenges(defaultChallenges);
      localStorage.setItem('challenges', JSON.stringify(defaultChallenges));
    }
  }, []);
  
  // Update localStorage when data changes
  useEffect(() => {
    localStorage.setItem('challenges', JSON.stringify(challenges));
    localStorage.setItem('achievements', JSON.stringify(achievements));
    localStorage.setItem('challengePoints', JSON.stringify(totalPoints));
    localStorage.setItem('currentStreak', JSON.stringify(currentStreak));
    localStorage.setItem('longestStreak', JSON.stringify(longestStreak));
    
    // Update active challenge
    const active = challenges.find(c => c.isActive);
    setActiveChallenge(active || null);
  }, [challenges, achievements, totalPoints, currentStreak, longestStreak]);
  
  // Update streaks based on mood entries
  useEffect(() => {
    if (moodEntries.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // Check if there's an entry from today or yesterday
      const hasTodayEntry = moodEntries.some(entry => 
        entry.date.split('T')[0] === today
      );
      
      const hasYesterdayEntry = moodEntries.some(entry => 
        entry.date.split('T')[0] === yesterdayStr
      );
      
      if (hasTodayEntry) {
        // Increment streak
        const newStreak = currentStreak + 1;
        setCurrentStreak(newStreak);
        
        // Update longest streak if needed
        if (newStreak > longestStreak) {
          setLongestStreak(newStreak);
        }
        
        // Update active challenge streak
        if (activeChallenge) {
          setChallenges(prev => prev.map(challenge => 
            challenge.id === activeChallenge.id
              ? { ...challenge, streak: challenge.streak + 1 }
              : challenge
          ));
        }
      } else if (!hasYesterdayEntry && !hasTodayEntry) {
        // Reset streak if no entries for two days
        setCurrentStreak(0);
      }
    }
  }, [moodEntries, currentStreak, longestStreak, activeChallenge]);
  
  // Generate default challenges
  const generateDefaultChallenges = (): Challenge[] => {
    return [
      {
        id: uuidv4(),
        title: 'Daily Mood Logger',
        description: 'Log your mood every day for 7 days to establish a tracking habit',
        category: 'mood',
        difficulty: 1,
        icon: '📝',
        pointsReward: 50,
        duration: 7,
        completedDays: 0,
        isActive: false,
        isCompleted: false,
        streak: 0
      },
      {
        id: uuidv4(),
        title: 'Mindful Minutes',
        description: 'Practice mindfulness for 5 minutes each day for 5 days',
        category: 'mindfulness',
        difficulty: 1,
        icon: '🧘',
        pointsReward: 75,
        duration: 5,
        completedDays: 0,
        isActive: false,
        isCompleted: false,
        streak: 0
      },
      {
        id: uuidv4(),
        title: 'Happiness Boost',
        description: 'Record 3 "Good" or "Very Good" moods in a single week',
        category: 'mood',
        difficulty: 2,
        icon: '😊',
        pointsReward: 100,
        duration: 7,
        completedDays: 0,
        isActive: false,
        isCompleted: false,
        streak: 0,
        targetMood: 'Good'
      },
      {
        id: uuidv4(),
        title: 'Emotion Explorer',
        description: 'Log 5 different moods with detailed notes to understand your patterns',
        category: 'growth',
        difficulty: 2,
        icon: '🔍',
        pointsReward: 125,
        duration: 14,
        completedDays: 0,
        isActive: false,
        isCompleted: false,
        streak: 0
      },
      {
        id: uuidv4(),
        title: 'Mood Master',
        description: 'Complete a 30-day streak of mood logging',
        category: 'mood',
        difficulty: 3,
        icon: '🏆',
        pointsReward: 300,
        duration: 30,
        completedDays: 0,
        isActive: false,
        isCompleted: false,
        streak: 0
      }
    ];
  };
  
  // Add a new challenge
  const addChallenge = (challenge: Omit<Challenge, 'id' | 'isCompleted' | 'completedDays' | 'streak'>) => {
    const newChallenge: Challenge = {
      ...challenge,
      id: uuidv4(),
      isCompleted: false,
      completedDays: 0,
      streak: 0
    };
    
    setChallenges(prev => [...prev, newChallenge]);
  };
  
  // Start a challenge
  const startChallenge = (challengeId: string) => {
    // First, set all challenges to inactive
    setChallenges(prev => prev.map(challenge => ({
      ...challenge,
      isActive: false
    })));
    
    // Then set the selected challenge to active
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId
        ? {
            ...challenge,
            isActive: true,
            startDate: new Date().toISOString(),
            completedDays: 0,
            streak: 0
          }
        : challenge
    ));
  };
  
  // Complete a challenge
  const completeChallenge = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (challenge) {
      // Mark the challenge as completed
      setChallenges(prev => prev.map(c => 
        c.id === challengeId
          ? {
              ...c,
              isCompleted: true,
              isActive: false,
              completionDate: new Date().toISOString()
            }
          : c
      ));
      
      // Reward points
      setTotalPoints(prev => prev + challenge.pointsReward);
      
      // Create an achievement
      const newAchievement: Achievement = {
        id: uuidv4(),
        title: `Completed: ${challenge.title}`,
        description: `Successfully completed the "${challenge.title}" challenge`,
        icon: challenge.icon,
        earnedDate: new Date().toISOString(),
        pointsRewarded: challenge.pointsReward,
        category: challenge.category,
        level: challenge.difficulty === 1 ? 'bronze' : challenge.difficulty === 2 ? 'silver' : 'gold'
      };
      
      setAchievements(prev => [...prev, newAchievement]);
    }
  };
  
  // Increment challenge progress
  const incrementChallengeProgress = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => {
      if (challenge.id === challengeId) {
        const completedDays = challenge.completedDays + 1;
        const isCompleted = completedDays >= challenge.duration;
        
        // If completing the challenge, this will trigger the completion logic in the next render
        if (isCompleted) {
          completeChallenge(challengeId);
        }
        
        return {
          ...challenge,
          completedDays,
          isCompleted
        };
      }
      return challenge;
    }));
  };
  
  // Generate personalized challenges based on user's mood data
  const generatePersonalizedChallenges = (): Challenge[] => {
    // Analyze mood trends
    const moodCounts: Record<MoodType, number> = {
      'Very Bad': 0,
      'Bad': 0,
      'Okay': 0,
      'Good': 0,
      'Very Good': 0
    };
    
    moodEntries.forEach(entry => {
      moodCounts[entry.mood]++;
    });
    
    const totalEntries = moodEntries.length;
    const personalizedChallenges: Challenge[] = [];
    
    // Generate challenges based on mood patterns
    if (totalEntries > 0) {
      // If user has more negative moods, suggest happiness-focused challenges
      if ((moodCounts['Bad'] + moodCounts['Very Bad']) / totalEntries > 0.4) {
        personalizedChallenges.push({
          id: uuidv4(),
          title: 'Positivity Project',
          description: 'Record one positive thing each day for 7 days to improve your mood',
          category: 'growth',
          difficulty: 2,
          icon: '✨',
          pointsReward: 150,
          duration: 7,
          completedDays: 0,
          isActive: false,
          isCompleted: false,
          streak: 0,
          dailyGoal: 'Note one positive experience each day'
        });
      }
      
      // If user has inconsistent logging (based on gaps in the data)
      if (currentStreak < 3 && totalEntries > 5) {
        personalizedChallenges.push({
          id: uuidv4(),
          title: 'Consistency Builder',
          description: 'Log your mood for 5 consecutive days to build a tracking habit',
          category: 'mood',
          difficulty: 1,
          icon: '📊',
          pointsReward: 100,
          duration: 5,
          completedDays: 0,
          isActive: false,
          isCompleted: false,
          streak: 0
        });
      }
      
      // If user has many neutral moods, suggest emotional awareness
      if (moodCounts['Okay'] / totalEntries > 0.5) {
        personalizedChallenges.push({
          id: uuidv4(),
          title: 'Emotional Awareness',
          description: 'Log detailed notes about your feelings for 7 days to increase emotional granularity',
          category: 'growth',
          difficulty: 2,
          icon: '🔎',
          pointsReward: 175,
          duration: 7,
          completedDays: 0,
          isActive: false,
          isCompleted: false,
          streak: 0,
          dailyGoal: 'Write detailed emotions beyond just "okay"'
        });
      }
    }
    
    // Always offer at least one challenge
    if (personalizedChallenges.length === 0) {
      personalizedChallenges.push({
        id: uuidv4(),
        title: 'Mood Explorer',
        description: 'Log your mood at different times of day for 7 days to discover patterns',
        category: 'mood',
        difficulty: 1,
        icon: '🕒',
        pointsReward: 125,
        duration: 7,
        completedDays: 0,
        isActive: false,
        isCompleted: false,
        streak: 0,
        dailyGoal: 'Log your mood at least twice daily'
      });
    }
    
    return personalizedChallenges;
  };
  
  // Get recommended challenges
  const getRecommendedChallenges = (): Challenge[] => {
    // Filter out completed challenges and the active challenge
    const availableChallenges = challenges.filter(
      challenge => !challenge.isCompleted && !challenge.isActive
    );
    
    // If we have enough challenges, return 3 random ones
    if (availableChallenges.length >= 3) {
      // Shuffle the array and take the first 3
      return [...availableChallenges]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    }
    
    // If we don't have enough challenges, generate some personalized ones
    const personalizedChallenges = generatePersonalizedChallenges();
    
    // Combine and return 3 (or fewer if not available)
    return [...availableChallenges, ...personalizedChallenges].slice(0, 3);
  };
  
  const value: ChallengesContextType = {
    challenges,
    activeChallenge,
    achievements,
    totalPoints,
    currentStreak,
    longestStreak,
    addChallenge,
    startChallenge,
    completeChallenge,
    incrementChallengeProgress,
    generatePersonalizedChallenges,
    getRecommendedChallenges
  };
  
  return <ChallengesContext.Provider value={value}>{children}</ChallengesContext.Provider>;
}; 