import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  IconButton, 
  Tooltip,
  Grid,
  Alert,
  Stack,
  Chip,
  Divider,
  Slider,
  InputAdornment,
  Paper,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { ChromePicker, ColorResult } from 'react-color';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import { v4 as uuidv4 } from 'uuid';
import { CustomMoodCategory } from '../../types';

interface CustomMoodManagerProps {
  customMoods: CustomMoodCategory[];
  onChange: (moods: CustomMoodCategory[]) => void;
}

const CustomMoodManager: React.FC<CustomMoodManagerProps> = ({ 
  customMoods = [], 
  onChange 
}) => {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentMood, setCurrentMood] = useState<CustomMoodCategory | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#4CAF50');
  const [emoji, setEmoji] = useState('');
  const [description, setDescription] = useState('');
  const [moodValue, setMoodValue] = useState<number>(2); // Default to neutral (like "Okay")
  const [error, setError] = useState('');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  const theme = useTheme();
  
  // Reset form when dialog is opened/closed
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);
  
  // Set form values when editing
  useEffect(() => {
    if (currentMood) {
      setName(currentMood.name);
      setColor(currentMood.color);
      setEmoji(currentMood.emoji || '');
      setDescription(currentMood.description || '');
      setMoodValue(currentMood.value !== undefined ? currentMood.value : 2);
      setEditMode(true);
    } else {
      setEditMode(false);
    }
  }, [currentMood]);
  
  const resetForm = () => {
    setCurrentMood(null);
    setName('');
    setColor('#4CAF50');
    setEmoji('');
    setDescription('');
    setMoodValue(2);
    setError('');
    setEditMode(false);
    setColorPickerOpen(false);
  };
  
  const handleOpen = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const handleEdit = (mood: CustomMoodCategory) => {
    setCurrentMood(mood);
    setOpen(true);
  };
  
  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };
  
  const confirmDelete = () => {
    if (confirmDeleteId) {
      const updatedMoods = customMoods.filter(mood => mood.id !== confirmDeleteId);
      onChange(updatedMoods);
      setConfirmDeleteId(null);
    }
  };
  
  const handleSubmit = () => {
    // Validate form
    if (!name.trim()) {
      setError('Please enter a mood name');
      return;
    }
    
    // Check for name duplication (except when editing current mood)
    const nameExists = customMoods.some(
      mood => mood.name.toLowerCase() === name.toLowerCase() && 
        (!currentMood || mood.id !== currentMood.id)
    );
    
    if (nameExists) {
      setError(`A mood named "${name}" already exists`);
      return;
    }
    
    try {
      if (editMode && currentMood) {
        // Update existing mood
        const updatedMoods = customMoods.map(mood => 
          mood.id === currentMood.id ? {
            ...mood,
            name,
            color,
            emoji,
            description,
            value: moodValue
          } : mood
        );
        onChange(updatedMoods);
      } else {
        // Create new mood
        const newMood: CustomMoodCategory = {
          id: uuidv4(),
          name,
          color,
          emoji,
          description,
          createdAt: new Date().toISOString(),
          value: moodValue
        };
        onChange([...customMoods, newMood]);
      }
      
      handleClose();
    } catch (err) {
      console.error('Error saving custom mood:', err);
      setError('Failed to save mood. Please try again.');
    }
  };
  
  const getMoodValueLabel = (value: number) => {
    switch (value) {
      case 0: return 'Very Bad';
      case 1: return 'Bad';
      case 2: return 'Neutral';
      case 3: return 'Good';
      case 4: return 'Very Good';
      default: return 'Neutral';
    }
  };
  
  return (
    <>
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Custom Mood Categories</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpen}
            >
              Add Custom Mood
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Create your own mood categories to track emotions that are important to you. Custom moods will appear alongside the default moods when logging your mood.
          </Typography>
          
          {customMoods.length === 0 ? (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                textAlign: 'center', 
                bgcolor: 'action.hover',
                borderRadius: 2
              }}
            >
              <SentimentSatisfiedAltIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1">
                You haven't created any custom moods yet.
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                onClick={handleOpen}
                sx={{ mt: 2 }}
              >
                Create Your First Custom Mood
              </Button>
            </Paper>
          ) : (
            <List>
              {customMoods.map(mood => (
                <ListItem
                  key={mood.id}
                  sx={{
                    mb: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: `${mood.color}10`
                  }}
                  secondaryAction={
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton edge="end" onClick={() => handleEdit(mood)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton edge="end" onClick={() => handleDelete(mood.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            bgcolor: mood.color,
                            mr: 2
                          }}
                        />
                        <Typography fontWeight="medium">
                          {mood.emoji && `${mood.emoji} `}{mood.name} 
                        </Typography>
                        <Chip 
                          size="small" 
                          label={getMoodValueLabel(mood.value !== undefined ? mood.value : 2)} 
                          sx={{ ml: 1, bgcolor: 'background.paper' }} 
                        />
                      </Box>
                    }
                    secondary={mood.description}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
      
      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit' : 'Add'} Custom Mood</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Mood Name"
                fullWidth
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                helperText="Give your mood a descriptive name (e.g., Anxious, Energetic, Calm)"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                Mood Color
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: color,
                    mr: 2,
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: 'divider'
                  }}
                  onClick={() => setColorPickerOpen(!colorPickerOpen)}
                />
                <TextField
                  size="small"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  sx={{ width: '100%' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">#</InputAdornment>
                    ),
                  }}
                />
              </Box>
              {colorPickerOpen && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <ChromePicker
                    color={color}
                    onChange={(colorResult: ColorResult) => setColor(colorResult.hex)}
                    disableAlpha
                  />
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Emoji (Optional)"
                fullWidth
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                helperText="Add a single emoji to represent this mood"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Mood Intensity
              </Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={moodValue}
                  onChange={(_, newValue) => setMoodValue(newValue as number)}
                  step={1}
                  marks
                  min={0}
                  max={4}
                  valueLabelDisplay="auto"
                  valueLabelFormat={getMoodValueLabel}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    Very Negative
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Very Positive
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description (Optional)"
                fullWidth
                multiline
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                helperText="Add a brief description to help you remember what this mood feels like"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            startIcon={<CheckCircleIcon />}
          >
            {editMode ? 'Update' : 'Add'} Mood
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this custom mood? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomMoodManager; 