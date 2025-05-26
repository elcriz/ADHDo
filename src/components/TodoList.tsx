import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Container,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useTodos } from '../contexts/TodoContext';
import type { Todo } from '../types';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';

const TodoList: React.FC = () => {
  const { todos, loading } = useTodos();
  const [activeTab, setActiveTab] = useState<'open' | 'completed'>('open');
  const [showForm, setShowForm] = useState(false);

  // Ensure todos is always an array and filter by completion status
  const todoArray = Array.isArray(todos) ? todos : [];
  const openTodos = todoArray.filter(todo => !todo.completed && !todo.parent);
  const completedTodos = todoArray.filter(todo => todo.completed && !todo.parent);

  const currentTodos = activeTab === 'open' ? openTodos : completedTodos;

  const renderTodoWithChildren = (todo: Todo, level: number = 0) => (
    <Box
      key={todo._id}
    >
      <TodoItem
        todo={todo}
        level={level}
      />
      {todo.children && todo.children.length > 0 && (
        <Box
          sx={{ ml: 2 }}
        >
          {todo.children.map(child => renderTodoWithChildren(child, level + 1))}
        </Box>
      )}
    </Box>
  );

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
        sx={{ p: 3 }}
      >
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
          >
            My Todos
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add Todo'}
          </Button>
        </Box>

        {showForm && (
          <Paper
            elevation={1}
            sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}
          >
            <TodoForm
              onSuccess={() => setShowForm(false)}
            />
          </Paper>
        )}

        <Box
          sx={{ mb: 3 }}
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
              label={`Open (${openTodos.length})`}
              value="open"
            />
            <Tab
              label={`Completed (${completedTodos.length})`}
              value="completed"
            />
          </Tabs>
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
                {activeTab === 'open'
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
    </Container>
  );
};

export default TodoList;
