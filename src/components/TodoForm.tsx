import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import type { Todo, Tag } from '../types';
import { useTodos } from '../contexts/TodoContext';
import TagSelector from './TagSelector';

interface TodoFormProps {
  todo?: Todo;
  parent?: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ todo, parent, onSuccess, onCancel }) => {
  const [title, setTitle] = useState(todo?.title || '');
  const [description, setDescription] = useState(todo?.description || '');
  const [selectedTags, setSelectedTags] = useState<Tag[]>(todo?.tags || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { createTodo, updateTodo } = useTodos();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);

    try {
      const tagIds = selectedTags.map(tag => tag._id);

      if (todo) {
        // Update existing todo
        await updateTodo(todo._id, title.trim(), description.trim() || undefined, tagIds);
      } else {
        // Create new todo
        await createTodo(title.trim(), description.trim() || undefined, parent, tagIds);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save todo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      {error && (
        <Alert
          severity="error"
        >
          {error}
        </Alert>
      )}

      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter todo title"
        disabled={loading}
        required
        size="small"
        fullWidth
        autoFocus
      />

      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter todo description (optional)"
        disabled={loading}
        multiline
        rows={3}
        size="small"
        fullWidth
      />

      <TagSelector
        selectedTags={selectedTags}
        onChange={setSelectedTags}
        disabled={loading}
        size="small"
      />

      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, pr: todo && !todo.completed ? 2 : 0 }}
      >
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
          size="small"
        >
          {loading ? 'Saving...' : (todo ? 'Update todo' : 'Create todo ')}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
            size="small"
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default TodoForm;
