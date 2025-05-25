import { Response } from 'express';
import Todo from '../models/Todo.js';
import { AuthRequest } from '../middleware/auth.js';

export const getTodos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const todos = await Todo.find({ user: req.user._id })
      .populate('children')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      todos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createTodo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { title, description, parent } = req.body;

    const todo = new Todo({
      title,
      description,
      user: req.user._id,
      parent: parent || null
    });

    await todo.save();

    // If this is a child todo, add it to parent's children array
    if (parent) {
      await Todo.findByIdAndUpdate(parent, {
        $push: { children: todo._id }
      });
    }

    await todo.populate('children');

    res.status(201).json({
      success: true,
      todo
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

export const updateTodo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const { title, description } = req.body;

    const todo = await Todo.findOne({ _id: id, user: req.user._id });

    if (!todo) {
      res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
      return;
    }

    todo.title = title ?? todo.title;
    todo.description = description ?? todo.description;

    await todo.save();
    await todo.populate('children');

    res.json({
      success: true,
      todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const toggleTodo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;

    const todo = await Todo.findOne({ _id: id, user: req.user._id });

    if (!todo) {
      res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
      return;
    }

    todo.completed = !todo.completed;
    await todo.save();
    await todo.populate('children');

    res.json({
      success: true,
      todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteTodo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;

    const todo = await Todo.findOne({ _id: id, user: req.user._id });

    if (!todo) {
      res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
      return;
    }

    // Remove from parent's children array if it has a parent
    if (todo.parent) {
      await Todo.findByIdAndUpdate(todo.parent, {
        $pull: { children: todo._id }
      });
    }

    // Delete all child todos recursively
    const deleteChildrenRecursively = async (todoId: string) => {
      const childTodos = await Todo.find({ parent: todoId });
      for (const child of childTodos) {
        await deleteChildrenRecursively((child._id as any).toString());
        await Todo.findByIdAndDelete(child._id);
      }
    };

    await deleteChildrenRecursively(id);
    await Todo.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};