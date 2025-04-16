import { useState, useEffect, useCallback } from 'react';
import { Badge, MoodEntry } from '../types';

interface User {
  id: string;
  name: string;
  email: string;
  badges: Badge[];
  moodEntries: MoodEntry[];
  stats: {
    currentStreak: number;
    longestStreak: number;
    totalEntries: number;
    averageMood: number;
  };
}

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Get mood entries from localStorage for demonstration
    const savedEntries = localStorage.getItem('moodEntries');
    const moodEntries = savedEntries ? JSON.parse(savedEntries) : [];
    
    // Load saved badges from localStorage
    const savedBadges = localStorage.getItem('userBadges');
    const badges = savedBadges ? JSON.parse(savedBadges) : [];
    
    // Calculate some basic stats
    const totalEntries = moodEntries.length;
    const currentStreak = totalEntries >= 7 ? 7 : totalEntries; // Simplified streak calculation
    const longestStreak = currentStreak;
    
    // Calculate average mood (Very Bad=0, Bad=1, Okay=2, Good=3, Very Good=4)
    const moodValues = {
      'Very Bad': 0,
      'Bad': 1,
      'Okay': 2,
      'Good': 3,
      'Very Good': 4
    };
    
    const moodSum = moodEntries.reduce((sum: number, entry: MoodEntry) => {
      return sum + (moodValues[entry.mood as keyof typeof moodValues] || 2);
    }, 0);
    const averageMood = totalEntries > 0 ? moodSum / totalEntries : 2;
    
    // Mock user data for development with real mood entries and stats
    setCurrentUser({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      badges: badges,
      moodEntries: moodEntries,
      stats: {
        currentStreak,
        longestStreak,
        totalEntries,
        averageMood
      }
    });
  }, []);

  // Function to award a badge to the user
  const awardBadge = useCallback((badge: Badge) => {
    if (!currentUser) return;
    
    // Check if user already has this badge
    const hasBadge = currentUser.badges.some(b => b.id === badge.id);
    if (hasBadge) return;
    
    // Add the badge with earned timestamp
    const updatedBadge = {
      ...badge,
      earnedAt: new Date().toISOString()
    };
    
    const updatedBadges = [...currentUser.badges, updatedBadge];
    
    // Update user with new badge
    setCurrentUser({
      ...currentUser,
      badges: updatedBadges
    });
    
    // Save to localStorage
    localStorage.setItem('userBadges', JSON.stringify(updatedBadges));
    
    // Show achievement notification - could implement a toast notification here
    console.log(`Achievement unlocked: ${badge.name}`);
    
    return updatedBadge;
  }, [currentUser]);

  return { currentUser, awardBadge };
}; 