import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Chip,
  Box,
  CircularProgress,
} from '@mui/material';
import { tagApi } from '../services/api';
import type { Tag } from '../types';

interface TagSelectorProps {
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onChange,
  disabled = false,
  size = 'small',
}) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setIsLoading(true);
      const tags = await tagApi.getTags();
      setAvailableTags(Array.isArray(tags) ? tags : []);
    } catch (error) {
      console.error('Failed to load tags:', error);
      setAvailableTags([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagChange = async (_event: any, newValue: (Tag | string)[]) => {
    const processedTags: Tag[] = [];

    for (const item of newValue) {
      if (typeof item === 'string') {
        // Create new tag
        if (item.trim()) {
          try {
            const newTag = await tagApi.createTag({ name: item.trim() });
            processedTags.push(newTag);

            // Add to available tags if not already there
            setAvailableTags(prev => {
              const exists = prev.some(tag => tag._id === newTag._id);
              return exists ? prev : [...prev, newTag];
            });
          } catch (error) {
            console.error('Failed to create tag:', error);
          }
        }
      } else {
        // Existing tag
        processedTags.push(item);
      }
    }

    onChange(processedTags);
  };

  return (
    <Box>
      <Autocomplete
        multiple
        freeSolo
        size={size}
        value={selectedTags}
        onChange={handleTagChange}
        inputValue={inputValue}
        onInputChange={(_event, newInputValue) => setInputValue(newInputValue)}
        options={availableTags}
        getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
        isOptionEqualToValue={(option, value) => {
          if (typeof option === 'string' && typeof value === 'string') {
            return option === value;
          }
          if (typeof option === 'object' && typeof value === 'object') {
            return option._id === value._id;
          }
          return false;
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => {
            const tag = typeof option === 'string' ? null : option;
            return (
              <Chip
                {...getTagProps({ index })}
                key={typeof option === 'string' ? option : option._id}
                label={typeof option === 'string' ? option : option.name}
                size="small"
                style={{
                  backgroundColor: tag?.color || '#1976d2',
                  color: 'white',
                }}
              />
            );
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tags"
            placeholder="Add tags..."
            disabled={disabled}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        disabled={disabled}
      />
    </Box>
  );
};

export default TagSelector;
