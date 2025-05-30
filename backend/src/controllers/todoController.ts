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
    const allTodos = await Todo.find({ user: req.user._id }).populate('tags');

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

    // Sort todos: completed todos by completedAt desc, open todos by order (if exists) then createdAt desc
    rootTodos.sort((a, b) => {
      if (a.isCompleted && b.isCompleted) {
        // Both completed: sort by completedAt desc
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      } else if (!a.isCompleted && !b.isCompleted) {
        // Both open: sort by order (if exists) then createdAt desc
        if (a.order !== null && b.order !== null) {
          return a.order - b.order;
        } else if (a.order !== null) {
          return -1; // a has order, b doesn't - a comes first
        } else if (b.order !== null) {
          return 1; // b has order, a doesn't - b comes first
        } else {
          // Neither has order - sort by createdAt desc
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      } else if (a.isCompleted) {
        return 1; // a is completed, b is not - b comes first
      } else {
        return -1; // b is completed, a is not - a comes first
      }
    });

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

    const { title, description, parent, tags } = req.body;

    // If this is not a child todo, we need to update the order of existing todos
    if (!parent) {
      // Increment the order of all existing open todos (push them down)
      await Todo.updateMany(
        {
          user: req.user._id,
          isCompleted: false,
          parent: null,
          order: { $ne: null }
        },
        { $inc: { order: 1 } }
      );
    }

    const todo = new Todo({
      title,
      description,
      user: req.user._id,
      parent: parent || null,
      tags: tags || [],
      order: parent ? null : 0 // Set order to 0 for new parent todos, null for child todos
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
    const { title, description, tags } = req.body;

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
    if (tags !== undefined) {
      todo.tags = tags;
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

    todo.isCompleted = !todo.isCompleted;
    if (todo.isCompleted) {
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
      isCompleted: true
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

export const deleteTodosByDate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { date } = req.params;

    // Parse the date string to get start and end of day
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find all completed todos for the user completed on the specified date
    const completedTodos = await Todo.find({
      user: req.user._id,
      completed: true,
      completedAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (completedTodos.length === 0) {
      res.json({
        success: true,
        message: 'No completed todos found for this date',
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

    // Delete all completed todos for the specified date
    const result = await Todo.deleteMany({
      user: req.user._id,
      completed: true,
      completedAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} todos completed on ${targetDate.toDateString()}`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error in deleteTodosByDate:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateTodoOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { todoIds } = req.body;

    if (!Array.isArray(todoIds)) {
      res.status(400).json({ success: false, message: 'todoIds must be an array' });
      return;
    }

    const userId = req.user._id;

    // Update the order field for each todo
    const updates = todoIds.map((id: string, index: number) => ({
      updateOne: {
        filter: { _id: id, user: userId },
        update: { order: index }
      }
    }));

    await Todo.bulkWrite(updates);

    res.json({
      success: true,
      message: 'Todo order updated successfully'
    });
  } catch (error) {
    console.error('Error in updateTodoOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
