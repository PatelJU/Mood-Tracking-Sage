import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Divider,
  Stack,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Slider,
  Paper,
  useTheme
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DateRangeIcon from '@mui/icons-material/DateRange';
import BarChartIcon from '@mui/icons-material/BarChart';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useMood } from '../../context/MoodContext';

// Mock function for PDF generation (would need actual implementation with jsPDF)
// This is a placeholder - the full implementation would require more complex
// code to render charts and format data for the PDF
const generatePDF = async (
  moodData: any[], 
  options: PdfOptions, 
  fileName: string = 'mood-report.pdf'
) => {
  // Create a new PDF instance
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Set default font
  doc.setFont('helvetica');
  
  // Add title and date
  doc.setFontSize(22);
  doc.setTextColor(33, 33, 33);
  doc.text('Mood Tracker Report', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  const today = format(new Date(), 'MMMM d, yyyy');
  doc.text(`Generated on ${today}`, 105, 30, { align: 'center' });
  
  // Add date range
  doc.setFontSize(14);
  doc.setTextColor(33, 33, 33);
  doc.text(`Report Period: ${format(options.dateRange.start, 'MMM d, yyyy')} - ${format(options.dateRange.end, 'MMM d, yyyy')}`, 105, 40, { align: 'center' });
  
  // Add divider
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 45, 190, 45);
  
  let yPosition = 55;
  
  // Summary section
  if (options.includeSummary) {
    doc.setFontSize(18);
    doc.setTextColor(66, 66, 66);
    doc.text("Summary", 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    
    // Calculate summary statistics
    const totalEntries = moodData.length;
    let moodCounts: Record<string, number> = {
      'Very Good': 0,
      'Good': 0,
      'Okay': 0,
      'Bad': 0,
      'Very Bad': 0
    };
    
    moodData.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    
    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0];
    
    doc.text(`Total entries: ${totalEntries}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Most frequent mood: ${dominantMood}`, 20, yPosition);
    yPosition += 7;
    
    // Mood distribution
    doc.text('Mood distribution:', 20, yPosition);
    yPosition += 7;
    
    Object.entries(moodCounts).forEach(([mood, count]) => {
      const percentage = totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0;
      doc.text(`- ${mood}: ${count} entries (${percentage}%)`, 25, yPosition);
      yPosition += 6;
    });
    
    yPosition += 5;
  }
  
  // Monthly comparison if selected
  if (options.includeMonthlyComparison && options.dateRange.end.getTime() - options.dateRange.start.getTime() >= 50 * 24 * 60 * 60 * 1000) {
    doc.setFontSize(18);
    doc.setTextColor(66, 66, 66);
    doc.text("Monthly Comparison", 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text("Monthly trends will be visualized in the final PDF.", 20, yPosition);
    yPosition += 20;
    
    // In a real implementation, this is where you would:
    // 1. Group data by month
    // 2. Calculate averages/trends
    // 3. Draw charts using jsPDF's drawing capabilities or import images
  }
  
  // Journal entries if selected
  if (options.includeJournalEntries) {
    doc.setFontSize(18);
    doc.setTextColor(66, 66, 66);
    doc.text("Journal Entries", 20, yPosition);
    yPosition += 10;
    
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // In a real implementation, filter entries with journal content
    const entriesWithJournal = moodData.filter(entry => entry.journal && entry.journal.trim().length > 0);
    
    if (entriesWithJournal.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text("No journal entries found for this period.", 20, yPosition);
      yPosition += 10;
    } else {
      // Display journal entries (limited to a few for this mock)
      const limitedEntries = entriesWithJournal.slice(0, Math.min(5, entriesWithJournal.length));
      
      limitedEntries.forEach(entry => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(50, 50, 50);
        doc.text(`${format(new Date(entry.date), 'MMMM d, yyyy')} - ${entry.mood}`, 20, yPosition);
        yPosition += 7;
        
        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);
        
        // Format journal text to fit PDF width
        const maxWidth = 170;
        const lines = doc.splitTextToSize(entry.journal || '', maxWidth);
        
        lines.forEach((line: string) => {
          doc.text(line, 20, yPosition);
          yPosition += 6;
        });
        
        // Add space after entry
        yPosition += 5;
        doc.setDrawColor(220, 220, 220);
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 8;
      });
      
      if (entriesWithJournal.length > 5) {
        doc.text(`... and ${entriesWithJournal.length - 5} more entries not shown.`, 20, yPosition);
        yPosition += 10;
      }
    }
  }
  
  // Mood trends chart placeholder
  if (options.includeMoodChart) {
    // Check if we need a new page
    if (yPosition > 180) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(18);
    doc.setTextColor(66, 66, 66);
    doc.text("Mood Trends", 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text("Mood trends chart will be rendered in the final PDF.", 20, yPosition);
    yPosition += 60; // Reserve space for chart
  }
  
  // Add footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
    doc.text('Mood Tracker App - Generated Report', 105, 292, { align: 'center' });
  }
  
  // Save the PDF
  doc.save(fileName);
  
  return true;
};

// PDF Options interface
interface PdfOptions {
  dateRange: {
    start: Date;
    end: Date;
  };
  includeSummary: boolean;
  includeMoodChart: boolean;
  includeJournalEntries: boolean;
  includeMonthlyComparison: boolean;
}

// Default options
const defaultOptions: PdfOptions = {
  dateRange: {
    start: subMonths(new Date(), 1),
    end: new Date()
  },
  includeSummary: true,
  includeMoodChart: true,
  includeJournalEntries: true,
  includeMonthlyComparison: true
};

interface DateRangeOption {
  label: string;
  getValue: () => { start: Date; end: Date };
}

