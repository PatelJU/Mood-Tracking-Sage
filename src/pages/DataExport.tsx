import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tab,
  Tabs,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  useTheme,
  SelectChangeEvent,
  Card,
  CardContent,
  CardActionArea,
  Tooltip,
  Fade,
  Popover,
  ListItemIcon,
  ListItemText,
  Badge,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  subMonths, 
  subYears,
  isAfter,
  isBefore
} from 'date-fns';

// Icons
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import CodeIcon from '@mui/icons-material/Code';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TuneIcon from '@mui/icons-material/Tune';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

// Hooks
import { useMood } from '../context/MoodContext';
import { useUser } from '../context/UserContext';

// Services
import { generateMoodReport, downloadMonthlyReport, downloadComparisonReport } from '../services/reportService';
import { moodApi } from '../services/apiService';

// Import our utility functions
import { 
  captureElementAsCanvas, 
  createPdfFromCanvas, 
  exportMultipleElementsToPdf, 
  exportToCsv, 
  exportToJson,
  exportToHtml
} from '../utils/exportUtils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`export-tabpanel-${index}`}
      aria-labelledby={`export-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const DataExport: React.FC = () => {
  const theme = useTheme();
  const { user } = useUser();
  const { moodEntries, moodStats } = useMood();
  
  const [activeTab, setActiveTab] = useState<number>(0);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'json'>('pdf');
  const [timeFrame, setTimeFrame] = useState<'month' | 'year' | 'custom' | 'compare-months' | 'compare-years'>('month');
  
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedYear, setSelectedYear] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date | null>(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  
  // For comparison exports
  const [compareMonth1, setCompareMonth1] = useState<Date>(subMonths(new Date(), 1));
  const [compareMonth2, setCompareMonth2] = useState<Date>(new Date());
  const [compareYear1, setCompareYear1] = useState<Date>(subYears(new Date(), 1));
  const [compareYear2, setCompareYear2] = useState<Date>(new Date());
  
  // For PDF options
  const [includeCharts, setIncludeCharts] = useState<boolean>(true);
  const [includeJournalEntries, setIncludeJournalEntries] = useState<boolean>(true);
  const [includeDetailedAnalysis, setIncludeDetailedAnalysis] = useState<boolean>(true);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Add refs for capturing all visualization components
  const visualizationsRef = useRef<HTMLDivElement>(null);
  const analyticsRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  
  // Add these new state variables for dropdown menu and popover
  const [timeFrameAnchorEl, setTimeFrameAnchorEl] = useState<null | HTMLElement>(null);
  const openTimeFrameMenu = Boolean(timeFrameAnchorEl);
  
  // Add a new state variable to manage export options
  const [showExportOptions, setShowExportOptions] = useState<boolean>(false);
  const [exportOptionsAnchorEl, setExportOptionsAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Reset any form values when changing tabs
    setError('');
    setSuccess('');
  };
  
  const handleFormatChange = (format: 'pdf' | 'csv' | 'json') => {
    setExportFormat(format);
  };
  
  const handleTimeFrameClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setTimeFrameAnchorEl(event.currentTarget);
  };

  const handleTimeFrameClose = () => {
    setTimeFrameAnchorEl(null);
  };

  const handleTimeFrameSelect = (value: 'month' | 'year' | 'custom' | 'compare-months' | 'compare-years') => {
    setTimeFrame(value);
    handleTimeFrameClose();
  };
  
  const validateDates = (): boolean => {
    // Validation for custom date range
    if (timeFrame === 'custom') {
      if (!startDate || !endDate) {
        setError('Please select both start and end dates.');
        return false;
      }
      if (isAfter(startDate, endDate)) {
        setError('Start date must be before end date.');
        return false;
      }
    }
    
    // Validation for month comparison
    if (timeFrame === 'compare-months') {
      if (isAfter(compareMonth1, compareMonth2)) {
        setError('First month should be before or same as the second month.');
        return false;
      }
    }
    
    // Validation for year comparison
    if (timeFrame === 'compare-years') {
      if (isAfter(compareYear1, compareYear2)) {
        setError('First year should be before or same as the second year.');
        return false;
      }
    }
    
    return true;
  };
  
  const getDateRange = () => {
    switch (timeFrame) {
      case 'month':
        return {
          start: startOfMonth(selectedMonth),
          end: endOfMonth(selectedMonth)
        };
      case 'year':
        return {
          start: startOfYear(selectedYear),
          end: endOfYear(selectedYear)
        };
      case 'custom':
        return {
          start: startDate!,
          end: endDate!
        };
      case 'compare-months':
        return {
          start: startOfMonth(compareMonth1),
          end: endOfMonth(compareMonth2)
        };
      case 'compare-years':
        return {
          start: startOfYear(compareYear1),
          end: endOfYear(compareYear2)
        };
      default:
        return {
          start: startOfMonth(new Date()),
          end: endOfMonth(new Date())
        };
    }
  };
  
  const handleExport = async () => {
    // Validate inputs
    if (!validateDates()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const { start, end } = getDateRange();
      
      if (exportFormat === 'pdf') {
        let fileName = '';
        
        if (timeFrame === 'month') {
          fileName = `mood-report-${format(selectedMonth, 'yyyy-MM')}`;
        } else if (timeFrame === 'year') {
          fileName = `mood-yearly-report-${format(selectedYear, 'yyyy')}`;
        } else if (timeFrame === 'compare-months') {
          fileName = `mood-comparison-${format(compareMonth1, 'yyyy-MM')}-vs-${format(compareMonth2, 'yyyy-MM')}`;
        } else if (timeFrame === 'compare-years') {
          fileName = `mood-yearly-comparison-${format(compareYear1, 'yyyy')}-vs-${format(compareYear2, 'yyyy')}`;
        } else {
          fileName = `mood-report-${format(start, 'yyyy-MM-dd')}-to-${format(end, 'yyyy-MM-dd')}`;
        }
        
        // Get all visualization elements from the app
        interface PageToCapture {
          element: HTMLElement | HTMLDivElement;
          title: string;
        }
        
        const pagesToCapture: PageToCapture[] = [];
        
        // Get the main visualizations page
        if (visualizationsRef.current) {
          pagesToCapture.push({
            element: visualizationsRef.current,
            title: 'Mood Visualizations'
          });
        } else {
          // If direct reference isn't available, find element by ID
          const visualizationsElement = document.getElementById('visualizations-container');
          if (visualizationsElement) {
            pagesToCapture.push({
              element: visualizationsElement,
              title: 'Mood Visualizations'
            });
          }
        }
        
        // Get the analytics page
        if (analyticsRef.current) {
          pagesToCapture.push({
            element: analyticsRef.current,
            title: 'Mood Analytics'
          });
        } else {
          const analyticsElement = document.getElementById('analytics-container');
          if (analyticsElement) {
            pagesToCapture.push({
              element: analyticsElement,
              title: 'Mood Analytics'
            });
          }
        }
        
        // Get the history page
        if (historyRef.current) {
          pagesToCapture.push({
            element: historyRef.current,
            title: 'Mood History'
          });
        } else {
          const historyElement = document.getElementById('history-container');
          if (historyElement) {
            pagesToCapture.push({
              element: historyElement,
              title: 'Mood History'
            });
          }
        }
        
        // Check if we have any pages to capture
        if (pagesToCapture.length === 0) {
          // If we don't have specific refs, try to export from report service
          if (timeFrame === 'month') {
            downloadMonthlyReport(
              moodEntries,
              moodStats,
              selectedMonth,
              user?.username || 'User'
            );
          } 
          else if (timeFrame === 'compare-months') {
            await downloadComparisonReport(
              moodEntries,
              moodStats,
              compareMonth1,
              compareMonth2,
              user?.username || 'User'
            );
          }
          else {
            // Generate PDF with custom date range
            const doc = generateMoodReport(
              moodEntries,
              moodStats,
              start,
              end,
              user?.username || 'User'
            );
            doc.save(`${fileName}.pdf`);
          }
        } else {
          // Use our new utility to export multiple elements to PDF
          const title = `Mood Tracker Report - ${format(start, 'MMMM d, yyyy')} to ${format(end, 'MMMM d, yyyy')}`;
          
          await exportMultipleElementsToPdf(
            pagesToCapture,
            fileName,
            {
              mainTitle: title,
              orientation: 'portrait',
              format: 'a4',
              oneChartPerPage: true,
              headerColor: theme.palette.primary.contrastText,
              headerBackgroundColor: theme.palette.primary.main,
              userName: user?.username || 'User',
              companyName: 'Pro Mood Tracker',
              includeSummary: includeDetailedAnalysis
            }
          );
        }
        
        setSuccess(`PDF report "${fileName}.pdf" has been generated and downloaded.`);
      } 
      else if (exportFormat === 'csv') {
        // Export as CSV
        const filteredEntries = moodEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= start && entryDate <= end;
        });
        
        let fileName = '';
        if (timeFrame === 'month') {
          fileName = `mood-data-${format(selectedMonth, 'yyyy-MM')}`;
        } else if (timeFrame === 'year') {
          fileName = `mood-data-${format(selectedYear, 'yyyy')}`;
        } else if (timeFrame === 'compare-months') {
          fileName = `mood-data-${format(compareMonth1, 'yyyy-MM')}-vs-${format(compareMonth2, 'yyyy-MM')}`;
        } else if (timeFrame === 'compare-years') {
          fileName = `mood-data-${format(compareYear1, 'yyyy')}-vs-${format(compareYear2, 'yyyy')}`;
        } else {
          fileName = `mood-data-${format(start, 'yyyy-MM-dd')}-to-${format(end, 'yyyy-MM-dd')}`;
        }
        
        exportToCsv(filteredEntries, fileName);
        
        setSuccess(`Your mood data has been exported as CSV.`);
      } 
      else if (exportFormat === 'json') {
        // Export as JSON
        const filteredEntries = moodEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= start && entryDate <= end;
        });
        
        let fileName = '';
        if (timeFrame === 'month') {
          fileName = `mood-data-${format(selectedMonth, 'yyyy-MM')}`;
        } else if (timeFrame === 'year') {
          fileName = `mood-data-${format(selectedYear, 'yyyy')}`;
        } else if (timeFrame === 'compare-months') {
          fileName = `mood-data-${format(compareMonth1, 'yyyy-MM')}-vs-${format(compareMonth2, 'yyyy-MM')}`;
        } else if (timeFrame === 'compare-years') {
          fileName = `mood-data-${format(compareYear1, 'yyyy')}-vs-${format(compareYear2, 'yyyy')}`;
        } else {
          fileName = `mood-data-${format(start, 'yyyy-MM-dd')}-to-${format(end, 'yyyy-MM-dd')}`;
        }
        
        exportToJson(filteredEntries, fileName);
        
        setSuccess(`Your mood data has been exported as JSON.`);
      }
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('An error occurred while exporting your data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExportOptionsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportOptionsAnchorEl(event.currentTarget);
    setShowExportOptions(true);
  };

  const handleExportOptionsClose = () => {
    setExportOptionsAnchorEl(null);
    setShowExportOptions(false);
  };

  const handleExportAsHTML = async () => {
    // Use the same date range as the regular export
    if (!validateDates()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const { start, end } = getDateRange();
      
      // Filter entries based on date range
      const filteredEntries = moodEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= start && entryDate <= end;
      });
      
      let fileName = '';
      if (timeFrame === 'month') {
        fileName = `mood-data-${format(selectedMonth, 'yyyy-MM')}`;
      } else if (timeFrame === 'year') {
        fileName = `mood-data-${format(selectedYear, 'yyyy')}`;
      } else if (timeFrame === 'compare-months') {
        fileName = `mood-data-${format(compareMonth1, 'yyyy-MM')}-vs-${format(compareMonth2, 'yyyy-MM')}`;
      } else if (timeFrame === 'compare-years') {
        fileName = `mood-data-${format(compareYear1, 'yyyy')}-vs-${format(compareYear2, 'yyyy')}`;
      } else {
        fileName = `mood-data-${format(start, 'yyyy-MM-dd')}-to-${format(end, 'yyyy-MM-dd')}`;
      }
      
      // Export as HTML
      exportToHtml(filteredEntries, fileName);
      
      setSuccess(`Your mood data has been exported as HTML for rich viewing.`);
    } catch (err) {
      console.error('Error exporting data as HTML:', err);
      setError('An error occurred while exporting your data as HTML. Please try again.');
    } finally {
      setLoading(false);
      handleExportOptionsClose();
    }
  };
  
  const renderTimeFrameOptions = () => {
    switch (timeFrame) {
      case 'month':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Select Month"
              value={selectedMonth}
              onChange={(date) => date && setSelectedMonth(date)}
              views={['month', 'year']}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        );
      case 'year':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Select Year"
              value={selectedYear}
              onChange={(date) => date && setSelectedYear(date)}
              views={['year']}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        );
      case 'custom':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(date) => setStartDate(date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(date) => setEndDate(date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Stack>
          </LocalizationProvider>
        );
      case 'compare-months':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <DatePicker
                label="First Month"
                value={compareMonth1}
                onChange={(date) => date && setCompareMonth1(date)}
                views={['month', 'year']}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DatePicker
                label="Second Month"
                value={compareMonth2}
                onChange={(date) => date && setCompareMonth2(date)}
                views={['month', 'year']}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Stack>
          </LocalizationProvider>
        );
      case 'compare-years':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <DatePicker
                label="First Year"
                value={compareYear1}
                onChange={(date) => date && setCompareYear1(date)}
                views={['year']}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DatePicker
                label="Second Year"
                value={compareYear2}
                onChange={(date) => date && setCompareYear2(date)}
                views={['year']}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Stack>
          </LocalizationProvider>
        );
      default:
        return null;
    }
  };
  
  const renderPdfOptions = () => {
    if (exportFormat !== 'pdf') {
      return null;
    }
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          PDF Content Options
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Card 
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `3px solid ${includeCharts ? theme.palette.primary.main : 'rgba(0, 0, 0, 0.05)'}`,
                bgcolor: includeCharts ? 'rgba(67, 97, 238, 0.1)' : 'white',
                boxShadow: includeCharts ? '0 4px 20px rgba(67, 97, 238, 0.15)' : '0 2px 12px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)'
                }
              }}
            >
              {includeCharts && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: `3px solid ${theme.palette.primary.main}`,
                    borderRadius: 3,
                    pointerEvents: 'none',
                    zIndex: 2
                  }}
                />
              )}
              <CardActionArea 
                onClick={() => setIncludeCharts(!includeCharts)}
                sx={{ 
                  p: 1, 
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'flex-start' }}>
                  <Checkbox 
                    checked={includeCharts} 
                    onChange={() => setIncludeCharts(!includeCharts)}
                    color="primary"
                    sx={{ 
                      '& .MuiSvgIcon-root': { fontSize: 24 }
                    }} 
                  />
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Charts & Visualizations
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.5 }}>
                      Include all mood charts and data visualizations in the report
                    </Typography>
                  </Box>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card 
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `3px solid ${includeJournalEntries ? theme.palette.primary.main : 'rgba(0, 0, 0, 0.05)'}`,
                bgcolor: includeJournalEntries ? 'rgba(67, 97, 238, 0.1)' : 'white',
                boxShadow: includeJournalEntries ? '0 4px 20px rgba(67, 97, 238, 0.15)' : '0 2px 12px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)'
                }
              }}
            >
              {includeJournalEntries && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: `3px solid ${theme.palette.primary.main}`,
                    borderRadius: 3,
                    pointerEvents: 'none',
                    zIndex: 2
                  }}
                />
              )}
              <CardActionArea 
                onClick={() => setIncludeJournalEntries(!includeJournalEntries)}
                sx={{ 
                  p: 1, 
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'flex-start' }}>
                  <Checkbox 
                    checked={includeJournalEntries} 
                    onChange={() => setIncludeJournalEntries(!includeJournalEntries)}
                    color="primary"
                    sx={{ 
                      '& .MuiSvgIcon-root': { fontSize: 24 }
                    }} 
                  />
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Journal Entries
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.5 }}>
                      Include your personal journal notes and reflections
                    </Typography>
                  </Box>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card 
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `3px solid ${includeDetailedAnalysis ? theme.palette.primary.main : 'rgba(0, 0, 0, 0.05)'}`,
                bgcolor: includeDetailedAnalysis ? 'rgba(67, 97, 238, 0.1)' : 'white',
                boxShadow: includeDetailedAnalysis ? '0 4px 20px rgba(67, 97, 238, 0.15)' : '0 2px 12px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)'
                }
              }}
            >
              {includeDetailedAnalysis && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: `3px solid ${theme.palette.primary.main}`,
                    borderRadius: 3,
                    pointerEvents: 'none',
                    zIndex: 2
                  }}
                />
              )}
              <CardActionArea 
                onClick={() => setIncludeDetailedAnalysis(!includeDetailedAnalysis)}
                sx={{ 
                  p: 1, 
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'flex-start' }}>
                  <Checkbox 
                    checked={includeDetailedAnalysis} 
                    onChange={() => setIncludeDetailedAnalysis(!includeDetailedAnalysis)}
                    color="primary"
                    sx={{ 
                      '& .MuiSvgIcon-root': { fontSize: 24 }
                    }} 
                  />
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Detailed Analysis
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.5 }}>
                      Include AI-powered insights and pattern detection
                    </Typography>
                  </Box>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 700, 
            color: '#1e293b',
            mb: 1,
            fontSize: { xs: '1.75rem', md: '2.125rem' }
          }}
        >
          Export Data
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ maxWidth: '800px' }}
        >
          Export your mood tracking data in different formats for analysis, backup, or sharing with healthcare providers.
        </Typography>
      </Box>
      
      <Paper
        elevation={0}
        sx={{
          borderRadius: '20px',
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05), 0 1px 8px rgba(0, 0, 0, 0.02)'
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTabs-indicator': {
              backgroundColor: '#4361ee',
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab
            icon={<DownloadIcon />}
            label="Export Options"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              py: 2,
              '&.Mui-selected': {
                color: '#4361ee'
              }
            }}
          />
        </Tabs>
        
        <TabPanel value={activeTab} index={0}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Export Format
            </Typography>
            
            {/* Modern card-based export format selection with enhanced selected state */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card 
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: `3px solid ${exportFormat === 'pdf' ? theme.palette.primary.main : 'rgba(0, 0, 0, 0.05)'}`,
                    bgcolor: exportFormat === 'pdf' ? 'rgba(67, 97, 238, 0.1)' : 'white',
                    boxShadow: exportFormat === 'pdf' ? '0 4px 20px rgba(67, 97, 238, 0.15)' : '0 2px 12px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease-in-out',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)'
                    }
                  }}
                >
                  {exportFormat === 'pdf' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: `3px solid ${theme.palette.primary.main}`,
                        borderRadius: 3,
                        pointerEvents: 'none',
                        zIndex: 2
                      }}
                    />
                  )}
                  {exportFormat === 'pdf' && (
                    <Badge
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 3,
                        '& .MuiBadge-badge': {
                          backgroundColor: theme.palette.primary.main,
                          color: 'white',
                          fontWeight: 'bold',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '0.7rem',
                          textTransform: 'uppercase'
                        }
                      }}
                      badgeContent="Selected"
                    />
                  )}
                  <CardActionArea onClick={() => handleFormatChange('pdf')} sx={{ p: 2, zIndex: 1 }}>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      p: 2,
                    }}>
                      <Box 
                        sx={{ 
                          p: 1.5, 
                          borderRadius: '50%', 
                          bgcolor: 'rgba(220, 53, 69, 0.1)', 
                          mb: 2, 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <PictureAsPdfIcon color="error" sx={{ fontSize: '2rem' }} />
                      </Box>
                      <Typography variant="h6" fontWeight="600" gutterBottom>PDF Report</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Professional report with visualizations and analytics
                      </Typography>
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Card 
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: `3px solid ${exportFormat === 'csv' ? theme.palette.primary.main : 'rgba(0, 0, 0, 0.05)'}`,
                    bgcolor: exportFormat === 'csv' ? 'rgba(67, 97, 238, 0.1)' : 'white',
                    boxShadow: exportFormat === 'csv' ? '0 4px 20px rgba(67, 97, 238, 0.15)' : '0 2px 12px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease-in-out',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)'
                    }
                  }}
                >
                  {exportFormat === 'csv' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: `3px solid ${theme.palette.primary.main}`,
                        borderRadius: 3,
                        pointerEvents: 'none',
                        zIndex: 2
                      }}
                    />
                  )}
                  {exportFormat === 'csv' && (
                    <Badge
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 3,
                        '& .MuiBadge-badge': {
                          backgroundColor: theme.palette.primary.main,
                          color: 'white',
                          fontWeight: 'bold',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '0.7rem',
                          textTransform: 'uppercase'
                        }
                      }}
                      badgeContent="Selected"
                    />
                  )}
                  <CardActionArea onClick={() => handleFormatChange('csv')} sx={{ p: 2, zIndex: 1 }}>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      p: 2
                    }}>
                      <Box 
                        sx={{ 
                          p: 1.5, 
                          borderRadius: '50%', 
                          bgcolor: 'rgba(25, 118, 210, 0.1)', 
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <TableChartIcon color="primary" sx={{ fontSize: '2rem' }} />
                      </Box>
                      <Typography variant="h6" fontWeight="600" gutterBottom>CSV Export</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Spreadsheet-compatible format for data analysis
                      </Typography>
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Card 
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: `3px solid ${exportFormat === 'json' ? theme.palette.primary.main : 'rgba(0, 0, 0, 0.05)'}`,
                    bgcolor: exportFormat === 'json' ? 'rgba(67, 97, 238, 0.1)' : 'white',
                    boxShadow: exportFormat === 'json' ? '0 4px 20px rgba(67, 97, 238, 0.15)' : '0 2px 12px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease-in-out',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)'
                    }
                  }}
                >
                  {exportFormat === 'json' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: `3px solid ${theme.palette.primary.main}`,
                        borderRadius: 3,
                        pointerEvents: 'none',
                        zIndex: 2
                      }}
                    />
                  )}
                  {exportFormat === 'json' && (
                    <Badge
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 3,
                        '& .MuiBadge-badge': {
                          backgroundColor: theme.palette.primary.main,
                          color: 'white',
                          fontWeight: 'bold',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '0.7rem',
                          textTransform: 'uppercase'
                        }
                      }}
                      badgeContent="Selected"
                    />
                  )}
                  <CardActionArea onClick={() => handleFormatChange('json')} sx={{ p: 2, zIndex: 1 }}>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      p: 2
                    }}>
                      <Box 
                        sx={{ 
                          p: 1.5, 
                          borderRadius: '50%', 
                          bgcolor: 'rgba(46, 175, 35, 0.1)', 
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <CodeIcon color="success" sx={{ fontSize: '2rem' }} />
                      </Box>
                      <Typography variant="h6" fontWeight="600" gutterBottom>JSON Data</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Structured data format for developers
                      </Typography>
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Time Frame
                </Typography>
                
                {/* Replace full width select with a compact button dropdown */}
                <Button
                  variant="outlined"
                  onClick={handleTimeFrameClick}
                  endIcon={<DateRangeIcon />}
                  sx={{
                    borderRadius: 2,
                    padding: '10px 15px',
                    textTransform: 'none',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    bgcolor: 'white',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
                    fontSize: '1rem',
                    fontWeight: 500,
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: '200px',
                    color: 'text.primary',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.03)',
                      border: '1px solid rgba(0, 0, 0, 0.2)',
                    }
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    {timeFrame === 'month' && <CalendarMonthIcon fontSize="small" />}
                    {timeFrame === 'year' && <DateRangeIcon fontSize="small" />}
                    {timeFrame === 'custom' && <TuneIcon fontSize="small" />}
                    {timeFrame === 'compare-months' && <CompareArrowsIcon fontSize="small" />}
                    {timeFrame === 'compare-years' && <CompareArrowsIcon fontSize="small" />}
                    
                    {timeFrame === 'month' && 'Single Month'}
                    {timeFrame === 'year' && 'Full Year'}
                    {timeFrame === 'custom' && 'Custom Date Range'}
                    {timeFrame === 'compare-months' && 'Compare Two Months'}
                    {timeFrame === 'compare-years' && 'Compare Two Years'}
                  </Stack>
                </Button>
                
                <Popover
                  open={openTimeFrameMenu}
                  anchorEl={timeFrameAnchorEl}
                  onClose={handleTimeFrameClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  sx={{
                    '& .MuiPaper-root': {
                      borderRadius: 2,
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                      overflow: 'visible',
                      width: '280px',
                      mt: 1,
                    }
                  }}
                >
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 1, 
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: -8,
                        left: 20,
                        width: 16,
                        height: 16,
                        bgcolor: 'background.paper',
                        transform: 'rotate(45deg)',
                        zIndex: 0,
                        borderLeft: '1px solid rgba(0, 0, 0, 0.05)',
                        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                      }
                    }}
                  >
                    <MenuItem 
                      onClick={() => handleTimeFrameSelect('month')}
                      selected={timeFrame === 'month'}
                      sx={{ 
                        borderRadius: 1.5, 
                        py: 1,
                        mb: 0.5, 
                        bgcolor: timeFrame === 'month' ? 'rgba(67, 97, 238, 0.08)' : 'transparent',
                      }}
                    >
                      <ListItemIcon>
                        <CalendarMonthIcon fontSize="small" color={timeFrame === 'month' ? 'primary' : 'inherit'} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Single Month" 
                        primaryTypographyProps={{ 
                          fontWeight: timeFrame === 'month' ? 600 : 400,
                          color: timeFrame === 'month' ? 'primary.main' : 'text.primary'
                        }} 
                      />
                    </MenuItem>
                    
                    <MenuItem 
                      onClick={() => handleTimeFrameSelect('year')}
                      selected={timeFrame === 'year'}
                      sx={{ 
                        borderRadius: 1.5, 
                        py: 1,
                        mb: 0.5, 
                        bgcolor: timeFrame === 'year' ? 'rgba(67, 97, 238, 0.08)' : 'transparent',
                      }}
                    >
                      <ListItemIcon>
                        <DateRangeIcon fontSize="small" color={timeFrame === 'year' ? 'primary' : 'inherit'} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Full Year" 
                        primaryTypographyProps={{ 
                          fontWeight: timeFrame === 'year' ? 600 : 400,
                          color: timeFrame === 'year' ? 'primary.main' : 'text.primary'
                        }} 
                      />
                    </MenuItem>
                    
                    <MenuItem 
                      onClick={() => handleTimeFrameSelect('custom')}
                      selected={timeFrame === 'custom'}
                      sx={{ 
                        borderRadius: 1.5, 
                        py: 1,
                        mb: 0.5, 
                        bgcolor: timeFrame === 'custom' ? 'rgba(67, 97, 238, 0.08)' : 'transparent',
                      }}
                    >
                      <ListItemIcon>
                        <TuneIcon fontSize="small" color={timeFrame === 'custom' ? 'primary' : 'inherit'} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Custom Date Range" 
                        primaryTypographyProps={{ 
                          fontWeight: timeFrame === 'custom' ? 600 : 400,
                          color: timeFrame === 'custom' ? 'primary.main' : 'text.primary'
                        }} 
                      />
                    </MenuItem>
                    
                    <MenuItem 
                      onClick={() => handleTimeFrameSelect('compare-months')}
                      selected={timeFrame === 'compare-months'}
                      sx={{ 
                        borderRadius: 1.5, 
                        py: 1,
                        mb: 0.5, 
                        bgcolor: timeFrame === 'compare-months' ? 'rgba(67, 97, 238, 0.08)' : 'transparent',
                      }}
                    >
                      <ListItemIcon>
                        <CompareArrowsIcon fontSize="small" color={timeFrame === 'compare-months' ? 'primary' : 'inherit'} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Compare Two Months" 
                        primaryTypographyProps={{ 
                          fontWeight: timeFrame === 'compare-months' ? 600 : 400,
                          color: timeFrame === 'compare-months' ? 'primary.main' : 'text.primary'
                        }} 
                      />
                    </MenuItem>
                    
                    <MenuItem 
                      onClick={() => handleTimeFrameSelect('compare-years')}
                      selected={timeFrame === 'compare-years'}
                      sx={{ 
                        borderRadius: 1.5, 
                        py: 1,
                        bgcolor: timeFrame === 'compare-years' ? 'rgba(67, 97, 238, 0.08)' : 'transparent',
                      }}
                    >
                      <ListItemIcon>
                        <CompareArrowsIcon fontSize="small" color={timeFrame === 'compare-years' ? 'primary' : 'inherit'} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Compare Two Years" 
                        primaryTypographyProps={{ 
                          fontWeight: timeFrame === 'compare-years' ? 600 : 400,
                          color: timeFrame === 'compare-years' ? 'primary.main' : 'text.primary'
                        }} 
                      />
                    </MenuItem>
                  </Paper>
                </Popover>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ 
                p: 3, 
                bgcolor: 'rgba(245, 247, 250, 0.8)',
                borderRadius: 3,
                border: '1px solid rgba(0, 0, 0, 0.05)',
              }}>
                {renderTimeFrameOptions()}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              {renderPdfOptions()}
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            {exportFormat === 'csv' ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleExportOptionsClick}
                  startIcon={<TableChartIcon />}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 10px 25px rgba(67, 97, 238,.3)',
                    background: 'linear-gradient(90deg, #4361ee 0%, #3a0ca3 100%)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 14px 30px rgba(67, 97, 238, 0.4)',
                    }
                  }}
                >
                  {loading ? 'Generating...' : 'Export CSV Options'}
                </Button>
                
                <Popover
                  open={showExportOptions}
                  anchorEl={exportOptionsAnchorEl}
                  onClose={handleExportOptionsClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                  sx={{
                    '& .MuiPaper-root': {
                      borderRadius: 2,
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                      overflow: 'hidden',
                      mt: 1,
                      maxHeight: '150px',
                      width: 'auto'
                    }
                  }}
                >
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 0.5,
                      width: 220
                    }}
                  >
                    <MenuItem 
                      onClick={handleExport}
                      sx={{ 
                        borderRadius: 1, 
                        py: 0.75,
                        mb: 0.25,
                        minHeight: 'auto'
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <FileDownloadIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Standard CSV" 
                        secondary="For spreadsheet apps"
                        primaryTypographyProps={{ fontSize: '0.9rem' }}
                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                      />
                    </MenuItem>
                    
                    <MenuItem 
                      onClick={handleExportAsHTML}
                      sx={{ 
                        borderRadius: 1, 
                        py: 0.75,
                        minHeight: 'auto'
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CodeIcon fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Rich HTML Export" 
                        secondary="Colorful for Excel"
                        primaryTypographyProps={{ fontSize: '0.9rem' }}
                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                      />
                    </MenuItem>
                  </Paper>
                </Popover>
              </>
            ) : (
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleExport}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <DownloadIcon />}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 8,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 10px 25px rgba(67, 97, 238, 0.3)',
                  background: 'linear-gradient(90deg, #4361ee 0%, #3a0ca3 100%)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 14px 30px rgba(67, 97, 238, 0.4)',
                  }
                }}
              >
                {loading ? 'Generating...' : `Export as ${exportFormat.toUpperCase()}`}
              </Button>
            )}
          </Box>
        </TabPanel>
      </Paper>
      
      <Box sx={{ mt: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, rgba(64, 116, 255, 0.1), rgba(108, 92, 231, 0.1))',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}
        >
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Information for Healthcare Providers
          </Typography>
          <Typography variant="body2" paragraph>
            PDF reports include detailed visualizations and insights that can help healthcare providers understand your mood patterns over time. 
            When sharing with your doctor or therapist, we recommend using PDF format which preserves all visual information.
          </Typography>
          <Typography variant="body2">
            The CSV format is useful for those who want to perform their own data analysis in spreadsheet software. 
            JSON format is primarily for developers or data scientists who want to analyze the data programmatically.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default DataExport; 