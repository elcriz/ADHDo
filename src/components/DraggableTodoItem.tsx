import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box } from '@mui/material';
import type { Todo } from '../types';
import { useEditing } from '../contexts/EditingContext';
import TodoItem from './TodoItem';

interface DraggableTodoItemProps {
  todo: Todo;
  level: number;
}

const DraggableTodoItem: React.FC<DraggableTodoItemProps> = ({ todo, level }) => {
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
  };

  // Filter out any children that are strings (IDs) instead of Todo objects
  const validChildren = todo.children?.filter(child => typeof child === 'object' && child._id) || [];

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      sx={{
        // Allow normal touch scrolling
        touchAction: 'manipulation',
        cursor: isAnyEditing ? 'default' : (isSortableDragging ? 'grabbing' : 'grab'),
      }}
    >
      <Box
        {...(!isAnyEditing ? listeners : {})} // Only apply listeners when not editing
        sx={{
          // Only prevent touch actions on the draggable content
          ...((!isAnyEditing && listeners) && { touchAction: 'none' }),
          userSelect: 'none',
        }}
      >
        <TodoItem
          todo={todo}
          level={level}
        />
      </Box>
      {validChildren.length > 0 && (
        <Box sx={{ ml: 2 }}>
          {validChildren.map(child => (
            <TodoItem
              key={child._id}
              todo={child}
              level={level + 1}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default DraggableTodoItem;
