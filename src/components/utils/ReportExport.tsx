import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography,
  Divider,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SelectChangeEvent,
  Alert,
  CircularProgress,
  Stack,
  useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isAfter } from 'date-fns';
import { useMood } from '../../context/MoodContext';
import { useAuth } from '../../context/AuthContext';
import { downloadMonthlyReport, downloadComparisonReport } from '../../services/reportService';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InsightsIcon from '@mui/icons-material/Insights';

const ReportExport: React.FC = () => {
  const [reportType, setReportType] = useState<'monthly' | 'comparison'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(new Date()));
  const [comparisonMonth1, setComparisonMonth1] = useState<Date>(startOfMonth(subMonths(new Date(), 1)));
  const [comparisonMonth2, setComparisonMonth2] = useState<Date>(startOfMonth(new Date()));
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  
  const { moodEntries, moodStats } = useMood();
  const { currentUser } = useAuth();
  const theme = useTheme();
  
  const handleReportTypeChange = (event: SelectChangeEvent) => {
    setReportType(event.target.value as 'monthly' | 'comparison');
  };
  
  const validateDates = (): boolean => {
    if (reportType === 'comparison' && isAfter(comparisonMonth1, comparisonMonth2)) {
      setError('The first month should be before or the same as the second month.');
      return false;
    }
    return true;
  };
  
  const handleGenerateReport = async () => {
    if (!validateDates()) {
      return;
    }
    
    try {
      setGenerating(true);
      setError('');
      
      // Small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (reportType === 'monthly') {
        downloadMonthlyReport(
          moodEntries, 
          moodStats, 
          selectedMonth,
          currentUser?.username || 'User'
        );
        setSuccess(`Monthly report for ${format(selectedMonth, 'MMMM yyyy')} downloaded successfully.`);
      } else {
        downloadComparisonReport(
          moodEntries,
          moodStats,
          comparisonMonth1,
          comparisonMonth2,
          currentUser?.username || 'User'
        );
        setSuccess(`Comparison report for ${format(comparisonMonth1, 'MMMM yyyy')} vs ${format(comparisonMonth2, 'MMMM yyyy')} downloaded successfully.`);
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };
  
  const openPreview = () => {
    if (!validateDates()) {
      return;
    }
    setOpenPreviewDialog(true);
  };
  
  const getPreviewContent = () => {
    return (
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Your report will include:
        </Typography>
        
        <Box sx={{ pl: 2 }}>
          <Typography variant="body2" paragraph>
            <strong>• Summary Statistics</strong>
            <br />
            Total entries, most frequent mood, and overall trend
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>• Visualizations</strong>
            <br />
            Mood distribution chart, time of day analysis, and mood trend over time
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>• Detailed Entries</strong>
            <br />
            A table with all your mood entries for the selected time period
          </Typography>
          
          {reportType === 'comparison' && (
            <Typography variant="body2" paragraph>
              <strong>• Comparison Analysis</strong>
              <br />
              Side-by-side charts comparing mood patterns between the two selected months
            </Typography>
          )}
        </Box>
        
        <Box 
          sx={{ 
            mt: 2, 
            p: 2, 
            border: '1px dashed', 
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'action.hover'
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <PictureAsPdfIcon color="error" />
            <Typography variant="caption">
              Reports are generated as PDF files and will open in a new tab or download automatically depending on your browser settings.
            </Typography>
          </Stack>
        </Box>
      </Box>
    );
  };
  
  return (
    <Card elevation={3} sx={{ mb: 4 }}>
      <CardHeader 
        title="Export Reports" 
        avatar={<InsightsIcon color="primary" />}
      />
      
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Export your mood data as a detailed PDF report with visualizations and insights.
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="report-type-label">Report Type</InputLabel>
              <Select
                labelId="report-type-label"
                id="report-type"
                value={reportType}
                label="Report Type"
                onChange={handleReportTypeChange}
                disabled={generating}
              >
                <MenuItem value="monthly">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarMonthIcon sx={{ mr: 1 }} />
                    Monthly Report
                  </Box>
                </MenuItem>
                <MenuItem value="comparison">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CompareArrowsIcon sx={{ mr: 1 }} />
                    Comparison Report
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              {reportType === 'monthly' ? (
                <DatePicker
                  label="Select Month"
                  views={['month', 'year']}
                  value={selectedMonth}
                  onChange={(newValue) => newValue && setSelectedMonth(startOfMonth(newValue))}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      disabled: generating
                    } 
                  }}
                />
              ) : (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <DatePicker
                    label="First Month"
                    views={['month', 'year']}
                    value={comparisonMonth1}
                    onChange={(newValue) => newValue && setComparisonMonth1(startOfMonth(newValue))}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true,
                        disabled: generating
                      } 
                    }}
                  />
                  <DatePicker
                    label="Second Month"
                    views={['month', 'year']}
                    value={comparisonMonth2}
                    onChange={(newValue) => newValue && setComparisonMonth2(startOfMonth(newValue))}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true,
                        disabled: generating
                      } 
                    }}
                  />
                </Box>
              )}
            </LocalizationProvider>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={openPreview}
            disabled={generating}
          >
            Preview Report Content
          </Button>
          
          <Button
            variant="contained"
            startIcon={generating ? <CircularProgress size={20} /> : <DownloadIcon />}
            onClick={handleGenerateReport}
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate Report'}
          </Button>
        </Box>
      </CardContent>
      
      <Dialog 
        open={openPreviewDialog} 
        onClose={() => setOpenPreviewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Report Preview</DialogTitle>
        <DialogContent>
          {getPreviewContent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreviewDialog(false)}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={() => {
              setOpenPreviewDialog(false);
              handleGenerateReport();
            }}
          >
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ReportExport; 