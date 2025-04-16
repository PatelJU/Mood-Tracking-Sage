import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useTheme } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';

const OnboardingTour: React.FC = () => {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const theme = useTheme();
  const location = useLocation();

  // Define different tour steps for different routes
  useEffect(() => {
    const isFirstTimeUser = localStorage.getItem('onboardingComplete') !== 'true';
    
    if (isFirstTimeUser) {
      let tourSteps: Step[] = [];

      // Define steps based on current route
      switch (location.pathname) {
        case '/dashboard':
        case '/':
          tourSteps = [
            {
              target: '.dashboard-overview',
              content: 'Welcome to Pro Mood Tracker! This is your dashboard where you can see an overview of your mood patterns.',
              disableBeacon: true,
              placement: 'bottom',
            },
            {
              target: '.mood-stats-card',
              content: 'Here you can see a summary of your mood statistics.',
              placement: 'bottom',
            },
            {
              target: '.sidebar-nav',
              content: 'Use this menu to navigate to different sections of the app.',
              placement: 'right',
            }
          ];
          break;
        case '/log-mood':
          tourSteps = [
            {
              target: '.mood-logger-container',
              content: 'This is where you can log your daily mood. Try to log your mood at least once a day for the best insights.',
              disableBeacon: true,
            },
            {
              target: '.mood-selector',
              content: 'Click on these icons to select your current mood.',
              placement: 'top',
            },
            {
              target: '.time-of-day-selector',
              content: 'You can specify the time of day for more detailed tracking.',
              placement: 'left',
            },
            {
              target: '.notes-field',
              content: 'Add notes about what influenced your mood today. This will help with generating personalized insights.',
              placement: 'top',
            }
          ];
          break;
        case '/analytics':
          tourSteps = [
            {
              target: '.analytics-container',
              content: 'Here you can see detailed visualizations of your mood data.',
              disableBeacon: true,
            },
            {
              target: '.chart-controls',
              content: 'Use these controls to customize the time period and type of chart.',
              placement: 'bottom',
            }
          ];
          break;
        default:
          break;
      }

      setSteps(tourSteps);
      setRun(tourSteps.length > 0);
    }
  }, [location.pathname]);

  // Handle tour callback
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;
    
    // Tour is finished or skipped
    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      setRun(false);
      
      // For dashboard, mark tour as complete
      if (location.pathname === '/dashboard' || location.pathname === '/') {
        localStorage.setItem('onboardingComplete', 'true');
      }
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          primaryColor: theme.palette.primary.main,
          backgroundColor: theme.palette.background.paper,
          textColor: theme.palette.text.primary,
          arrowColor: theme.palette.background.paper,
          zIndex: 10000,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          backgroundColor: theme.palette.primary.main,
        },
        buttonBack: {
          marginRight: 10,
        }
      }}
    />
  );
};

export default OnboardingTour; 