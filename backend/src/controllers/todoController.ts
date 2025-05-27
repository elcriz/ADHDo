import { Response } from 'express';
import Todo from '../models/Todo.js';
import { AuthRequest } from '../middleware/auth.js';

export const getTodos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    // First get all todos for the user
    const allTodos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Create a map for quick lookup
    const todoMap = new Map<string, any>();
    allTodos.forEach(todo => todoMap.set((todo._id as any).toString(), todo.toObject()));

    // Build the hierarchy
    const rootTodos: any[] = [];

    for (const todo of allTodos) {
      const todoObj = todo.toObject();

      // Recursively populate children
      const populateChildren = (item: any): any => {
        const childIds = item.children || [];
        item.children = childIds
          .map((childId: any) => {
            const childTodo = todoMap.get(childId.toString());
            if (childTodo) {
              return populateChildren({ ...childTodo });
            }
            return null;
          })
          .filter((child: any) => child !== null);
        return item;
      };

      const populatedTodo = populateChildren(todoObj);

      // Only include root todos (no parent)
      if (!todo.parent) {
        rootTodos.push(populatedTodo);
      }
    }

    res.json({
      success: true,
      todos: rootTodos
    });
  } catch (error) {
    console.error('Error in getTodos:', error);
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
    if (todo.completed) {
      todo.completedAt = new Date();
    } else {
      todo.completedAt = undefined;
    }
    await todo.save();

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

export const deleteCompletedTodos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    // Find all completed todos for the user
    const completedTodos = await Todo.find({
      user: req.user._id,
      completed: true
    });

    if (completedTodos.length === 0) {
      res.json({
        success: true,
        message: 'No completed todos to delete',
        deletedCount: 0
      });
      return;
    }

    // For each completed todo, handle its children
    for (const todo of completedTodos) {
      // Remove from parent's children array if it has a parent
      if (todo.parent) {
        await Todo.findByIdAndUpdate(todo.parent, {
          $pull: { children: todo._id }
        });
      }

      // Delete all child todos recursively (whether completed or not)
      const deleteChildrenRecursively = async (todoId: string) => {
        const childTodos = await Todo.find({ parent: todoId });
        for (const child of childTodos) {
          await deleteChildrenRecursively((child._id as any).toString());
          await Todo.findByIdAndDelete(child._id);
        }
      };

      await deleteChildrenRecursively((todo._id as any).toString());
    }

    // Delete all completed todos
    const result = await Todo.deleteMany({
      user: req.user._id,
      completed: true
    });

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} completed todos`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error in deleteCompletedTodos:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
