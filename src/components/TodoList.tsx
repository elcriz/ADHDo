import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Popover,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, Search as SearchIcon, Delete as DeleteIcon, ViewList as ViewListIcon, ViewModule as ViewModuleIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTodos } from '../contexts/TodoContext';
import { useEditing } from '../contexts/EditingContext';
import type { Todo, Tag } from '../types';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import DraggableTodoItem from './DraggableTodoItem';
import ConfirmationDialog from './ConfirmationDialog';
import TagSelector from './TagSelector';

// Droppable section component for priority and regular todos
interface DroppableSectionProps {
  sectionId: string;
  children: React.ReactNode;
}

const DroppableSection: React.FC<DroppableSectionProps> = ({ sectionId, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: sectionId,
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        transition: 'all 0.2s ease',
        position: 'relative', // Establish position context
        ...(isOver && {
          backgroundColor: 'action.hover',
          transform: 'scale(1.02)',
        }),
      }}
    >
      {children}
    </Box>
  );
};

const TodoList: React.FC = () => {
  const { todos, loading, deleteCompletedTodos, deleteTodosByDate, reorderTodos, makeTodoPriority, removeTodoPriority } = useTodos();
  const { isAnyEditing, setIsAnyEditing } = useEditing();
  const [activeTab, setActiveTab] = useState<'open' | 'completed'>('open');
  const [showForm, setShowForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [selectedFilterTags, setSelectedFilterTags] = useState<Tag[]>([]);
  const [tagFilterAnchor, setTagFilterAnchor] = useState<HTMLElement | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteDateDialog, setShowDeleteDateDialog] = useState(false);
  const [deletingCompleted, setDeletingCompleted] = useState(false);
  const [deletingDate, setDeletingDate] = useState(false);
  const [dateToDelete, setDateToDelete] = useState<string | null>(null);

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>(() => {
    const saved = localStorage.getItem('todoViewMode');
    return (saved === 'compact') ? 'compact' : 'detailed';
  });

  // Save view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('todoViewMode', viewMode);
  }, [viewMode]);

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'detailed' ? 'compact' : 'detailed');
  };

  const searchInputRef = useRef<HTMLInputElement>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Drag and drop sensors - simplified since we now use a dedicated drag handle
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Small distance for immediate response on drag handle
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 0, // No delay needed since we have a dedicated handle
        tolerance: 3, // Small tolerance for immediate response
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update global editing state when showForm changes
  useEffect(() => {
    setIsAnyEditing(showForm);
  }, [showForm, setIsAnyEditing]);

  // Close search and tag filter when editing starts
  useEffect(() => {
    if (isAnyEditing && showSearch) {
      setShowSearch(false);
      setSearchQuery('');
    }
    if (isAnyEditing && showTagFilter) {
      setShowTagFilter(false);
      setTagFilterAnchor(null);
    }
  }, [isAnyEditing, showSearch, showTagFilter]);

  // Focus search input when search becomes visible
  useEffect(() => {
    if (showSearch && !isAnyEditing) {
      // Small delay to ensure the Collapse animation doesn't interfere
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [showSearch, isAnyEditing]);

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

  const handleDeleteTodosByDate = async () => {
    if (!dateToDelete) return;

    setDeletingDate(true);
    try {
      await deleteTodosByDate(dateToDelete);
      setShowDeleteDateDialog(false);
      setDateToDelete(null);
    } catch (error) {
      console.error('Failed to delete todos by date:', error);
    } finally {
      setDeletingDate(false);
    }
  };

  const handleDateDeleteClick = (dateString: string) => {
    setDateToDelete(dateString);
    setShowDeleteDateDialog(true);
  };

  const handleTagFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setTagFilterAnchor(event.currentTarget);
    setShowTagFilter(true);
  };

  const handleTagFilterClose = () => {
    setTagFilterAnchor(null);
    setShowTagFilter(false);
  };

  const handleTagFilterChange = (tags: Tag[]) => {
    setSelectedFilterTags(tags);
  };

  const clearTagFilter = () => {
    setSelectedFilterTags([]);
    setShowTagFilter(false);
    setTagFilterAnchor(null);
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

      // Search in tags
      const tagsMatch = todo.tags?.some(tag =>
        tag.name.toLowerCase().includes(lowerQuery)
      );

      // Also search in children (including their tags)
      const childrenMatch = todo.children?.some(child =>
        typeof child === 'object' && (
          child.title.toLowerCase().includes(lowerQuery) ||
          child.description?.toLowerCase().includes(lowerQuery) ||
          child.tags?.some(tag => tag.name.toLowerCase().includes(lowerQuery))
        )
      );

      return titleMatch || descriptionMatch || tagsMatch || childrenMatch;
    });
  };

  // Filter todos by selected tags
  const filterTodosByTags = (todos: Todo[], filterTags: Tag[]): Todo[] => {
    if (!filterTags || filterTags.length === 0) return todos;

    return todos.filter(todo => {
      // Check if todo has any of the selected tags
      const hasMatchingTag = filterTags.some(filterTag =>
        todo.tags?.some(todoTag => todoTag._id === filterTag._id)
      );

      // Also check children for matching tags
      const childrenHaveMatchingTag = todo.children?.some(child =>
        typeof child === 'object' && filterTags.some(filterTag =>
          child.tags?.some(childTag => childTag._id === filterTag._id)
        )
      );

      return hasMatchingTag || childrenHaveMatchingTag;
    });
  };

  // Group completed todos by completion date
  const groupTodosByCompletionDate = (todos: Todo[]): { [date: string]: Todo[] } => {
    const grouped: { [date: string]: Todo[] } = {};

    todos.forEach(todo => {
      if (todo.completedAt) {
        const completionDate = new Date(todo.completedAt);
        const dateKey = completionDate.toDateString(); // e.g., "Mon May 28 2025"

        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(todo);
      }
    });

    // Sort todos within each date group by completion time (newest first)
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => {
        const timeA = new Date(a.completedAt!).getTime();
        const timeB = new Date(b.completedAt!).getTime();
        return timeB - timeA; // Newest first
      });
    });

    return grouped;
  };

  // Format date for display
  const formatDateHeading = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }

    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // Check if it's this year
    if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    }

    // Different year
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle drag end event
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Check if we're moving between priority sections
    const isMovingToPriority = over.id === 'priority-section';
    const isMovingToRegular = over.id === 'regular-section';
    const activeTodo = openTodos.find(todo => todo._id === active.id);

    if (!activeTodo) return;

    // If dropping on priority or regular section containers
    if (isMovingToPriority || isMovingToRegular) {
      try {
        if (isMovingToPriority) {
          await makeTodoPriority(activeTodo._id);
        } else {
          await removeTodoPriority(activeTodo._id);
        }
      } catch (error) {
        console.error('Failed to update todo priority:', error);
      }
      return;
    }

    // Handle reordering within the same section
    const sourceList = activeTodo.isPriority ? priorityTodos : regularTodos;
    const activeIndex = sourceList.findIndex(todo => todo._id === active.id);
    const overIndex = sourceList.findIndex(todo => todo._id === over.id);

    if (activeIndex !== -1 && overIndex !== -1) {
      const reorderedTodos = arrayMove(sourceList, activeIndex, overIndex);
      const todoIds = reorderedTodos.map(todo => todo._id);

      try {
        await reorderTodos(todoIds);
      } catch (error) {
        console.error('Failed to reorder todos:', error);
      }
    }
  };

  const allOpenTodos = todoArray.filter(todo => !todo.completed && !todo.parent);
  const allCompletedTodos = todoArray.filter(todo => todo.completed && !todo.parent);

  const openTodos = useMemo(() => {
    let filtered = allOpenTodos;
    // Apply tag filter first
    if (selectedFilterTags.length > 0) {
      filtered = filterTodosByTags(filtered, selectedFilterTags);
    }
    // Then apply search filter
    return searchTodos(filtered, searchQuery);
  }, [allOpenTodos, searchQuery, selectedFilterTags]);

  // Separate priority and regular open todos
  const priorityTodos = useMemo(() => {
    return openTodos.filter(todo => todo.isPriority);
  }, [openTodos]);

  const regularTodos = useMemo(() => {
    return openTodos.filter(todo => !todo.isPriority);
  }, [openTodos]);

  const completedTodos = useMemo(() => {
    let filtered = allCompletedTodos;
    // Apply tag filter first
    if (selectedFilterTags.length > 0) {
      filtered = filterTodosByTags(filtered, selectedFilterTags);
    }
    // Then apply search filter
    return searchTodos(filtered, searchQuery);
  }, [allCompletedTodos, searchQuery, selectedFilterTags]);

  // Group completed todos by completion date (newest dates first)
  const groupedCompletedTodos = useMemo(() => {
    const grouped = groupTodosByCompletionDate(completedTodos);
    const sortedDateKeys = Object.keys(grouped).sort((a, b) => {
      const dateA = new Date(a).getTime();
      const dateB = new Date(b).getTime();
      return dateB - dateA; // Newest dates first
    });

    return sortedDateKeys.map(dateKey => ({
      date: dateKey,
      todos: grouped[dateKey]
    }));
  }, [completedTodos]);

  const renderTodoWithChildren = (todo: Todo, level: number = 0) => {
    // Filter out any children that are strings (IDs) instead of Todo objects
    const validChildren = todo.children?.filter(child => typeof child === 'object' && child._id) || [];

    return (
      <Box
        key={todo._id}
      >
        <TodoItem
          todo={todo}
          level={level}
          viewMode={viewMode}
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
      sx={{ pt: isMobile ? 0 : 4, pb: isMobile ? 8.25 : 4, px: isMobile ? 0 : 4 }}
    >
      <Paper
        elevation={isMobile ? 0 : 2}
        sx={{ px: 2, pb: 2, pt: 0, backgroundColor: isMobile ? 'transparent': 'auto', borderRadius: isMobile ? 0 : 2 }}
      >
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ml: -2,  mr: -2, mb: isDesktop ? 0 : 2, px: 2, py: 1, backgroundColor: 'ui', borderTopLeftRadius: isMobile ? 0 : 8, borderTopRightRadius: isMobile ? 0 : 8 }}
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
              size="small"
              aria-label={viewMode === 'detailed' ? 'Switch to compact view' : 'Switch to detailed view'}
              onClick={toggleViewMode}
              sx={{
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.light',
                  color: 'primary.dark',
                },
              }}
            >
              {viewMode === 'detailed' ? <ViewListIcon /> : <ViewModuleIcon />}
            </IconButton>
            <IconButton
              size="small"
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
                },
              }}
            >
              <SearchIcon />
            </IconButton>
            <IconButton
              size="small"
              aria-label="Filter todos by tags"
              disabled={isAnyEditing || showForm}
              onClick={handleTagFilterClick}
              sx={{
                bgcolor: selectedFilterTags.length > 0 ? 'primary.main' : 'transparent',
                color: selectedFilterTags.length > 0 ? 'primary.contrastText' : 'primary.main',
                '&:hover': {
                  bgcolor: selectedFilterTags.length > 0 ? 'primary.dark' : 'primary.light',
                  color: selectedFilterTags.length > 0 ? 'primary.contrastText' : 'primary.dark',
                },
                '&:disabled': {
                  bgcolor: 'transparent',
                  color: 'action.disabled',
                },
              }}
            >
              <FilterListIcon />
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
          <Box sx={{ mb: 2, mt: isDesktop ? 2 : 0 }}>
            <TextField
              inputRef={searchInputRef}
              size="small"
              fullWidth
              placeholder="Search todos by title, description, or tags... (minimum 2 characters)"
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

        <Popover
          open={showTagFilter}
          anchorEl={tagFilterAnchor}
          onClose={handleTagFilterClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Box sx={{ p: 2, minWidth: 300 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Filter by Tags</Typography>
              {selectedFilterTags.length > 0 && (
                <Button
                  size="small"
                  onClick={clearTagFilter}
                  sx={{ minWidth: 'auto' }}
                >
                  Clear All
                </Button>
              )}
            </Box>
            <TagSelector
              selectedTags={selectedFilterTags}
              onChange={handleTagFilterChange}
              size="small"
            />
            {selectedFilterTags.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Active Filters:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedFilterTags.map(tag => (
                    <Chip
                      key={tag._id}
                      label={tag.name}
                      size="small"
                      style={{ backgroundColor: tag.color, color: '#fff' }}
                      onDelete={() => {
                        const newTags = selectedFilterTags.filter(t => t._id !== tag._id);
                        setSelectedFilterTags(newTags);
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Popover>

        {/* Active Tag Filters Display */}
        {selectedFilterTags.length > 0 && (
          <Box sx={{ mb: 2, mt: isDesktop ? 2 : 0, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Filtering by tags:
              </Typography>
              <Button
                size="small"
                onClick={clearTagFilter}
                sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
              >
                Clear All
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedFilterTags.map(tag => (
                <Chip
                  key={tag._id}
                  label={tag.name}
                  size="small"
                  style={{ backgroundColor: tag.color, color: '#fff' }}
                  onDelete={() => {
                    const newTags = selectedFilterTags.filter(t => t._id !== tag._id);
                    setSelectedFilterTags(newTags);
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {showForm && (
          <Paper
            elevation={1}
            sx={{
              p: 2,
              mb: 3,
              mt: isDesktop ? 2 : 0,
              bgcolor: 'uiForm',
              ...(isMobile && {
                position: 'sticky',
                top: 80,
                zIndex: 999,
              })
            }}
          >
            <TodoForm
              onSuccess={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          </Paper>
        )}

        <Box
          sx={{ mb: 3}}
        >
          {/* Show tabs on mobile/tablet, hide on desktop */}
          {!isDesktop && (
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              sx={{
                '& .MuiTabs-flexContainer': {
                  bgcolor: 'ui',
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  p: 0.5,
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 700,
                  '&:first-of-type': {
                    borderTopLeftRadius: 8,
                  },
                  '&:last-of-type': {
                    borderTopRightRadius: 8,
                  }
                },
                '& .Mui-selected': {
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                },
              }}
            >
              <Tab
                label={`Open (${openTodos.length}${searchQuery.length >= 2 || selectedFilterTags.length > 0 ? ` of ${allOpenTodos.length}` : ''})`}
                value="open"
                sx={{ minHeight: 22, py: 1.5 }}
              />
              <Tab
                label={`Completed (${completedTodos.length}${searchQuery.length >= 2 || selectedFilterTags.length > 0 ? ` of ${allCompletedTodos.length}` : ''})`}
                value="completed"
                sx={{ minHeight: 22, py: 1.5 }}
              />
            </Tabs>
          )}

          {/* Delete All Completed Button - show only on mobile when on completed tab */}
          {(!isDesktop && activeTab === 'completed') && allCompletedTodos.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
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
          sx={{ position: 'relative', mt: -1 }}
        >
          {isDesktop ? (
            // Desktop: Two-column layout
            <Box sx={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              {/* Open Todos Column - 2/3 width */}
              <Box sx={{ flex: 2, minWidth: 0 }}>
                <Box
                  sx={{
                    position: 'sticky',
                    top: { xs: 56, sm: 64 },
                    zIndex: 10,
                    mb: 2,
                    px: 2,
                    pt: 1.5,
                    mx: -2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    pb: 1,
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800 }}
                  >
                    Open ({openTodos.length}{searchQuery.length >= 2 || selectedFilterTags.length > 0 ? ` of ${allOpenTodos.length}` : ''})
                  </Typography>
                </Box>

                {openTodos.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchQuery.length >= 2
                        ? `No open todos found matching "${searchQuery}"`
                        : "No open todos. Create one to get started!"}
                    </Typography>
                  </Box>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {/* Priority Section */}
                      <Box>
                        <Box
                          sx={{
                            mb: 2,
                            px: 2,
                            pt: 1.5,
                            mx: -2,
                            borderBottom: 1,
                            borderColor: 'divider',
                            pb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, fontSize: '1rem' }}
                          >
                            Priority ({priorityTodos.length})
                          </Typography>
                        </Box>
                        <DroppableSection sectionId="priority-section">
                          {priorityTodos.length === 0 ? (
                            <Box
                              sx={{
                                border: '2px dashed',
                                borderColor: 'divider',
                                borderRadius: 2,
                                p: 3,
                                textAlign: 'center',
                                minHeight: 80,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'action.hover',
                                position: 'relative',
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontStyle: 'italic' }}
                              >
                                Drag your priority todos in here to maintain focus. Eat the frog!
                              </Typography>
                            </Box>
                          ) : (
                            <SortableContext
                              items={priorityTodos.map(todo => todo._id)}
                              strategy={verticalListSortingStrategy}
                            >
                              <Box
                                sx={{
                                  border: '2px dashed',
                                  borderColor: 'divider',
                                  borderRadius: 2,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 1,
                                  pt: 2,
                                  px: 2,
                                  pb: 1,
                                  backgroundColor: 'action.hover',
                                  position: 'relative',
                                }}
                              >
                                {priorityTodos.map(todo => (
                                  <DraggableTodoItem
                                    key={todo._id}
                                    todo={todo}
                                    level={0}
                                    viewMode={viewMode}
                                  />
                                ))}
                              </Box>
                            </SortableContext>
                          )}
                        </DroppableSection>
                      </Box>

                      {/* Regular Todos Section */}
                      <Box>
                        <Box
                          sx={{
                            mb: 2,
                            px: 2,
                            pt: 1.5,
                            mx: -2,
                            borderBottom: 1,
                            borderColor: 'divider',
                            pb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, fontSize: '1rem' }}
                          >
                            Other ({regularTodos.length})
                          </Typography>
                        </Box>
                        <DroppableSection sectionId="regular-section">
                          {regularTodos.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                              <Typography variant="body2" color="text.secondary">
                                No other todos
                              </Typography>
                            </Box>
                          ) : (
                            <SortableContext
                              items={regularTodos.map(todo => todo._id)}
                              strategy={verticalListSortingStrategy}
                            >
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {regularTodos.map(todo => (
                                  <DraggableTodoItem
                                    key={todo._id}
                                    todo={todo}
                                    level={0}
                                    viewMode={viewMode}
                                  />
                                ))}
                              </Box>
                            </SortableContext>
                          )}
                        </DroppableSection>
                      </Box>
                    </Box>
                  </DndContext>
                )}
              </Box>

              {/* Completed Todos Column - 1/3 width */}
              <Box sx={{ flex: 1, minWidth: 0, px: isDesktop ? 4 : 0, pb: isDesktop ? 1 : 0, backgroundColor: isDesktop ? 'action.hover': 'none', borderRadius: 2 }}>
                <Box
                  sx={{
                    position: 'sticky',
                    top: { xs: 56, sm: 64 },
                    zIndex: 10,
                    mb: 2,
                    px: 0,
                    pt: 1.5,
                    mx: -2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    pb: 1,
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800 }}
                  >
                    Completed ({completedTodos.length} {searchQuery.length >= 2 || selectedFilterTags.length > 0 ? ` of ${allCompletedTodos.length}` : ''})
                  </Typography>
                </Box>

                {groupedCompletedTodos.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchQuery.length >= 2
                        ? `No completed todos found matching "${searchQuery}"`
                        : "No completed todos yet. Time to get busy!"}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: isDesktop ? -0.65 : -2 }}>
                    {groupedCompletedTodos.map(({ date, todos }) => (
                      <Box key={date}>
                        <Box
                          sx={{
                            mb: 2,
                            px: isDesktop ? 0 : 2,
                            pt: 1.5,
                            mx: -2,
                            borderBottom: 1,
                            borderColor: 'divider',
                            pb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, fontSize: '1rem' }}
                          >
                            {formatDateHeading(date)} ({todos.length})
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleDateDeleteClick(date)}
                            sx={{
                              color: 'text.secondary',
                              '&:hover': {
                                color: 'error.main',
                                backgroundColor: 'error.light',
                              },
                            }}
                            title={`Delete all todos completed on ${formatDateHeading(date)}`}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {todos.map(todo => renderTodoWithChildren(todo))}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          ) : (
            // Mobile/Tablet: Single column with tabs
            activeTab === 'open' ? (
              // Render open todos with drag and drop and priority sections
              openTodos.length === 0 ? (
                <Box
                  sx={{ textAlign: 'center', py: 4 }}
                >
                  <Typography
                    variant="body1"
                    color="text.secondary"
                  >
                    {searchQuery.length >= 2
                      ? `No open todos found matching "${searchQuery}"`
                      : "No open todos. Create one to get started!"}
                  </Typography>
                </Box>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Priority Section */}
                    <Box>
                      <Box
                        sx={{
                          position: 'sticky',
                          top: { xs: 56, sm: 64 }, // Account for AppBar/Toolbar height
                          zIndex: 10,
                          mb: 2,
                          px: 2,
                          pt: 1.5,
                          mx: -2,
                          borderBottom: 1,
                          borderColor: 'divider',
                          pb: 1,
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600 }}
                        >
                          Priority ({priorityTodos.length})
                        </Typography>
                      </Box>
                      <DroppableSection sectionId="priority-section">
                        {priorityTodos.length === 0 ? (
                          <Box
                            sx={{
                              border: '2px dashed',
                              borderColor: 'divider',
                              borderRadius: 2,
                              p: 3,
                              textAlign: 'center',
                              minHeight: 80,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'action.hover',
                              position: 'relative', // Add position context
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontStyle: 'italic' }}
                            >
                              Drag your priority todos in here to maintain focus. Eat the frog!
                            </Typography>
                          </Box>
                        ) : (
                          <SortableContext
                            items={priorityTodos.map(todo => todo._id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <Box
                              sx={{
                                border: '2px dashed',
                                borderColor: 'divider',
                                borderRadius: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                pt: 2,
                                px: 2,
                                pb: 1,
                                backgroundColor: 'action.hover',
                                position: 'relative', // Add position context
                              }}
                            >
                              {priorityTodos.map(todo => (
                                <DraggableTodoItem
                                  key={todo._id}
                                  todo={todo}
                                  level={0}
                                  viewMode={viewMode}
                                />
                              ))}
                            </Box>
                          </SortableContext>
                        )}
                      </DroppableSection>
                    </Box>

                    {/* Regular Todos Section */}
                    <Box>
                      <Box
                        sx={{
                          position: 'sticky',
                          top: { xs: 56, sm: 64 }, // Account for AppBar/Toolbar height
                          zIndex: 10,
                          mb: 2,
                          px: 2,
                          pt: 1.5,
                          mx: -2,
                          borderBottom: 1,
                          borderColor: 'divider',
                          pb: 1,
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600 }}
                        >
                          Other ({regularTodos.length})
                        </Typography>
                      </Box>
                      <DroppableSection sectionId="regular-section">
                        {regularTodos.length === 0 ? (
                          <Box
                            sx={{ textAlign: 'center', py: 4 }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              No other todos
                            </Typography>
                          </Box>
                        ) : (
                          <SortableContext
                            items={regularTodos.map(todo => todo._id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <Box
                              sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                            >
                              {regularTodos.map(todo => (
                                <DraggableTodoItem
                                  key={todo._id}
                                  todo={todo}
                                  level={0}
                                  viewMode={viewMode}
                                />
                              ))}
                            </Box>
                          </SortableContext>
                        )}
                      </DroppableSection>
                    </Box>
                  </Box>
                </DndContext>
              )
            ) : (
              // Render completed todos grouped by date
              groupedCompletedTodos.length === 0 ? (
                <Box
                  sx={{ textAlign: 'center', py: 4 }}
                >
                  <Typography
                    variant="body1"
                    color="text.secondary"
                  >
                    {searchQuery.length >= 2
                      ? `No completed todos found matching "${searchQuery}"`
                      : "No completed todos yet. Time to get busy!"}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: -2 }}>
                  {groupedCompletedTodos.map(({ date, todos }) => (
                    <Box key={date}>
                      <Box
                        sx={{
                          position: 'sticky',
                          top: { xs: 56, sm: 64 }, // Account for AppBar/Toolbar height
                          zIndex: 10,
                          mb: 2,
                          px: 2,
                          pt: 1.5,
                          mx: -2,
                          borderBottom: 1,
                          borderColor: 'divider',
                          pb: 1,
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {formatDateHeading(date)} ({todos.length})
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleDateDeleteClick(date)}
                          sx={{
                            color: 'text.secondary',
                            '&:hover': {
                              color: 'error.main',
                              backgroundColor: 'error.light',
                            },
                          }}
                          title={`Delete all todos completed on ${formatDateHeading(date)}`}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {todos.map(todo => renderTodoWithChildren(todo))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )
            )
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

      {/* Delete all completed todos confirmation */}
      <ConfirmationDialog
        open={showDeleteDialog}
        title="Delete All Completed Todos"
        message="Are you sure you want to delete all completed todos? This action cannot be undone."
        confirmText="Delete All"
        loading={deletingCompleted}
        destructive={true}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAllCompleted}
      />

      {/* Delete todos by date confirmation */}
      <ConfirmationDialog
        open={showDeleteDateDialog}
        title={`Delete Todos for ${dateToDelete ? formatDateHeading(dateToDelete) : ''}`}
        message={`Are you sure you want to delete all todos completed on ${dateToDelete ? formatDateHeading(dateToDelete) : 'this date'}? This action cannot be undone.`}
        confirmText="Delete"
        loading={deletingDate}
        destructive={true}
        onClose={() => setShowDeleteDateDialog(false)}
        onConfirm={handleDeleteTodosByDate}
      />
    </Container>
  );
};

export default TodoList;
