import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Tooltip,
  Card,
  CardContent,
  Divider,
  Snackbar,
  Alert,
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useMood } from '../../context/MoodContext';
import { useTheme, normalizeMoodType } from '../../context/ThemeContext';
import { MoodEntry, MoodType, TimeOfDay } from '../../types';
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterIcon from '@mui/icons-material/Water';
import MoodLogger from '../mood/MoodLogger';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const MoodHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType | 'all'>('all');
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<TimeOfDay | 'all'>('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [editActivities, setEditActivities] = useState<string[]>([]);
  const [newActivity, setNewActivity] = useState<string>('');
  
  // Common activities for suggestions
  const commonActivities = [
    'Exercise', 'Reading', 'Meditation', 'Social', 'Work', 'Family', 
    'Outdoors', 'Shopping', 'Cooking', 'Movies', 'Music', 'Gaming',
    'Studying', 'Cleaning', 'Travel', 'Sports', 'Art', 'Yoga'
  ];
  
  const { moodEntries, deleteMoodEntry, updateMoodEntry } = useMood();
  const { moodColors } = useTheme();
  
  // Filter entries based on search and filters
  const filteredEntries = moodEntries.filter(entry => {
    // Text search
    const matchesSearch = searchTerm === '' || 
      entry.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Mood filter
    const matchesMood = selectedMood === 'all' || entry.mood === selectedMood;
    
    // Time of day filter
    const matchesTimeOfDay = selectedTimeOfDay === 'all' || entry.timeOfDay === selectedTimeOfDay;
    
    // Date range filter
    let matchesDateRange = true;
    if (startDate && endDate) {
      const entryDate = parseISO(entry.date);
      matchesDateRange = isWithinInterval(entryDate, {
        start: startOfDay(startDate),
        end: endOfDay(endDate)
      });
    }
    
    return matchesSearch && matchesMood && matchesTimeOfDay && matchesDateRange;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date, newest first
  
  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle mood filter change
  const handleMoodFilterChange = (event: SelectChangeEvent<MoodType | 'all'>) => {
    setSelectedMood(event.target.value as MoodType | 'all');
    setPage(0);
  };
  
  // Handle time of day filter change
  const handleTimeOfDayFilterChange = (event: SelectChangeEvent<TimeOfDay | 'all'>) => {
    setSelectedTimeOfDay(event.target.value as TimeOfDay | 'all');
    setPage(0);
  };
  
  // Handle view entry
  const handleViewEntry = (entry: MoodEntry) => {
    setSelectedEntry(entry);
    setOpenDialog(true);
  };
  
  // Handle edit entry
  const handleEditEntry = (entry: MoodEntry) => {
    setSelectedEntry(entry);
    setEditActivities(entry.activities || []);
    setOpenEditDialog(true);
  };
  
  // Handle delete entry
  const handleDeleteEntry = (entry: MoodEntry) => {
    setSelectedEntry(entry);
    setOpenDeleteDialog(true);
  };
  
  // Confirm delete
  const confirmDelete = () => {
    if (selectedEntry) {
      deleteMoodEntry(selectedEntry.id);
      setOpenDeleteDialog(false);
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedMood('all');
    setSelectedTimeOfDay('all');
    setStartDate(null);
    setEndDate(null);
    setPage(0);
  };
  
  // Set current month as default date range
  useEffect(() => {
    const today = new Date();
    setStartDate(startOfMonth(today));
    setEndDate(endOfMonth(today));
  }, []);
  
  // Get time of day label
  const getTimeOfDayLabel = (timeOfDay: TimeOfDay): string => {
    switch (timeOfDay) {
      case 'morning': return 'Morning';
      case 'afternoon': return 'Afternoon';
      case 'evening': return 'Evening';
      case 'night': return 'Night';
      case 'full-day': return 'Full Day';
    }
  };
  
  const handleAddActivity = () => {
    if (newActivity.trim() && !editActivities.includes(newActivity.trim())) {
      setEditActivities([...editActivities, newActivity.trim()]);
      setNewActivity('');
    }
  };
  
  const handleRemoveActivity = (activity: string) => {
    setEditActivities(editActivities.filter(a => a !== activity));
  };
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        borderRadius: 'var(--radius-xl)',
        background: 'var(--surface-glass-light-solid)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid rgba(255, 255, 255, 0.7)',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h5" 
          fontWeight="bold"
          sx={{ 
            color: 'var(--color-text-dark)', 
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}
        >
          Mood History
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'var(--color-primary)' }} />
                </InputAdornment>
              ),
              sx: {
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 'var(--radius-md)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(var(--color-primary-rgb), 0.3)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(var(--color-primary-rgb), 0.5)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--color-primary)'
                }
              }
            }}
            sx={{ width: 200 }}
          />
          
          <IconButton 
            color={showFilters ? 'primary' : 'default'} 
            onClick={() => setShowFilters(!showFilters)}
            sx={{ 
              border: showFilters ? 1 : 0, 
              borderColor: 'var(--color-primary)',
              bgcolor: showFilters ? 'rgba(var(--color-primary-rgb), 0.1)' : 'rgba(255, 255, 255, 0.8)',
              boxShadow: 'var(--shadow-sm)',
              '&:hover': {
                bgcolor: showFilters ? 'rgba(var(--color-primary-rgb), 0.15)' : 'rgba(255, 255, 255, 0.9)'
              }
            }}
          >
            <FilterListIcon sx={{ color: showFilters ? 'var(--color-primary)' : 'var(--color-text-dark-secondary)' }} />
          </IconButton>
        </Box>
      </Box>
      
      {/* Filters */}
      {showFilters && (
        <Paper
          elevation={1}
          sx={{ 
            mb: 3, 
            p: 2.5, 
            bgcolor: 'rgba(255, 255, 255, 0.8)', 
            borderRadius: 'var(--radius-lg)', 
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid rgba(var(--color-primary-rgb), 0.1)'
          }}
        >
          <Typography 
            variant="subtitle1" 
            fontWeight="bold" 
            gutterBottom
            sx={{
              color: 'var(--color-text-dark)',
              mb: 2
            }}
          >
            Filters
          </Typography>
          
          <Grid container spacing={2.5} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl 
                fullWidth 
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    '& fieldset': {
                      borderColor: 'rgba(var(--color-primary-rgb), 0.3)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(var(--color-primary-rgb), 0.5)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--color-primary)'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--color-text-dark-secondary)'
                  },
                  '& .MuiSelect-select': {
                    color: 'var(--color-text-dark)'
                  }
                }}
              >
                <InputLabel id="mood-filter-label">Mood</InputLabel>
                <Select
                  labelId="mood-filter-label"
                  id="mood-filter"
                  value={selectedMood}
                  label="Mood"
                  onChange={handleMoodFilterChange}
                >
                  <MenuItem value="all">All Moods</MenuItem>
                  <MenuItem value="Very Bad">Very Bad</MenuItem>
                  <MenuItem value="Bad">Bad</MenuItem>
                  <MenuItem value="Okay">Okay</MenuItem>
                  <MenuItem value="Good">Good</MenuItem>
                  <MenuItem value="Very Good">Very Good</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl 
                fullWidth 
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    '& fieldset': {
                      borderColor: 'rgba(var(--color-primary-rgb), 0.3)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(var(--color-primary-rgb), 0.5)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--color-primary)'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--color-text-dark-secondary)'
                  },
                  '& .MuiSelect-select': {
                    color: 'var(--color-text-dark)'
                  }
                }}
              >
                <InputLabel id="time-filter-label">Time of Day</InputLabel>
                <Select
                  labelId="time-filter-label"
                  id="time-filter"
                  value={selectedTimeOfDay}
                  label="Time of Day"
                  onChange={handleTimeOfDayFilterChange}
                >
                  <MenuItem value="all">All Times</MenuItem>
                  <MenuItem value="morning">Morning</MenuItem>
                  <MenuItem value="afternoon">Afternoon</MenuItem>
                  <MenuItem value="evening">Evening</MenuItem>
                  <MenuItem value="night">Night</MenuItem>
                  <MenuItem value="full-day">Full Day</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{ 
                    textField: { 
                      size: 'small',
                      fullWidth: true,
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'rgba(255, 255, 255, 0.8)',
                          '& fieldset': {
                            borderColor: 'rgba(var(--color-primary-rgb), 0.3)'
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(var(--color-primary-rgb), 0.5)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'var(--color-primary)'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'var(--color-text-dark-secondary)'
                        },
                        '& .MuiInputBase-input': {
                          color: 'var(--color-text-dark)'
                        }
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{ 
                    textField: { 
                      size: 'small',
                      fullWidth: true,
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'rgba(255, 255, 255, 0.8)',
                          '& fieldset': {
                            borderColor: 'rgba(var(--color-primary-rgb), 0.3)'
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(var(--color-primary-rgb), 0.5)'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'var(--color-primary)'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: 'var(--color-text-dark-secondary)'
                        },
                        '& .MuiInputBase-input': {
                          color: 'var(--color-text-dark)'
                        }
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Button 
                variant="outlined" 
                onClick={resetFilters}
                fullWidth
                sx={{
                  borderColor: 'rgba(var(--color-primary-rgb), 0.5)',
                  color: 'var(--color-primary-dark)',
                  bgcolor: 'rgba(255, 255, 255, 0.6)',
                  height: '40px',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    borderColor: 'var(--color-primary)'
                  }
                }}
              >
                Reset Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Results count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {filteredEntries.length} entries
      </Typography>
      
      {/* Entries table */}
      <TableContainer 
        component={Paper}
        elevation={1}
        sx={{ 
          mb: 2,
          borderRadius: 'var(--radius-lg)',
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          overflow: 'hidden',
          border: '1px solid rgba(var(--color-primary-rgb), 0.1)'
        }}
      >
        <Table>
          <TableHead 
            sx={{ 
              bgcolor: 'rgba(var(--color-primary-rgb), 0.05)',
              '& th': {
                fontWeight: 600,
                color: 'var(--color-text-dark)'
              }
            }}
          >
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Mood</TableCell>
              <TableCell>Time of Day</TableCell>
              <TableCell>Activities</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              '& tr:nth-of-type(odd)': {
                bgcolor: 'rgba(255, 255, 255, 0.4)',
              },
              '& tr:nth-of-type(even)': {
                bgcolor: 'rgba(255, 255, 255, 0.8)',
              },
              '& tr:hover': {
                bgcolor: 'rgba(var(--color-primary-rgb), 0.05)',
              },
              '& td': {
                color: 'var(--color-text-dark)'
              }
            }}
          >
            {filteredEntries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(entry => (
              <TableRow key={entry.id}>
                <TableCell>{format(parseISO(entry.date), 'MMM d, yyyy')}</TableCell>
                <TableCell>{format(parseISO(entry.date), 'h:mm a')}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      className="mood-icon-wrapper"
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%', 
                        background: 'white',
                        boxShadow: 'var(--shadow-sm)',
                        mr: 1.5,
                        border: `1px solid ${moodColors[normalizeMoodType(entry.mood)]}`
                      }} 
                    >
                      <Box 
                        sx={{ 
                          width: 14, 
                          height: 14, 
                          borderRadius: '50%', 
                          bgcolor: moodColors[normalizeMoodType(entry.mood)],
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      />
                    </Box>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        color: moodColors[normalizeMoodType(entry.mood)],
                        fontWeight: 600,
                        textShadow: '0 1px 1px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      {entry.mood}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getTimeOfDayLabel(entry.timeOfDay)} 
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(var(--color-primary-rgb), 0.1)',
                      color: 'var(--color-primary-dark)',
                      fontWeight: 500,
                      border: '1px solid rgba(var(--color-primary-rgb), 0.2)'
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
                    {entry.activities && entry.activities.length > 0 ? (
                      entry.activities.length > 2 ? (
                        <>
                          <Chip 
                            label={entry.activities[0]}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(var(--color-secondary-rgb), 0.1)',
                              color: 'var(--color-secondary-dark)',
                              fontWeight: 500,
                              fontSize: '0.7rem'
                            }}
                          />
                          <Chip 
                            label={`+${entry.activities.length - 1}`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(var(--color-secondary-rgb), 0.05)',
                              color: 'var(--color-text-dark-secondary)',
                              fontWeight: 500,
                              fontSize: '0.7rem'
                            }}
                          />
                        </>
                      ) : (
                        entry.activities.map((activity, idx) => (
                          <Chip 
                            key={idx}
                            label={activity}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(var(--color-secondary-rgb), 0.1)',
                              color: 'var(--color-secondary-dark)',
                              fontWeight: 500,
                              fontSize: '0.7rem'
                            }}
                          />
                        ))
                      )
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontStyle: 'italic' }}>
                        No activities
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'var(--color-text-dark)',
                      maxWidth: '200px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {entry.notes || '-'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Tooltip title="View">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewEntry(entry)}
                        sx={{ 
                          color: 'var(--color-primary)',
                          bgcolor: 'rgba(var(--color-primary-rgb), 0.1)',
                          '&:hover': {
                            bgcolor: 'rgba(var(--color-primary-rgb), 0.2)'
                          }
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditEntry(entry)}
                        sx={{ 
                          color: 'var(--color-secondary)',
                          bgcolor: 'rgba(var(--color-secondary-rgb), 0.1)',
                          '&:hover': {
                            bgcolor: 'rgba(var(--color-secondary-rgb), 0.2)'
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteEntry(entry)}
                        sx={{ 
                          color: 'var(--color-error)',
                          bgcolor: 'rgba(239, 68, 68, 0.1)',
                          '&:hover': {
                            bgcolor: 'rgba(239, 68, 68, 0.2)'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredEntries.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{ 
                      p: 2.5, 
                      borderRadius: 'var(--radius-md)',
                      bgcolor: 'rgba(255, 255, 255, 0.6)',
                      border: '1px dashed rgba(var(--color-primary-rgb), 0.3)',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <Typography 
                      variant="body1"
                      sx={{
                        color: 'var(--color-text-dark-secondary)',
                        fontWeight: 500,
                        textAlign: 'center'
                      }}
                    >
                      No mood entries found matching your filters.
                    </Typography>
                  </Paper>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredEntries.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      
      {/* View Entry Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedEntry && (
          <>
            <DialogTitle sx={{ fontWeight: 'bold' }}>
              Mood Entry Details
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card elevation={0} sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Mood Information
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box 
                          sx={{ 
                            width: 16, 
                            height: 16, 
                            borderRadius: '50%', 
                            bgcolor: moodColors[normalizeMoodType(selectedEntry.mood)],
                            mr: 1
                          }} 
                        />
                        <Typography variant="h6" sx={{ color: moodColors[normalizeMoodType(selectedEntry.mood)] }}>
                          {selectedEntry.mood}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body1">
                          {format(parseISO(selectedEntry.date), 'EEEE, MMMM d, yyyy')}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body1">
                          {getTimeOfDayLabel(selectedEntry.timeOfDay)}
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Notes
                      </Typography>
                      
                      <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedEntry.notes || 'No notes for this entry.'}
                      </Typography>
                      
                      {selectedEntry.activities && selectedEntry.activities.length > 0 && (
                        <>
                          <Divider sx={{ my: 2 }} />
                          
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Activities
                          </Typography>
                          
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {selectedEntry.activities.map((activity, index) => (
                              <Chip 
                                key={index}
                                label={activity}
                                sx={{
                                  bgcolor: `rgba(${moodColors[normalizeMoodType(selectedEntry.mood)]
                                    .replace(/^#/, '')
                                    .match(/.{2}/g)
                                    ?.map(c => parseInt(c, 16))
                                    .join(', ')}, 0.1)`,
                                  color: moodColors[normalizeMoodType(selectedEntry.mood)],
                                  fontWeight: 'medium'
                                }}
                              />
                            ))}
                          </Box>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card elevation={0} sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Weather Conditions
                      </Typography>
                      
                      {selectedEntry.weather ? (
                        <>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <WbSunnyIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body1">
                              {selectedEntry.weather.condition || 'Not recorded'}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <ThermostatIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body1">
                              {selectedEntry.weather.temperature ? `${selectedEntry.weather.temperature}°C` : 'Not recorded'}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <WaterIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body1">
                              {selectedEntry.weather.humidity ? `${selectedEntry.weather.humidity}% humidity` : 'Not recorded'}
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        <Typography variant="body1" color="text.secondary">
                          No weather data available for this entry.
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button 
                          variant="outlined" 
                          color="primary" 
                          startIcon={<EditIcon />}
                          onClick={() => {
                            setOpenDialog(false);
                            setOpenEditDialog(true);
                          }}
                        >
                          Edit Entry
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Edit Entry Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Edit Mood Entry
        </DialogTitle>
        <DialogContent dividers>
          {selectedEntry && (
            <Box sx={{ p: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date"
                      value={parseISO(selectedEntry.date)}
                      onChange={(newDate: Date | null) => {
                        if (newDate && selectedEntry) {
                          setSelectedEntry({
                            ...selectedEntry,
                            date: newDate.toISOString()
                          });
                        }
                      }}
                      slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
                    />
                  </LocalizationProvider>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="edit-time-of-day-label">Time of Day</InputLabel>
                    <Select
                      labelId="edit-time-of-day-label"
                      id="edit-time-of-day"
                      value={selectedEntry.timeOfDay}
                      label="Time of Day"
                      onChange={(e: SelectChangeEvent) => {
                        setSelectedEntry({
                          ...selectedEntry,
                          timeOfDay: e.target.value as TimeOfDay
                        });
                      }}
                    >
                      <MenuItem value="morning">Morning</MenuItem>
                      <MenuItem value="afternoon">Afternoon</MenuItem>
                      <MenuItem value="evening">Evening</MenuItem>
                      <MenuItem value="night">Night</MenuItem>
                      <MenuItem value="full-day">Full Day</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      mt: 2, 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      height: 'calc(100% - 16px)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                      Select Mood
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1,
                      justifyContent: 'center',
                      mb: 2
                    }}>
                      {['Very Bad', 'Bad', 'Okay', 'Good', 'Very Good'].map((mood) => (
                        <Chip
                          key={mood}
                          label={mood}
                          onClick={() => {
                            setSelectedEntry({
                              ...selectedEntry,
                              mood: mood as MoodType
                            });
                          }}
                          sx={{
                            bgcolor: selectedEntry.mood === mood ? 
                              `${moodColors[normalizeMoodType(mood as MoodType)]}40` : 'transparent',
                            color: selectedEntry.mood === mood ? 
                              moodColors[normalizeMoodType(mood as MoodType)] : 'text.primary',
                            borderColor: moodColors[normalizeMoodType(mood as MoodType)],
                            border: '1px solid',
                            fontWeight: selectedEntry.mood === mood ? 'bold' : 'normal',
                            transition: 'all 0.2s',
                            px: 2,
                            '&:hover': {
                              bgcolor: `${moodColors[normalizeMoodType(mood as MoodType)]}20`,
                              borderColor: moodColors[normalizeMoodType(mood as MoodType)],
                            }
                          }}
                        />
                      ))}
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      align="center" 
                      sx={{ 
                        mt: 'auto',
                        color: 'text.secondary'
                      }}
                    >
                      Selected: {selectedEntry.mood}
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Notes"
                    multiline
                    rows={4}
                    fullWidth
                    value={selectedEntry.notes}
                    onChange={(e) => {
                      setSelectedEntry({
                        ...selectedEntry,
                        notes: e.target.value
                      });
                    }}
                    placeholder="How were you feeling? What made you feel this way?"
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 2
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                      Activities
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {editActivities.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          No activities selected
                        </Typography>
                      ) : (
                        editActivities.map((activity, index) => (
                          <Chip 
                            key={index}
                            label={activity}
                            onDelete={() => handleRemoveActivity(activity)}
                            sx={{
                              bgcolor: `rgba(${moodColors[normalizeMoodType(selectedEntry.mood)]
                                .replace(/^#/, '')
                                .match(/.{2}/g)
                                ?.map(c => parseInt(c, 16))
                                .join(', ')}, 0.1)`,
                              color: 'text.primary'
                            }}
                          />
                        ))
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Autocomplete
                        freeSolo
                        options={commonActivities.filter(activity => !editActivities.includes(activity))}
                        value={newActivity}
                        onChange={(event, newValue) => {
                          if (typeof newValue === 'string' && newValue.trim() !== '') {
                            if (!editActivities.includes(newValue)) {
                              setEditActivities([...editActivities, newValue]);
                            }
                            setNewActivity('');
                          }
                        }}
                        inputValue={newActivity}
                        onInputChange={(event, newValue) => {
                          setNewActivity(newValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder="Add an activity..."
                          />
                        )}
                        sx={{ flex: 1 }}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={handleAddActivity}
                        disabled={!newActivity.trim()}
                      >
                        Add
                      </Button>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>Suggestions:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {commonActivities
                          .filter(activity => !editActivities.includes(activity))
                          .slice(0, 6)
                          .map((activity) => (
                            <Chip
                              key={activity}
                              label={activity}
                              size="small"
                              onClick={() => {
                                setEditActivities([...editActivities, activity]);
                              }}
                              sx={{
                                bgcolor: 'rgba(0,0,0,0.05)',
                                fontSize: '0.75rem',
                                '&:hover': {
                                  bgcolor: 'rgba(var(--color-primary-rgb), 0.1)',
                                }
                              }}
                            />
                          ))}
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<SaveIcon />}
            onClick={() => {
              if (selectedEntry) {
                updateMoodEntry(selectedEntry.id, {
                  date: selectedEntry.date,
                  timeOfDay: selectedEntry.timeOfDay,
                  mood: selectedEntry.mood,
                  notes: selectedEntry.notes,
                  activities: editActivities
                });
                setOpenEditDialog(false);
                setUpdateSuccess(true);
              }
            }}
            sx={{
              boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 0 10px rgba(255,255,255,0.2)' : 'inherit',
              '&:hover': {
                boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 0 15px rgba(255,255,255,0.3)' : 'inherit'
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this mood entry? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={updateSuccess}
        autoHideDuration={4000}
        onClose={() => setUpdateSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setUpdateSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Mood entry updated successfully!
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default MoodHistory; 