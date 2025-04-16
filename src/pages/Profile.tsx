import React from 'react';
import { Container, Box } from '@mui/material';
import UserProfile from '../components/profile/UserProfile';

const Profile: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <UserProfile />
      </Box>
    </Container>
  );
};

export default Profile; 