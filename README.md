# ADHDO - Full-Stack Todo Application

A modern, responsive todo application built for neurodivergent human beings w5. **Search todos** by clicking the search icon and typing (minimum 2 characters)
6. **Toggle completion** by checking/unchecking the checkbox
7. **Edit todos** by clicking the "Edit" button
8. **Delete todos** by clicking the "Delete" button (includes all children)
9. **Bulk delete completed** by clicking "Delete All Completed" on the Completed tab
10. **Switch tabs** between "Open" and "Completed" todoseact, TypeScript, Node.js, and MongoDB. Features hierarchical todos, user authentication, and mobile-optimized design.

This application is the result of experimenting with Agent mode in VS Code.

## 🚀 Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Hierarchical Todos**: Create parent-child relationships between todos
- **Status Management**: Toggle between open and completed todos
- **Real-time Search**: Search todos by title and description with live filtering
- **Smart UI Management**: Mutual exclusivity between search and editing modes
- **Bulk Operations**: Delete all completed todos with confirmation dialog
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
2. **Create todos** using the form at the top
3. **Add subtasks** by clicking the "+ Sub" button on any todo
4. **Search todos** by clicking the search icon and typing (minimum 2 characters)
5. **Toggle completion** by checking/unchecking the checkbox
6. **Edit todos** by clicking the "Edit" button
7. **Delete todos** by clicking the "Delete" button (includes all children)
8. **Switch tabs** between "Open" and "Completed" todos

### Search & Editing Modes
- **Search mode**: Filters todos in real-time as you type
- **Editing mode**: Edit individual todos with inline forms
- **Mutual exclusivity**: Search and editing modes cannot be active simultaneously for focused user experience

### Bulk Operations
- **Delete All Completed**: Remove all completed todos at once with confirmation dialog
- **Safety features**: Confirmation required, disabled during other operations
- **Hierarchical cleanup**: Properly handles deletion of parent todos and their children

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Todos
- `GET /api/todos` - Get all user todos
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo and children
- `PUT /api/todos/:id/toggle` - Toggle todo completion

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
- Touch-friendly button sizes
- Mobile-first design approach
- Optimized for various screen sizes
- Fast loading and minimal bundle size

## 🛣️ Future Enhancements

- [ ] Due dates and reminders
- [ ] Todo categories and tags
- [ ] File attachments
- [ ] Collaboration features
- [ ] Export/import functionality
- [ ] Batch operations for todos
- [ ] Keyboard shortcuts for power users
- [ ] Todo templates and recurring tasks

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
