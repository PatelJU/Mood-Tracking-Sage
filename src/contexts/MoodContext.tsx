import React, { createContext, useContext, useState, useEffect } from 'react';

// Define types
export type MoodType = 'veryGood' | 'good' | 'neutral' | 'bad' | 'veryBad';

export interface MoodEntry {
  id: string;
  date: string;
  time: string;
  mood: MoodType;
  activities: string[];
  journal?: string;
  location?: string;
  weather?: {
    condition: string;
    temperature: number;
  };
  tags?: string[];
}

interface MoodContextType {
  moodEntries: MoodEntry[];
  addMoodEntry: (entry: Omit<MoodEntry, 'id'>) => void;
  updateMoodEntry: (id: string, entry: Partial<MoodEntry>) => void;
  deleteMoodEntry: (id: string) => void;
  loading: boolean;
}

// Create the context
const MoodContext = createContext<MoodContextType | undefined>(undefined);

// Sample data for development
const sampleMoodEntries: MoodEntry[] = [
  {
    id: '1',
    date: '2023-05-01',
    time: '09:30',
    mood: 'good',
    activities: ['Exercise', 'Reading'],
    journal: 'Started the day with a good workout. Feeling energized!',
    location: 'Home',
    weather: {
      condition: 'Sunny',
      temperature: 72
    },
    tags: ['morning', 'exercise']
  },
  {
    id: '2',
    date: '2023-05-02',
    time: '14:00',
    mood: 'neutral',
    activities: ['Working', 'Meeting'],
    journal: 'Long meeting today. Feeling a bit drained but okay overall.',
    location: 'Office',
    weather: {
      condition: 'Cloudy',
      temperature: 65
    },
    tags: ['work', 'stress']
  },
  {
    id: '3',
    date: '2023-05-03',
    time: '19:45',
    mood: 'veryGood',
    activities: ['Dinner with friends', 'Walking'],
    journal: 'Had an amazing time with friends tonight. Great conversations!',
    location: 'Restaurant',
    weather: {
      condition: 'Clear',
      temperature: 68
    },
    tags: ['social', 'evening']
  },
  {
    id: '4',
    date: '2023-05-04',
    time: '11:15',
    mood: 'bad',
    activities: ['Working'],
    journal: 'Difficult project at work. Feeling frustrated with the challenges.',
    location: 'Office',
    weather: {
      condition: 'Rainy',
      temperature: 58
    },
    tags: ['work', 'stress']
  },
  {
    id: '5',
    date: '2023-05-05',
    time: '08:30',
    mood: 'good',
    activities: ['Meditation', 'Breakfast'],
    journal: 'Peaceful morning meditation helped me start the day centered.',
    location: 'Home',
    weather: {
      condition: 'Sunny',
      temperature: 70
    },
    tags: ['morning', 'self-care']
  },
  // Generate more sample data for the last 30 days
  ...Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const formattedDate = date.toISOString().split('T')[0];
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    const moods: MoodType[] = ['veryGood', 'good', 'neutral', 'bad', 'veryBad'];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    
    const activities = [
      'Exercise', 'Reading', 'Working', 'Studying', 'Relaxing', 
      'Cooking', 'Cleaning', 'Shopping', 'Socializing', 'Watching TV',
      'Gaming', 'Meditation', 'Walking', 'Running', 'Cycling'
    ];
    const randomActivities = activities
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1);
    
    return {
      id: (i + 6).toString(),
      date: formattedDate,
      time: formattedTime,
      mood: randomMood,
      activities: randomActivities,
      journal: `Random mood entry for ${formattedDate}`,
      location: Math.random() > 0.5 ? 'Home' : 'Office',
      weather: {
        condition: ['Sunny', 'Cloudy', 'Rainy', 'Clear'][Math.floor(Math.random() * 4)],
        temperature: Math.floor(Math.random() * 30) + 50
      },
      tags: ['sample', 'generated']
    };
  })
];

// Provider component
export const MoodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load mood entries from localStorage on initial render
  useEffect(() => {
    const storedEntries = localStorage.getItem('moodEntries');
    if (storedEntries) {
      setMoodEntries(JSON.parse(storedEntries));
    } else {
      // Use sample data if nothing is in localStorage
      setMoodEntries(sampleMoodEntries);
    }
    setLoading(false);
  }, []);
  
  // Save mood entries to localStorage when they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
    }
  }, [moodEntries, loading]);
  
  // Add a new mood entry
  const addMoodEntry = (entry: Omit<MoodEntry, 'id'>) => {
    const newEntry: MoodEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    
    setMoodEntries(prev => [...prev, newEntry]);
  };
  
  // Update an existing mood entry
  const updateMoodEntry = (id: string, entry: Partial<MoodEntry>) => {
    setMoodEntries(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...entry } : item
      )
    );
  };
  
  // Delete a mood entry
  const deleteMoodEntry = (id: string) => {
    setMoodEntries(prev => prev.filter(item => item.id !== id));
  };
  
  const value = {
    moodEntries,
    addMoodEntry,
    updateMoodEntry,
    deleteMoodEntry,
    loading
  };
  
  return (
    <MoodContext.Provider value={value}>
      {children}
    </MoodContext.Provider>
  );
};

// Custom hook to use the mood context
export const useMood = (): MoodContextType => {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
}; 