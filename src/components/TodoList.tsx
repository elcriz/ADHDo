import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Container,
  Fab,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
  IconButton,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
import { useTodos } from '../contexts/TodoContext';
import { useEditing } from '../contexts/EditingContext';
import type { Todo } from '../types';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';

const TodoList: React.FC = () => {
  const { todos, loading, deleteCompletedTodos } = useTodos();
  const { isAnyEditing, setIsAnyEditing } = useEditing();
  const [activeTab, setActiveTab] = useState<'open' | 'completed'>('open');
  const [showForm, setShowForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingCompleted, setDeletingCompleted] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Update global editing state when showForm changes
  useEffect(() => {
    setIsAnyEditing(showForm);
  }, [showForm, setIsAnyEditing]);

  // Close search when editing starts
  useEffect(() => {
    if (isAnyEditing && showSearch) {
      setShowSearch(false);
      setSearchQuery('');
    }
  }, [isAnyEditing, showSearch]);

  const handleDeleteAllCompleted = async () => {
    setDeletingCompleted(true);
    try {
      await deleteCompletedTodos();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete completed todos:', error);
    } finally {
      setDeletingCompleted(false);
    }
  };

  // Ensure todos is always an array and filter by completion status
  const todoArray = Array.isArray(todos) ? todos : [];

  // Search function
  const searchTodos = (todos: Todo[], query: string): Todo[] => {
    if (!query || query.length < 2) return todos;

    const lowerQuery = query.toLowerCase();
    return todos.filter(todo => {
      const titleMatch = todo.title.toLowerCase().includes(lowerQuery);
      const descriptionMatch = todo.description?.toLowerCase().includes(lowerQuery);

      // Also search in children
      const childrenMatch = todo.children?.some(child =>
        typeof child === 'object' && (
          child.title.toLowerCase().includes(lowerQuery) ||
          child.description?.toLowerCase().includes(lowerQuery)
        )
      );

      return titleMatch || descriptionMatch || childrenMatch;
    });
  };

  const allOpenTodos = todoArray.filter(todo => !todo.completed && !todo.parent);
  const allCompletedTodos = todoArray.filter(todo => todo.completed && !todo.parent);

  const openTodos = useMemo(() => searchTodos(allOpenTodos, searchQuery), [allOpenTodos, searchQuery]);
  const completedTodos = useMemo(() => searchTodos(allCompletedTodos, searchQuery), [allCompletedTodos, searchQuery]);

  const currentTodos = activeTab === 'open' ? openTodos : completedTodos;  const renderTodoWithChildren = (todo: Todo, level: number = 0) => {
    // Filter out any children that are strings (IDs) instead of Todo objects
    const validChildren = todo.children?.filter(child => typeof child === 'object' && child._id) || [];

    return (
      <Box
        key={todo._id}
      >
        <TodoItem
          todo={todo}
          level={level}
        />
        {validChildren.length > 0 && (
          <Box
            sx={{ ml: 2 }}
          >
            {validChildren.map(child => renderTodoWithChildren(child, level + 1))}
          </Box>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '16rem'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container
      maxWidth="lg"
    >
      <Paper
        elevation={2}
        sx={{ p: 2 }}
      >
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
          >
            My Todos
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <IconButton
              color="primary"
              aria-label="Search todos"
              disabled={isAnyEditing || showForm}
              onClick={() => {
                setShowSearch(!showSearch);
                if (showSearch) {
                  setSearchQuery('');
                }
              }}
              sx={{
                bgcolor: showSearch ? 'primary.main' : 'transparent',
                color: showSearch ? 'primary.contrastText' : 'primary.main',
                '&:hover': {
                  bgcolor: showSearch ? 'primary.dark' : 'primary.light',
                  color: showSearch ? 'primary.contrastText' : 'primary.dark',
                },
                '&:disabled': {
                  bgcolor: 'transparent',
                  color: 'action.disabled',
                  borderColor: 'action.disabled',
                },
                border: '1px solid',
                borderColor: (isAnyEditing || showForm) ? 'action.disabled' : 'primary.main',
              }}
            >
              <SearchIcon />
            </IconButton>
            {!isMobile && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                disabled={showSearch}
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'Cancel' : 'Add Todo'}
              </Button>
            )}
          </Box>
        </Box>

        <Collapse in={showSearch && !isAnyEditing}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search todos... (minimum 2 characters)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper',
                }
              }}
            />
          </Box>
        </Collapse>

        {showForm && (
          <Paper
            elevation={1}
            sx={{
              p: 2,
              mb: 3,
              bgcolor: 'grey.50',
              ...(isMobile && {
                position: 'sticky',
                top: 80,
                zIndex: 999,
              })
            }}
          >
            <TodoForm
              onSuccess={() => setShowForm(false)}
            />
          </Paper>
        )}

        <Box
          sx={{ mb: 3}}
        >
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTabs-flexContainer': {
                bgcolor: 'grey.100',
                borderRadius: 2,
                p: 0.5,
              },
              '& .MuiTab-root': {
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500,
              },
              '& .Mui-selected': {
                bgcolor: 'background.paper',
                boxShadow: 1,
              },
            }}
          >
            <Tab
              label={`Open (${openTodos.length}${searchQuery.length >= 2 ? ` of ${allOpenTodos.length}` : ''})`}
              value="open"
              sx={{ minHeight: 22, py: 1.5 }}
            />
            <Tab
              label={`Completed (${completedTodos.length}${searchQuery.length >= 2 ? ` of ${allCompletedTodos.length}` : ''})`}
              value="completed"
              sx={{ minHeight: 22, py: 1.5 }}
            />
          </Tabs>

          {/* Delete All Completed Button */}
          {activeTab === 'completed' && allCompletedTodos.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="contained"
                color="error"
                size="small"
                disabled={isAnyEditing || showSearch || deletingCompleted}
                onClick={() => setShowDeleteDialog(true)}
                sx={{
                  '&:disabled': {
                    bgcolor: 'action.disabled',
                    color: 'action.disabled',
                  },
                }}
              >
                {deletingCompleted ? 'Deleting...' : 'Delete All Completed'}
              </Button>
            </Box>
          )}
        </Box>

        <Box
          sx={{ mt: 2 }}
        >
          {currentTodos.length === 0 ? (
            <Box
              sx={{ textAlign: 'center', py: 4 }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
              >
                {searchQuery.length >= 2
                  ? `No ${activeTab} todos found matching "${searchQuery}"`
                  : activeTab === 'open'
                    ? "No open todos. Create one to get started!"
                    : "No completed todos yet."}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
            >
              {currentTodos.map(todo => renderTodoWithChildren(todo))}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Floating Action Button for mobile devices */}
      {isMobile && (
        <Fab
          color={showForm ? 'error' : 'primary'}
          aria-label={showForm ? 'Cancel adding todo' : 'Add new todo'}
          disabled={showSearch}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            '&:disabled': {
              bgcolor: 'action.disabled',
              color: 'action.disabled',
            },
          }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <CloseIcon /> : <AddIcon />}
        </Fab>
      )}

      {/* Delete all completed todos dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        aria-labelledby="delete-all-completed-todos"
      >
        <DialogTitle id="delete-all-completed-todos">
          Delete All Completed Todos
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete all completed todos? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowDeleteDialog(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAllCompleted}
            color="error"
            disabled={deletingCompleted}
          >
            {deletingCompleted ? <CircularProgress size={24} /> : 'Delete All'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TodoList;
