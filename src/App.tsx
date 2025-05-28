import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Typography } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TodoProvider } from './contexts/TodoContext';
import { EditingProvider } from './contexts/EditingContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import TodoList from './components/TodoList';
import TagManagement from './components/TagManagement';
import Header from './components/Header';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { useAppTheme } from './theme';

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
          sx={{ maxWidth: '1200px', mx: 'auto', px: 0, py: 0 }}
        >
          {!user && (
            <Typography
              variant="h1"
              component="h1"
              align="center"
              sx={{ mt: 4, px: 4, fontWeight: 200 }}
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
                  <EditingProvider>
                    <TodoProvider>
                      <TodoList />
                    </TodoProvider>
                  </EditingProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tags"
              element={
                <ProtectedRoute>
                  <TagManagement />
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
        <PWAInstallPrompt />
      </Box>
    </Router>
  );
}

function App() {
  const theme = useAppTheme();

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
