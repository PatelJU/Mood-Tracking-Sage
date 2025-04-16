import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { MoodEntry, MoodStats, MoodType } from "../types";
import { format, parseISO, startOfMonth, endOfMonth, subMonths, getDay, isSameDay, differenceInDays } from "date-fns";

// Helper function to get mood emoji
const getMoodEmoji = (mood: MoodType): string => {
  switch (mood) {
    case 'Very Good': return '😄';
    case 'Good': return '🙂';
    case 'Okay': return '😐';
    case 'Bad': return '🙁';
    case 'Very Bad': return '😢';
    default: return '';
  }
};

// Create mood distribution data for charts
const createMoodDistributionData = (entries: MoodEntry[]) => {
  const distribution = {
    'Very Good': 0,
    'Good': 0,
    'Okay': 0,
    'Bad': 0,
    'Very Bad': 0
  };
  
  entries.forEach(entry => {
    distribution[entry.mood]++;
  });
  
  return distribution;
};

// Create time of day distribution data
const createTimeOfDayData = (entries: MoodEntry[]) => {
  const distribution: Record<string, number> = {
    'morning': 0,
    'afternoon': 0,
    'evening': 0,
    'night': 0,
    'full-day': 0
  };
  
  entries.forEach(entry => {
    distribution[entry.timeOfDay]++;
  });
  
  return distribution;
};

// Create day of week distribution data
const createDayOfWeekData = (entries: MoodEntry[]) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const distribution: Record<string, number> = {
    'Sunday': 0,
    'Monday': 0,
    'Tuesday': 0,
    'Wednesday': 0,
    'Thursday': 0,
    'Friday': 0,
    'Saturday': 0
  };
  
  entries.forEach(entry => {
    const day = days[getDay(parseISO(entry.date))];
    distribution[day]++;
  });
  
  return distribution;
};

// Calculate average mood per day of week
const calculateAverageMoodByDayOfWeek = (entries: MoodEntry[]) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const moodValues: Record<string, number[]> = {
    'Sunday': [],
    'Monday': [],
    'Tuesday': [],
    'Wednesday': [],
    'Thursday': [],
    'Friday': [],
    'Saturday': []
  };
  
  entries.forEach(entry => {
    const day = days[getDay(parseISO(entry.date))];
    moodValues[day].push(moodToValue(entry.mood));
  });
  
  const averages: Record<string, number> = {};
  for (const day of days) {
    if (moodValues[day].length > 0) {
      const sum = moodValues[day].reduce((a, b) => a + b, 0);
      averages[day] = sum / moodValues[day].length;
    } else {
      averages[day] = 0;
    }
  }
  
  return averages;
};

// Create custom category distribution data if available
const createCustomCategoryData = (entries: MoodEntry[]) => {
  // Extract all custom categories
  const categories = Array.from(new Set(
    entries
      .filter(entry => entry.customCategory)
      .map(entry => entry.customCategory as string)
  ));
  
  // Count entries per category
  const distribution: Record<string, number> = {};
  categories.forEach(category => {
    distribution[category] = entries.filter(entry => entry.customCategory === category).length;
  });
  
  return distribution;
};

// Create weather condition distribution data
const createWeatherConditionData = (entries: MoodEntry[]) => {
  // Extract all weather conditions
  const conditions = Array.from(new Set(
    entries
      .filter(entry => entry.weather?.condition)
      .map(entry => entry.weather?.condition as string)
  ));
  
  // Count entries per condition
  const distribution: Record<string, number> = {};
  conditions.forEach(condition => {
    distribution[condition] = entries.filter(entry => entry.weather?.condition === condition).length;
  });
  
  return distribution;
};

// Calculate mood correlations with weather
const calculateWeatherCorrelations = (entries: MoodEntry[]) => {
  // Only consider entries with weather data
  const entriesWithWeather = entries.filter(entry => entry.weather);
  
  // Group by condition
  const byCondition: Record<string, number[]> = {};
  entriesWithWeather.forEach(entry => {
    const condition = entry.weather?.condition;
    if (condition) {
      if (!byCondition[condition]) {
        byCondition[condition] = [];
      }
      byCondition[condition].push(moodToValue(entry.mood));
    }
  });
  
  // Calculate average mood per condition
  const conditionAverages: Record<string, { average: number; count: number }> = {};
  for (const [condition, values] of Object.entries(byCondition)) {
    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      conditionAverages[condition] = {
        average: sum / values.length,
        count: values.length
      };
    }
  }
  
  return conditionAverages;
};

