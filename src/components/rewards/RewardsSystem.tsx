import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  styled,
  CircularProgress,
  Tooltip,
  Badge as MuiBadge,
  Tabs,
  Tab,
  Fade,
  Zoom,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Timeline as TimelineIcon,
  Whatshot as StreakIcon,
  Lock as LockIcon,
  Share as ShareIcon,
  Celebration as CelebrationIcon,
  Favorite as HeartIcon,
  LocalFireDepartment as FireIcon,
  Star as StarIcon,
  AutoGraph as StatsIcon,
  Psychology as MindIcon,
  Bolt as PowerIcon,
  Spa as SpaIcon,
  School as SchoolIcon,
  Science as ScienceIcon,
  Insights as InsightsIcon,
  AddTask as TaskIcon,
  Diamond as DiamondIcon,
  WorkspacePremium as PremiumIcon,
  Lightbulb as IdeaIcon,
  FlashOn as FlashIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Badge, MoodEntry, MoodType } from '../../types/index';
import confetti from 'canvas-confetti';

// Enhanced styled components with more vibrant 2025 design
const StyledCard = styled(motion.div)(({ theme }) => ({
  background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.7)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  borderRadius: 32,
  overflow: 'hidden',
  boxShadow: `
    0 20px 50px ${alpha(theme.palette.primary.main, 0.2)},
    0 5px 15px ${alpha(theme.palette.common.black, 0.05)},
    inset 0 0 0 1px ${alpha(theme.palette.common.white, 0.1)}
  `,
  transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  height: '100%',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, transparent, ${alpha(theme.palette.primary.main, 0.05)})`,
    borderRadius: 'inherit',
    zIndex: 0,
  },
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: `
      0 30px 60px ${alpha(theme.palette.primary.main, 0.3)},
      0 8px 25px ${alpha(theme.palette.common.black, 0.1)},
      inset 0 0 0 1px ${alpha(theme.palette.common.white, 0.15)}
    `,
    '&::after': {
      opacity: 1,
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(to right, 
      ${alpha(theme.palette.primary.main, 0.1)}, 
      ${alpha(theme.palette.secondary.main, 0.1)}, 
      ${alpha(theme.palette.primary.main, 0.1)}
    )`,
    backgroundSize: '200% 200%',
    animation: 'shimmer 8s infinite linear',
    opacity: 0,
    transition: 'opacity 0.4s ease-in-out',
    borderRadius: 'inherit',
    zIndex: 0,
  },
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '0% 0%' },
    '100%': { backgroundPosition: '200% 0%' },
  }
}));

const AchievementIcon = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  backgroundColor: 'transparent',
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  position: 'relative',
  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))',
  transition: 'all 0.4s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: '50%',
    opacity: 0.9,
    zIndex: -1,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.6)} 0%, transparent 70%)`,
    filter: 'blur(15px)',
    opacity: 0.7,
    zIndex: -2,
  },
  '& .MuiSvgIcon-root': {
    fontSize: 60,
    color: 'white',
    filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.2))',
  },
  '&:hover': {
    transform: 'scale(1.05) translateY(-5px)',
    '&::after': {
      opacity: 0.9,
    }
  }
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 16,
  borderRadius: 16,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  '& .MuiLinearProgress-bar': {
    borderRadius: 16,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    backgroundSize: '200% 200%',
    animation: 'gradientShift 3s ease infinite',
    boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.secondary.main, 0.12)} 100%)`,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: 32,
  boxShadow: `
    0 15px 35px ${alpha(theme.palette.primary.main, 0.15)},
    0 5px 15px ${alpha(theme.palette.common.black, 0.05)},
    inset 0 0 0 1px ${alpha(theme.palette.common.white, 0.1)}
  `,
  overflow: 'hidden',
  position: 'relative',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  transition: 'all 0.4s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `radial-gradient(circle at top right, ${alpha(theme.palette.primary.main, 0.2)}, transparent 70%)`,
    zIndex: 0,
  },
  '&:hover': {
    boxShadow: `
      0 20px 40px ${alpha(theme.palette.primary.main, 0.25)},
      0 8px 20px ${alpha(theme.palette.common.black, 0.08)},
      inset 0 0 0 1px ${alpha(theme.palette.common.white, 0.15)}
    `,
    transform: 'translateY(-5px)',
  }
}));

