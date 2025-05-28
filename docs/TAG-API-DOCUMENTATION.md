# Tag API Documentation

This document provides detailed API documentation for the tagging system endpoints.

## Authentication

All tag endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### GET /api/tags

Get all tags for the authenticated user.

**Request:**
```http
GET /api/tags
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "tags": [
    {
      "_id": "605c72ef1532076a41f5c8c1",
      "name": "urgent",
      "color": "#d32f2f",
      "user": "605c72ef1532076a41f5c8c0",
      "createdAt": "2025-05-28T10:30:00.000Z",
      "updatedAt": "2025-05-28T10:30:00.000Z"
    }
  ]
}
```

### POST /api/tags

Create a new tag.

**Request:**
```http
POST /api/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "important"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "tag": {
    "_id": "605c72ef1532076a41f5c8c2",
    "name": "important",
    "color": "#1976d2",
    "user": "605c72ef1532076a41f5c8c0",
    "createdAt": "2025-05-28T10:35:00.000Z",
    "updatedAt": "2025-05-28T10:35:00.000Z"
  }
}
```

**Note:** If a tag with the same name already exists for the user, the existing tag is returned instead of creating a duplicate.

### PUT /api/tags/:id

Update an existing tag.

**Request:**
```http
PUT /api/tags/605c72ef1532076a41f5c8c2
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "very important",
  "color": "#ff5722"
}
```

**Response:**
```json
{
  "success": true,
  "tag": {
    "_id": "605c72ef1532076a41f5c8c2",
    "name": "very important",
    "color": "#ff5722",
    "user": "605c72ef1532076a41f5c8c0",
    "createdAt": "2025-05-28T10:35:00.000Z",
    "updatedAt": "2025-05-28T10:40:00.000Z"
  }
}
```

### DELETE /api/tags/:id

Delete a tag.

**Request:**
```http
DELETE /api/tags/605c72ef1532076a41f5c8c2
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Tag deleted successfully"
}
```

## Todo Integration

### Creating Todos with Tags

When creating a todo, include a `tags` array with tag IDs:

```http
POST /api/todos
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the todo app implementation",
  "tags": ["605c72ef1532076a41f5c8c1", "605c72ef1532076a41f5c8c2"]
}
```

### Updating Todo Tags

When updating a todo, include the `tags` array:

```http
PUT /api/todos/605c72ef1532076a41f5c8d0
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the todo app implementation",
  "tags": ["605c72ef1532076a41f5c8c1"]
}
```

## Error Responses

### 400 Bad Request

Missing or invalid data:

```json
{
  "success": false,
  "message": "Tag name is required"
}
```

### 401 Unauthorized

Missing or invalid authentication:

```json
{
  "success": false,
  "message": "User not authenticated"
}
```

### 404 Not Found

Tag not found or not owned by user:

```json
{
  "success": false,
  "message": "Tag not found"
}
```

### 500 Internal Server Error

Server error:

```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Validation Rules

### Tag Name
- Required field
- Maximum 50 characters
- Trimmed of whitespace
- Must be unique per user (case-sensitive)

### Tag Color
- Must be valid hex color format (#RRGGBB)
- Auto-generated if not provided
- Generated colors are consistent per tag name

## Color Generation

Colors are automatically generated using a hash algorithm for consistency:

```javascript
// Available colors (12 total)
const colors = [
  '#1976d2', '#d32f2f', '#388e3c', '#f57c00',
  '#7b1fa2', '#00796b', '#c2185b', '#303f9f',
  '#5d4037', '#616161', '#e64a19', '#0097a7'
];

// Hash function ensures same tag name always gets same color
function generateTagColor(tagName) {
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
```

## Usage Examples

### Creating a Complete Workflow

1. **Create tags:**
```bash
curl -X POST http://localhost:5000/api/tags \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "work"}'

curl -X POST http://localhost:5000/api/tags \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "urgent"}'
```

2. **Create todo with tags:**
```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review pull request",
    "tags": ["TAG_ID_1", "TAG_ID_2"]
  }'
```

3. **List todos (tags are populated):**
```bash
curl -X GET http://localhost:5000/api/todos \
  -H "Authorization: Bearer $TOKEN"
```

## Database Schema

### Tag Collection
```javascript
{
  _id: ObjectId,
  name: String,        // max 50 chars, required
  color: String,       // hex format, required
  user: ObjectId,      // reference to User, required
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ user: 1, name: 1 } // unique compound index
```

### Todo Collection (Updated)
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  completed: Boolean,
  completedAt: Date,
  user: ObjectId,
  parent: ObjectId,
  children: [ObjectId],
  tags: [ObjectId],    // array of Tag references
  order: Number,
  createdAt: Date,
  updatedAt: Date
}
```