// Generate a simple horizontal bar chart for PDF
const drawBarChart = (
  doc: jsPDF, 
  data: Record<string, number>, 
  x: number, 
  y: number, 
  width: number = 150, 
  height: number = 100,
  colors: Record<string, string> = {},
  title: string = ''
) => {
  // Add title
  if (title) {
    doc.setFontSize(10);
    doc.text(title, x, y - 5);
  }
  
  const keys = Object.keys(data);
  const values = Object.values(data);
  const maxValue = Math.max(...values);
  
  // Calculate dimensions
  const barHeight = (height - 10) / keys.length;
  const barMargin = 2;
  
  // Draw bars
  keys.forEach((key, index) => {
    const value = data[key];
    const barWidth = (value / maxValue) * width;
    const barY = y + (index * (barHeight + barMargin));
    
    // Bar color
    const fillColor = colors[key] || `rgb(${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)})`;
    
    // Draw bar
    doc.setFillColor(fillColor);
    doc.rect(x, barY, barWidth, barHeight, 'F');
    
    // Draw label and value
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(key, x - 2, barY + barHeight / 2, { align: 'right' });
    doc.text(value.toString(), x + barWidth + 2, barY + barHeight / 2);
  });
};

// Draw a line chart for mood over time
const drawLineChart = (
  doc: jsPDF,
  entries: MoodEntry[],
  x: number,
  y: number,
  width: number = 170,
  height: number = 80,
  title: string = ''
) => {
  // Add title
  if (title) {
    doc.setFontSize(10);
    doc.text(title, x, y - 5);
  }
  
  // Only proceed if we have entries
  if (entries.length === 0) {
    doc.setFontSize(8);
    doc.text("Not enough data for chart", x + width / 2, y + height / 2, { align: 'center' });
    return;
  }
  
  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Group entries by day
  const entriesByDay: Record<string, number[]> = {};
  sortedEntries.forEach(entry => {
    const dateStr = format(parseISO(entry.date), 'yyyy-MM-dd');
    if (!entriesByDay[dateStr]) {
      entriesByDay[dateStr] = [];
    }
    entriesByDay[dateStr].push(moodToValue(entry.mood));
  });
  
  // Calculate average mood per day
  const dailyAverages: { date: Date; value: number }[] = [];
  Object.entries(entriesByDay).forEach(([dateStr, values]) => {
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    dailyAverages.push({
      date: new Date(dateStr),
      value: average
    });
  });
  
  // Limit to max 30 points
  const pointsToShow = dailyAverages.slice(-30);
  
  // Calculate coordinates
  const points: { x: number; y: number }[] = [];
  const dateRange = pointsToShow.length > 1 ? 
    pointsToShow[pointsToShow.length - 1].date.getTime() - pointsToShow[0].date.getTime() : 
    1;
  
  pointsToShow.forEach((point, i) => {
    // X position by date
    const datePosition = pointsToShow.length > 1 ? 
      (point.date.getTime() - pointsToShow[0].date.getTime()) / dateRange : 
      0.5;
    
    const pointX = x + (datePosition * width);
    
    // Y position by mood value (invert to draw properly)
    const pointY = y + height - ((point.value / 4) * height);
    
    points.push({ x: pointX, y: pointY });
  });
  
  // Draw axis
  doc.setDrawColor(200, 200, 200);
  doc.line(x, y, x, y + height); // Y axis
  doc.line(x, y + height, x + width, y + height); // X axis
  
  // Draw mood value labels
  doc.setFontSize(6);
  ['V.Bad', 'Bad', 'Okay', 'Good', 'V.Good'].forEach((label, i) => {
    const labelY = y + height - ((i / 4) * height);
    doc.text(label, x - 2, labelY, { align: 'right' });
    
    // Draw horizontal grid line
    doc.setDrawColor(230, 230, 230);
    doc.line(x, labelY, x + width, labelY);
  });
  
  // Draw the line chart
  doc.setDrawColor(41, 128, 185); // Blue line
  doc.setLineWidth(0.5);
  
  // Connect points with lines
  for (let i = 0; i < points.length - 1; i++) {
    doc.line(points[i].x, points[i].y, points[i+1].x, points[i+1].y);
  }
  
  // Draw points
  points.forEach(point => {
    doc.setFillColor(41, 128, 185);
    doc.circle(point.x, point.y, 1, 'F');
  });
  
  // Draw date labels (first, middle, last)
  if (pointsToShow.length > 0) {
    doc.setFontSize(6);
    
    const firstDate = format(pointsToShow[0].date, 'MMM d');
    doc.text(firstDate, x, y + height + 10);
    
    if (pointsToShow.length > 2) {
      const middleIndex = Math.floor(pointsToShow.length / 2);
      const middleDate = format(pointsToShow[middleIndex].date, 'MMM d');
      doc.text(middleDate, x + (width / 2), y + height + 10, { align: 'center' });
    }
    
    const lastDate = format(pointsToShow[pointsToShow.length - 1].date, 'MMM d');
    doc.text(lastDate, x + width, y + height + 10, { align: 'right' });
  }
};

