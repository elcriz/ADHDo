export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  user: string;
  parent?: string;
  children: Todo[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface TodoContextType {
  todos: Todo[];
  loading: boolean;
  createTodo: (title: string, description?: string, parent?: string) => Promise<void>;
  updateTodo: (id: string, title: string, description?: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  deleteCompletedTodos: () => Promise<void>;
  refreshTodos: () => Promise<void>;
}
