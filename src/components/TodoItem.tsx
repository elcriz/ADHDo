import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Checkbox,
  Typography,
  IconButton,
  Box,
  Chip,
  Paper,
  Popover,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { Todo } from '../types';
import { useTodos } from '../contexts/TodoContext';
import { useEditing } from '../contexts/EditingContext';
import TodoForm from './TodoForm';

interface TodoItemProps {
  todo: Todo;
  level: number;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, level }) => {
  const { toggleTodo, deleteTodo } = useTodos();
  const { isAnyEditing, setIsAnyEditing, editingTodoId, setEditingTodoId } = useEditing();
  const [isEditing, setIsEditing] = useState(false);
  const [showChildForm, setShowChildForm] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Update global editing state when this todo is being edited
  useEffect(() => {
    if (isEditing || showChildForm) {
      setIsAnyEditing(true);
      setEditingTodoId(todo._id);
    } else if (editingTodoId === todo._id) {
      setIsAnyEditing(false);
      setEditingTodoId(null);
    }
  }, [isEditing, showChildForm, todo._id, setIsAnyEditing, setEditingTodoId, editingTodoId]);

  // Filter out any children that are strings (IDs) instead of Todo objects
  const validChildren = todo.children?.filter(child => typeof child === 'object' && child._id) || [];

  const handleToggle = () => {
    toggleTodo(todo._id);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this todo and all its children?')) {
      deleteTodo(todo._id);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    // Don't open menu if any other todo is being edited
    if (isAnyEditing && editingTodoId !== todo._id) {
      return;
    }
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddSubtask = () => {
    setShowChildForm(!showChildForm);
    handleMenuClose();
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    handleDelete();
    handleMenuClose();
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd-MM-yyyy');
  };

  return (
    <Card
      elevation={level > 0 ? 1 : 2}
      sx={{
        mb: 1,
        ml: level,
        borderLeft: level > 0 ? 3 : 0,
        borderLeftColor: level > 0 ? 'primary.light' : 'transparent',
        borderTop: !todo.completed ? 4 : 0,
        borderTopColor: !todo.completed ? 'primary.main' : 'transparent',
        bgcolor: todo.completed ? 'grey.50' : 'background.paper',
        borderTopLeftRadius: level > 0 ? 0 : 8,
        borderTopRightRadius: level > 0 ? 0 : 8,
        borderBottomRightRadius: validChildren.length > 0 ? 0 : 8,
      }}
    >
      <CardContent
        sx={{ p: 1, px: 0.25, '&:last-child': { pb: 1.5 } }}
      >
        <Box
          sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}
        >
          <Checkbox
            checked={todo.completed}
            onChange={handleToggle}
            disabled={isAnyEditing && editingTodoId !== todo._id}
            size="small"
            sx={{ mt: -0.5 }}
          />

          <Box
            sx={{ flexGrow: 1, minWidth: 0, mt: 0.65 }}
          >
            <Typography
              variant="body1"
              sx={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? 'text.disabled' : 'text.primary',
                fontWeight: 700,
                lineHeight: 1.25,
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

            <Box
              sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
            >
              <Chip
                label={`Created: ${formatDate(todo.createdAt)}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20, pt: 0.35 }}
              />
              {todo.completedAt && (
                <Chip
                  label={`Completed: ${formatDate(todo.completedAt)}`}
                  size="small"
                  variant="outlined"
                  color="success"
                  sx={{ fontSize: '0.7rem', height: 20, pt: 0.35 }}
                />
              )}
              {validChildren.length > 0 && (
                <Chip
                  label={`${validChildren.length} subtask${validChildren.length > 1 ? 's' : ''}`}
                  size="small"
                  variant="outlined"
                  color="info"
                  sx={{ fontSize: '0.7rem', height: 20, pt: 0.35 }}
                />
              )}
            </Box>
          </Box>

          <IconButton
            size="small"
            onClick={handleMenuOpen}
            disabled={isAnyEditing && editingTodoId !== todo._id}
            sx={{
              p: 0.5,
              '&:disabled': {
                color: 'action.disabled',
              }
            }}
          >
            <MoreVertIcon
              fontSize="small"
            />
          </IconButton>

          <Popover
            open={Boolean(anchorEl)}
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
          >
            <MenuList
              dense
              sx={{ py: 0 }}
            >
              <MenuItem
                onClick={handleAddSubtask}
              >
                <ListItemIcon>
                  <AddIcon
                    fontSize="small"
                    color="success"
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Add subtask"
                />
              </MenuItem>
              <MenuItem
                onClick={handleEdit}
              >
                <ListItemIcon>
                  <EditIcon
                    fontSize="small"
                    color="primary"
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Edit"
                />
              </MenuItem>
              <MenuItem
                onClick={handleDeleteClick}
              >
                <ListItemIcon>
                  <DeleteIcon
                    fontSize="small"
                    color="error"
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Delete"
                />
              </MenuItem>
            </MenuList>
          </Popover>
        </Box>

        {isEditing && (
          <Paper
            elevation={1}
            sx={{ mt: 2, p: 2, bgcolor: 'grey.50' }}
          >
            <TodoForm
              todo={todo}
              onSuccess={() => setIsEditing(false)}
              onCancel={() => setIsEditing(false)}
            />
          </Paper>
        )}

        {showChildForm && (
          <Paper
            elevation={1}
            sx={{ mt: 2, p: 2, bgcolor: 'primary.50' }}
          >
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
