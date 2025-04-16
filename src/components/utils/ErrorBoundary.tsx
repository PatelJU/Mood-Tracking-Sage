import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Divider,
  Stack,
  Alert
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import { Link as RouterLink } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onReset?: () => void;
  errorLogFunction?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in its child component tree.
 * Displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
    
    // Call the optional error logging function if provided
    if (this.props.errorLogFunction) {
      this.props.errorLogFunction(error, errorInfo);
    }
  }

  handleReset = (): void => {
    // Reset the error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Call the optional onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If a custom fallback component is provided, use it
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }
      
      // Otherwise, use the default fallback UI
      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'error.light'
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <ErrorOutlineIcon color="error" sx={{ fontSize: 60 }} />
              <Typography variant="h4" color="error" gutterBottom>
                Something went wrong
              </Typography>
              <Typography variant="body1" color="text.secondary">
                We're sorry, but an error occurred while rendering this component.
              </Typography>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="subtitle2">
                {this.state.error?.toString() || 'Unknown error'}
              </Typography>
            </Alert>
            
            <Box 
              sx={{ 
                bgcolor: 'action.hover', 
                p: 2, 
                borderRadius: 1,
                mb: 3,
                maxHeight: '200px',
                overflow: 'auto'
              }}
            >
              <Typography 
                variant="caption" 
                component="pre" 
                sx={{ 
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '0.7rem'
                }}
              >
                {this.state.errorInfo?.componentStack || 'No component stack available'}
              </Typography>
            </Box>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center"
            >
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<RefreshIcon />}
                onClick={this.handleReset}
                fullWidth
              >
                Try Again
              </Button>
              
              <Button 
                variant="outlined" 
                component={RouterLink} 
                to="/"
                startIcon={<HomeIcon />}
                fullWidth
              >
                Back to Dashboard
              </Button>
            </Stack>
          </Paper>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              If this problem persists, please contact support or try refreshing the page.
            </Typography>
          </Box>
        </Container>
      );
    }

    // If there's no error, render the children normally
    return this.props.children;
  }
}

export default ErrorBoundary; 