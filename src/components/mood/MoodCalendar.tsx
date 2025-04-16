import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  IconButton, 
  Tooltip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  useTheme as useMuiTheme,
  Chip,
  alpha,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider
} from '@mui/material';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  parseISO,
  parse
} from 'date-fns';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useMood } from '../../context/MoodContext';
import { useTheme, normalizeMoodType } from '../../context/ThemeContext';
import { MoodEntry, MoodType, TimeOfDay } from '../../types';
import { useNavigate } from 'react-router-dom';

const MoodCalendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<MoodEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  
  const { moodEntries, getMoodEntriesByDate, updateMoodEntry } = useMood();
  const { moodColors } = useTheme();
  const muiTheme = useMuiTheme();
  const navigate = useNavigate();
  
  // Get days in current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get day names for header
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Handle month navigation
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  
  // Handle date selection
  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    const entries = getMoodEntriesByDate(day);
    setSelectedEntries(entries);
    setOpenDialog(true);
  };
  
  // Get mood entries for a specific day
  const getDayMoodEntries = (day: Date): MoodEntry[] => {
    return moodEntries.filter(entry => 
      isSameDay(parseISO(entry.date), day)
    );
  };
  
  // Get mood colors for a day (for visualization)
  const getDayMoodColors = (day: Date): string[] => {
    const entries = getDayMoodEntries(day);
    return entries.map(entry => moodColors[normalizeMoodType(entry.mood)]);
  };
  
  // Get time of day for an entry
  const getTimeOfDayLabel = (timeOfDay: TimeOfDay): string => {
    switch (timeOfDay) {
      case 'morning': return 'Morning';
      case 'afternoon': return 'Afternoon';
      case 'evening': return 'Evening';
      case 'night': return 'Night';
      case 'full-day': return 'Full Day';
    }
  };

  // Get appropriate time of day icon
  const getTimeOfDayIcon = (timeOfDay: string) => {
    switch(timeOfDay) {
      case 'morning':
        return '🌅';
      case 'afternoon':
        return '☀️';
      case 'evening':
        return '🌆';
      case 'night':
        return '🌙';
      default:
        return '📅';
    }
  };

  // Get emoji for mood
  const getMoodEmoji = (mood: string) => {
    switch(mood) {
      case 'Very Bad':
        return '😢';
      case 'Bad':
        return '😕';
      case 'Okay':
        return '😐';
      case 'Good':
        return '🙂';
      case 'Very Good':
        return '😄';
      default:
        return '😐';
    }
  };

  const handleAddMood = () => {
    // Navigate to mood entry page with the date
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    setOpenDialog(false);
    navigate(`/mood-entry/${formattedDate}`);
  };

  const handleEditEntry = (entry: MoodEntry) => {
    setEditingEntry({...entry});
    setOpenEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (editingEntry) {
      updateMoodEntry(editingEntry.id, editingEntry);
      setOpenEditDialog(false);
      
      // Refresh the entries list
      const updatedEntries = getMoodEntriesByDate(selectedDate);
      setSelectedEntries(updatedEntries);
    }
  };
  
  return (
    <>
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
            Mood Calendar
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              onClick={prevMonth}
              sx={{ 
                background: 'rgba(255, 255, 255, 0.5)',
                boxShadow: 'var(--shadow-sm)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.8)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <ChevronLeftIcon sx={{ color: 'var(--color-text-dark)' }} />
            </IconButton>
            
            <Typography 
              variant="h6" 
              sx={{ 
                mx: 2, 
                color: 'var(--color-primary-dark)',
                fontWeight: 600
              }}
            >
              {format(currentMonth, 'MMMM yyyy')}
            </Typography>
            
            <IconButton 
              onClick={nextMonth}
              sx={{ 
                background: 'rgba(255, 255, 255, 0.5)',
                boxShadow: 'var(--shadow-sm)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.8)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <ChevronRightIcon sx={{ color: 'var(--color-text-dark)' }} />
            </IconButton>
          </Box>
        </Box>
        
        {/* Calendar header (day names) */}
        <Grid container sx={{ mb: 2 }}>
          {weekDays.map(day => (
            <Grid item key={day} xs={12/7} sx={{ textAlign: 'center' }}>
              <Typography 
                variant="subtitle2" 
                fontWeight="bold"
                sx={{
                  p: 1,
                  bgcolor: 'rgba(var(--color-primary-rgb), 0.1)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-dark)'
                }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>
        
        {/* Calendar grid */}
        <Grid container>
          {/* Empty cells for days before the start of the month */}
          {Array.from({ length: monthStart.getDay() }).map((_, index) => (
            <Grid item key={`empty-start-${index}`} xs={12/7}>
              <Box sx={{ 
                height: 80, 
                p: 1, 
                borderRadius: 'var(--radius-md)',
                m: 0.5,
                bgcolor: 'rgba(255, 255, 255, 0.3)',
                opacity: 0.3,
                boxShadow: 'none'
              }} />
            </Grid>
          ))}
          
          {/* Days of the month */}
          {monthDays.map(day => {
            const dayMoodColors = getDayMoodColors(day);
            const isCurrentDay = isToday(day);
            const hasEntries = dayMoodColors.length > 0;
            
            return (
              <Grid item key={day.toISOString()} xs={12/7}>
                <Paper 
                  elevation={hasEntries ? 1 : 0}
                  onClick={() => handleDateClick(day)}
                  sx={{ 
                    height: 80, 
                    p: 1.5, 
                    borderRadius: 'var(--radius-md)',
                    m: 0.5,
                    cursor: 'pointer',
                    position: 'relative',
                    bgcolor: isCurrentDay 
                      ? 'rgba(var(--color-primary-rgb), 0.15)' 
                      : 'rgba(255, 255, 255, 0.7)',
                    border: isCurrentDay 
                      ? '2px solid var(--color-primary)' 
                      : hasEntries 
                        ? '1px solid rgba(var(--color-primary-rgb), 0.2)'
                        : '1px solid rgba(255, 255, 255, 0.7)',
                    boxShadow: hasEntries 
                      ? 'var(--shadow-sm)' 
                      : 'none',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: 'var(--shadow-md)',
                      bgcolor: isCurrentDay 
                        ? 'rgba(var(--color-primary-rgb), 0.2)' 
                        : 'rgba(255, 255, 255, 0.9)'
                    },
                    transition: 'all 0.3s var(--motion-elastic)'
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: isCurrentDay ? 'bold' : hasEntries ? 600 : 500,
                      color: isCurrentDay 
                        ? 'var(--color-primary-dark)' 
                        : 'var(--color-text-dark)',
                      mb: 0.5
                    }}
                  >
                    {format(day, 'd')}
                  </Typography>
                  
                  {/* Mood indicators */}
                  {hasEntries && (
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 0.7, 
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      right: 8
                    }}>
                      {dayMoodColors.map((color, index) => (
                        <Box 
                          key={`mood-${day.toISOString()}-${index}`}
                          className="icon-container"
                          sx={{ 
                            width: 16, 
                            height: 16, 
                            borderRadius: '50%', 
                            bgcolor: color,
                            border: '1px solid rgba(255, 255, 255, 0.8)',
                            boxShadow: 'var(--shadow-sm)'
                          }} 
                        />
                      ))}
                    </Box>
                  )}
                </Paper>
              </Grid>
            );
          })}
          
          {/* Empty cells for days after the end of the month */}
          {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
            <Grid item key={`empty-end-${index}`} xs={12/7}>
              <Box sx={{ 
                height: 80, 
                p: 1, 
                borderRadius: 'var(--radius-md)',
                m: 0.5,
                bgcolor: 'rgba(255, 255, 255, 0.3)',
                opacity: 0.3,
                boxShadow: 'none'
              }} />
            </Grid>
          ))}
        </Grid>
        
        {/* Mood Details Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 'var(--radius-xl)',
              background: 'var(--surface-glass-light-solid)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              minHeight: '60vh'
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              fontWeight: 'bold', 
              fontSize: 'h5.fontSize',
              color: 'var(--color-text-dark)',
              background: 'rgba(var(--color-primary-rgb), 0.05)',
              p: 2.5,
              borderBottom: '1px solid rgba(var(--color-primary-rgb), 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            <IconButton 
              onClick={() => setOpenDialog(false)}
              sx={{ 
                color: 'var(--color-text-dark)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent 
            sx={{ 
              p: 4,
              background: 'var(--surface-glass-light-solid)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {selectedEntries.length > 0 ? (
              <>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                  Your Mood History for {format(selectedDate, 'MMMM d, yyyy')}
                </Typography>
                
                <Grid container spacing={3}>
                  {selectedEntries.map((entry) => {
                    const moodColor = moodColors[normalizeMoodType(entry.mood)];
                    
                    return (
                    <Grid item xs={12} key={entry.id}>
                        <Card 
                        elevation={1} 
                        sx={{ 
                          borderRadius: 'var(--radius-lg)',
                            overflow: 'hidden',
                          position: 'relative',
                            borderLeft: `6px solid ${moodColor}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: 'var(--shadow-lg)'
                            }
                        }}
                      >
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                              right: 0,
                              bottom: 0,
                              background: `linear-gradient(90deg, ${alpha(moodColor, 0.15)}, transparent)`,
                            zIndex: 0
                          }}
                        />
                        
                          <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box 
                          sx={{ 
                                        width: 50, 
                                        height: 50, 
                                        borderRadius: '50%', 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                        background: alpha(moodColor, 0.2),
                                        border: `2px solid ${moodColor}`,
                                        fontSize: '1.8rem'
                                      }}
                                    >
                                      {getMoodEmoji(entry.mood)}
                            </Box>
                                    <Typography variant="h6" fontWeight="600" sx={{ color: moodColor }}>
                              {entry.mood}
                            </Typography>
                          </Box>
                          
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip 
                                      icon={<AccessTimeIcon fontSize="small" />}
                                      label={entry.timeOfDay ? 
                                        `${getTimeOfDayIcon(entry.timeOfDay)} ${entry.timeOfDay.charAt(0).toUpperCase() + entry.timeOfDay.slice(1)}` : 
                                        'Full Day'
                                      }
                                      sx={{ 
                                        bgcolor: alpha(moodColor, 0.1),
                                        color: moodColor,
                                        fontWeight: 500,
                                        '& .MuiChip-icon': {
                                          color: moodColor
                                        }
                                      }}
                                    />

                                    <Tooltip title="Edit mood entry">
                                      <IconButton 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditEntry(entry);
                                        }}
                                        size="small"
                            sx={{ 
                                          bgcolor: alpha(moodColor, 0.1),
                                          color: moodColor,
                                          '&:hover': {
                                            bgcolor: alpha(moodColor, 0.2),
                                          }
                                        }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                        </Box>
                              </Grid>
                        
                        {entry.notes && (
                                <Grid item xs={12}>
                                  <Paper
                                    elevation={0}
                            sx={{
                                      p: 2.5, 
                                      bgcolor: 'rgba(255, 255, 255, 0.7)',
                              borderRadius: 'var(--radius-md)',
                                      border: `1px solid ${alpha(moodColor, 0.2)}`
                                    }}
                                  >
                                    <Typography variant="body1">
                              {entry.notes}
                            </Typography>
                      </Paper>
                    </Grid>
                              )}
                              
                              {entry.activities && entry.activities.length > 0 && (
                                <Grid item xs={12}>
                                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    Activities:
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {entry.activities.map((activity, index) => (
                                      <Chip 
                                        key={index}
                                        label={activity}
                                        size="small"
                                        sx={{ 
                                          bgcolor: alpha(moodColor, 0.1),
                                          color: alpha(moodColor, 0.8),
                                          border: `1px solid ${alpha(moodColor, 0.2)}`
                                        }}
                                      />
                                    ))}
                                  </Box>
                                </Grid>
                              )}
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                py: 6,
                flexGrow: 1
              }}>
              <Box 
                sx={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    bgcolor: 'rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <CalendarTodayIcon sx={{ fontSize: 40, color: 'var(--color-primary)' }} />
                </Box>
                
                <Typography variant="h6" fontWeight="600" sx={{ mb: 1 }}>
                  No mood entries yet for {format(selectedDate, 'MMMM d, yyyy')}
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
                  You haven't recorded how you were feeling on this day. Would you like to log your mood now?
                </Typography>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions 
            sx={{ 
              p: 2,
              borderTop: '1px solid rgba(0, 0, 0, 0.05)',
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <Button 
              onClick={() => setOpenDialog(false)}
              variant="outlined"
              startIcon={<CloseIcon />}
              sx={{
                color: 'var(--color-text-dark)',
                fontWeight: 500,
                borderRadius: 'var(--radius-md)',
                borderWidth: '2px',
                px: 3,
                '&:hover': {
                  borderWidth: '2px',
                  backgroundColor: 'rgba(0, 0, 0, 0.05)'
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddMood}
              sx={{
                borderRadius: 'var(--radius-md)',
                py: 1.5,
                px: 3,
                boxShadow: 'var(--shadow-md)',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
              }}
            >
              {selectedEntries.length > 0 ? 'Add Another Entry' : 'Log Your Mood'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Mood Dialog */}
        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 'var(--radius-xl)',
              background: 'var(--surface-glass-light-solid)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 'bold',
              fontSize: 'h5.fontSize',
              color: 'var(--color-text-dark)',
              background: 'rgba(var(--color-primary-rgb), 0.05)',
              p: 2.5,
              borderBottom: '1px solid rgba(var(--color-primary-rgb), 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            Edit Mood Entry
            <IconButton
              onClick={() => setOpenEditDialog(false)}
              sx={{
                color: 'var(--color-text-dark)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent
            sx={{
              p: 3,
              background: 'var(--surface-glass-light-solid)'
            }}
          >
            {editingEntry && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                        Date
                      </Typography>
                      <TextField
                        type="date"
                        fullWidth
                        value={format(parseISO(editingEntry.date), 'yyyy-MM-dd')}
                        disabled
                        InputProps={{
                          sx: {
                            bgcolor: 'rgba(255,255,255,0.7)',
                            borderRadius: 'var(--radius-lg)',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 'var(--radius-lg)'
                            }
                          }
                        }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                        Time of Day
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={editingEntry.timeOfDay}
                          onChange={(e) => setEditingEntry({
                            ...editingEntry,
                            timeOfDay: e.target.value as TimeOfDay
                          })}
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.7)',
                            borderRadius: 'var(--radius-lg)',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 'var(--radius-lg)'
                            }
                          }}
                        >
                          <MenuItem value="morning">Morning</MenuItem>
                          <MenuItem value="afternoon">Afternoon</MenuItem>
                          <MenuItem value="evening">Evening</MenuItem>
                          <MenuItem value="night">Night</MenuItem>
                          <MenuItem value="full-day">Full Day</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ my: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                    Mood
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={editingEntry.mood}
                      onChange={(e) => setEditingEntry({
                        ...editingEntry,
                        mood: e.target.value as MoodType
                      })}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.7)',
                        borderRadius: 'var(--radius-lg)',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 'var(--radius-lg)'
                        }
                      }}
                    >
                      <MenuItem value="Very Bad">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>😢</span> Very Bad
                        </Box>
                      </MenuItem>
                      <MenuItem value="Bad">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>😕</span> Bad
                        </Box>
                      </MenuItem>
                      <MenuItem value="Okay">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>😐</span> Okay
                        </Box>
                      </MenuItem>
                      <MenuItem value="Good">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>🙂</span> Good
                        </Box>
                      </MenuItem>
                      <MenuItem value="Very Good">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>😄</span> Very Good
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ my: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                    Notes
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={editingEntry.notes}
                    onChange={(e) => setEditingEntry({
                      ...editingEntry,
                      notes: e.target.value
                    })}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.7)',
                      borderRadius: 'var(--radius-lg)',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 'var(--radius-lg)'
                      }
                    }}
                  />
                </Box>

                <Box sx={{ my: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                    Activities
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                    {editingEntry.activities?.map((activity, index) => (
                      <Chip
                        key={index}
                        label={activity}
                        onDelete={() => {
                          const updatedActivities = editingEntry.activities?.filter((_, i) => i !== index) || [];
                          setEditingEntry({
                            ...editingEntry,
                            activities: updatedActivities
                          });
                        }}
                        sx={{
                          m: 0.5,
                          bgcolor: alpha(moodColors[normalizeMoodType(editingEntry.mood)], 0.1),
                          color: moodColors[normalizeMoodType(editingEntry.mood)],
                          border: `1px solid ${alpha(moodColors[normalizeMoodType(editingEntry.mood)], 0.3)}`
                        }}
                      />
                    ))}
                    {(!editingEntry.activities || editingEntry.activities.length === 0) && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', p: 1 }}>
                        No activities selected
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Box>
            )}
          </DialogContent>

          <DialogActions
            sx={{
              p: 2,
              borderTop: '1px solid rgba(0, 0, 0, 0.05)',
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <Button
              onClick={() => setOpenEditDialog(false)}
              variant="outlined"
              startIcon={<CloseIcon />}
              sx={{
                color: 'var(--color-text-dark)',
                fontWeight: 500,
                borderRadius: 'var(--radius-md)',
                borderWidth: '2px',
                px: 3,
                '&:hover': {
                  borderWidth: '2px',
                  backgroundColor: 'rgba(0, 0, 0, 0.05)'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveEdit}
              sx={{
                borderRadius: 'var(--radius-md)',
                py: 1.5,
                px: 3,
                boxShadow: 'var(--shadow-md)',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </>
  );
};

export default MoodCalendar; 