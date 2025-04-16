/**
 * Notification Service
 * Handles push notifications and reminder functionality
 */

// Check if the browser supports notifications
export const checkNotificationSupport = (): boolean => {
  return 'Notification' in window;
};

// Request permission for notifications
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!checkNotificationSupport()) {
    console.warn('This browser does not support notifications');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Function to show a notification
export const showNotification = (
  title: string,
  options: NotificationOptions = {}
): Notification | null => {
  if (!checkNotificationSupport() || Notification.permission !== 'granted') {
    return null;
  }

  // Default options
  const defaultOptions: NotificationOptions = {
    body: 'Time to log your mood!',
    icon: '/logo192.png',
    badge: '/logo192.png',
    silent: false,
  };

  // Merge options
  const mergedOptions = { ...defaultOptions, ...options };

  try {
    const notification = new Notification(title, mergedOptions);
    
    // Add click handler to open the app
    notification.onclick = () => {
      window.focus();
      notification.close();
      
      // Navigate to mood logger if path is specified in data
      if (options.data && options.data.url) {
        window.location.href = options.data.url;
      }
    };
    
    return notification;
  } catch (error) {
    console.error('Error showing notification:', error);
    return null;
  }
};

// Schedule regular mood logging reminders
export const scheduleMoodReminders = (frequency: 'daily' | 'twice-daily' | 'custom' = 'daily'): void => {
  if (!checkNotificationSupport() || Notification.permission !== 'granted') {
    console.warn('Notifications not enabled');
    return;
  }

  // Clear any existing scheduled reminders
  clearMoodReminders();

  // Store user preference
  localStorage.setItem('reminderFrequency', frequency);

  // Default reminder times
  let reminderTimes: { hour: number; minute: number }[] = [];
  
  switch (frequency) {
    case 'daily':
      // Default to 8 PM
      reminderTimes = [{ hour: 20, minute: 0 }];
      break;
    case 'twice-daily':
      // 9 AM and 8 PM
      reminderTimes = [
        { hour: 9, minute: 0 },
        { hour: 20, minute: 0 }
      ];
      break;
    case 'custom':
      // Get custom times from localStorage or use default
      const customTimes = localStorage.getItem('customReminderTimes');
      if (customTimes) {
        reminderTimes = JSON.parse(customTimes);
      } else {
        reminderTimes = [{ hour: 20, minute: 0 }];
      }
      break;
  }

  // Schedule each reminder
  reminderTimes.forEach(time => {
    scheduleReminderAtTime(time.hour, time.minute);
  });
};

// Schedule a reminder at a specific time
const scheduleReminderAtTime = (hour: number, minute: number): void => {
  const now = new Date();
  const scheduledTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    0
  );

  // If the time has already passed today, schedule for tomorrow
  if (scheduledTime < now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  // Calculate delay in milliseconds
  const delay = scheduledTime.getTime() - now.getTime();

  // Schedule the notification
  const timerId = setTimeout(() => {
    showNotification('Mood Tracker Reminder', {
      body: 'How are you feeling right now? Take a moment to log your mood.',
      data: { url: '/log-mood' }
    });
    
    // Reschedule for the next day
    scheduleReminderAtTime(hour, minute);
  }, delay);

  // Store the timer ID for cleanup
  const existingTimers = JSON.parse(localStorage.getItem('reminderTimers') || '[]');
  existingTimers.push(timerId);
  localStorage.setItem('reminderTimers', JSON.stringify(existingTimers));
};

// Clear all scheduled reminders
export const clearMoodReminders = (): void => {
  const timerIds = JSON.parse(localStorage.getItem('reminderTimers') || '[]');
  timerIds.forEach((id: number) => clearTimeout(id));
  localStorage.setItem('reminderTimers', '[]');
};

// Set custom reminder times
export const setCustomReminderTimes = (times: { hour: number; minute: number }[]): void => {
  localStorage.setItem('customReminderTimes', JSON.stringify(times));
  
  // If currently using custom frequency, reschedule with new times
  if (localStorage.getItem('reminderFrequency') === 'custom') {
    scheduleMoodReminders('custom');
  }
};

// Initialize reminders based on user preferences
export const initializeReminders = async (): Promise<void> => {
  const hasPermission = await requestNotificationPermission();
  
  if (hasPermission) {
    const frequency = localStorage.getItem('reminderFrequency') as 'daily' | 'twice-daily' | 'custom' || 'daily';
    scheduleMoodReminders(frequency);
  }
}; 