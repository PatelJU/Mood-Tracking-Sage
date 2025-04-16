import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  MoodEntry, 
  MoodStats, 
  MoodPrediction, 
  MoodSuggestion, 
  MoodType,
  TimeOfDay 
} from '../types';
import { addDays, format, parseISO, startOfDay } from 'date-fns';

// Mock data and utility functions
import { calculateMoodStats, generateMockMoodEntries, getMoodSuggestions, predictMood } from '../services/moodService';

interface MoodContextType {
  moodEntries: MoodEntry[];
  moodStats: MoodStats | null;
  predictions: MoodPrediction[];
  addMoodEntry: (entry: Omit<MoodEntry, 'id'>) => void;
  updateMoodEntry: (id: string, updatedEntry: Partial<MoodEntry>) => void;
  deleteMoodEntry: (id: string) => void;
  getMoodEntriesByDate: (date: Date) => MoodEntry[];
  getMoodEntriesByTimeRange: (startDate: Date, endDate: Date) => MoodEntry[];
  getMoodSuggestion: (mood: MoodType) => MoodSuggestion;
  exportMoodData: () => { json: any; csv: string };
  sendMoodDataByEmail: (email: string) => Promise<boolean>;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export const useMood = () => {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};

interface MoodProviderProps {
  children: ReactNode;
}

export const MoodProvider: React.FC<MoodProviderProps> = ({ children }) => {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [moodStats, setMoodStats] = useState<MoodStats | null>(null);
  const [predictions, setPredictions] = useState<MoodPrediction[]>([]);

  // Initialize with mock data or load from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('moodEntries');
    
    if (savedEntries) {
      setMoodEntries(JSON.parse(savedEntries));
    } else {
      // Generate some mock entries for demonstration
      const mockEntries = generateMockMoodEntries(30); // Last 30 days
      setMoodEntries(mockEntries);
      localStorage.setItem('moodEntries', JSON.stringify(mockEntries));
    }
  }, []);

  // Update stats and predictions whenever entries change
  useEffect(() => {
    if (moodEntries.length > 0) {
      const stats = calculateMoodStats(moodEntries);
      setMoodStats(stats);

      // Generate predictions for the next 7 days
      const newPredictions: MoodPrediction[] = [];
      for (let i = 1; i <= 7; i++) {
        const date = addDays(new Date(), i);
        const prediction = predictMood(moodEntries, date);
        newPredictions.push(prediction);
      }
      setPredictions(newPredictions);

      // Save to localStorage
      localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
    }
  }, [moodEntries]);

  const addMoodEntry = (entry: Omit<MoodEntry, 'id'>) => {
    const newEntry: MoodEntry = {
      ...entry,
      id: uuidv4(),
    };
    setMoodEntries((prevEntries) => [...prevEntries, newEntry]);
  };

  const updateMoodEntry = (id: string, updatedEntry: Partial<MoodEntry>) => {
    setMoodEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.id === id ? { ...entry, ...updatedEntry } : entry
      )
    );
  };

  const deleteMoodEntry = (id: string) => {
    setMoodEntries((prevEntries) =>
      prevEntries.filter((entry) => entry.id !== id)
    );
  };

  const getMoodEntriesByDate = (date: Date) => {
    const targetDate = format(startOfDay(date), 'yyyy-MM-dd');
    return moodEntries.filter((entry) => 
      format(parseISO(entry.date), 'yyyy-MM-dd') === targetDate
    );
  };

  const getMoodEntriesByTimeRange = (startDate: Date, endDate: Date) => {
    return moodEntries.filter((entry) => {
      const entryDate = parseISO(entry.date);
      return entryDate >= startOfDay(startDate) && entryDate <= startOfDay(endDate);
    });
  };

  const getMoodSuggestion = (mood: MoodType): MoodSuggestion => {
    const suggestions = getMoodSuggestions();
    const moodSuggestions = suggestions.filter((s) => s.forMood === mood);
    
    if (moodSuggestions.length === 0) {
      return {
        forMood: mood,
        suggestion: "Take a deep breath and reflect on your mood."
      };
    }
    
    // Return a random suggestion for the given mood
    const randomIndex = Math.floor(Math.random() * moodSuggestions.length);
    return moodSuggestions[randomIndex];
  };

  const exportMoodData = () => {
    // Export as JSON
    const jsonData = JSON.stringify(moodEntries, null, 2);
    
    // Export as CSV
    const headers = "ID,Date,Time of Day,Mood,Notes,Temperature,Weather Condition,Humidity\n";
    const csvRows = moodEntries.map(entry => {
      return `"${entry.id}","${entry.date}","${entry.timeOfDay}","${entry.mood}","${entry.notes}",` +
        `"${entry.weather?.temperature || ''}","${entry.weather?.condition || ''}","${entry.weather?.humidity || ''}"`;
    });
    const csvData = headers + csvRows.join('\n');
    
    return { json: JSON.parse(jsonData), csv: csvData };
  };

  const sendMoodDataByEmail = async (email: string): Promise<boolean> => {
    try {
      // This would be an API call in a real app
      console.log(`Sending mood data to ${email}`);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  };

  const value: MoodContextType = {
    moodEntries,
    moodStats,
    predictions,
    addMoodEntry,
    updateMoodEntry,
    deleteMoodEntry,
    getMoodEntriesByDate,
    getMoodEntriesByTimeRange,
    getMoodSuggestion,
    exportMoodData,
    sendMoodDataByEmail,
  };

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
}; 