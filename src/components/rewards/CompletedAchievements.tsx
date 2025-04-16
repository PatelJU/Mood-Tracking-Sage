import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
  alpha,
  styled,
  Chip,
  Button,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Paper
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Celebration as CelebrationIcon,
  Share as ShareIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../types/index';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';
import Header from '../layout/Header';

// Styled components
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

// Main component
const CompletedAchievements: React.FC = () => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  
  useEffect(() => {
    setAnimateStats(true);
    
    // Get the badge details for all earned badges
    if (currentUser?.badges) {
      const badgesWithDetails = currentUser.badges.map(badge => ({
        ...badge,
        // Make sure we have all the badge details even if some were missing
        name: badge.name || 'Unknown Badge',
        description: badge.description || 'Achievement unlocked!',
        criteria: badge.criteria || '',
        points: badge.points || 50,
        tier: badge.tier || 'bronze'
      }));
      
      setEarnedBadges(badgesWithDetails);
    }
    
    // Reset for future animations
    return () => setAnimateStats(false);
  }, [currentUser]);
  
  // Calculate total points
  const totalPoints = earnedBadges.reduce((sum, badge) => sum + (badge.points || 0), 0);
  
  // Trigger confetti effect when a badge is clicked
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };
  
  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            borderRadius: 2, 
            background: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(240,240,255,0.8) 100%)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
          }}
        >
          <Box display="flex" alignItems="center" mb={4}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '12px', 
              backgroundColor: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2
            }}>
              <CheckCircleIcon sx={{ color: '#fff' }} />
            </Box>
            <Typography variant="h4" component="h1" fontWeight="600">
              Completed Achievements
            </Typography>
          </Box>

          {earnedBadges.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                You haven't earned any badges yet.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Continue logging your moods to unlock achievements!
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {earnedBadges.map((badge: Badge) => (
                <Grid item xs={12} sm={6} md={4} key={badge.id}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden',
                      background: 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                    }}
                  >
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 12, 
                        right: 12, 
                        bgcolor: 'success.light',
                        color: 'success.contrastText',
                        borderRadius: '12px',
                        px: 1.5,
                        py: 0.5,
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      EARNED
                    </Box>

                    <Box 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.03)',
                        borderRadius: '20px',
                        mb: 2
                      }}
                    >
                      <CelebrationIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                    </Box>

                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {badge.name}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                      {badge.description}
                    </Typography>
                    
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        mt: 'auto'
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }}/>
                      Earned on {badge.earnedAt ? format(new Date(badge.earnedAt), 'MMM d, yyyy') : 'Unknown date'}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>

      {/* Badge Detail Dialog */}
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
                  <AchievementIcon sx={{ width: 120, height: 120, mb: 3 }}>
                    <CelebrationIcon sx={{ fontSize: 60 }} />
                  </AchievementIcon>
                  
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
                    background: alpha(theme.palette.success.main, 0.05),
                    border: `1px dashed ${alpha(theme.palette.success.main, 0.3)}`,
                  }}
                >
                  <Typography variant="subtitle2" color="success.main" sx={{ mb: 1 }}>
                    Achievement Completed:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" color="text.primary">
                    {selectedBadge.earnedAt ? new Date(selectedBadge.earnedAt).toLocaleString() : 'Date unknown'}
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
                  <TrophyIcon />
                  {selectedBadge.points || 0} Points
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
    </>
  );
};

export default CompletedAchievements; 