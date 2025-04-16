import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  IconButton, 
  LinearProgress, 
  Fade,
  Slide,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Spa, 
  SelfImprovement, 
  Favorite, 
  Air, 
  WbSunny, 
  Waves, 
  Close, 
  PauseCircle, 
  PlayCircle, 
  Refresh 
} from '@mui/icons-material';
// import { motion } from 'framer-motion';

interface Exercise {
  title: string;
  icon: React.ReactNode;
  description: string;
  duration: string;
  durationInMinutes: number;
  steps: string[];
  audioUrl?: string;
  backgroundImageUrl?: string;
  backgroundHue?: number;
}

// Modern animation variants for UI elements
const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] // Modern 2025 ease curve
    }
  },
  hover: { 
    scale: 1.03,
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 20 
    }
  }
};

const MindfulnessExercise = ({ 
  title, 
  icon, 
  description, 
  duration, 
  durationInMinutes,
  steps,
  audioUrl,
  backgroundImageUrl,
  backgroundHue,
  onStart
}: Exercise & { onStart: (exercise: Exercise) => void }) => {

  return (
    <div className="mindfulness-card-container">
      <Card 
        className="mood-card"
        sx={{ 
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: theme => `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.7)}, ${alpha(theme.palette.secondary.main, 0.7)})`,
            zIndex: 1
          }
        }}
      >
        {backgroundImageUrl && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${backgroundImageUrl})`,
              backgroundSize: 'cover',
              opacity: 0.06,
              zIndex: 0
            }}
          />
        )}
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: '50%', 
              background: backgroundHue ? 
                `hsl(${backgroundHue}, 85%, 95%)` : 
                'var(--color-primary-100)',
              color: backgroundHue ? 
                `hsl(${backgroundHue}, 80%, 40%)` : 
                'var(--color-primary)',
              mr: 2
            }}>
              {icon}
            </Box>
            <Typography variant="h6">{title}</Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 2 }}>{description}</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>{duration}</Typography>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => onStart({ 
                title, 
                icon, 
                description, 
                duration, 
                durationInMinutes, 
                steps,
                audioUrl,
                backgroundImageUrl,
                backgroundHue
              })}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: theme => 
                    `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                  zIndex: -1,
                  transition: 'all 0.3s ease-out'
                },
                '&:hover::after': {
                  opacity: 0.8,
                }
              }}
            >
              Start
            </Button>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

const ExercisePlayer = ({ 
  exercise, 
  open, 
  onClose 
}: { 
  exercise: Exercise | null, 
  open: boolean, 
  onClose: () => void 
}) => {
  const theme = useTheme();
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Reset state when a new exercise is loaded
  React.useEffect(() => {
    if (open && exercise) {
      setStep(0);
      setProgress(0);
      setIsPlaying(true);
      
      // Load exercise audio if available
      if (exercise.audioUrl) {
        setAudioLoaded(false);
        const audio = new Audio(exercise.audioUrl);
        audio.addEventListener('canplaythrough', () => {
          setAudioLoaded(true);
        });
        setAudioElement(audio);
        return () => {
          audio.pause();
          audio.src = '';
        };
      }
    }
  }, [open, exercise]);

  // Handle playing and pausing audio
  React.useEffect(() => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.play().catch(e => console.log("Audio playback error:", e));
      } else {
        audioElement.pause();
      }
    }
  }, [isPlaying, audioElement]);

  // Progress timer
  React.useEffect(() => {
    if (!exercise || !isPlaying) return;

    const totalDurationMs = exercise.durationInMinutes * 60 * 1000;
    const totalSteps = exercise.steps.length;
    const stepDurationMs = totalDurationMs / totalSteps;
    
    // Update progress every 100ms
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (totalDurationMs / 100));
        
        // Move to next step if needed
        if (Math.floor(prev / (100 / totalSteps)) < Math.floor(newProgress / (100 / totalSteps))) {
          setStep(Math.min(Math.floor(newProgress / (100 / totalSteps)), totalSteps - 1));
        }
        
        // Complete the exercise
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        
        return newProgress;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [exercise, isPlaying]);

  if (!exercise) return null;

  const backgroundColor = exercise.backgroundHue ? 
    `hsl(${exercise.backgroundHue}, 50%, 97%)` : 
    alpha(theme.palette.background.paper, 0.95);

  const accentColor = exercise.backgroundHue ? 
    `hsl(${exercise.backgroundHue}, 80%, 40%)` : 
    theme.palette.primary.main;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          backgroundImage: exercise.backgroundImageUrl ? 
            `linear-gradient(${backgroundColor}, ${backgroundColor}), url(${exercise.backgroundImageUrl})` : 
            undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
        }
      }}
      TransitionComponent={Fade}
      transitionDuration={{
        enter: 700,
        exit: 300
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: '50%', 
              background: alpha(accentColor, 0.1),
              color: accentColor,
              mr: 2
            }}>
              {exercise.icon}
            </Box>
            <Typography variant="h6">{exercise.title}</Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'text.secondary'
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 4,
            mt: 2,
            mx: 3,
            mb: 0,
            borderRadius: 2,
            backgroundColor: alpha(accentColor, 0.1),
            '& .MuiLinearProgress-bar': {
              backgroundColor: accentColor
            }
          }} 
        />
        
        <DialogContent sx={{ pt: 4, pb: 4 }}>
          <Slide direction="up" in={true} mountOnEnter unmountOnExit>
            <Box sx={{ minHeight: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {exercise.audioUrl && !audioLoaded ? (
                <CircularProgress size={40} />
              ) : (
                <>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      textAlign: 'center', 
                      mb: 4, 
                      fontWeight: 500,
                      maxWidth: '80%',
                      color: 'text.primary'
                    }}
                  >
                    {exercise.steps[step]}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
                    <IconButton 
                      size="large" 
                      onClick={() => setIsPlaying(!isPlaying)}
                      sx={{ 
                        color: accentColor,
                        transform: 'scale(1.2)',
                        '&:hover': {
                          backgroundColor: alpha(accentColor, 0.1)
                        }
                      }}
                    >
                      {isPlaying ? <PauseCircle fontSize="large" /> : <PlayCircle fontSize="large" />}
                    </IconButton>
                    
                    <IconButton 
                      size="large" 
                      onClick={() => {
                        setStep(0);
                        setProgress(0);
                        setIsPlaying(true);
                        if (audioElement) {
                          audioElement.currentTime = 0;
                          audioElement.play().catch(e => console.log("Audio replay error:", e));
                        }
                      }}
                      sx={{ 
                        color: theme.palette.text.secondary,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.text.secondary, 0.1)
                        }
                      }}
                    >
                      <Refresh />
                    </IconButton>
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mt: 4,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.5)
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      {`Step ${step + 1} of ${exercise.steps.length} • ${Math.floor(progress)}% complete`}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Slide>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