// Map mood to numeric value
const moodToValue = (mood: MoodType): number => {
  switch (mood) {
    case 'Very Bad': return 0;
    case 'Bad': return 1;
    case 'Okay': return 2;
    case 'Good': return 3;
    case 'Very Good': return 4;
    default: return 2; // Default to 'Okay'
  }
};

// Draw a radar chart for mood by day of week
const drawRadarChart = (
  doc: jsPDF,
  data: Record<string, number>,
  x: number,
  y: number,
  radius: number = 60,
  title: string = ''
) => {
  // Add title
  if (title) {
    doc.setFontSize(10);
    doc.text(title, x, y - radius - 10);
  }
  
  const center = { x, y };
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Find max value for scaling
  const values = days.map(day => data[day] || 0);
  const maxValue = Math.max(...values, 4); // At least scale to max mood value
  
  // Draw axes
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  
  // Draw concentric circles
  for (let i = 1; i <= 4; i++) {
    const circleRadius = (radius * i) / 4;
    doc.circle(center.x, center.y, circleRadius, 'S');
  }
  
  // Draw axes lines and labels
  days.forEach((day, i) => {
    const angle = (Math.PI * 2 * i) / 7 - Math.PI / 2;
    const axisEndX = center.x + Math.cos(angle) * radius;
    const axisEndY = center.y + Math.sin(angle) * radius;
    
    // Draw axis line
    doc.line(center.x, center.y, axisEndX, axisEndY);
    
    // Draw label
    const labelDistance = radius + 10;
    const labelX = center.x + Math.cos(angle) * labelDistance;
    const labelY = center.y + Math.sin(angle) * labelDistance;
    
    doc.setFontSize(7);
    doc.text(day.substring(0, 3), labelX, labelY, { 
      align: 'center'
    });
  });
  
  // Draw data points
  const points: { x: number; y: number }[] = [];
  days.forEach((day, i) => {
    const value = data[day] || 0;
    const normalizedValue = value / maxValue; // 0 to 1
    
    const angle = (Math.PI * 2 * i) / 7 - Math.PI / 2;
    const pointDistance = radius * normalizedValue;
    const pointX = center.x + Math.cos(angle) * pointDistance;
    const pointY = center.y + Math.sin(angle) * pointDistance;
    
    points.push({ x: pointX, y: pointY });
  });
  
  // Draw the polygon
  doc.setDrawColor(41, 128, 185);
  doc.setFillColor(41, 128, 185);
  doc.setLineWidth(1);
  doc.setGState(new (doc as any).GState({ opacity: 0.4 }));
  
  // Draw path
  if (points.length > 0) {
    doc.path([[
      'M', points[0].x, points[0].y, // Move to first point
      ...points.slice(1).flatMap(point => (['L', point.x, point.y])), // Draw lines to other points
      'Z' // Close path
    ]] as any, {fill: true, stroke: true} as any);
  }
  
  // Reset opacity
  doc.setGState(new (doc as any).GState({ opacity: 1 }));
  
  // Draw points
  points.forEach(point => {
    doc.setFillColor(41, 128, 185);
    doc.circle(point.x, point.y, 2, 'F');
  });
};

// Draw weather correlation chart
const drawWeatherCorrelationChart = (
  doc: jsPDF,
  data: Record<string, { average: number; count: number }>,
  x: number,
  y: number,
  width: number = 150,
  height: number = 100,
  title: string = ''
) => {
  // Add title
  if (title) {
    doc.setFontSize(10);
    doc.text(title, x, y - 5);
  }
  
  const conditions = Object.keys(data);
  if (conditions.length === 0) {
    doc.setFontSize(8);
    doc.text("No weather data available", x + width / 2, y + height / 2, { align: 'center' });
    return;
  }
  
  // Calculate dimensions
  const barHeight = (height - 10) / conditions.length;
  const barMargin = 2;
  
  // Set colors based on mood scale
  const getColorForValue = (value: number): string => {
    // Scale from 0-4
    if (value <= 1) return '#F44336'; // Red for bad
    if (value <= 2) return '#FF9800'; // Orange for not great
    if (value <= 3) return '#FFC107'; // Yellow for okay
    return '#4CAF50'; // Green for good
  };
  
  // Draw bars
  conditions.forEach((condition, index) => {
    const { average, count } = data[condition];
    const barWidth = (average / 4) * width; // Normalize to 0-4 scale
    const barY = y + (index * (barHeight + barMargin));
    
    // Draw bar
    const fillColor = getColorForValue(average);
    doc.setFillColor(fillColor);
    doc.rect(x, barY, barWidth, barHeight, 'F');
    
    // Draw label and value
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(`${condition} (${count})`, x - 2, barY + barHeight / 2, { align: 'right' });
    doc.text(average.toFixed(1), x + barWidth + 2, barY + barHeight / 2);
  });
  
  // Add legend for the mood scale
  const legendY = y + height + 15;
  doc.setFontSize(7);
  doc.text("Mood Scale:", x, legendY);
  
  const legendItems = [
    { label: "V.Bad (0-1)", color: '#F44336' },
    { label: "Bad (1-2)", color: '#FF9800' },
    { label: "Okay (2-3)", color: '#FFC107' },
    { label: "Good (3-4)", color: '#4CAF50' }
  ];
  
  legendItems.forEach((item, i) => {
    const itemX = x + 35 + (i * 30);
    
    // Draw color box
    doc.setFillColor(item.color);
    doc.rect(itemX, legendY - 5, 6, 6, 'F');
    
    // Draw label
    doc.text(item.label, itemX + 8, legendY);
  });
};

