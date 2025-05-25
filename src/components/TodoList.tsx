import React, { useState } from 'react';
import { useTodos } from '../contexts/TodoContext';
import type { Todo } from '../types';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';

const TodoList: React.FC = () => {
  const { todos, loading } = useTodos();
  const [activeTab, setActiveTab] = useState<'open' | 'completed'>('open');
  const [showForm, setShowForm] = useState(false);

  // Ensure todos is always an array and filter by completion status
  const todoArray = Array.isArray(todos) ? todos : [];
  const openTodos = todoArray.filter(todo => !todo.completed && !todo.parent);
  const completedTodos = todoArray.filter(todo => todo.completed && !todo.parent);

  const currentTodos = activeTab === 'open' ? openTodos : completedTodos;

  const renderTodoWithChildren = (todo: Todo, level: number = 0) => (
    <div key={todo._id}>
      <TodoItem todo={todo} level={level} />
      {todo.children && todo.children.length > 0 && (
        <div className="ml-4">
          {todo.children.map(child => renderTodoWithChildren(child, level + 1))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Todos</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Cancel' : 'Add Todo'}
          </button>
        </div>

        {showForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <TodoForm onSuccess={() => setShowForm(false)} />
          </div>
        )}

        {/* Tab navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('open')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'open'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Open ({openTodos.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'completed'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Completed ({completedTodos.length})
          </button>
        </div>

        {/* Todo list */}
        <div className="space-y-2">
          {currentTodos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {activeTab === 'open' 
                ? "No open todos. Create one to get started!" 
                : "No completed todos yet."}
            </div>
          ) : (
            currentTodos.map(todo => renderTodoWithChildren(todo))
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoList;