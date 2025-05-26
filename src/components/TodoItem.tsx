import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Checkbox,
  Typography,
  IconButton,
  Box,
  Chip,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import type { Todo } from '../types';
import { useTodos } from '../contexts/TodoContext';
import TodoForm from './TodoForm';

interface TodoItemProps {
  todo: Todo;
  level: number;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, level }) => {
  const { toggleTodo, deleteTodo } = useTodos();
  const [isEditing, setIsEditing] = useState(false);
  const [showChildForm, setShowChildForm] = useState(false);

  const handleToggle = () => {
    toggleTodo(todo._id);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this todo and all its children?')) {
      deleteTodo(todo._id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card 
      elevation={level > 0 ? 1 : 2}
      sx={{ 
        mb: 1,
        ml: level * 2,
        borderLeft: level > 0 ? 3 : 0,
        borderLeftColor: level > 0 ? 'primary.light' : 'transparent',
        bgcolor: todo.completed ? 'grey.50' : 'background.paper',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Checkbox
            checked={todo.completed}
            onChange={handleToggle}
            size="small"
            sx={{ mt: -0.5 }}
          />
          
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="body1"
              sx={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? 'text.disabled' : 'text.primary',
                fontWeight: 500,
              }}
            >
              {todo.title}
            </Typography>
            
            {todo.description && (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  color: todo.completed ? 'text.disabled' : 'text.secondary',
                }}
              >
                {todo.description}
              </Typography>
            )}
            
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              <Chip
                label={`Created: ${formatDate(todo.createdAt)}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
              {todo.completedAt && (
                <Chip
                  label={`Completed: ${formatDate(todo.completedAt)}`}
                  size="small"
                  variant="outlined"
                  color="success"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              )}
              {todo.children.length > 0 && (
                <Chip
                  label={`${todo.children.length} subtask${todo.children.length > 1 ? 's' : ''}`}
                  size="small"
                  variant="outlined"
                  color="info"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              )}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Add subtask">
              <IconButton
                size="small"
                onClick={() => setShowChildForm(!showChildForm)}
                color="success"
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => setIsEditing(!isEditing)}
                color="primary"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={handleDelete}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {isEditing && (
          <Paper elevation={1} sx={{ mt: 2, p: 2, bgcolor: 'grey.50' }}>
            <TodoForm
              todo={todo}
              onSuccess={() => setIsEditing(false)}
              onCancel={() => setIsEditing(false)}
            />
          </Paper>
        )}

        {showChildForm && (
          <Paper elevation={1} sx={{ mt: 2, p: 2, bgcolor: 'primary.50' }}>
            <TodoForm
              parent={todo._id}
              onSuccess={() => setShowChildForm(false)}
              onCancel={() => setShowChildForm(false)}
            />
          </Paper>
        )}
      </CardContent>
    </Card>
  );
};

export default TodoItem;