/**
 * Generate PDF report for the given mood entries and time period
 */
export const generateMoodReport = (
  entries: MoodEntry[],
  stats: MoodStats | null,
  startDate: Date,
  endDate: Date,
  userName: string = 'User'
): jsPDF => {
  const doc = new jsPDF();
  
  // Filter entries for the time period
  const filteredEntries = entries.filter(entry => {
    const entryDate = parseISO(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });
  
  if (filteredEntries.length === 0) {
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185); // Blue
    doc.text("Mood Tracker Report", 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text("No entries found for the selected time period.", 105, 40, { align: 'center' });
    return doc;
  }
  
  // ===== COVER PAGE =====
  
  // Create title with gradient background
  doc.setFillColor(230, 240, 255);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setFontSize(24);
  doc.setTextColor(41, 128, 185); // Blue
  doc.text("Mood Tracker Report", 105, 25, { align: 'center' });
  
  // Add subtitle with period
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `${format(startDate, 'MMMM d, yyyy')} - ${format(endDate, 'MMMM d, yyyy')}`, 
    105, 
    35, 
    { align: 'center' }
  );
  
  // Add user info
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text(`Generated for: ${userName}`, 20, 50);
  doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy, h:mm a')}`, 20, 58);
  
  // Add report cover image/icon
  doc.setFillColor(41, 128, 185, 0.1);
  doc.circle(105, 100, 30, 'F');
  
  // Draw a simple mood icon
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.5);
  doc.circle(105, 100, 20, 'S');
  doc.circle(97, 95, 3, 'S');
  doc.circle(113, 95, 3, 'S');
  
  // Draw smile
  doc.setLineWidth(1);
  const smilePath = new Path2D();
  smilePath.arc(105, 105, 10, 0.1, Math.PI - 0.1);
  (doc as any).path(smilePath.toString(), 'S');
  
  // Add summary statistics
  doc.setFontSize(16);
  doc.setTextColor(41, 128, 185);
  doc.text("Report Highlights", 105, 145, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  
  // Create a summary box
  doc.setFillColor(245, 250, 255);
  doc.roundedRect(40, 155, 130, 80, 5, 5, 'F');
  
  doc.setFontSize(11);
  doc.text(`Total Entries: ${filteredEntries.length}`, 50, 170);
  
  if (stats) {
    // Draw colored circle for most frequent mood
    const moodColor = getMoodColor(stats.mostFrequentMood);
    doc.setFillColor(hexToRgb(moodColor).r, hexToRgb(moodColor).g, hexToRgb(moodColor).b);
    doc.circle(45, 180, 3, 'F');
    
    doc.text(`Most Frequent Mood: ${stats.mostFrequentMood}`, 50, 180);
    
    // Draw trend arrow
    if (stats.moodTrend === 'improving') {
      doc.setFillColor(76, 175, 80); // Green
      drawUpArrow(doc, 45, 190, 3);
    } else if (stats.moodTrend === 'declining') {
      doc.setFillColor(244, 67, 54); // Red
      drawDownArrow(doc, 45, 190, 3);
    } else {
      doc.setFillColor(255, 193, 7); // Amber
      drawSideArrow(doc, 45, 190, 3);
    }
    
    doc.text(`Mood Trend: ${stats.moodTrend.charAt(0).toUpperCase() + stats.moodTrend.slice(1)}`, 50, 190);
    
    const averageMoodValue = Object.values(stats.moodCountByType).reduce((acc, count, index) => {
      return acc + (count * index);
    }, 0) / filteredEntries.length;
    
    // Draw average mood indicator
    const avgMoodColor = getColorForMoodValue(averageMoodValue);
    doc.setFillColor(hexToRgb(avgMoodColor).r, hexToRgb(avgMoodColor).g, hexToRgb(avgMoodColor).b);
    doc.circle(45, 200, 3, 'F');
    
    doc.text(`Average Mood: ${averageMoodValue.toFixed(2)} / 4.00`, 50, 200);
    
    // Add time period info
    const dayCount = differenceInDays(endDate, startDate) + 1;
    doc.text(`Time Period: ${dayCount} days`, 50, 210);
    
    // Add entry frequency
    const entriesPerDay = (filteredEntries.length / dayCount).toFixed(1);
    doc.text(`Entry Frequency: ${entriesPerDay} entries per day`, 50, 220);
  }
  
  // Add page footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Pro Mood Tracker - Detailed Analysis Report', 105, 285, { align: 'center' });
  
  // ===== SUMMARY PAGE =====
  doc.addPage();
  
  // Add page header
  addPageHeader(doc, "Mood Summary", 1);
  
  // Add mood distribution chart
  if (filteredEntries.length > 0) {
    const distribution = createMoodDistributionData(filteredEntries);
    const moodColors: Record<string, string> = {
      'Very Good': '#4CAF50',
      'Good': '#8BC34A',
      'Okay': '#FFC107',
      'Bad': '#FF9800',
      'Very Bad': '#F44336'
    };
    
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text("Mood Distribution", 20, 50);
    
    // Add legend for mood colors
    doc.setFontSize(8);
    Object.entries(moodColors).forEach(([mood, color], index) => {
      const x = 20 + (index * 35);
      doc.setFillColor(hexToRgb(color).r, hexToRgb(color).g, hexToRgb(color).b);
      doc.rect(x, 55, 8, 8, 'F');
      doc.text(mood, x + 10, 61);
    });
    
    drawBarChart(doc, distribution, 20, 75, 160, 60, moodColors);
  }
  
  // Add time of day distribution chart
  if (filteredEntries.length > 0) {
    const timeDistribution = createTimeOfDayData(filteredEntries);
    const timeColors: Record<string, string> = {
      'morning': '#FFD54F',
      'afternoon': '#FFA726',
      'evening': '#5C6BC0',
      'night': '#303F9F',
      'full-day': '#90A4AE'
    };
    
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text("Time of Day Distribution", 20, 150);
    
    // Add legend for time of day colors
    doc.setFontSize(8);
    const timeLabels = {
      'morning': 'Morning',
      'afternoon': 'Afternoon',
      'evening': 'Evening',
      'night': 'Night',
      'full-day': 'Full Day'
    };
    
    Object.entries(timeColors).forEach(([time, color], index) => {
      const x = 20 + (index * 35);
      doc.setFillColor(hexToRgb(color).r, hexToRgb(color).g, hexToRgb(color).b);
      doc.rect(x, 155, 8, 8, 'F');
      doc.text(timeLabels[time as keyof typeof timeLabels], x + 10, 161);
    });
    
    drawBarChart(doc, timeDistribution, 20, 175, 160, 50, timeColors);
  }
  
  // Add day of week radar chart
  if (filteredEntries.length > 0) {
    // Calculate average mood by day of week
    const averageMoodByDay = calculateAverageMoodByDayOfWeek(filteredEntries);
    
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text("Mood by Day of Week", 20, 240);
    drawRadarChart(doc, averageMoodByDay, 100, 265, 40, "");
  }
  
  // ===== TRENDS PAGE =====
  doc.addPage();
  
  // Add page header
  addPageHeader(doc, "Mood Trends", 2);
  
  // Add mood over time chart
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text("Daily Mood Variations", 20, 50);
  
  // Add legend for mood values
  doc.setFontSize(8);
  const moodLabels = ['Very Bad', 'Bad', 'Okay', 'Good', 'Very Good'];
  moodLabels.forEach((label, index) => {
    const y = 55 + (index * 8);
    doc.setFillColor(hexToRgb(getMoodColor(label)).r, hexToRgb(getMoodColor(label)).g, hexToRgb(getMoodColor(label)).b);
    doc.circle(25, y, 3, 'F');
    doc.text(`${index} - ${label}`, 30, y + 2);
  });
  
  drawLineChart(doc, filteredEntries, 20, 100, 170, 80);
  
  // Add custom category analysis if applicable
  const customCategories = createCustomCategoryData(filteredEntries);
  if (Object.keys(customCategories).length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text("Custom Categories Analysis", 20, 195);
    drawBarChart(doc, customCategories, 20, 210, 170, 60);
  }
  
  // ===== WEATHER PAGE =====
  const entriesWithWeather = filteredEntries.filter(entry => entry.weather?.condition);
  if (entriesWithWeather.length > 0) {
    doc.addPage();
    
    // Add page header
    addPageHeader(doc, "Weather Analysis", 3);
    
    // Weather conditions distribution
    const weatherConditions = createWeatherConditionData(filteredEntries);
    
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text("Weather Conditions Distribution", 20, 50);
    drawBarChart(doc, weatherConditions, 20, 65, 170, 60);
    
    // Calculate and display mood correlations with weather
    const weatherCorrelations = calculateWeatherCorrelations(filteredEntries);
    
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text("Average Mood by Weather Condition", 20, 140);
    drawWeatherCorrelationChart(doc, weatherCorrelations, 20, 155, 170, 80);
    
    // Add text explaining the correlations
    doc.setFontSize(10);
    doc.text("Weather Impact Analysis:", 20, 250);
    
    // Sort conditions by mood impact
    const sortedConditions = Object.entries(weatherCorrelations)
      .sort(([, a], [, b]) => b.average - a.average);
    
    // Display top positive and negative correlations
    let yPos = 260;
    doc.setFontSize(9);
    
    if (sortedConditions.length > 0) {
      doc.text(`Highest mood during ${sortedConditions[0][0]} weather (${getMoodLabel(sortedConditions[0][1].average)})`, 30, yPos);
      yPos += 10;
      
      if (sortedConditions.length > 1) {
        doc.text(`Lowest mood during ${sortedConditions[sortedConditions.length - 1][0]} weather (${getMoodLabel(sortedConditions[sortedConditions.length - 1][1].average)})`, 30, yPos);
      }
    }
  }
  
  // ===== ENTRIES PAGE =====
  doc.addPage();
  
  // Add page header
  addPageHeader(doc, "Detailed Entries", entriesWithWeather.length > 0 ? 4 : 3);
  
  // Add table of entries
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text("Your Mood Entries", 20, 50);
  
  // Table headers
  doc.setFillColor(230, 240, 255);
  doc.rect(20, 55, 170, 10, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text("Date", 25, 62);
  doc.text("Time", 60, 62);
  doc.text("Mood", 85, 62);
  doc.text("Weather", 115, 62);
  doc.text("Notes", 150, 62);
  
  // Table rows
  let yPos = 65;
  const entriesPerPage = 20;
  const sortedEntries = [...filteredEntries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // First page of entries
  const firstPageEntries = sortedEntries.slice(0, entriesPerPage);
  drawEntriesTable(doc, firstPageEntries, yPos);
  
  // Additional pages for entries if needed
  if (sortedEntries.length > entriesPerPage) {
    const remainingEntries = sortedEntries.slice(entriesPerPage);
    const chunks = chunkArray(remainingEntries, entriesPerPage);
    
    chunks.forEach((chunk, index) => {
      doc.addPage();
      addPageHeader(doc, "Detailed Entries (Continued)", entriesWithWeather.length > 0 ? 5 + index : 4 + index);
      
      // Table headers
      doc.setFillColor(230, 240, 255);
      doc.rect(20, 55, 170, 10, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      doc.text("Date", 25, 62);
      doc.text("Time", 60, 62);
      doc.text("Mood", 85, 62);
      doc.text("Weather", 115, 62);
      doc.text("Notes", 150, 62);
      
      drawEntriesTable(doc, chunk, 65);
    });
  }
  
  // ===== NOTES PAGE =====
  // Add a page for entries with longer notes
  const entriesWithLongNotes = filteredEntries.filter(entry => entry.notes.length > 30);
  if (entriesWithLongNotes.length > 0) {
    doc.addPage();
    
    const pageNumber = entriesWithWeather.length > 0 ? 
      5 + Math.ceil((sortedEntries.length - entriesPerPage) / entriesPerPage) : 
      4 + Math.ceil((sortedEntries.length - entriesPerPage) / entriesPerPage);
    
    addPageHeader(doc, "Detailed Notes", pageNumber);
    
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text("Your Detailed Notes", 20, 50);
    
    let noteYPos = 60;
    entriesWithLongNotes.forEach((entry, index) => {
      // Check if we need a new page
      if (noteYPos > 250) {
        doc.addPage();
        addPageHeader(doc, "Detailed Notes (Continued)", pageNumber + 1);
        noteYPos = 50;
      }
      
      // Entry header
      doc.setFontSize(10);
      doc.setTextColor(41, 128, 185);
      doc.text(`${format(parseISO(entry.date), 'MMMM d, yyyy')} - ${entry.timeOfDay} - ${entry.mood}`, 20, noteYPos);
      
      // Entry notes
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      
      // Split long notes into multiple lines
      const maxWidth = 170;
      const lines = doc.splitTextToSize(entry.notes, maxWidth);
      doc.text(lines, 20, noteYPos + 8);
      
      // Update position for next entry
      noteYPos += 10 + (lines.length * 5) + 10;
      
      // Add a divider
      if (index < entriesWithLongNotes.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.line(20, noteYPos - 5, 190, noteYPos - 5);
      }
    });
  }
  
  // Add footer on all pages
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(150);
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Pro Mood Tracker Report - Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }
  
  return doc;
};

// Helper function to add a page header
const addPageHeader = (doc: jsPDF, title: string, pageNumber: number) => {
  // Add header background
  doc.setFillColor(230, 240, 255);
  doc.rect(0, 0, 210, 30, 'F');
  
  // Add title
  doc.setFontSize(16);
  doc.setTextColor(41, 128, 185);
  doc.text(title, 105, 20, { align: 'center' });
};

// Helper function to draw entries table
const drawEntriesTable = (doc: jsPDF, entries: MoodEntry[], startY: number) => {
  let yPos = startY;
  
  entries.forEach((entry, index) => {
    // Alternating row colors
    if (index % 2 === 0) {
      doc.setFillColor(245, 250, 255);
      doc.rect(20, yPos, 170, 10, 'F');
    }
    
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    
    // Date
    doc.text(format(parseISO(entry.date), 'MMM d, yyyy'), 25, yPos + 7);
    
    // Time of day
    doc.text(entry.timeOfDay.charAt(0).toUpperCase() + entry.timeOfDay.slice(1), 60, yPos + 7);
    
    // Mood with color
    const moodColor = getMoodColor(entry.mood);
    doc.setFillColor(hexToRgb(moodColor).r, hexToRgb(moodColor).g, hexToRgb(moodColor).b);
    doc.circle(82, yPos + 5, 3, 'F');
    doc.text(entry.mood, 85, yPos + 7);
    
    // Weather
    if (entry.weather?.condition) {
      doc.text(entry.weather.condition, 115, yPos + 7);
    } else {
      doc.text("-", 115, yPos + 7);
    }
    
    // Notes (truncated)
    const truncatedNotes = entry.notes.length > 30 ? 
      entry.notes.substring(0, 30) + "..." : 
      entry.notes;
    doc.text(truncatedNotes || "-", 150, yPos + 7);
    
    yPos += 10;
  });
};

// Helper function to get mood color
const getMoodColor = (mood: string): string => {
  const moodColors: Record<string, string> = {
    'Very Good': '#4CAF50',
    'Good': '#8BC34A',
    'Okay': '#FFC107',
    'Bad': '#FF9800',
    'Very Bad': '#F44336'
  };
  
  return moodColors[mood] || '#9E9E9E';
};

// Helper function to get color for mood value
const getColorForMoodValue = (value: number): string => {
  if (value >= 3.5) return '#4CAF50'; // Very Good
  if (value >= 2.5) return '#8BC34A'; // Good
  if (value >= 1.5) return '#FFC107'; // Okay
  if (value >= 0.5) return '#FF9800'; // Bad
  return '#F44336'; // Very Bad
};

// Helper function to convert hex to rgb
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// Helper function to draw up arrow
const drawUpArrow = (doc: jsPDF, x: number, y: number, size: number) => {
  doc.triangle(x - size, y + size, x, y - size, x + size, y + size, 'F');
};

// Helper function to draw down arrow
const drawDownArrow = (doc: jsPDF, x: number, y: number, size: number) => {
  doc.triangle(x - size, y - size, x, y + size, x + size, y - size, 'F');
};

// Helper function to draw side arrow
const drawSideArrow = (doc: jsPDF, x: number, y: number, size: number) => {
  doc.line(x - size, y, x + size, y);
  doc.line(x - size, y - size, x - size, y + size);
  doc.line(x + size, y - size, x + size, y + size);
};

// Helper function to chunk array
const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Generate and download a monthly mood report PDF
 */
export const downloadMonthlyReport = (
  entries: MoodEntry[],
  stats: MoodStats | null,
  month: Date,
  userName: string = 'User'
): void => {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const monthName = format(month, 'MMMM yyyy');
  
  const doc = generateMoodReport(entries, stats, start, end, userName);
  doc.save(`Mood_Report_${monthName}.pdf`);
};

/**
 * Generate and download a comparison report for two months
 */
export const downloadComparisonReport = (
  entries: MoodEntry[],
  stats: MoodStats | null,
  month1: Date,
  month2: Date,
  userName: string = 'User'
): void => {
  const doc = new jsPDF();
  
  // Create title
  doc.setFontSize(20);
  doc.setTextColor(41, 128, 185);
  doc.text("Mood Comparison Report", 105, 20, { align: 'center' });
  
  // Add subtitle with period
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Comparing ${format(month1, 'MMMM yyyy')} vs ${format(month2, 'MMMM yyyy')}`, 
    105, 
    30, 
    { align: 'center' }
  );
  
  // Add user info
  doc.setFontSize(10);
  doc.text(`Generated for: ${userName}`, 20, 40);
  doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy, h:mm a')}`, 20, 45);
  
  // Filter entries for the two months
  const month1Start = startOfMonth(month1);
  const month1End = endOfMonth(month1);
  const month1Entries = entries.filter(entry => {
    const entryDate = parseISO(entry.date);
    return entryDate >= month1Start && entryDate <= month1End;
  });
  
  const month2Start = startOfMonth(month2);
  const month2End = endOfMonth(month2);
  const month2Entries = entries.filter(entry => {
    const entryDate = parseISO(entry.date);
    return entryDate >= month2Start && entryDate <= month2End;
  });
  
  // Add comparison data
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Comparison Summary", 20, 60);
  
  doc.setFontSize(10);
  doc.text(`Entries in ${format(month1, 'MMMM')}: ${month1Entries.length}`, 20, 70);
  doc.text(`Entries in ${format(month2, 'MMMM')}: ${month2Entries.length}`, 20, 75);
  
  // Calculate mood distributions
  const month1Distribution = createMoodDistributionData(month1Entries);
  const month2Distribution = createMoodDistributionData(month2Entries);
  
  // Create a comparison chart
  doc.setFontSize(14);
  doc.text("Mood Distribution Comparison", 20, 90);
  
  // Convert to arrays for side-by-side comparison
  const moodTypes: MoodType[] = ['Very Good', 'Good', 'Okay', 'Bad', 'Very Bad'];
  const month1Data = moodTypes.map(mood => month1Distribution[mood]);
  const month2Data = moodTypes.map(mood => month2Distribution[mood]);
  
  // Draw side-by-side bar chart
  drawSideBySideBarChart(
    doc, 
    moodTypes, 
    [
      { name: format(month1, 'MMMM'), values: month1Data, color: '#4CAF50' },
      { name: format(month2, 'MMMM'), values: month2Data, color: '#2196F3' }
    ],
    20, 
    100, 
    170, 
    80
  );
  
  // Draw mood trend charts
  doc.setFontSize(14);
  doc.text(`${format(month1, 'MMMM')} Mood Trend`, 20, 195);
  drawLineChart(doc, month1Entries, 20, 205, 170, 50);
  
  doc.text(`${format(month2, 'MMMM')} Mood Trend`, 20, 270);
  drawLineChart(doc, month2Entries, 20, 280, 170, 50);
  
  // Add footer on all pages
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(150);
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Pro Mood Tracker Report - Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
  }
  
  doc.save(`Mood_Comparison_${format(month1, 'MMM')}_vs_${format(month2, 'MMM')}.pdf`);
};

