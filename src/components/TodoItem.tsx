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
  DragIndicator as DragIndicatorIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { Todo } from '../types';
import { useTodos } from '../contexts/TodoContext';
import { useEditing } from '../contexts/EditingContext';
import TodoForm from './TodoForm';
import { TagList } from './TagChip';
import ConfirmationDialog from './ConfirmationDialog';

interface TodoItemProps {
  todo: Todo;
  level: number;
  dragHandleProps?: any; // Props from useSortable for drag handle
  showDragHandle?: boolean; // Whether to show the drag handle
  viewMode?: 'detailed' | 'compact'; // View mode for rendering
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, level, dragHandleProps, showDragHandle = false, viewMode = 'detailed' }) => {
  const { toggleTodo, deleteTodo, makeTodoPriority, removeTodoPriority } = useTodos();
  const { isAnyEditing, setIsAnyEditing, editingTodoId, setEditingTodoId } = useEditing();
  const [isEditing, setIsEditing] = useState(false);
  const [showChildForm, setShowChildForm] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleToggle = async () => {
    // If marking as completed (was not completed before), trigger fade animation
    if (!todo.completed) {
      setIsCompleting(true);

      // Wait for fade animation to complete before calling the API
      setTimeout(async () => {
        await toggleTodo(todo._id);
        setIsCompleting(false);
      }, 500); // 500ms animation duration
    } else {
      // If uncompleting, no animation needed - just toggle immediately
      toggleTodo(todo._id);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTodo(todo._id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete todo:', error);
    } finally {
      setIsDeleting(false);
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
  };  const handleMakePriority = async () => {
    try {
      await makeTodoPriority(todo._id);
    } catch (error) {
      console.error('Failed to make todo priority:', error);
    }
    handleMenuClose();
  };

  const handleRemovePriority = async () => {
    try {
      await removeTodoPriority(todo._id);
    } catch (error) {
      console.error('Failed to remove todo priority:', error);
    }
    handleMenuClose();
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd-MM-yyyy');
  };

  return (
    <Card
      elevation={level > 0 ? 1 : 2}
      sx={{
        position: 'relative',
        mb: 1,
        ml: level,
        borderLeft: level > 0 ? 3 : 0,
        borderLeftColor: level > 0 ? 'primary.light' : 'transparent',
        bgcolor: todo.completed
          ? 'todoCompleted'
          : todo.isPriority
            ? (theme => theme.palette.mode === 'dark' ? 'warning.dark' : 'warning.light')
            : 'background.paper',
        borderTopLeftRadius: level > 0 ? 0 : 8,
        borderTopRightRadius: level > 0 ? 0 : 8,
        borderBottomRightRadius: validChildren.length > 0 ? 0 : 8,
        // Animation styles
        opacity: isCompleting ? 0 : 1,
        transform: isCompleting ? 'scale(0.95)' : 'scale(1)',
        transition: 'opacity 500ms ease-out, transform 500ms ease-out',
        // Slightly reduce height when fading out for smoother effect
        ...(isCompleting && {
          overflow: 'hidden',
        }),
      }}
    >
      <CardContent
        sx={{ p: 1, px: 0.25, '&:last-child': { pb: 1.5 } }}
      >
        <Box
          sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, pt: viewMode === 'compact' ? 1 : 0 }}
        >
          <Checkbox
            checked={todo.completed}
            onChange={handleToggle}
            disabled={isAnyEditing && editingTodoId !== todo._id || isCompleting}
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

            {viewMode === 'detailed' && todo.description && (
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

            {viewMode === 'detailed' ? (
              <Box
                sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
              >
                <Chip
                  label={`Created: ${formatDate(todo.createdAt)}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20, pt: 0 }}
                />
                {todo.completedAt && (
                  <Chip
                    label={`Completed: ${formatDate(todo.completedAt)}`}
                    size="small"
                    variant="outlined"
                    color="success"
                    sx={{ fontSize: '0.7rem', height: 20, pt: 0 }}
                  />
                )}
                {validChildren.length > 0 && (
                  <Chip
                    label={`${validChildren.length} subtask${validChildren.length > 1 ? 's' : ''}`}
                    size="small"
                    variant="outlined"
                    color="info"
                    sx={{ fontSize: '0.7rem', height: 20, pt: 0 }}
                  />
                )}
              </Box>
            ) : (
              // Compact mode: only show subtask count if present
              validChildren.length > 0 && (
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={`${validChildren.length} subtask${validChildren.length > 1 ? 's' : ''}`}
                    size="small"
                    variant="outlined"
                    color="info"
                    sx={{ fontSize: '0.7rem', height: 20, pt: 0 }}
                  />
                </Box>
              )
            )}

            {/* Tags display - only in detailed mode */}
            {viewMode === 'detailed' && <TagList tags={todo.tags || []} size="small" />}
          </Box>

          {/* Drag Handle - only show for open todos in draggable context */}
          {showDragHandle && !todo.completed && (
            <Box
              component="div"
              role="button"
              tabIndex={0}
              aria-label="Drag to reorder"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                display: isEditing ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 1,
                cursor: isAnyEditing ? 'default' : 'grab',
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: 'action.hover',
                },
                '&:active': {
                  cursor: isAnyEditing ? 'default' : 'grabbing',
                },
                // Disable the drag handle when editing
                ...(isAnyEditing && {
                  color: 'action.disabled',
                  cursor: 'default',
                  pointerEvents: 'none',
                }),
                // Ensure touch events work properly on mobile
                touchAction: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent',
                // Prevent default button/link behaviors
                border: 'none',
                background: 'none',
                outline: 'none',
                // Ensure proper focus styles for accessibility
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: 2,
                },
              }}
              {...(!isAnyEditing ? dragHandleProps : {})}
            >
              <DragIndicatorIcon fontSize="small" />
            </Box>
          )}

          <IconButton
            size="small"
            onClick={handleMenuOpen}
            disabled={isAnyEditing && editingTodoId !== todo._id || isCompleting}
            sx={{
              mt: viewMode === 'compact' ? -1.5 : 0,
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
              {/* Only show "Make priority" for open todos that are not already priority */}
              {!todo.completed && !todo.isPriority && (
                <MenuItem
                  onClick={handleMakePriority}
                >
                  <ListItemIcon>
                    <StarIcon
                      fontSize="small"
                      color="warning"
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Make priority"
                  />
                </MenuItem>
              )}
              {/* Only show "Remove priority" for prioritized todos */}
              {!todo.completed && todo.isPriority && (
                <MenuItem
                  onClick={handleRemovePriority}
                >
                  <ListItemIcon>
                    <StarIcon
                      fontSize="small"
                      sx={{ color: 'text.secondary' }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Remove priority"
                  />
                </MenuItem>
              )}
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
            sx={{ mt: 1, mx: 1, mb: 0, p: 2, bgcolor: 'uiForm' }}
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
            sx={{ mt: 2, mb: -2, p: 2, bgcolor: 'uiForm' }}
          >
            <TodoForm
              parent={todo._id}
              onSuccess={() => setShowChildForm(false)}
              onCancel={() => setShowChildForm(false)}
            />
          </Paper>
        )}
      </CardContent>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        title="Delete Todo"
        message={
          validChildren.length > 0
            ? 'Are you sure you want to delete this todo and all its children? This action cannot be undone.'
            : 'Are you sure you want to delete this todo? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        loading={isDeleting}
        destructive={true}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
      />
    </Card>
  );
};

export default TodoItem;
