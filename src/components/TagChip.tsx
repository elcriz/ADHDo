import React from 'react';
import { Chip, Box } from '@mui/material';
import type { Tag } from '../types';

interface TagChipProps {
  tag: Tag;
  size?: 'small' | 'medium';
  onDelete?: () => void;
}

const TagChip: React.FC<TagChipProps> = ({ tag, size = 'small', onDelete }) => {
  return (
    <Chip
      label={tag.name}
      size={size}
      onDelete={onDelete}
      style={{
        backgroundColor: tag.color,
        color: 'white',
        fontSize: '0.75rem',
      }}
    />
  );
};

interface TagListProps {
  tags: Tag[];
  size?: 'small' | 'medium';
  onTagDelete?: (tagId: string) => void;
}

export const TagList: React.FC<TagListProps> = ({ tags, size = 'small', onTagDelete }) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
      {tags.map((tag) => (
        <TagChip
          key={tag._id}
          tag={tag}
          size={size}
          onDelete={onTagDelete ? () => onTagDelete(tag._id) : undefined}
        />
      ))}
    </Box>
  );
};

export default TagChip;
