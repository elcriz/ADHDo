import React from 'react';
import { Box } from '@mui/material';

const ColorBar: React.FC = () => {
  // Color palette with primary blue from theme and other vibrant colors
  const colors = [
    '#f97316', // Orange
    '#22c55e', // Green
    '#3b82f6', // Blue (primary from theme)
    '#a16207', // Brown
    '#9333ea', // Purple
    '#ec4899', // Pink
    '#eab308', // Yellow
    '#ef4444', // Red
  ];

  // Calculate how many color blocks we need to fill the viewport
  const blocksNeeded = Math.ceil(window.innerWidth / 8);

  return (
    <Box
      role="presentation"
      aria-hidden="true"
      sx={{
        width: '100vw',
        height: '8px',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
      }}
    >
      <svg
        width="100%"
        height="8"
        viewBox={`0 0 ${blocksNeeded * 8} 8`}
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        {Array.from({ length: blocksNeeded }).map((_, index) => (
          <rect
            key={index}
            x={index * 8}
            y={0}
            width={8}
            height={8}
            fill={colors[index % colors.length]}
          />
        ))}
      </svg>
    </Box>
  );
};

export default ColorBar;
