# ADHDO - Full-Stack Todo Application

A modern, responsive todo application built for neurodivergent human beings with React, TypeScript, Node.js, and MongoDB. Features hierarchical todos, user authentication, and mobile-optimized design.

This application is the result of experimenting with Agent mode in VS Code.

## 🚀 Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Hierarchical Todos**: Create parent-child relationships between todos
- **Tag System**: Organize todos with colored tags - create new tags on-the-fly or select from existing ones
- **Smart Todo Ordering**: New todos automatically appear at the top of the list for immediate focus
- **Drag & Drop Reordering**: Touch-friendly drag and drop for reordering open todos with mobile optimization
- **Status Management**: Toggle between open and completed todos
- **Toast Notifications**: Non-obstructive feedback for user actions with completion/incompletion notifications
- **Real-time Search**: Search todos by title, description, and tags with autofocus and live filtering
- **Date-Based Organization**: Completed todos grouped by completion date with smart headings (Today, Yesterday, etc.)
- **Smart UI Management**: Mutual exclusivity between search and editing modes
- **Bulk Operations**: Delete all completed todos with confirmation dialog
- **Hamburger Menu**: Modern menu system for scalable user actions
- **Decorative ColorBar**: Vibrant repeating color blocks for visual enhancement
- **Progressive Web App**: Installable with offline functionality
- **Dark Mode**: Automatic theme switching based on system preferences
- **Responsive Design**: Mobile-first, responsive UI design
- **Date Tracking**: Automatic creation and completion date tracking
- **RESTful API**: Clean backend API with proper error handling
- **Type Safety**: Full TypeScript implementation for both frontend and backend

## 🏗️ Architecture

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **React Router** for client-side routing
- **Context API** for state management with global editing state
- **Material UI** for modern, accessible components
- **@dnd-kit** for drag and drop functionality with mobile touch support
- **PWA** with service worker and offline functionality
- **Axios** for API communication
- **Dark Mode** with automatic system preference detection

### Backend
- **Node.js** with TypeScript
- **Express.js** web framework
- **MongoDB** with Mongoose ODM
- **JWT** authentication with Passport.js
- **Security**: Helmet, CORS, rate limiting, compression

## 📂 Project Structure

```
adhdo/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── contexts/          # React Context providers (Auth, Todo, Editing)
│   ├── services/          # API service layer
│   ├── types/             # TypeScript type definitions
│   ├── theme.ts           # Material UI theme and dark mode
│   └── App.tsx            # Main app component
├── backend/               # Backend source code
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   └── types/         # Backend type definitions
│   └── dist/              # Compiled backend code
├── public/                # Static frontend assets
└── dist/                  # Built frontend application
```

## 🛠️ Development Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Environment Variables

Create `.env` files in both root and backend directories:

**Root `.env`:**
```
VITE_API_URL=http://localhost:5000/api
```

**Backend `.env`:**
```
MONGODB_URI=mongodb://localhost:27017/adhdo
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
PORT=5000
```

### Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

2. **Start MongoDB** (if running locally)

3. **Start development servers:**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173 (or similar port)
   - Backend API: http://localhost:5000/api

## 📱 Usage

1. **Register** a new account or **login** with existing credentials
2. **Create todos** using the form at the top - new todos automatically appear at the top of the list for immediate focus
3. **Add tags** to todos for better organization:
   - Type tag names in the tag field during todo creation/editing
   - Select from existing tags via autocomplete dropdown
   - Create new tags on-the-fly by typing and pressing Enter
   - Tags display with consistent colors automatically generated per tag name
4. **Add subtasks** by clicking the "+ Sub" button on any todo
5. **Reorder todos** by touch-and-hold for 200ms (mobile) or click-and-drag (desktop) to rearrange open todos
6. **Search todos** by clicking the search icon and typing (minimum 2 characters) - searches title, description, and tags with automatic field focus
7. **Toggle completion** by checking/unchecking the checkbox - receive instant visual feedback with toast notifications
8. **Edit todos** by clicking the "Edit" button
9. **Delete todos** by clicking the "Delete" button (includes all children)
10. **Bulk delete completed** by clicking "Delete All Completed" on the Completed tab
11. **Manage tags** by accessing "Manage tags" from the hamburger menu
12. **Access user menu** by clicking the hamburger menu icon (top right)
13. **Switch tabs** between "Open" and "Completed" todos

### Smart Todo Ordering
- **Auto Top Insertion**: New todos automatically appear at the top of the list with order 0
- **Existing Todo Shift**: All existing open todos are pushed down when a new todo is created
- **Manual Reordering**: Use drag and drop to manually rearrange todos as needed
- **Subtask Positioning**: Child todos (subtasks) remain grouped under their parent regardless of order

### Drag & Drop Reordering
- **Mobile**: Touch and hold a todo item for 200ms, then drag to reorder
- **Desktop**: Click and drag todo items to new positions
- **Visual Feedback**: Dragged items become semi-transparent during movement
- **Auto-Save**: New order is automatically saved to the database
- **Edit Mode**: Dragging is disabled when any todo is being edited
- **Scroll-Friendly**: Delay prevents accidental dragging while scrolling

