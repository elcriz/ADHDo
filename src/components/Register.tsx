import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Container,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password);
      navigate('/todos');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
    >
      <Box
        sx={{ mt: 4 }}
      >
        <Paper
          elevation={3}
          sx={{ py: 2, px: 4, mx: 1 }}
        >
          <Typography
            variant="h4"
            component="h2"
            align="center"
            gutterBottom
          >
            Register
          </Typography>
          <Typography
            component="p"
            align="center"
          >
            It's entirely free and always will be!
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1 }}
          >
            <TextField
              type="text"
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              size="small"
              fullWidth
              margin="normal"
              placeholder="Enter your full name"
              autoComplete="name"
            />

            <TextField
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              size="small"
              fullWidth
              margin="normal"
              placeholder="Enter your email"
              autoComplete="email"
            />

            <TextField
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              size="small"
              fullWidth
              margin="normal"
              placeholder="Enter your password (min 6 characters)"
              autoComplete="new-password"
            />

            <TextField
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              size="small"
              fullWidth
              margin="normal"
              placeholder="Confirm your password"
              autoComplete="new-password"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2 }}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Creating account...' : 'Register'}
            </Button>
          </Box>

          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 2 }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: 'inherit' }}
            >
              <Typography
                component="span"
                variant="body2"
                color="primary"
                sx={{ textDecoration: 'underline' }}
              >
                Login here
              </Typography>
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
