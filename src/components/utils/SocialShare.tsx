import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
  TextField,
  Snackbar,
  Alert,
  Divider,
  Chip,
  Stack,
  Switch,
  FormControlLabel,
  useTheme
} from '@mui/material';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  EmailIcon
} from 'react-share';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { MoodType } from '../../types';

// Define navigator.share interface if it doesn't exist
interface NavigatorShare {
  share?: (data: { title: string; text: string; url: string }) => Promise<void>;
}

interface SocialShareProps {
  title?: string;
  text?: string;
  hashtags?: string[];
  shareUrl?: string;
  moodType?: MoodType;
  iconSize?: number;
  isButton?: boolean;
  buttonText?: string;
  allowAnonymous?: boolean;
}

const SocialShare: React.FC<SocialShareProps> = ({
  title = 'My Mood Tracker Insight',
  text = 'Check out my mood insights from Pro Mood Tracker!',
  hashtags = ['moodtracker', 'wellbeing', 'mentalhealth'],
  shareUrl = window.location.href,
  moodType,
  iconSize = 32,
  isButton = false,
  buttonText = 'Share',
  allowAnonymous = true
}) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customText, setCustomText] = useState(text);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [success, setSuccess] = useState('');
  const theme = useTheme();

  const getMoodColor = (mood?: MoodType): string => {
    if (!mood) return theme.palette.primary.main;
    
    switch (mood) {
      case 'Very Good':
        return '#4CAF50';
      case 'Good':
        return '#8BC34A';
      case 'Okay':
        return '#FFC107';
      case 'Bad':
        return '#FF9800';
      case 'Very Bad':
        return '#F44336';
      default:
        return theme.palette.primary.main;
    }
  };
  
  const getMoodEmoji = (mood?: MoodType): string => {
    if (!mood) return '📊';
    
    switch (mood) {
      case 'Very Good':
        return '😄';
      case 'Good':
        return '🙂';
      case 'Okay':
        return '😐';
      case 'Bad':
        return '🙁';
      case 'Very Bad':
        return '😢';
      default:
        return '📊';
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCopied(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${customText} ${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleNativeShare = async () => {
    const nav = navigator as NavigatorShare;
    if (nav.share) {
      try {
        await nav.share({
          title,
          text: customText,
          url: shareUrl,
        });
        setSuccess('Shared successfully!');
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const getShareContent = () => {
    return isAnonymous 
      ? `${customText} ${shareUrl}`
      : `${getMoodEmoji(moodType)} ${customText} ${shareUrl}`;
  };

  return (
    <>
      {isButton ? (
        <Button
          variant="outlined"
          startIcon={<ShareIcon />}
          onClick={handleOpen}
          size="small"
          sx={{ 
            borderColor: getMoodColor(moodType),
            color: getMoodColor(moodType),
            '&:hover': {
              borderColor: getMoodColor(moodType),
              backgroundColor: `${getMoodColor(moodType)}10`,
            }
          }}
        >
          {buttonText}
        </Button>
      ) : (
        <Tooltip title="Share">
          <IconButton 
            onClick={handleOpen}
            sx={{ 
              color: getMoodColor(moodType) 
            }}
          >
            <ShareIcon />
          </IconButton>
        </Tooltip>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Share {moodType ? `Your ${moodType} Mood` : 'Your Insights'}
        </DialogTitle>
        
        <DialogContent>
          {allowAnonymous && (
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    color="primary"
                  />
                }
                label="Share anonymously (without mood emoji)"
              />
            </Box>
          )}
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Customize your message"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            variant="outlined"
            sx={{ mb: 3 }}
          />
          
          <Divider sx={{ mb: 3 }}>
            <Chip label="Share via" />
          </Divider>
          
          <Stack 
            direction="row" 
            spacing={2} 
            justifyContent="center" 
            sx={{ mb: 3 }}
          >
            <FacebookShareButton url={shareUrl} title={getShareContent()} hashtag={`#${hashtags[0]}`}>
              <Tooltip title="Share on Facebook">
                <Box>
                  <FacebookIcon size={iconSize} round />
                </Box>
              </Tooltip>
            </FacebookShareButton>
            
            <TwitterShareButton url={shareUrl} title={getShareContent()} hashtags={hashtags}>
              <Tooltip title="Share on Twitter">
                <Box>
                  <TwitterIcon size={iconSize} round />
                </Box>
              </Tooltip>
            </TwitterShareButton>
            
            <LinkedinShareButton url={shareUrl} title={title} summary={getShareContent()}>
              <Tooltip title="Share on LinkedIn">
                <Box>
                  <LinkedinIcon size={iconSize} round />
                </Box>
              </Tooltip>
            </LinkedinShareButton>
            
            <WhatsappShareButton url={shareUrl} title={getShareContent()}>
              <Tooltip title="Share on WhatsApp">
                <Box>
                  <WhatsappIcon size={iconSize} round />
                </Box>
              </Tooltip>
            </WhatsappShareButton>
            
            <EmailShareButton url={shareUrl} subject={title} body={getShareContent()}>
              <Tooltip title="Share via Email">
                <Box>
                  <EmailIcon size={iconSize} round />
                </Box>
              </Tooltip>
            </EmailShareButton>
          </Stack>
          
          <Divider sx={{ mb: 3 }}>
            <Chip label="Or" />
          </Divider>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
              onClick={handleCopyLink}
              color={copied ? 'success' : 'primary'}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            
            {(navigator as NavigatorShare).share && (
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={handleNativeShare}
              >
                Share via...
              </Button>
            )}
          </Box>
          
          <Box sx={{ mt: 3, bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Note: The link will take people to the mood tracker app. They won't be able to see your personal data unless you choose to share specifics in your message.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={3000} 
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SocialShare; 