const Mindfulness: React.FC = () => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleStartExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const exercises: Exercise[] = [
    {
      title: 'Breathing Exercise',
      icon: <Air />,
      description: 'Focus on your breath to clear your mind and reduce stress.',
      duration: '5 min',
      durationInMinutes: 5,
      backgroundHue: 200, // Blue
      backgroundImageUrl: 'https://images.unsplash.com/photo-1609252902605-24adcfa6388e?auto=format&fit=crop&w=800',
      steps: [
        'Find a comfortable seated position with your back straight.',
        'Take a deep breath in through your nose, filling your lungs completely.',
        'Hold your breath for a moment.',
        'Exhale slowly through your mouth, emptying your lungs completely.',
        'Notice the natural rhythm of your breathing.',
        'Breathe in for a count of 4, hold for 4, exhale for 6.',
        'Continue this pattern, keeping your attention on the breath.',
        'If your mind wanders, gently bring your focus back to your breathing.',
        'Feel the sensations of the breath in your nostrils, chest, and belly.',
        'With each exhale, let go of any tension or stress.',
        'Allow your breath to return to its natural rhythm.',
        'Notice how you feel now compared to when you started.',
      ],
      audioUrl: 'https://soundcloud.com/meditationrelaxclub/breathing-exercise-meditation'
    },
    {
      title: 'Body Scan Meditation',
      icon: <SelfImprovement />,
      description: 'Gradually scan your body from head to toe, releasing tension.',
      duration: '10 min',
      durationInMinutes: 10,
      backgroundHue: 270, // Purple
      backgroundImageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800',
      steps: [
        'Lie down or sit in a comfortable position.',
        'Close your eyes and take a few deep breaths.',
        'Bring your awareness to the top of your head.',
        'Notice any sensations in your scalp and forehead.',
        'Move your attention to your face: eyes, cheeks, jaw.',
        'Scan down to your neck and shoulders.',
        'Notice any tension in your shoulders and consciously release it.',
        'Continue down to your arms and hands.',
        'Feel each finger individually.',
        'Bring awareness to your chest and upper back.',
        'Notice your breath moving in this area.',
        'Scan down to your abdomen and lower back.',
        'Move to your hips and pelvis.',
        'Continue down to your thighs.',
        'Notice your knees, calves, and ankles.',
        'Finally, bring awareness to your feet and toes.',
        'Now, feel your entire body as a whole.',
        'Take a deep breath and prepare to return to the present moment.',
      ]
    },
    {
      title: 'Loving-kindness',
      icon: <Favorite />,
      description: 'Cultivate feelings of goodwill, kindness, and warmth towards others.',
      duration: '8 min',
      durationInMinutes: 8,
      backgroundHue: 350, // Pink/Red
      backgroundImageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800',
      steps: [
        'Sit comfortably with your eyes closed.',
        'Take a few deep breaths to center yourself.',
        'Bring to mind someone you care deeply about.',
        'Silently repeat: "May you be happy. May you be healthy. May you be safe. May you live with ease."',
        'Notice the feelings of love and kindness arising.',
        'Now direct these wishes toward yourself: "May I be happy. May I be healthy. May I be safe. May I live with ease."',
        'Extend these wishes to a neutral person in your life.',
        'Now, if you can, bring to mind someone difficult in your life.',
        'Wish them well: "May you be happy. May you be healthy. May you be safe. May you live with ease."',
        'Finally, extend these wishes to all beings everywhere.',
        'Feel the warmth of loving-kindness radiating from your heart.',
        'Rest in this feeling of connection and compassion.',
      ]
    },
    {
      title: 'Morning Gratitude',
      icon: <WbSunny />,
      description: 'Begin your day with gratitude to foster a positive mindset.',
      duration: '3 min',
      durationInMinutes: 3,
      backgroundHue: 40, // Yellow/Orange
      backgroundImageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=800',
      steps: [
        'Sit in a comfortable position and take a few deep breaths.',
        'Bring to mind something in nature that you\'re grateful for.',
        'Think of a person in your life who you appreciate.',
        'Recall something about your body or health that you\'re thankful for.',
        'Consider an opportunity or experience you\'re grateful for.',
        'Reflect on a challenge that has helped you grow.',
        'Notice how focusing on gratitude affects your mood and body.',
        'Set an intention to notice moments of gratitude throughout your day.',
      ]
    },
    {
      title: 'Evening Reflection',
      icon: <Spa />,
      description: 'Reflect on your day and let go of lingering thoughts or stress.',
      duration: '7 min',
      durationInMinutes: 7,
      backgroundHue: 220, // Deep Blue
      backgroundImageUrl: 'https://images.unsplash.com/photo-1507502707541-f369a3b18502?auto=format&fit=crop&w=800',
      steps: [
        'Find a quiet place to sit comfortably.',
        'Take several deep breaths to center yourself.',
        'Recall the events of your day, without judgment.',
        'Acknowledge three things that went well today.',
        'Consider any challenges you faced and what you learned.',
        'Notice if you\'re holding onto any tension from the day.',
        'With each exhale, release any lingering stress or worry.',
        'Visualize placing your concerns in a container, setting them aside for now.',
        'Set an intention for your sleep and the coming day.',
        'Express gratitude for the day\'s experiences.',
        'Let your breath become natural and restful.',
        'Prepare to transition into your evening with a clear mind.',
      ]
    },
    {
      title: 'Sound Meditation',
      icon: <Waves />,
      description: 'Use soothing sounds to anchor your awareness in the present moment.',
      duration: '12 min',
      durationInMinutes: 12,
      backgroundHue: 160, // Teal
      backgroundImageUrl: 'https://images.unsplash.com/photo-1476908965434-f988d59d7abd?auto=format&fit=crop&w=800',
      steps: [
        'Find a comfortable position and close your eyes.',
        'Take a few deep breaths to settle your body and mind.',
        'Begin to notice the sounds in your environment.',
        'Don\'t label or judge the sounds, simply observe them.',
        'Notice sounds that are far away.',
        'Bring your attention to sounds that are closer to you.',
        'Be aware of sounds within your own body.',
        'Listen to the quality, tone, and texture of each sound.',
        'If your mind wanders, gently bring it back to listening.',
        'Notice the spaces of silence between sounds.',
        'Allow sounds to come and go without attachment.',
        'Feel how sound creates a landscape of awareness.',
        'Gradually expand your attention to include all sounds at once.',
        'Begin to bring gentle movement back to your fingers and toes.',
        'When you\'re ready, slowly open your eyes.',
      ],
      audioUrl: 'https://soundcloud.com/meditationrelaxclub/deep-meditation-music-nature'
    }
  ];

  return (
    <Box className="animate-fade-in">
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{
          fontWeight: 800,
          mb: 4,
          textAlign: 'center',
          background: 'linear-gradient(90deg, #4F46E5, #7C3AED)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Mindfulness Practices
      </Typography>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 }, 
          mb: 4, 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: theme => `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.default, 0.8)})`,
          backdropFilter: 'blur(20px)'
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Today's Mindfulness Focus
        </Typography>
        <Typography variant="body1">
          Take a moment to breathe deeply and connect with the present. Mindfulness exercises can help reduce stress, improve focus, and enhance emotional well-being.
        </Typography>
      </Paper>
      
      <Grid container spacing={3}>
        {exercises.map((exercise, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <MindfulnessExercise 
              {...exercise} 
              onStart={handleStartExercise}
            />
          </Grid>
        ))}
      </Grid>

      <ExercisePlayer 
        exercise={selectedExercise} 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
      />
    </Box>
  );
};

export default Mindfulness; 