import { Response } from 'express';
import Tag from '../models/Tag.js';
import Todo from '../models/Todo.js';
import { AuthRequest } from '../middleware/auth.js';

// Generate a consistent color for a tag name using a simple hash
const generateTagColor = (tagName: string): string => {
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate a color that's not too light or too dark
  const colors = [
    '#1976d2', '#d32f2f', '#388e3c', '#f57c00',
    '#7b1fa2', '#00796b', '#c2185b', '#303f9f',
    '#5d4037', '#616161', '#e64a19', '#0097a7'
  ];

  return colors[Math.abs(hash) % colors.length];
};

export const getTags = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const tags = await Tag.find({ user: req.user._id }).sort({ name: 1 });

    res.json({
      success: true,
      tags
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createTag = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { name } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Tag name is required' });
      return;
    }

    const trimmedName = name.trim();

    // Check if tag already exists for this user
    const existingTag = await Tag.findOne({
      user: req.user._id,
      name: trimmedName
    });

    if (existingTag) {
      // Return the existing tag
      res.json({
        success: true,
        tag: existingTag
      });
      return;
    }

    // Generate color for the tag
    const color = generateTagColor(trimmedName);

    const tag = new Tag({
      name: trimmedName,
      color,
      user: req.user._id
    });

    await tag.save();

    res.status(201).json({
      success: true,
      tag
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

export const updateTag = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const { name, color } = req.body;

    const tag = await Tag.findOne({ _id: id, user: req.user._id });

    if (!tag) {
      res.status(404).json({ success: false, message: 'Tag not found' });
      return;
    }

    if (name) tag.name = name.trim();
    if (color) tag.color = color;

    await tag.save();

    res.json({
      success: true,
      tag
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

export const deleteTag = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;

    const tag = await Tag.findOne({ _id: id, user: req.user._id });

    if (!tag) {
      res.status(404).json({ success: false, message: 'Tag not found' });
      return;
    }

    // Remove the tag reference from all todos that use it
    await Todo.updateMany(
      { user: req.user._id, tags: id },
      { $pull: { tags: id } }
    );

    // Delete the tag
    await Tag.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting tag:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
