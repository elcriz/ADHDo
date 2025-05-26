import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TodoProvider } from './contexts/TodoContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import TodoList from './components/TodoList';
import Header from './components/Header';
import { theme } from './theme';

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <Box
        sx={{ minHeight: '100vh', bgcolor: 'background.default' }}
      >
        <Header />
        <Box
          component="main"
          sx={{ maxWidth: '1200px', mx: 'auto', px: 0, py: 2 }}
        >
          {!user && (
            <Typography
              variant="h3"
              component="h1"
              align="center"
              sx={{ mt: 4, fontWeight: 200 }}
            >
              The <strong>pragmatic</strong> todo app for neurodivergent <strong>human</strong> beings
            </Typography>
          )}
          <Routes>
            <Route
              path="/login"
              element={<Login />}
            />
            <Route
              path="/register"
              element={<Register />}
            />
            <Route
              path="/todos"
              element={
                <ProtectedRoute>
                  <TodoProvider>
                    <TodoList />
                  </TodoProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <Navigate
                  to="/todos"
                  replace
                />
              }
            />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider
      theme={theme}
    >
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
