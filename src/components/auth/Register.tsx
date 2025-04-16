import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Box, 
  Button, 
  Container, 
  TextField, 
  Typography, 
  Paper, 
  Link, 
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const steps = ['Account Details', 'Preferences'];

  const validateStep1 = () => {
    setFormError('');

    if (!username.trim()) {
      setFormError('Username is required');
      return false;
    }
    
    if (!email.trim()) {
      setFormError('Email is required');
      return false;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      setFormError('Please enter a valid email address');
      return false;
    }
    
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return false;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (validateStep1()) {
        setActiveStep(1);
      }
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      await register(username, email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          mt: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%', 
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
            Create Account
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {(error || formError) && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {formError || error}
            </Alert>
          )}

          {activeStep === 0 ? (
            <Box component="form" sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </Box>
          ) : (
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Almost there!
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 4 }}>
                Your account is ready to be created. Click "Create Account" to finish the registration process.
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, width: '100%' }}>
            <Button
              color="inherit"
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            
            <Box sx={{ flex: '1 1 auto' }} />
            
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : activeStep === steps.length - 1 ? (
                'Create Account'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login">
                Log in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 