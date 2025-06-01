import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Popover,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Menu as MenuIcon, Logout as LogoutIcon, Label as LabelIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import ColorBar from './ColorBar';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setAnchorEl(null); // Close the popover
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
      <AppBar
        position="sticky"
        elevation={1}
        sx={{
          bgcolor: '#3b82f6',
          color: 'text.contrastText',
          borderRadius: 0,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          zIndex: (theme) => theme.zIndex.appBar,
          top: 0
        }}
      >
      <Toolbar>
        <Typography
          variant="h4"
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
              color="text.contrastText"
            >
              Hi, {user.name}
            </Typography>
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              aria-label="User menu"
              aria-controls={open ? 'user-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              sx={{
                color: 'text.primary',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Popover
              id="user-menu"
              open={open}
              anchorEl={anchorEl}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 120,
                  boxShadow: 3,
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  navigate('/tags');
                  setAnchorEl(null);
                }}
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon>
                  <LabelIcon
                    fontSize="small"
                  />
                </ListItemIcon>
                <ListItemText primary="Manage tags" />
              </MenuItem>
              <MenuItem
                onClick={handleLogout}
                sx={{
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.light',
                    color: 'error.contrastText',
                  },
                }}
              >
                <ListItemIcon>
                  <LogoutIcon
                    fontSize="small"
                    sx={{ color: 'inherit' }}
                  />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </MenuItem>
            </Popover>
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
      <ColorBar />
    </AppBar>
  );
};

export default Header;
