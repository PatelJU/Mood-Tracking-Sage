import React, { useRef, useEffect } from 'react';
import { styled, keyframes } from '@mui/material/styles';
import { Box, Fade, Grow, Zoom, Collapse, useTheme } from '@mui/material';

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const wiggle = keyframes`
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// Animation wrapper components
const AnimatedBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'animationType' && 
                               prop !== 'duration' && 
                               prop !== 'delay' && 
                               prop !== 'iterations' && 
                               prop !== 'timing'
})<{
  animationType?: 'pulse' | 'bounce' | 'wiggle' | 'shimmer';
  duration?: number;
  delay?: number;
  iterations?: number | 'infinite';
  timing?: string;
}>(({ animationType, duration = 1, delay = 0, iterations = 1, timing = 'ease-in-out' }) => ({
  animation: animationType && 
             `${
               animationType === 'pulse' ? pulse : 
               animationType === 'bounce' ? bounce :
               animationType === 'wiggle' ? wiggle :
               animationType === 'shimmer' ? shimmer : ''
             } ${duration}s ${timing} ${delay}s ${iterations}`,
  animationFillMode: 'both',
  ...(animationType === 'shimmer' && {
    backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
    backgroundSize: '1000px 100%',
    backgroundRepeat: 'no-repeat',
    overflow: 'hidden'
  })
}));

// Types
type TransitionType = 'fade' | 'grow' | 'zoom' | 'collapse' | 'slide';
type AnimationType = 'pulse' | 'bounce' | 'wiggle' | 'shimmer';
type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

interface MicroInteractionProps {
  children: React.ReactNode;
  in?: boolean;
  animate?: boolean;
  transition?: TransitionType;
  animation?: AnimationType;
  duration?: number;
  delay?: number;
  iterations?: number | 'infinite';
  timing?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  haptic?: HapticType;
  onComplete?: () => void;
  sx?: any;
  className?: string;
}

/**
 * A utility component that adds animations, transitions, and haptic feedback to UI elements
 */
const MicroInteraction: React.FC<MicroInteractionProps> = ({
  children,
  in: inProp = true,
  animate = false,
  transition,
  animation,
  duration = 0.3,
  delay = 0,
  iterations = 1,
  timing = 'ease-in-out',
  direction = 'up',
  haptic,
  onComplete,
  sx = {},
  className
}) => {
  const theme = useTheme();
  const animationRef = useRef<HTMLDivElement>(null);
  const durationMs = duration * 1000;
  
  // Trigger haptic feedback if supported
  useEffect(() => {
    if (haptic && inProp && 'vibrate' in navigator) {
      switch (haptic) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate([30, 10, 30]);
          break;
        case 'success':
          navigator.vibrate([10, 20, 30]);
          break;
        case 'warning':
          navigator.vibrate([30, 50, 30]);
          break;
        case 'error':
          navigator.vibrate([50, 30, 50, 30, 50]);
          break;
      }
    }
  }, [haptic, inProp]);
  
  // Handle animation completion
  useEffect(() => {
    if (animate && onComplete && animationRef.current) {
      const timer = setTimeout(() => {
        onComplete();
      }, durationMs);
      
      return () => clearTimeout(timer);
    }
  }, [animate, onComplete, durationMs]);
  
  // Determine transform origin based on direction
  const getTransformOrigin = () => {
    switch (direction) {
      case 'up': return 'center bottom';
      case 'down': return 'center top';
      case 'left': return 'right center';
      case 'right': return 'left center';
      default: return 'center center';
    }
  };
  
  // Apply transition if specified
  const renderWithTransition = () => {
    if (!transition) {
      return (
        <AnimatedBox
          ref={animationRef}
          animationType={animate ? animation : undefined}
          duration={duration}
          delay={delay}
          iterations={iterations}
          timing={timing}
          sx={{
            ...sx,
            display: 'inline-flex'
          }}
          className={className}
        >
          {children}
        </AnimatedBox>
      );
    }
    
    switch (transition) {
      case 'fade':
        return (
          <Fade
            in={inProp}
            timeout={durationMs}
            style={{ transitionDelay: `${delay * 1000}ms` }}
          >
            <AnimatedBox
              ref={animationRef}
              animationType={animate ? animation : undefined}
              duration={duration}
              delay={0}
              iterations={iterations}
              timing={timing}
              sx={{
                ...sx,
                display: 'inline-flex'
              }}
              className={className}
            >
              {children}
            </AnimatedBox>
          </Fade>
        );
      
      case 'grow':
        return (
          <Grow
            in={inProp}
            timeout={durationMs}
            style={{ 
              transitionDelay: `${delay * 1000}ms`,
              transformOrigin: getTransformOrigin()
            }}
          >
            <AnimatedBox
              ref={animationRef}
              animationType={animate ? animation : undefined}
              duration={duration}
              delay={0}
              iterations={iterations}
              timing={timing}
              sx={{
                ...sx,
                display: 'inline-flex'
              }}
              className={className}
            >
              {children}
            </AnimatedBox>
          </Grow>
        );
      
      case 'zoom':
        return (
          <Zoom
            in={inProp}
            timeout={durationMs}
            style={{ transitionDelay: `${delay * 1000}ms` }}
          >
            <AnimatedBox
              ref={animationRef}
              animationType={animate ? animation : undefined}
              duration={duration}
              delay={0}
              iterations={iterations}
              timing={timing}
              sx={{
                ...sx,
                display: 'inline-flex'
              }}
              className={className}
            >
              {children}
            </AnimatedBox>
          </Zoom>
        );
      
      case 'collapse':
        return (
          <Collapse
            in={inProp}
            timeout={durationMs}
            orientation={direction === 'left' || direction === 'right' ? 'horizontal' : 'vertical'}
            style={{ transitionDelay: `${delay * 1000}ms` }}
          >
            <AnimatedBox
              ref={animationRef}
              animationType={animate ? animation : undefined}
              duration={duration}
              delay={0}
              iterations={iterations}
              timing={timing}
              sx={{
                ...sx,
                display: 'inline-flex'
              }}
              className={className}
            >
              {children}
            </AnimatedBox>
          </Collapse>
        );
      
      case 'slide':
        return (
          <AnimatedBox
            ref={animationRef}
            sx={{
              ...sx,
              transition: `transform ${duration}s ${timing} ${delay}s, opacity ${duration}s ${timing} ${delay}s`,
              transform: inProp
                ? 'translateX(0) translateY(0)'
                : `translate${direction === 'left' || direction === 'right' ? 'X' : 'Y'}(${
                    direction === 'left' || direction === 'up' ? '-' : ''
                  }20px)`,
              opacity: inProp ? 1 : 0,
              display: 'inline-flex'
            }}
            animationType={animate ? animation : undefined}
            duration={duration}
            delay={0}
            iterations={iterations}
            timing={timing}
            className={className}
          >
            {children}
          </AnimatedBox>
        );
      
      default:
        return (
          <AnimatedBox
            ref={animationRef}
            animationType={animate ? animation : undefined}
            duration={duration}
            delay={delay}
            iterations={iterations}
            timing={timing}
            sx={{
              ...sx,
              display: 'inline-flex'
            }}
            className={className}
          >
            {children}
          </AnimatedBox>
        );
    }
  };
  
  return renderWithTransition();
};

// Helper components for specific micro-interactions

interface SuccessActionProps {
  children: React.ReactNode;
  sx?: any;
}

export const SuccessAction: React.FC<SuccessActionProps> = ({ children, sx }) => (
  <MicroInteraction
    transition="grow"
    animation="pulse"
    duration={0.4}
    haptic="success"
    sx={sx}
  >
    {children}
  </MicroInteraction>
);

interface AttentionGrabberProps {
  children: React.ReactNode;
  sx?: any;
}

export const AttentionGrabber: React.FC<AttentionGrabberProps> = ({ children, sx }) => (
  <MicroInteraction
    animation="wiggle"
    duration={0.5}
    iterations={2}
    sx={sx}
  >
    {children}
  </MicroInteraction>
);

interface ProgressIndicatorProps {
  isLoading?: boolean;
  children: React.ReactNode;
  sx?: any;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  isLoading = true,
  children,
  sx
}) => (
  <MicroInteraction
    animation={isLoading ? "shimmer" : undefined}
    duration={2}
    iterations="infinite"
    sx={sx}
  >
    {children}
  </MicroInteraction>
);

export default MicroInteraction; 