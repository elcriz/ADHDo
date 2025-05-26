import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderRadius: 0,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        zIndex: (theme) => theme.zIndex.appBar,
        top: 0
      }}
    >
      <Toolbar>
        <Typography
          variant="h5"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 700,
          }}
        >
          ADHDo
        </Typography>

        {user ? (
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Welcome, {user.name}
            </Typography>
            <Button
              onClick={handleLogout}
              variant="contained"
              color="error"
              size="small"
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Box
            sx={{ display: 'flex', gap: 1 }}
          >
            <Button
              component={Link}
              to="/login"
              color="primary"
              size="small"
            >
              Login
            </Button>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              color="primary"
              size="small"
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
