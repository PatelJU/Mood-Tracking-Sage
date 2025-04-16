import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useEmotion, EmotionType } from '../../context/EmotionContext';

// This is a simulation/placeholder for real emotion detection that would use AI models
// In a real implementation, this would use a computer vision model to analyze facial expressions

const EmotionDetector: React.FC = () => {
  const { setEmotion, currentEmotion, emotionIntensity, applyEmotionBasedTheme } = useEmotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [permission, setPermission] = useState<boolean | null>(null);
  
  // Mock emotion detection - in a real implementation this would use a machine learning model
  const detectEmotionMock = () => {
    if (!isActive) return;
    
    // Simulate random emotion changes for demonstration purposes
    const emotions: EmotionType[] = ['happy', 'anxious', 'neutral', 'energetic', 'calm', 'tired', 'focused'];
    
    // Use weighted probabilities to make the emotion changes less erratic
    // Neutral should be more common, with occasional shifts to other emotions
    let newEmotion: EmotionType;
    const rand = Math.random();
    
    if (rand < 0.6) {
      // 60% chance to stay the same
      newEmotion = currentEmotion;
    } else if (rand < 0.8) {
      // 20% chance for neutral
      newEmotion = 'neutral';
    } else {
      // 20% chance for a random emotion
      const randomIndex = Math.floor(Math.random() * emotions.length);
      newEmotion = emotions[randomIndex];
    }
    
    // Random intensity between 40-100
    const intensity = Math.floor(Math.random() * 60) + 40;
    
    if (newEmotion !== currentEmotion) {
      setEmotion(newEmotion, intensity);
      applyEmotionBasedTheme();
    }
  };

  useEffect(() => {
    let detectionInterval: NodeJS.Timeout;
    
    if (isActive) {
      // Start camera
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then((stream) => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              setPermission(true);
              
              // Start mock emotion detection
              detectionInterval = setInterval(detectEmotionMock, 3000); // Check every 3 seconds
            }
          })
          .catch((err) => {
            console.error("Error accessing camera:", err);
            setPermission(false);
          });
      }
    } else {
      // Stop camera
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        
        tracks.forEach(track => {
          track.stop();
        });
        
        videoRef.current.srcObject = null;
      }
    }
    
    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
      // Clean up camera on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        
        tracks.forEach(track => {
          track.stop();
        });
      }
    };
  }, [isActive]);

  const toggleDetection = () => {
    setIsActive(!isActive);
  };

  // Helper function to get emoji for current emotion
  const getEmotionEmoji = (): string => {
    switch(currentEmotion) {
      case 'happy': return '😊';
      case 'anxious': return '😟';
      case 'neutral': return '😐';
      case 'energetic': return '😃';
      case 'calm': return '😌';
      case 'tired': return '😴';
      case 'focused': return '🧐';
      default: return '😐';
    }
  };

  return (
    <Box sx={{ 
      position: 'relative',
      maxWidth: '300px',
      margin: '0 auto',
      textAlign: 'center',
      padding: 2,
      borderRadius: 2,
      backgroundColor: 'var(--color-background-paper)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Emotion Detector {isActive ? '(Active)' : '(Inactive)'}
      </Typography>

      {permission === false && (
        <Typography color="error" variant="body2" sx={{ mb: 1 }}>
          Camera access is required for emotion detection
        </Typography>
      )}

      <Box sx={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mb: 2
      }}>
        {isActive ? (
          <Box sx={{ position: 'relative', width: '200px', height: '150px' }}>
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                borderRadius: '8px',
                filter: 'grayscale(0.3) contrast(1.1)'
              }} 
            />
            <Box sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
            }}>
              <Typography variant="h3" sx={{ opacity: 0.7 }}>
                {getEmotionEmoji()}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ 
            width: '200px', 
            height: '150px', 
            backgroundColor: 'rgba(0, 0, 0, 0.1)', 
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Typography>
              Camera inactive
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography>
          Detected: {currentEmotion} ({emotionIntensity}%)
        </Typography>
        <Tooltip title={isActive ? "Disable emotion detection" : "Enable emotion detection"}>
          <IconButton onClick={toggleDetection} color={isActive ? "primary" : "default"}>
            {isActive ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default EmotionDetector; 