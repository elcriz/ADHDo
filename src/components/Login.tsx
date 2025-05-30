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

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/todos');
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
            Login
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
              placeholder="Enter your password"
              autoComplete="current-password"
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
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>

          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 2 }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ color: 'inherit' }}
            >
              <Typography
                component="span"
                variant="body2"
                color="primary"
                sx={{ textDecoration: 'underline' }}
              >
                Register here
              </Typography>
            </Link>.<br />It's free and always will be!
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
