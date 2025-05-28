import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  useTheme,
  useMediaQuery,
  Popover,
  MenuList,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { tagApi } from '../services/api';
import type { Tag } from '../types';

const TagManagement: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New tag form state
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [creatingTag, setCreatingTag] = useState(false);

  // Edit tag state
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editTagName, setEditTagName] = useState('');
  const [updatingTag, setUpdatingTag] = useState(false);

  // Delete confirmation state
  const [deleteTagId, setDeleteTagId] = useState<string | null>(null);
  const [deletingTag, setDeletingTag] = useState(false);

  // Popover menu state
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      setError('');
      const fetchedTags = await tagApi.getTags();
      setTags(Array.isArray(fetchedTags) ? fetchedTags : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load tags');
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      setError('Tag name is required');
      return;
    }

    setCreatingTag(true);
    setError('');

    try {
      const newTag = await tagApi.createTag({ name: newTagName.trim() });
      setTags(prev => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
      setNewTagName('');
      setShowNewTagForm(false);
      setSuccess('Tag created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create tag');
    } finally {
      setCreatingTag(false);
    }
  };

  const handleStartEdit = (tag: Tag) => {
    setEditingTagId(tag._id);
    setEditTagName(tag.name);
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingTagId(null);
    setEditTagName('');
    setError('');
  };

  const handleUpdateTag = async (tagId: string) => {
    if (!editTagName.trim()) {
      setError('Tag name is required');
      return;
    }

    setUpdatingTag(true);
    setError('');

    try {
      const updatedTag = await tagApi.updateTag(tagId, { name: editTagName.trim() });
      setTags(prev =>
        prev.map(tag => tag._id === tagId ? updatedTag : tag)
           .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingTagId(null);
      setEditTagName('');
      setSuccess('Tag updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update tag');
    } finally {
      setUpdatingTag(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    setDeletingTag(true);
    setError('');

    try {
      await tagApi.deleteTag(tagId);
      setTags(prev => prev.filter(tag => tag._id !== tagId));
      setDeleteTagId(null);
      setSuccess('Tag deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete tag');
      setDeleteTagId(null);
    } finally {
      setDeletingTag(false);
    }
  };

  const handleBackToTodos = () => {
    navigate('/todos');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, tagId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedTagId(tagId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTagId(null);
  };

  const handleEditFromMenu = (tag: Tag) => {
    handleStartEdit(tag);
    handleMenuClose();
  };

  const handleDeleteFromMenu = (tagId: string) => {
    setDeleteTagId(tagId);
    handleMenuClose();
  };

  return (
    <Container
      maxWidth="lg"
      sx={{ p: isMobile ? 1 : 4 }}
    >
      <Paper
        elevation={isMobile ? 0 : 2}
        sx={{
          p: 3,
          backgroundColor: isMobile ? 'transparent' : 'auto',
          borderRadius: isMobile ? 0 : 2
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            gap: 2
          }}
        >
          <IconButton
            onClick={handleBackToTodos}
            size="small"
            sx={{
              bgcolor: 'action.hover',
              '&:hover': {
                bgcolor: 'action.selected',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            sx={{ flexGrow: 1 }}
          >
            Manage Tags
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowNewTagForm(true)}
            disabled={showNewTagForm || loading}
            size={isMobile ? 'small' : 'medium'}
          >
            Add Tag
          </Button>
        </Box>

        {/* Alert messages */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {/* New tag form */}
        {showNewTagForm && (
          <Paper
            elevation={1}
            sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 2 }}
            >
              Create New Tag
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'flex-start',
                flexDirection: isMobile ? 'column' : 'row'
              }}
            >
              <TextField
                label="Tag Name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name..."
                size="small"
                disabled={creatingTag}
                autoFocus
                sx={{ flexGrow: 1, minWidth: isMobile ? '100%' : 200 }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateTag();
                  }
                }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleCreateTag}
                  disabled={creatingTag || !newTagName.trim()}
                  startIcon={creatingTag ? <CircularProgress size={16} /> : <SaveIcon />}
                >
                  {creatingTag ? 'Creating...' : 'Create'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setShowNewTagForm(false);
                    setNewTagName('');
                    setError('');
                  }}
                  disabled={creatingTag}
                  startIcon={<CancelIcon />}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Tags list */}
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 200
            }}
          >
            <CircularProgress />
          </Box>
        ) : tags.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: 'grey.50'
            }}
          >
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              No tags yet
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Create your first tag to start organizing your todos!
            </Typography>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{ bgcolor: 'background.paper' }}
          >
            <Typography
              variant="h6"
              sx={{ p: 2, bgcolor: 'grey.50' }}
            >
              Your Tags ({tags.length})
            </Typography>
            <List>
              {tags.map((tag, index) => (
                <ListItem
                  key={tag._id}
                  divider={index < tags.length - 1}
                  sx={{
                    py: 2,
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'stretch' : 'center',
                    gap: isMobile ? 1 : 0
                  }}
                >
                  {editingTagId === tag._id ? (
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center',
                        width: '100%',
                        flexDirection: isMobile ? 'column' : 'row'
                      }}
                    >
                      <TextField
                        value={editTagName}
                        onChange={(e) => setEditTagName(e.target.value)}
                        size="small"
                        disabled={updatingTag}
                        autoFocus
                        sx={{ flexGrow: 1, minWidth: isMobile ? '100%' : 200 }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateTag(tag._id);
                          }
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleUpdateTag(tag._id)}
                          disabled={updatingTag || !editTagName.trim()}
                        >
                          {updatingTag ? <CircularProgress size={16} /> : <SaveIcon />}
                        </IconButton>
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={handleCancelEdit}
                          disabled={updatingTag}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        gap: 2,
                        flexDirection: isMobile ? 'column' : 'row'
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              flexWrap: 'wrap'
                            }}
                          >
                            <Chip
                              label={tag.name}
                              size="medium"
                              style={{
                                backgroundColor: tag.color,
                                color: 'white',
                              }}
                            />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontSize: '0.75rem' }}
                            >
                              Created: {new Date(tag.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <IconButton
                        size="small"
                        onClick={(event) => handleMenuOpen(event, tag._id)}
                        disabled={editingTagId !== null}
                        sx={{ flexShrink: 0 }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Paper>

      {/* Tag Actions Popover Menu */}
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
            onClick={() => {
              const tag = tags.find(t => t._id === selectedTagId);
              if (tag) handleEditFromMenu(tag);
            }}
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
            onClick={() => {
              if (selectedTagId) handleDeleteFromMenu(selectedTagId);
            }}
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

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteTagId !== null}
        onClose={() => !deletingTag && setDeleteTagId(null)}
      >
        <DialogTitle>Delete Tag</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this tag? This action cannot be undone.
            Note that existing todos with this tag will keep the tag until manually removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteTagId(null)}
            disabled={deletingTag}
          >
            Cancel
          </Button>
          <Button
            onClick={() => deleteTagId && handleDeleteTag(deleteTagId)}
            color="error"
            disabled={deletingTag}
            startIcon={deletingTag ? <CircularProgress size={16} /> : undefined}
          >
            {deletingTag ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TagManagement;
