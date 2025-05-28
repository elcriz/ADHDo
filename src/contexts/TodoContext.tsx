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

  const createTodo = async (title: string, description?: string, parent?: string, tags?: string[]) => {
    await todoApi.createTodo({ title, description, parent, tags });
    await refreshTodos(); // Refresh to get updated hierarchy
  };

  const updateTodo = async (id: string, title: string, description?: string, tags?: string[]) => {
    await todoApi.updateTodo(id, { title, description, tags });
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

  const reorderTodos = async (todoIds: string[]) => {
    await todoApi.reorderTodos(todoIds);
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
    reorderTodos,
    refreshTodos,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
