export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Tag {
  _id: string;
  name: string;
  color: string;
  user: string;
  createdAt: string;
  updatedAt: string;
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
  tags: Tag[];
  order?: number;
  isPriority?: boolean;
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
  createTodo: (title: string, description?: string, parent?: string, tags?: string[]) => Promise<void>;
  updateTodo: (id: string, title: string, description?: string, tags?: string[]) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  deleteCompletedTodos: () => Promise<void>;
  deleteTodosByDate: (date: string) => Promise<void>;
  reorderTodos: (todoIds: string[]) => Promise<void>;
  refreshTodos: () => Promise<void>;
}
