import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box } from '@mui/material';
import type { Todo } from '../types';
import { useEditing } from '../contexts/EditingContext';
import TodoItem from './TodoItem';
import { BorderColor } from '@mui/icons-material';

interface DraggableTodoItemProps {
  todo: Todo;
  level: number;
  viewMode?: 'detailed' | 'compact';
}

const DraggableTodoItem: React.FC<DraggableTodoItemProps> = ({ todo, level, viewMode = 'detailed' }) => {
  const { isAnyEditing } = useEditing();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: todo._id,
    data: {
      type: 'Todo',
      todo,
    },
    disabled: isAnyEditing, // Disable dragging when editing
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
    zIndex: isSortableDragging ? 1000 : 'auto',
  };

  // Filter out any children that are strings (IDs) instead of Todo objects
  const validChildren = todo.children?.filter(child => typeof child === 'object' && child._id) || [];

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      sx={{
        cursor: isAnyEditing ? 'default' : (isSortableDragging ? 'grabbing' : 'auto'),
      }}
    >
      <TodoItem
        todo={todo}
        level={level}
        dragHandleProps={!isAnyEditing ? listeners : {}}
        showDragHandle={true}
        viewMode={viewMode}
      />
      {validChildren.length > 0 && (
        <Box sx={{ ml: 2 }}>
          {validChildren.map(child => (
            <TodoItem
              key={child._id}
              todo={child}
              level={level + 1}
              showDragHandle={false}
              viewMode={viewMode}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default DraggableTodoItem;