// Helper function to draw side-by-side bar chart
const drawSideBySideBarChart = (
  doc: jsPDF,
  categories: string[],
  datasets: { name: string; values: number[]; color: string }[],
  x: number,
  y: number,
  width: number = 170,
  height: number = 80
) => {
  // Find maximum value for scaling
  const allValues = datasets.flatMap(dataset => dataset.values);
  const maxValue = Math.max(...allValues, 1);
  
  // Calculate bar dimensions
  const categoryWidth = width / categories.length;
  const barWidth = categoryWidth / (datasets.length + 1);
  
  // Draw axis
  doc.setDrawColor(200, 200, 200);
  doc.line(x, y, x, y + height); // Y axis
  doc.line(x, y + height, x + width, y + height); // X axis
  
  // Draw categories
  doc.setFontSize(8);
  categories.forEach((category, i) => {
    const categoryX = x + (i * categoryWidth) + (categoryWidth / 2);
    doc.text(category, categoryX, y + height + 10, { align: 'center' });
  });
  
  // Draw legend
  doc.setFontSize(8);
  datasets.forEach((dataset, i) => {
    const legendX = x + 60 + (i * 50);
    const legendY = y - 10;
    
    // Draw color box
    doc.setFillColor(dataset.color);
    doc.rect(legendX, legendY - 5, 8, 8, 'F');
    
    // Draw label
    doc.text(dataset.name, legendX + 12, legendY);
  });
  
  // Draw bars
  datasets.forEach((dataset, datasetIndex) => {
    dataset.values.forEach((value, categoryIndex) => {
      // Calculate bar height
      const barHeight = (value / maxValue) * height;
      
      // Calculate position
      const barX = x + (categoryIndex * categoryWidth) + (barWidth * datasetIndex) + barWidth;
      const barY = y + height - barHeight;
      
      // Draw bar
      doc.setFillColor(dataset.color);
      doc.rect(barX, barY, barWidth * 0.8, barHeight, 'F');
      
      // Draw value
      if (value > 0) {
        doc.setFontSize(6);
        doc.setTextColor(0);
        doc.text(value.toString(), barX + (barWidth * 0.4), barY - 2, { align: 'center' });
      }
    });
  });
};

// Helper function to get mood label from value
const getMoodLabel = (value: number): string => {
  if (value >= 3.5) return 'Very Good';
  if (value >= 2.5) return 'Good';
  if (value >= 1.5) return 'Okay';
  if (value >= 0.5) return 'Bad';
  return 'Very Bad';
}; 