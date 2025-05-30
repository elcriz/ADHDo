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
import { useToast } from '../contexts/ToastContext';

const TagManagement: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showToast } = useToast();

  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // New tag form state
  const [isShowingNewTagForm, setIsShowingNewTagForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  // Edit tag state
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editTagName, setEditTagName] = useState('');
  const [isUpdatingTag, setIsUpdatingTag] = useState(false);

  // Delete confirmation state
  const [deleteTagId, setDeleteTagId] = useState<string | null>(null);
  const [isDeletingTag, setIsDeletingTag] = useState(false);

  // Popover menu state
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setIsLoading(true);
      setError('');
      const fetchedTags = await tagApi.getTags();
      setTags(Array.isArray(fetchedTags) ? fetchedTags : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load tags');
      setTags([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      setError('Tag name is required');
      return;
    }

    setIsCreatingTag(true);
    setError('');

    try {
      const newTag = await tagApi.createTag({ name: newTagName.trim() });
      setTags(prev => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
      setNewTagName('');
      setIsShowingNewTagForm(false);
      showToast(`Tag "${newTag.name}" created successfully!`, 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to create tag');
    } finally {
      setIsCreatingTag(false);
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

    setIsUpdatingTag(true);
    setError('');

    try {
      const updatedTag = await tagApi.updateTag(tagId, { name: editTagName.trim() });
      setTags(prev =>
        prev.map(tag => tag._id === tagId ? updatedTag : tag)
           .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingTagId(null);
      setEditTagName('');
      showToast(`Tag "${updatedTag.name}" updated successfully!`, 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to update tag');
    } finally {
      setIsUpdatingTag(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    setIsDeletingTag(true);
    setError('');

    try {
      const tagToDelete = tags.find(tag => tag._id === tagId);
      await tagApi.deleteTag(tagId);
      setTags(prev => prev.filter(tag => tag._id !== tagId));
      setDeleteTagId(null);
      showToast(`Tag "${tagToDelete?.name || 'Unknown'}" deleted successfully!`, 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to delete tag');
      setDeleteTagId(null);
    } finally {
      setIsDeletingTag(false);
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
          px: 1,
          pt: 2,
          pb: 1,
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
            onClick={() => setIsShowingNewTagForm(true)}
            disabled={isShowingNewTagForm || isLoading}
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

        {/* New tag form */}
        {isShowingNewTagForm && (
          <Paper
            elevation={1}
            sx={{ p: 2, mb: 3, bgcolor: 'uiForm' }}
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
                disabled={isCreatingTag}
                autoFocus
                sx={{ flexGrow: 1, minWidth: isMobile ? '100%' : 200 }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateTag();
                  }
                }}
              />
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 1, mt: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleCreateTag}
                  disabled={isCreatingTag || !newTagName.trim()}
                  startIcon={isCreatingTag ? <CircularProgress size={16} /> : <SaveIcon />}
                >
                  {isCreatingTag ? 'Creating...' : 'Create'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setIsShowingNewTagForm(false);
                    setNewTagName('');
                    setError('');
                  }}
                  disabled={isCreatingTag}
                  startIcon={<CancelIcon />}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Tags list */}
        {isLoading ? (
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
              sx={{ p: 2, bgcolor: 'ui', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
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
                        disabled={isUpdatingTag}
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
                          disabled={isUpdatingTag || !editTagName.trim()}
                        >
                          {isUpdatingTag ? <CircularProgress size={16} /> : <SaveIcon />}
                        </IconButton>
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={handleCancelEdit}
                          disabled={isUpdatingTag}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        width: '100%',
                        gap: 2
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          flexGrow: 1,
                          minWidth: 0,
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
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(event) => handleMenuOpen(event, tag._id)}
                        disabled={editingTagId !== null}
                        sx={{
                          flexShrink: 0,
                          alignSelf: 'flex-start',
                        }}
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
        onClose={() => !isDeletingTag && setDeleteTagId(null)}
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
            disabled={isDeletingTag}
          >
            Cancel
          </Button>
          <Button
            onClick={() => deleteTagId && handleDeleteTag(deleteTagId)}
            color="error"
            disabled={isDeletingTag}
            startIcon={isDeletingTag ? <CircularProgress size={16} /> : undefined}
          >
            {isDeletingTag ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TagManagement;
