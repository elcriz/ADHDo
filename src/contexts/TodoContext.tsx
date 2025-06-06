import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { todoApi } from '../services/api';
import type { Todo, TodoContextType } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};

interface TodoProviderProps {
  children: ReactNode;
}

export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      refreshTodos();
    } else {
      setTodos([]);
    }
  }, [user]);

  const refreshTodos = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const fetchedTodos = await todoApi.getTodos();
      setTodos(Array.isArray(fetchedTodos) ? fetchedTodos : []);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (title: string, description?: string, parent?: string, tags?: string[]) => {
    await todoApi.createTodo({ title, description, parent, tags });
    await refreshTodos(); // Refresh to get updated hierarchy
  };

  const updateTodo = async (id: string, title: string, description?: string, tags?: string[]) => {
    await todoApi.updateTodo(id, { title, description, tags });
    await refreshTodos();
  };

  const toggleTodo = async (id: string) => {
    // Find the todo to check its current state before toggling
    const findTodoById = (todoList: Todo[], targetId: string): Todo | null => {
      for (const todo of todoList) {
        if (todo._id === targetId) return todo;

        if (todo.children) {
          for (const child of todo.children) {
            if (typeof child === 'object') {
              const found = findTodoById([child], targetId);
              if (found) return found;
            }
          }
        }
      }
      return null;
    };

    const todoItem = findTodoById(todos, id);

    await todoApi.toggleTodo(id);
    await refreshTodos();

    // Show appropriate toast notification
    if (todoItem) {
      if (todoItem.completed) {
        showToast(`"${todoItem.title}" marked as incomplete`, 'info');
      } else {
        showToast(`"${todoItem.title}" completed!`, 'success');
      }
    }
  };

  const deleteTodo = async (id: string) => {
    await todoApi.deleteTodo(id);
    await refreshTodos();
  };

  const deleteCompletedTodos = async () => {
    await todoApi.deleteCompletedTodos();
    await refreshTodos();
  };

  const deleteTodosByDate = async (date: string) => {
    await todoApi.deleteTodosByDate(date);
    await refreshTodos();
    showToast(`Deleted all todos completed on ${date}`, 'success');
  };

  const reorderTodos = async (todoIds: string[]) => {
    await todoApi.reorderTodos(todoIds);
    await refreshTodos();
  };

  const makeTodoPriority = async (id: string) => {
    // Find the todo to get its details
    const findTodoById = (todoList: Todo[], targetId: string): Todo | null => {
      for (const todo of todoList) {
        if (todo._id === targetId) return todo;

        if (todo.children) {
          for (const child of todo.children) {
            if (typeof child === 'object') {
              const found = findTodoById([child], targetId);
              if (found) return found;
            }
          }
        }
      }
      return null;
    };

    const todoItem = findTodoById(todos, id);
    if (!todoItem) return;

    try {
      // Get all priority todos
      const priorityTodos = todos.filter(t =>
        t.isPriority && !t.completed && !t.parent
      );

      // Set this todo to priority status
      await todoApi.makeTodoPriority(id, {
        title: todoItem.title,
        description: todoItem.description,
        tags: todoItem.tags.map(tag => tag._id),
      });

      // Now reorder to put this todo at the top of priority section
      const priorityIds = [id, ...priorityTodos.map(t => t._id)];
      await todoApi.reorderTodos(priorityIds);

      await refreshTodos();
      showToast(`"${todoItem.title}" marked as priority`, 'success');
    } catch (error) {
      console.error('Failed to make todo priority:', error);
    }
  };

  const removeTodoPriority = async (id: string) => {
    // Find the todo to get its details
    const findTodoById = (todoList: Todo[], targetId: string): Todo | null => {
      for (const todo of todoList) {
        if (todo._id === targetId) return todo;

        if (todo.children) {
          for (const child of todo.children) {
            if (typeof child === 'object') {
              const found = findTodoById([child], targetId);
              if (found) return found;
            }
          }
        }
      }
      return null;
    };

    const todoItem = findTodoById(todos, id);
    if (!todoItem) return;

    try {
      // Remove priority status
      await todoApi.removeTodoPriority(id, {
        title: todoItem.title,
        description: todoItem.description,
        tags: todoItem.tags.map(tag => tag._id),
      });

      await refreshTodos();
      showToast(`"${todoItem.title}" removed from priorities`, 'info');
    } catch (error) {
      console.error('Failed to remove todo priority:', error);
    }
  };

  const moveTodoToTop = async (id: string) => {
    // Find the todo to get its details
    const findTodoById = (todoList: Todo[], targetId: string): Todo | null => {
      for (const todo of todoList) {
        if (todo._id === targetId) return todo;

        if (todo.children) {
          for (const child of todo.children) {
            if (typeof child === 'object') {
              const found = findTodoById([child], targetId);
              if (found) return found;
            }
          }
        }
      }
      return null;
    };

    const todoItem = findTodoById(todos, id);
    if (!todoItem || todoItem.completed || todoItem.parent) return;

    try {
      // Get all todos in the same section (priority or regular)
      const sameSectionTodos = todos.filter(t =>
        !t.completed && !t.parent && t.isPriority === todoItem.isPriority
      );

      // Create new order with this todo at the top
      const reorderedIds = [id, ...sameSectionTodos.map(t => t._id).filter(tId => tId !== id)];

      await reorderTodos(reorderedIds);
      showToast(`"${todoItem.title}" moved to top`, 'success');
    } catch (error) {
      console.error('Failed to move todo to top:', error);
    }
  };

  const moveTodoToBottom = async (id: string) => {
    // Find the todo to get its details
    const findTodoById = (todoList: Todo[], targetId: string): Todo | null => {
      for (const todo of todoList) {
        if (todo._id === targetId) return todo;

        if (todo.children) {
          for (const child of todo.children) {
            if (typeof child === 'object') {
              const found = findTodoById([child], targetId);
              if (found) return found;
            }
          }
        }
      }
      return null;
    };

    const todoItem = findTodoById(todos, id);
    if (!todoItem || todoItem.completed || todoItem.parent) return;

    try {
      // Get all todos in the same section (priority or regular)
      const sameSectionTodos = todos.filter(t =>
        !t.completed && !t.parent && t.isPriority === todoItem.isPriority
      );

      // Create new order with this todo at the bottom
      const reorderedIds = [...sameSectionTodos.map(t => t._id).filter(tId => tId !== id), id];

      await reorderTodos(reorderedIds);
      showToast(`"${todoItem.title}" moved to bottom`, 'success');
    } catch (error) {
      console.error('Failed to move todo to bottom:', error);
    }
  };

  const value: TodoContextType = {
    todos,
    loading,
    createTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    deleteCompletedTodos,
    deleteTodosByDate,
    reorderTodos,
    makeTodoPriority,
    removeTodoPriority,
    moveTodoToTop,
    moveTodoToBottom,
    refreshTodos,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
