import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  Grid,
  LinearProgress,
  Tabs,
  Tab,
  Badge,
  useTheme,
  alpha
} from '@mui/material';
import { 
  EmojiEvents as TrophyIcon,
  LocalFireDepartment as FireIcon, 
  AccessTime as TimeIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useChallenges, Challenge, ChallengeCategory } from '../../context/ChallengesContext';
import { motion } from 'framer-motion';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`challenges-tabpanel-${index}`}
      aria-labelledby={`challenges-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ChallengeCard: React.FC<{ 
  challenge: Challenge; 
  onStart: (id: string) => void;
  active?: boolean;
}> = ({ challenge, onStart, active = false }) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  // Helper function to get color based on difficulty
  const getDifficultyColor = (difficulty: number) => {
    switch(difficulty) {
      case 1: return theme.palette.success.main;
      case 2: return theme.palette.warning.main;
      case 3: return theme.palette.error.main;
      default: return theme.palette.primary.main;
    }
  };
  
  // Helper function to get category label
  const getCategoryLabel = (category: ChallengeCategory) => {
    switch(category) {
      case 'mood': return 'Mood';
      case 'mindfulness': return 'Mindfulness';
      case 'activity': return 'Activity';
      case 'social': return 'Social';
      case 'growth': return 'Growth';
      default: return category;
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = challenge.completedDays / challenge.duration * 100;
  
  return (
    <Card 
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{ 
        height: '100%',
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 3,
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        transform: isHovered ? 'translateY(-8px)' : 'none',
        boxShadow: isHovered 
          ? '0 12px 24px rgba(0, 0, 0, 0.1)' 
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: active ? `2px solid ${theme.palette.primary.main}` : 'none',
        backgroundColor: alpha(
          active ? theme.palette.primary.main : theme.palette.background.paper, 
          active ? 0.05 : 1
        ),
        '&::before': active ? {
          content: '"ACTIVE"',
          position: 'absolute',
          top: -12,
          left: 16,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          zIndex: 1,
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        } : {}
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ 
            fontSize: '1.25rem', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <span style={{ fontSize: '1.5em' }}>{challenge.icon}</span>
            {challenge.title}
          </Typography>
          <Chip 
            label={challenge.difficulty === 1 ? 'Easy' : challenge.difficulty === 2 ? 'Medium' : 'Hard'} 
            size="small"
            sx={{ 
              backgroundColor: alpha(getDifficultyColor(challenge.difficulty), 0.1),
              color: getDifficultyColor(challenge.difficulty),
              fontWeight: 'bold',
              fontSize: '0.7rem'
            }}
          />
        </Box>
        
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            label={getCategoryLabel(challenge.category)} 
            size="small" 
            sx={{ 
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main
            }}
          />
          
          <Chip 
            icon={<TimeIcon sx={{ fontSize: '0.9rem !important' }} />}
            label={`${challenge.duration} days`} 
            size="small" 
            sx={{ 
              backgroundColor: alpha(theme.palette.text.secondary, 0.1),
              color: theme.palette.text.secondary
            }}
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {challenge.description}
        </Typography>
        
        {active && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Progress: {challenge.completedDays}/{challenge.duration} days
              </Typography>
              <Typography variant="body2" color="primary" fontWeight="bold">
                {progressPercentage.toFixed(0)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progressPercentage}
              sx={{ 
                height: 10, 
                borderRadius: 5,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                }
              }}
            />
          </Box>
        )}
        
        {challenge.dailyGoal && (
          <Box sx={{ 
            mt: 2, 
            p: 1, 
            borderRadius: 1, 
            backgroundColor: alpha(theme.palette.info.main, 0.05),
            border: `1px dashed ${alpha(theme.palette.info.main, 0.3)}`
          }}>
            <Typography variant="body2" color="text.secondary">
              <span style={{ fontWeight: 'bold' }}>Daily goal:</span> {challenge.dailyGoal}
            </Typography>
          </Box>
        )}
      </CardContent>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        px: 2,
        py: 1,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TrophyIcon sx={{ color: theme.palette.warning.main, mr: 0.5 }} />
          <Typography variant="body2" fontWeight="bold" color="text.secondary">
            {challenge.pointsReward} pts
          </Typography>
        </Box>
        
        {!active && !challenge.isCompleted && (
          <Button 
            size="small" 
            color="primary" 
            variant="outlined"
            onClick={() => onStart(challenge.id)}
            sx={{ 
              borderRadius: 4,
              px: 2,
              textTransform: 'none'
            }}
          >
            Start Challenge
          </Button>
        )}
        
        {challenge.isCompleted && (
          <Chip 
            icon={<TrophyIcon />}
            label="Completed" 
            size="small"
            color="success"
            sx={{ fontWeight: 'bold' }}
          />
        )}
        
        {active && (
          <Chip 
            icon={<FireIcon sx={{ color: `${theme.palette.warning.main} !important` }} />}
            label={`Streak: ${challenge.streak}`} 
            size="small"
            sx={{ 
              backgroundColor: alpha(theme.palette.warning.main, 0.1),
              color: theme.palette.warning.main,
              fontWeight: 'bold'
            }}
          />
        )}
      </Box>
    </Card>
  );
};

const ChallengesList: React.FC = () => {
  const { challenges, activeChallenge, startChallenge, getRecommendedChallenges } = useChallenges();
  const [tabValue, setTabValue] = useState(0);
  const [recommended, setRecommended] = useState<Challenge[]>([]);
  
  // Fetch recommended challenges
  useEffect(() => {
    setRecommended(getRecommendedChallenges());
  }, [challenges, getRecommendedChallenges]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleStartChallenge = (id: string) => {
    startChallenge(id);
  };
  
  // Get completed challenges count
  const completedCount = challenges.filter(c => c.isCompleted).length;
  
  // Filter challenges for each tab
  const activeChallenges = activeChallenge ? [activeChallenge] : [];
  const availableChallenges = challenges.filter(c => !c.isActive && !c.isCompleted);
  const completedChallenges = challenges.filter(c => c.isCompleted);
  
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" component="h2" sx={{ 
        mb: 3, 
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <TrophyIcon color="primary" />
        Wellness Challenges
      </Typography>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ 
          mb: 2,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9rem'
          }
        }}
      >
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FireIcon fontSize="small" />
              {activeChallenge ? "Current Challenge" : "Start a Challenge"}
            </Box>
          } 
        />
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddIcon fontSize="small" />
              Available
            </Box>
          } 
        />
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Badge badgeContent={completedCount} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}>
                <TrophyIcon fontSize="small" />
              </Badge>
              <Box ml={completedCount > 0 ? 1 : 0}>Completed</Box>
            </Box>
          } 
        />
      </Tabs>
      
      <TabPanel value={tabValue} index={0}>
        {activeChallenges.length > 0 ? (
          <Grid container spacing={3}>
            {activeChallenges.map(challenge => (
              <Grid item xs={12} key={challenge.id}>
                <ChallengeCard challenge={challenge} onStart={handleStartChallenge} active={true} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No active challenge
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose from our recommended challenges below
            </Typography>
            
            <Grid container spacing={3}>
              {recommended.map(challenge => (
                <Grid item xs={12} sm={6} md={4} key={challenge.id}>
                  <ChallengeCard challenge={challenge} onStart={handleStartChallenge} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {availableChallenges.length > 0 ? (
          <Grid container spacing={3}>
            {availableChallenges.map(challenge => (
              <Grid item xs={12} sm={6} md={4} key={challenge.id}>
                <ChallengeCard challenge={challenge} onStart={handleStartChallenge} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="h6" color="text.secondary">
              You've tried all available challenges!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete your active challenge or check back later for new ones.
            </Typography>
          </Box>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        {completedChallenges.length > 0 ? (
          <Grid container spacing={3}>
            {completedChallenges.map(challenge => (
              <Grid item xs={12} sm={6} md={4} key={challenge.id}>
                <ChallengeCard challenge={challenge} onStart={handleStartChallenge} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="h6" color="text.secondary">
              No completed challenges yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start your wellness journey by taking on a challenge!
            </Typography>
          </Box>
        )}
      </TabPanel>
    </Box>
  );
};

export default ChallengesList; 