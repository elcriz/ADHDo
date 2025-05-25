import React, { useState } from 'react';
import type { Todo } from '../types';
import { useTodos } from '../contexts/TodoContext';
import TodoForm from './TodoForm';

interface TodoItemProps {
  todo: Todo;
  level: number;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, level }) => {
  const { toggleTodo, deleteTodo } = useTodos();
  const [isEditing, setIsEditing] = useState(false);
  const [showChildForm, setShowChildForm] = useState(false);

  const handleToggle = () => {
    toggleTodo(todo._id);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this todo and all its children?')) {
      deleteTodo(todo._id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`border rounded-lg p-4 ${level > 0 ? 'border-l-4 border-l-blue-300' : 'border-gray-200'} ${todo.completed ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
        />
        
        <div className="flex-1">
          <div className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
            {todo.title}
          </div>
          
          {todo.description && (
            <div className={`mt-1 text-sm ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
              {todo.description}
            </div>
          )}
          
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>Created: {formatDate(todo.createdAt)}</span>
            {todo.completedAt && (
              <span>• Completed: {formatDate(todo.completedAt)}</span>
            )}
            {todo.children.length > 0 && (
              <span>• {todo.children.length} subtask{todo.children.length > 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowChildForm(!showChildForm)}
            className="text-green-600 hover:text-green-800 text-sm"
            title="Add subtask"
          >
            + Sub
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600 hover:text-blue-800 text-sm"
            title="Edit"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 text-sm"
            title="Delete"
          >
            Delete
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <TodoForm
            todo={todo}
            onSuccess={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      )}

      {showChildForm && (
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <TodoForm
            parent={todo._id}
            onSuccess={() => setShowChildForm(false)}
            onCancel={() => setShowChildForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default TodoItem;