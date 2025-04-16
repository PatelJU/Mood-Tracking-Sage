import { MoodEntry, User } from '../types';
import { format } from 'date-fns';

export interface SharedMood {
  id: string;
  userId: string;
  username: string;
  mood: string;
  message: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  isAnonymous: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

export interface SupportGroup {
  id: string;
  name: string;
  description: string;
  members: string[];
  moderators: string[];
  posts: SharedMood[];
  rules: string[];
  createdAt: string;
}

export const shareMood = (
  entry: MoodEntry,
  user: User,
  message: string,
  isAnonymous: boolean = false
): SharedMood => {
  return {
    id: entry.id,
    userId: isAnonymous ? 'anonymous' : user.id,
    username: isAnonymous ? 'Anonymous' : user.username,
    mood: entry.mood,
    message,
    timestamp: new Date().toISOString(),
    likes: 0,
    comments: [],
    isAnonymous
  };
};

export const createSupportGroup = (
  name: string,
  description: string,
  creator: User
): SupportGroup => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    description,
    members: [creator.id],
    moderators: [creator.id],
    posts: [],
    rules: [
      'Be respectful and supportive',
      'No hate speech or bullying',
      'Protect everyone\'s privacy',
      'Share responsibly'
    ],
    createdAt: new Date().toISOString()
  };
};

export const generateShareableImage = (entry: MoodEntry): string => {
  // This would integrate with a service like html2canvas or similar
  // to generate a shareable image of the mood entry
  return `data:image/png;base64,...`;
};

export const formatMoodForSharing = (entry: MoodEntry, includeWeather: boolean = true): string => {
  const date = format(new Date(entry.date), 'MMMM do, yyyy');
  const time = entry.timeOfDay !== 'full-day' ? ` (${entry.timeOfDay})` : '';
  
  let text = `Mood on ${date}${time}: ${entry.mood}\n`;
  
  if (entry.notes) {
    text += `\nThoughts: ${entry.notes}\n`;
  }
  
  if (includeWeather && entry.weather) {
    text += `\nWeather: ${entry.weather.condition}, ${entry.weather.temperature}°C`;
  }
  
  return text;
};

export const generateSupportiveResponse = (mood: string): string => {
  const responses = {
    'Very Bad': [
      'I hear you, and I\'m here to support you. Remember that this feeling will pass.',
      'You\'re not alone in this. Reach out if you need someone to talk to.',
      'It takes courage to acknowledge these feelings. Take things one step at a time.'
    ],
    'Bad': [
      'Tough days happen to everyone. Be gentle with yourself.',
      'Tomorrow is a new day with new possibilities.',
      'Remember to take care of yourself today.'
    ],
    'Okay': [
      'Steady and stable is good! What\'s one small thing you could do to lift your mood?',
      'Sometimes "okay" is perfectly fine. You\'re doing well.',
      'Neutral days are part of life\'s rhythm.'
    ],
    'Good': [
      'That\'s wonderful to hear! Keep this positive energy flowing.',
      'You\'re doing great! What made today special?',
      'Celebrate these good moments!'
    ],
    'Very Good': [
      'Amazing! Your positive energy is contagious!',
      'Fantastic! Hold onto this feeling and remember it on harder days.',
      'You\'re radiating positivity! Keep shining!'
    ]
  };
  
  const moodResponses = responses[mood as keyof typeof responses] || responses['Okay'];
  return moodResponses[Math.floor(Math.random() * moodResponses.length)];
}; 