const GlowingIcon = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.3)} 0%, ${alpha(theme.palette.secondary.main, 0.3)} 100%)`,
  boxShadow: `
    0 0 30px ${alpha(theme.palette.primary.main, 0.5)},
    0 0 15px ${alpha(theme.palette.primary.main, 0.3)},
    inset 0 0 0 1px ${alpha(theme.palette.common.white, 0.2)}
  `,
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  position: 'relative',
  transition: 'all 0.3s ease',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '130%',
    height: '130%',
    borderRadius: '50%',
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.3)}, transparent 70%)`,
    filter: 'blur(15px)',
    zIndex: -1,
    animation: 'pulse 3s infinite ease-in-out',
  },
  '@keyframes pulse': {
    '0%': { opacity: 0.5, transform: 'scale(0.9)' },
    '50%': { opacity: 1, transform: 'scale(1.05)' },
    '100%': { opacity: 0.5, transform: 'scale(0.9)' },
  },
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 0 40px ${alpha(theme.palette.primary.main, 0.7)}`,
  }
}));

const AnimatedTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(6),
  borderRadius: 16,
  padding: theme.spacing(1.5),
  background: alpha(theme.palette.background.paper, 0.7),
  backdropFilter: 'blur(10px)',
  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  '& .MuiTabs-flexContainer': {
    justifyContent: 'center',
    gap: theme.spacing(2),
  },
  '& .MuiTabs-indicator': {
    height: 6,
    borderRadius: 3,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
  '& .MuiTab-root': {
    fontWeight: 700,
    fontSize: '1rem',
    minHeight: 56,
    borderRadius: 12,
    padding: theme.spacing(1.5, 3),
    transition: 'all 0.3s ease',
    margin: theme.spacing(0.5, 0),
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      background: alpha(theme.palette.primary.light, 0.1),
      transform: 'scale(1.05)',
      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
    },
    '&:hover': {
      background: alpha(theme.palette.primary.light, 0.05),
    },
    '& .MuiSvgIcon-root': {
      fontSize: 24,
    }
  },
}));

// Update point chip styling
const PointsChip = styled(Chip)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1rem',
  padding: theme.spacing(2, 1),
  height: 'auto',
  borderRadius: 12,
  marginBottom: theme.spacing(2),
  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
  '& .MuiChip-label': {
    padding: theme.spacing(0.75, 1.5),
  }
}));

// Extended badge list with more diverse achievements
const availableBadges: Badge[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Started your mood tracking journey',
    imageUrl: '/badges/first-mood.png',
    criteria: 'Log your first mood',
    points: 50,
    tier: 'bronze'
  },
  {
    id: 'consistency-master',
    name: 'Consistency Master',
    description: 'Logged moods for 7 consecutive days',
    imageUrl: '/badges/week-streak.png',
    criteria: '7-day streak',
    points: 100,
    tier: 'silver'
  },
  {
    id: 'mood-scientist',
    name: 'Mood Scientist',
    description: 'Added detailed notes to 30 mood entries',
    imageUrl: '/badges/note-taker.png',
    criteria: '30 detailed entries',
    points: 150,
    tier: 'gold'
  },
  {
    id: 'insight-explorer',
    name: 'Insight Explorer',
    description: 'Reviewed 10 personalized insights',
    imageUrl: '/badges/data-analyst.png',
    criteria: 'View 10 insights',
    points: 200,
    tier: 'platinum'
  },
  {
    id: 'mindfulness-guru',
    name: 'Mindfulness Guru',
    description: 'Completed 20 mindfulness sessions',
    imageUrl: '/badges/meditation.png',
    criteria: '20 mindfulness sessions',
    points: 250,
    tier: 'diamond'
  },
  {
    id: 'emotion-master',
    name: 'Emotion Master',
    description: 'Used all mood categories at least once',
    imageUrl: '/badges/mood-variety.png',
    criteria: 'Try all moods',
    points: 300,
    tier: 'elite'
  },
  {
    id: 'pattern-detective',
    name: 'Pattern Detective',
    description: 'Identified 5 mood patterns',
    imageUrl: '/badges/pattern.png',
    criteria: 'Find 5 patterns',
    points: 350,
    tier: 'master'
  },
  {
    id: 'resilience-warrior',
    name: 'Resilience Warrior',
    description: 'Bounced back from 10 low moods',
    imageUrl: '/badges/resilience.png',
    criteria: 'Overcome challenges',
    points: 400,
    tier: 'legend'
  },
  // Additional badges for more engagement
  {
    id: 'reflective-thinker',
    name: 'Reflective Thinker',
    description: 'Added 50 journal entries to mood logs',
    imageUrl: '/badges/journal.png',
    criteria: '50 journal entries',
    points: 275,
    tier: 'gold'
  },
  {
    id: 'weather-watcher',
    name: 'Weather Watcher',
    description: 'Tracked weather with moods for 30 days',
    imageUrl: '/badges/weather.png',
    criteria: '30 days with weather tracking',
    points: 225,
    tier: 'silver'
  },
  {
    id: 'activity-analyst',
    name: 'Activity Analyst',
    description: 'Logged 20 different activities with moods',
    imageUrl: '/badges/activities.png',
    criteria: '20 different activities',
    points: 325,
    tier: 'platinum'
  },
  {
    id: 'monthly-master',
    name: 'Monthly Master',
    description: 'Logged a mood every day for a full month',
    imageUrl: '/badges/calendar.png',
    criteria: '30-day perfect streak',
    points: 500,
    tier: 'elite'
  },
  {
    id: 'sleep-tracker',
    name: 'Sleep Tracker',
    description: 'Logged sleep data with moods for 14 days',
    imageUrl: '/badges/sleep.png',
    criteria: '14 days with sleep data',
    points: 275,
    tier: 'gold'
  },
  {
    id: 'feedback-friend',
    name: 'Feedback Friend',
    description: 'Provided feedback on 5 insights',
    imageUrl: '/badges/feedback.png',
    criteria: 'Rate 5 insights',
    points: 150,
    tier: 'bronze'
  },
  {
    id: 'app-customizer',
    name: 'App Customizer',
    description: 'Personalized app theme and settings',
    imageUrl: '/badges/customize.png',
    criteria: 'Customize your experience',
    points: 125,
    tier: 'bronze'
  },
  {
    id: 'mood-explorer',
    name: 'Mood Explorer',
    description: 'Viewed 5 different analytics charts',
    imageUrl: '/badges/explorer.png',
    criteria: 'Explore analytics',
    points: 175,
    tier: 'silver'
  },
  // New Year-Based Achievements
  {
    id: 'quarterly-champion',
    name: 'Quarterly Champion',
    description: 'Tracked moods for 90 consecutive days (3 months)',
    imageUrl: '/badges/quarterly.png',
    criteria: '90-day perfect streak',
    points: 1000,
    tier: 'legendary'
  },
  {
    id: 'half-year-hero',
    name: 'Half-Year Hero',
    description: 'Maintained mood tracking for 6 months',
    imageUrl: '/badges/half-year.png',
    criteria: '180-day journey',
    points: 2000,
    tier: 'mythic'
  },
  {
    id: 'annual-achiever',
    name: 'Annual Achiever',
    description: 'Completed a full year of mood tracking',
    imageUrl: '/badges/annual.png',
    criteria: '365-day dedication',
    points: 5000,
    tier: 'immortal'
  },
  {
    id: 'mood-master',
    name: 'Mood Master',
    description: 'Tracked over 500 mood entries in your journey',
    imageUrl: '/badges/mood-master.png',
    criteria: '500+ mood entries',
    points: 3000,
    tier: 'legendary'
  }
];

// Category definition for organizing badges
const badgeCategories = [
  { id: 'all', label: 'All', icon: <StarIcon /> },
  { id: 'streaks', label: 'Streaks', icon: <FireIcon /> },
  { id: 'analytics', label: 'Analytics', icon: <StatsIcon /> },
  { id: 'mindfulness', label: 'Mindfulness', icon: <SpaIcon /> },
  { id: 'achievements', label: 'Special', icon: <DiamondIcon /> },
  { id: 'yearly', label: 'Yearly', icon: <TimelineIcon /> },
  { id: 'completed', label: 'Completed', icon: <CelebrationIcon /> }
];

// Define interface for saved progress
interface BadgeProgress {
  id: string;
  progress: number;
  lastUpdated: string;
}

const RewardsSystem: React.FC = () => {
  const theme = useTheme();
  const { currentUser, awardBadge } = useAuth();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [animateStats, setAnimateStats] = useState(false);
  const [badgeHovered, setBadgeHovered] = useState<string | null>(null);
  // Persistent progress tracking
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);
  
  // Initialize and load saved progress
  useEffect(() => {
    setAnimateStats(true);
    
    // Load saved progress from localStorage
    const savedProgress = localStorage.getItem('badgeProgress');
    if (savedProgress) {
      setBadgeProgress(JSON.parse(savedProgress));
    } else {
      // Initialize progress for each badge
      const initialProgress = availableBadges.map(badge => ({
        id: badge.id,
        progress: 0,
        lastUpdated: new Date().toISOString()
      }));
      setBadgeProgress(initialProgress);
      localStorage.setItem('badgeProgress', JSON.stringify(initialProgress));
    }
    
    // Reset for future animations
    return () => setAnimateStats(false);
  }, []);
  
  // Check for unlockable badges when component mounts
  useEffect(() => {
    if (!currentUser || !awardBadge) return;
    
    // If user has entries but no badges, auto-award the "First Steps" badge
    if (currentUser.moodEntries?.length > 0 && (!currentUser.badges || currentUser.badges.length === 0)) {
      const firstStepsBadge = availableBadges.find(b => b.id === 'first-steps');
      if (firstStepsBadge) {
        // Add slight delay to ensure UI is ready
        setTimeout(() => {
          awardBadge(firstStepsBadge);
          // Update progress
          const updatedProgress = [...badgeProgress];
          const progressEntry = updatedProgress.find(p => p.id === 'first-steps');
          if (progressEntry) {
            progressEntry.progress = 100;
            progressEntry.lastUpdated = new Date().toISOString();
            setBadgeProgress(updatedProgress);
            localStorage.setItem('badgeProgress', JSON.stringify(updatedProgress));
          }
          
          // Trigger confetti for the achievement
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.5 }
          });
        }, 1000);
      }
    }
  }, [currentUser, awardBadge, badgeProgress]);
  
  // Precise progress calculation function wrapped in useCallback to avoid dependency issues
  const calculateBadgeProgress = useCallback((badgeId: string): number => {
    if (!currentUser) return 0;
    
    const totalEntries = currentUser.moodEntries?.length || 0;
    const currentStreak = currentUser.stats?.currentStreak || 0;
    
    switch (badgeId) {
      case 'first-steps':
        // Straightforward - if they've made an entry, they've completed it
        return totalEntries > 0 ? 100 : 0;
        
      case 'consistency-master':
        // Progress toward 7-day streak
        return Math.min(Math.round((currentStreak / 7) * 100), 99);
        
      case 'mood-scientist': 
        // Progress toward 30 entries with notes
        const entriesWithNotes = currentUser.moodEntries?.filter(entry => 
          entry.notes && entry.notes.trim().length > 0
        ).length || 0;
        return Math.min(Math.round((entriesWithNotes / 30) * 100), 99);
        
      case 'quarterly-champion':
        // Progress toward 90-day tracking
        return Math.min(Math.round((totalEntries / 90) * 100), 99);
        
      case 'half-year-hero':
        // Progress toward 180-day tracking
        return Math.min(Math.round((totalEntries / 180) * 100), 99);
        
      case 'annual-achiever':
        // Progress toward 365-day tracking
        return Math.min(Math.round((totalEntries / 365) * 100), 99);
        
      case 'mood-master':
        // Progress toward 500 entries
        return Math.min(Math.round((totalEntries / 500) * 100), 99);
        
      case 'emotion-master':
        // Used all mood types
        const uniqueMoods = new Set(currentUser.moodEntries?.map(entry => entry.mood));
        const allMoodTypes = ['Very Bad', 'Bad', 'Okay', 'Good', 'Very Good'];
        const moodCoverage = allMoodTypes.filter(mood => uniqueMoods.has(mood as MoodType)).length;
        return Math.min(Math.round((moodCoverage / allMoodTypes.length) * 100), 99);
        
      case 'reflective-thinker':
        // Progress toward 50 entries with substantial notes (20+ chars)
        const substantialNotes = currentUser.moodEntries?.filter(entry => 
          entry.notes && entry.notes.trim().length >= 20
        ).length || 0;
        return Math.min(Math.round((substantialNotes / 50) * 100), 99);
        
      case 'weather-watcher':
        // Entries with weather data
        const weatherEntries = currentUser.moodEntries?.filter(entry => 
          entry.weather && (entry.weather.temperature || entry.weather.condition)
        ).length || 0;
        return Math.min(Math.round((weatherEntries / 30) * 100), 99);
        
      case 'monthly-master':
        // 30-day perfect streak
        return Math.min(Math.round((currentStreak / 30) * 100), 99);
        
      default:
        // For other badges, use a deterministic calculation based on total entries
        // This ensures progress is stable and only increases
        const baseProgress = Math.min(Math.round((totalEntries / 20) * 100), 99);
        return baseProgress;
    }
  }, [currentUser]);
  
  // Get badge status - Improved function that uses saved progress or directly calculates it
  const getBadgeStatus = useCallback((badgeId: string): { earned: boolean; progress: number } => {
    // Check if badge is already earned
    const earnedBadge = currentUser?.badges?.find((badge: Badge) => badge.id === badgeId);
    if (earnedBadge) {
      return { earned: true, progress: 100 };
    }
    
    // Get saved progress from state
    const savedProgress = badgeProgress.find(p => p.id === badgeId);
    if (savedProgress) {
      // If progress is 100% but badge not awarded yet, trigger award
      if (savedProgress.progress >= 100) {
        // Find the badge from available badges
        const badge = availableBadges.find(b => b.id === badgeId);
        if (badge && awardBadge) {
          // Set timeout to prevent React state update conflicts
          setTimeout(() => {
            awardBadge(badge);
            // Trigger confetti effect
            confetti({
              particleCount: 150,
              spread: 90,
              origin: { y: 0.5 }
            });
          }, 300);
        }
        return { earned: true, progress: 100 };
      }
      return { earned: false, progress: savedProgress.progress };
    }
    
    // Fallback to calculated progress (should not happen often)
    const calculatedProgress = calculateBadgeProgress(badgeId);
    return { earned: false, progress: calculatedProgress };
  }, [currentUser, badgeProgress, calculateBadgeProgress, awardBadge]);
  
  // Update and save progress whenever user data changes
  useEffect(() => {
    if (!currentUser) return;
    
    // Create a copy of current progress
    const updatedProgress = [...badgeProgress];
    let hasChanges = false;
    
    // Calculate latest progress for each badge
    availableBadges.forEach(badge => {
      const progressEntry = updatedProgress.find(p => p.id === badge.id);
      if (!progressEntry) return;
      
      // For "First Steps" badge, directly set to 100% if user has any entries
      if (badge.id === 'first-steps' && currentUser.moodEntries?.length > 0) {
        if (progressEntry.progress < 100) {
          progressEntry.progress = 100;
          progressEntry.lastUpdated = new Date().toISOString();
          hasChanges = true;
        }
      } else {
        const calculatedProgress = calculateBadgeProgress(badge.id);
        
        // Only update if progress has increased (never decrease)
        if (calculatedProgress > progressEntry.progress) {
          progressEntry.progress = calculatedProgress;
          progressEntry.lastUpdated = new Date().toISOString();
          hasChanges = true;
          
          // Check if progress reached 100% to unlock badge
          if (calculatedProgress >= 100) {
            if (awardBadge) {
              awardBadge(badge);
            }
          }
        }
      }
    });
    
    // Save updated progress if changes were made
    if (hasChanges) {
      setBadgeProgress(updatedProgress);
      localStorage.setItem('badgeProgress', JSON.stringify(updatedProgress));
    }
  }, [currentUser, badgeProgress, calculateBadgeProgress, awardBadge]);

  // Calculate total points
  const totalPoints = currentUser?.badges?.reduce((sum: number, badge: Badge) => {
    const badgeInfo = availableBadges.find(b => b.id === badge.id);
    return sum + (badgeInfo?.points || 0);
  }, 0) || 0;

  // Calculate current level
  const currentLevel = Math.floor(totalPoints / 500) + 1;
  const nextLevelPoints = currentLevel * 500;
  const levelProgress = ((totalPoints % 500) / 500) * 100;

  // Filter badges by category
  const filteredBadges = activeCategory === 'all' 
    ? availableBadges 
    : activeCategory === 'completed'
    ? availableBadges.filter(badge => {
        // Only show earned badges
        const earnedBadge = currentUser?.badges?.find((b: Badge) => b.id === badge.id);
        return !!earnedBadge;
      })
    : availableBadges.filter(badge => {
        // Categorize badges based on their id or type
        if (activeCategory === 'streaks' && ['consistency-master', 'monthly-master'].includes(badge.id)) return true;
        if (activeCategory === 'analytics' && ['insight-explorer', 'pattern-detective', 'mood-explorer', 'activity-analyst', 'weather-watcher'].includes(badge.id)) return true;
        if (activeCategory === 'mindfulness' && ['mindfulness-guru', 'reflective-thinker', 'sleep-tracker'].includes(badge.id)) return true;
        if (activeCategory === 'achievements' && ['emotion-master', 'resilience-warrior', 'mood-scientist', 'app-customizer', 'feedback-friend'].includes(badge.id)) return true;
        if (activeCategory === 'yearly' && ['quarterly-champion', 'half-year-hero', 'annual-achiever', 'mood-master'].includes(badge.id)) return true;
        return false;
      });

  // Confetti effect for badge click
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header Section with Animated Title */}
      <Box sx={{ mb: 8, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            fontWeight="900"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 3,
              textShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}
          >
            Rewards & Achievements
          </Typography>
          
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              mb: 5, 
              maxWidth: 800, 
              mx: 'auto',
              opacity: 0.9,
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
              fontWeight: 500,
              lineHeight: 1.6
            }}
          >
            Track your progress, earn rewards, and unlock exclusive badges for consistent mood tracking. Your journey matters!
          </Typography>
        </motion.div>
        
        {/* Enhanced Stats Overview with Animated Cards */}
        <Grid container spacing={4} justifyContent="center" sx={{ mb: 8 }}>
          <Grid item xs={12} sm={4}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <StatsCard>
                <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                  <GlowingIcon>
                    <TrophyIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                  </GlowingIcon>
                  
                  <Zoom in={animateStats} timeout={800}>
                    <Typography 
                      variant="h2" 
                      sx={{ 
                        fontWeight: 900, 
                        mb: 1, 
                        fontSize: { xs: '3rem', md: '3.5rem' },
                        textAlign: 'center',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        textShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                      }}
                    >
                      {currentUser?.badges?.length || 0}
                    </Typography>
                  </Zoom>
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      opacity: 0.8, 
                      textAlign: 'center',
                      fontWeight: 600,
                      fontSize: '1.25rem'
                    }}
                  >
                    Badges Earned
                  </Typography>
                </CardContent>
              </StatsCard>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <StatsCard>
                <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                  <GlowingIcon>
                    <TimelineIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                  </GlowingIcon>
                  
                  <Zoom in={animateStats} timeout={1000}>
                    <Typography 
                      variant="h2" 
                      sx={{ 
                        fontWeight: 900, 
                        mb: 1, 
                        fontSize: { xs: '3rem', md: '3.5rem' },
                        textAlign: 'center',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        textShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                      }}
                    >
                      {totalPoints}
                    </Typography>
                  </Zoom>
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      opacity: 0.8, 
                      textAlign: 'center',
                      fontWeight: 600,
                      fontSize: '1.25rem'
                    }}
                  >
                    Total Points
                  </Typography>
                </CardContent>
              </StatsCard>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <StatsCard>
                <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                  <GlowingIcon>
                    <StreakIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                  </GlowingIcon>
                  
                  <Box sx={{ position: 'relative' }}>
                    <Zoom in={animateStats} timeout={1200}>
                      <Typography 
                        variant="h2" 
                        sx={{ 
                          fontWeight: 900, 
                          mb: 1, 
                          fontSize: { xs: '3rem', md: '3.5rem' },
                          textAlign: 'center',
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          color: 'transparent',
                          textShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                        }}
                      >
                        Level {currentLevel}
                      </Typography>
                    </Zoom>
                    
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        opacity: 0.8, 
                        mb: 3, 
                        textAlign: 'center',
                        fontWeight: 600
                      }}
                    >
                      {totalPoints} / {nextLevelPoints} Points
                    </Typography>
                    
                    <ProgressBar variant="determinate" value={levelProgress} />
                  </Box>
                </CardContent>
              </StatsCard>
            </motion.div>
          </Grid>
        </Grid>
      </Box>

      {/* Badge Categories Tabs */}
      <Box sx={{ mb: 7, mt: 3 }}>
        <AnimatedTabs 
          value={activeCategory}
          onChange={(_, newValue) => setActiveCategory(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          centered={!theme.breakpoints.down('sm')}
        >
          {badgeCategories.map(category => (
            <Tab 
              key={category.id} 
              value={category.id} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {category.icon}
                  <Typography variant="h6" sx={{ mb: 0, fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>
                    {category.label}
                  </Typography>
                </Box>
              }
            />
          ))}
        </AnimatedTabs>
      </Box>

      {/* Badges Grid with Enhanced Animation and Interaction */}
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 4, 
          fontWeight: 'bold',
          background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${alpha(theme.palette.text.primary, 0.7)})`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {activeCategory === 'all' ? 'Available Achievements' 
         : activeCategory === 'completed' ? 'Completed Achievements'
         : `${badgeCategories.find(c => c.id === activeCategory)?.label} Achievements`}
      </Typography>
      
      <Grid container spacing={3}>
        <AnimatePresence>
          {filteredBadges.map(badge => {
            const { earned, progress } = getBadgeStatus(badge.id);
            const isHovered = badgeHovered === badge.id;
            
            return (
              <Grid item xs={12} sm={6} md={4} key={badge.id}>
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.03 }}
                  onHoverStart={() => setBadgeHovered(badge.id)}
                  onHoverEnd={() => setBadgeHovered(null)}
                  style={{ height: '100%' }}
                >
                  <StyledCard
                    onClick={() => {
                      setSelectedBadge(badge);
                      setShowDialog(true);
                      if (earned) triggerConfetti();
                    }}
                    sx={{ 
                      cursor: 'pointer',
                      borderColor: earned ? alpha(theme.palette.primary.main, 0.5) : 'inherit',
                      boxShadow: earned 
                        ? `0 15px 40px ${alpha(theme.palette.primary.main, 0.3)}` 
                        : undefined
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      {earned && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            left: 0,
                            height: '100%',
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.secondary.light, 0.1)})`,
                            zIndex: 0,
                          }}
                        />
                      )}
                      
                      <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                        <AchievementIcon
                          sx={{
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                            transition: 'transform 0.3s ease',
                          }}
                        >
                          {earned ? (
                            <motion.div
                              animate={{ rotateY: [0, 360] }}
                              transition={{ 
                                duration: 1.2, 
                                ease: "easeInOut", 
                                delay: 0.2,
                                repeat: 0,
                              }}
                            >
                              <CelebrationIcon />
                            </motion.div>
                          ) : (
                            <LockIcon />
                          )}
                        </AchievementIcon>
                        
                        <Typography 
                          variant="h5" 
                          align="center" 
                          gutterBottom
                          sx={{ 
                            fontWeight: 800,
                            fontSize: '1.5rem',
                            color: earned ? theme.palette.primary.main : 'inherit',
                            mb: 2,
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {badge.name}
                        </Typography>
                        
                        <PointsChip
                          label={`${badge.points} pts`}
                          color="primary"
                        />
                        
                        <Tooltip title={badge.description} arrow placement="top">
                          <Typography 
                            variant="body1" 
                            color="text.secondary" 
                            align="center" 
                            sx={{ 
                              mb: 3,
                              minHeight: 48,
                              lineHeight: 1.6,
                              fontSize: '1.1rem',
                              fontWeight: 500,
                              padding: '0 0.5rem'
                            }}
                          >
                            {badge.description}
                          </Typography>
                        </Tooltip>
                        
                        <ProgressBar
                          variant="determinate"
                          value={progress}
                        />
                        
                        <Typography 
                          variant="subtitle1" 
                          color="text.secondary" 
                          sx={{ 
                            mt: 2, 
                            display: 'block', 
                            textAlign: 'center',
                            fontWeight: earned ? 700 : 600,
                            fontSize: '1.1rem',
                            color: earned ? theme.palette.success.main : undefined,
                          }}
                        >
                          {earned ? 'Completed!' : `${Math.round(progress)}% Progress`}
                        </Typography>
                      </CardContent>
                    </Box>
                  </StyledCard>
                </motion.div>
              </Grid>
            );
          })}
        </AnimatePresence>
      </Grid>

      {/* Enhanced Badge Detail Dialog */}
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 100%)`,
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
          }
        }}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 500 }}
      >
        {selectedBadge && (
          <>
            <DialogTitle sx={{ p: 0 }}>
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  pt: 5,
                  pb: 2,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '100%',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                    zIndex: 0,
                  }}
                />
                
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  <MuiBadge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Chip 
                        label={selectedBadge.tier.toUpperCase()} 
                        size="small"
                        sx={{ 
                          fontWeight: 'bold',
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          color: 'white',
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.5)}`,
                        }}
                      />
                    }
                  >
                    <AchievementIcon sx={{ width: 120, height: 120, mb: 3 }}>
                      <CelebrationIcon sx={{ fontSize: 60 }} />
                    </AchievementIcon>
                  </MuiBadge>
                  
                  <Typography 
                    variant="h5"
                    sx={{ 
                      fontWeight: 'bold',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    {selectedBadge.name}
                  </Typography>
                </motion.div>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Box sx={{ textAlign: 'center', py: 3, position: 'relative', zIndex: 1 }}>
                <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                  {selectedBadge.description}
                </Typography>
                
                <Box 
                  sx={{ 
                    p: 2, 
                    mb: 3, 
                    borderRadius: 3,
                    background: alpha(theme.palette.primary.main, 0.05),
                    border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    How to earn:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" color="text.primary">
                    {selectedBadge.criteria}
                  </Typography>
                </Box>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mt: 2, 
                    color: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  <StarIcon />
                  {selectedBadge.points} Points
                </Typography>
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ justifyContent: 'center', pb: 4, px: 3 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<ShareIcon />}
                onClick={() => {
                  console.log('Share badge:', selectedBadge.name);
                }}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 'bold',
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Share Achievement
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => setShowDialog(false)}
                sx={{ 
                  ml: 2,
                  borderRadius: 3,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    background: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default RewardsSystem; 