### Search & Editing Modes
- **Search mode**: Filters todos in real-time by title, description, and tags with automatic field focus
- **Editing mode**: Edit individual todos with inline forms
- **Mutual exclusivity**: Search and editing modes cannot be active simultaneously for focused user experience

### Tag System
- **Tag Creation**: Create new tags inline while adding or editing todos
- **Tag Selection**: Choose from existing tags via autocomplete dropdown
- **Tag Management**: Dedicated tag management page accessible via hamburger menu
- **Color Consistency**: Each tag name automatically gets a consistent color across all todos
- **Visual Display**: Tags appear as colored chips below date information in todo cards
- **User Isolation**: Tags are private and user-specific
- **Mobile Optimized**: Touch-friendly interface with appropriate sizing
- **Safe Operations**: Tag updates and deletions automatically maintain todo relationships

### Toast Notifications
- **Completion Feedback**: Success notifications when todos are completed with fade-out animation
- **Incompletion Feedback**: Info notifications when todos are marked as incomplete
- **Smart Positioning**: Positioned above the floating action button to avoid obstruction
- **Auto-dismiss**: Notifications automatically disappear after 3 seconds
- **Manual Dismiss**: Users can manually close notifications with the close button
- **Non-intrusive**: Smooth slide animations and proper z-index management
- **Expandable System**: Generic toast system ready for future notification needs

### Bulk Operations
- **Delete All Completed**: Remove all completed todos at once with confirmation dialog
- **Safety features**: Confirmation required, disabled during other operations
- **Hierarchical cleanup**: Properly handles deletion of parent todos and their children

## 📊 Data Models

### Todo Model
```typescript
interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  user: string;
  parent?: string;
  children: Todo[];
  tags: Tag[];        // Array of associated tags
  order?: number;     // For drag-and-drop ordering
  createdAt: string;
  updatedAt: string;
}
```

### Tag Model
```typescript
interface Tag {
  _id: string;
  name: string;       // Tag name (max 50 characters)
  color: string;      // Auto-generated hex color
  user: string;       // Owner of the tag
  createdAt: string;
  updatedAt: string;
}
```

### User Model
```typescript
interface User {
  _id: string;
  email: string;
  name: string;
  password: string;   // Hashed with bcrypt
  createdAt: string;
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Todos
- `GET /api/todos` - Get all user todos
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `PATCH /api/todos/reorder` - Reorder todos (drag and drop)
- `DELETE /api/todos/:id` - Delete todo and children
- `DELETE /api/todos/completed` - Delete all completed todos (bulk operation)
- `PUT /api/todos/:id/toggle` - Toggle todo completion

### Tags
- `GET /api/tags` - Get all user tags
- `POST /api/tags` - Create new tag
- `PUT /api/tags/:id` - Update tag (name/color)
- `DELETE /api/tags/:id` - Delete tag (automatically removes from todos)

## 🚀 Deployment

### Heroku Deployment

1. **Prepare for deployment:**
   ```bash
   npm run build
   ```

2. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-production-jwt-secret
   heroku config:set NODE_ENV=production
   ```

4. **Deploy:**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Environment Variables for Production

Ensure these are set in your production environment:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure secret for JWT signing
- `NODE_ENV`: Set to "production"
- `PORT`: Will be set automatically by Heroku

## 🔧 Development Commands

```bash
# Frontend development
npm run dev              # Start Vite dev server
npm run build            # Build frontend for production
npm run preview          # Preview production build

# Backend development
cd backend
npm run dev              # Start backend with nodemon
npm run build            # Compile TypeScript
npm start                # Start production server

# Full stack
npm run build            # Build both frontend and backend
npm start                # Start production server
```

## 🧪 Testing the API

Use curl or a tool like Postman to test the API:

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create todo (use token from login)
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Test Todo","description":"This is a test"}'
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting to prevent abuse
- CORS configuration
- Helmet for security headers
- Input validation and sanitization
- Environment variable protection

## 📱 Mobile Optimization

- Responsive CSS Grid and Flexbox layouts
- Touch-friendly button sizes and drag activation constraints
- Mobile-first design approach with optimized touch gestures
- Drag and drop with proper touch event handling
- Optimized for various screen sizes
- Fast loading and minimal bundle size
- Touch-friendly drag activation (200ms delay with 5px tolerance)

## 🛣️ Future Enhancements

- [ ] Due dates and reminders
- [ ] Advanced tag filtering (multiple tag selection)
- [ ] File attachments
- [ ] Collaboration features
- [ ] Export/import functionality
- [ ] Keyboard shortcuts for power users
- [ ] Todo templates and recurring tasks
- [ ] Cross-list drag and drop (between open and completed)
- [ ] Batch selection and operations for multiple todos

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

Built with ❤️ using React, TypeScript, Node.js, and MongoDB.
