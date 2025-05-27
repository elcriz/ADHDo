import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { todoApi } from '../services/api';
import type { Todo, TodoContextType } from '../types';
import { useAuth } from './AuthContext';

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

  const createTodo = async (title: string, description?: string, parent?: string) => {
    await todoApi.createTodo({ title, description, parent });
    await refreshTodos(); // Refresh to get updated hierarchy
  };

  const updateTodo = async (id: string, title: string, description?: string) => {
    await todoApi.updateTodo(id, { title, description });
    await refreshTodos();
  };

  const toggleTodo = async (id: string) => {
    await todoApi.toggleTodo(id);
    await refreshTodos();
  };

  const deleteTodo = async (id: string) => {
    await todoApi.deleteTodo(id);
    await refreshTodos();
  };

  const deleteCompletedTodos = async () => {
    await todoApi.deleteCompletedTodos();
    await refreshTodos();
  };

  const value: TodoContextType = {
    todos,
    loading,
    createTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    deleteCompletedTodos,
    refreshTodos,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