// Date range presets
const dateRangeOptions: DateRangeOption[] = [
  {
    label: 'Last 7 days',
    getValue: () => ({
      start: subDays(new Date(), 7),
      end: new Date()
    })
  },
  {
    label: 'Last 30 days',
    getValue: () => ({
      start: subDays(new Date(), 30),
      end: new Date()
    })
  },
  {
    label: 'This month',
    getValue: () => ({
      start: startOfMonth(new Date()),
      end: new Date()
    })
  },
  {
    label: 'Last month',
    getValue: () => ({
      start: startOfMonth(subMonths(new Date(), 1)),
      end: endOfMonth(subMonths(new Date(), 1))
    })
  },
  {
    label: 'Last 3 months',
    getValue: () => ({
      start: subMonths(new Date(), 3),
      end: new Date()
    })
  },
  {
    label: 'All time',
    getValue: () => ({
      start: new Date(2020, 0, 1), // arbitrary past date
      end: new Date()
    })
  }
];

const MoodPdfExport: React.FC = () => {
  const theme = useTheme();
  const { moodEntries } = useMood();
  const [options, setOptions] = useState<PdfOptions>(defaultOptions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState(1); // Default to "Last 30 days"
  
  // Handle opening the options dialog
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };
  
  // Handle closing the options dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  
  // Handle changing the date range
  const handleDateRangeChange = (index: number) => {
    setSelectedDateRange(index);
    setOptions(prev => ({
      ...prev,
      dateRange: dateRangeOptions[index].getValue()
    }));
  };
  
  // Handle toggle options
  const handleToggleOption = (option: keyof Omit<PdfOptions, 'dateRange'>) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
  
  // Generate PDF with selected options
  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    
    try {
      // Filter entries by date range
      const filteredEntries = moodEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= options.dateRange.start && entryDate <= options.dateRange.end;
      });
      
      // Generate the filename with date range
      const startFormatted = format(options.dateRange.start, 'yyyy-MM-dd');
      const endFormatted = format(options.dateRange.end, 'yyyy-MM-dd');
      const fileName = `mood-report-${startFormatted}-to-${endFormatted}.pdf`;
      
      // Generate and download the PDF
      await generatePDF(filteredEntries, options, fileName);
      
      // Close dialog after successful generation
      handleCloseDialog();
    } catch (error) {
      console.error("Error generating PDF:", error);
      // In a real app, you would show an error message to the user
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Box>
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PictureAsPdfIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              Export Your Mood Data
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Download a comprehensive PDF report of your mood data with charts, trends, and insights.
            Customize what information to include and the time period.
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleOpenDialog}
            fullWidth
            sx={{ mt: 2 }}
          >
            Create PDF Report
          </Button>
        </CardContent>
      </Card>
      
      {/* PDF Options Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={isGenerating ? undefined : handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PictureAsPdfIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">PDF Report Options</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <DateRangeIcon sx={{ mr: 1, color: 'primary.main' }} />
              Date Range
            </Typography>
            
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
              {dateRangeOptions.map((option, index) => (
                <Chip
                  key={option.label}
                  label={option.label}
                  onClick={() => handleDateRangeChange(index)}
                  variant={selectedDateRange === index ? "filled" : "outlined"}
                  color={selectedDateRange === index ? "primary" : "default"}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
            
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Selected period: <strong>
                  {format(options.dateRange.start, 'MMMM d, yyyy')} - {format(options.dateRange.end, 'MMMM d, yyyy')}
                </strong>
              </Typography>
              
              {moodEntries.filter(entry => {
                const entryDate = new Date(entry.date);
                return entryDate >= options.dateRange.start && entryDate <= options.dateRange.end;
              }).length === 0 ? (
                <Typography variant="body2" color="error">
                  No mood entries found in this date range. Please select a different period.
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {moodEntries.filter(entry => {
                    const entryDate = new Date(entry.date);
                    return entryDate >= options.dateRange.start && entryDate <= options.dateRange.end;
                  }).length} entries will be included in the report.
                </Typography>
              )}
            </Paper>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box>
            <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <BarChartIcon sx={{ mr: 1, color: 'primary.main' }} />
              Report Content
            </Typography>
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeSummary}
                    onChange={() => handleToggleOption('includeSummary')}
                    color="primary"
                  />
                }
                label="Overall Summary (mood distribution, time period stats)"
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeMoodChart}
                    onChange={() => handleToggleOption('includeMoodChart')}
                    color="primary"
                  />
                }
                label="Mood Trends Chart (visual representation of mood over time)"
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeJournalEntries}
                    onChange={() => handleToggleOption('includeJournalEntries')}
                    color="primary"
                  />
                }
                label="Journal Entries (your mood notes and reflections)"
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeMonthlyComparison}
                    onChange={() => handleToggleOption('includeMonthlyComparison')}
                    color="primary"
                    disabled={options.dateRange.end.getTime() - options.dateRange.start.getTime() < 50 * 24 * 60 * 60 * 1000}
                  />
                }
                label="Monthly Comparison (compare trends between months)"
              />
            </FormGroup>
            
            {options.dateRange.end.getTime() - options.dateRange.start.getTime() < 50 * 24 * 60 * 60 * 1000 && options.includeMonthlyComparison && (
              <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                Monthly comparison requires a date range of at least two months.
              </Typography>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleGeneratePdf}
            disabled={
              isGenerating || 
              moodEntries.filter(entry => {
                const entryDate = new Date(entry.date);
                return entryDate >= options.dateRange.start && entryDate <= options.dateRange.end;
              }).length === 0
            }
            startIcon={isGenerating ? <CircularProgress size={20} /> : <DownloadIcon />}
          >
            {isGenerating ? 'Generating...' : 'Generate PDF'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MoodPdfExport; 