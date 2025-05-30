# Coding Style Guide

This document outlines the coding conventions and style guidelines for the ADHDO project.

## Boolean Variable Naming Convention

### ✅ **Rule: All boolean variables MUST start with appropriate prefixes**

Boolean variables, parameters, properties, and state variables should clearly indicate their boolean nature and purpose by starting with one of these prefixes:

- `is` - for state or condition (most common)
- `has` - for possession or presence
- `should` - for recommendations or requirements
- `can` - for ability or permission
- `will` - for future actions
- `did` - for past actions
- `was/were` - for past state
- `are/am` - for current state

### ✅ **Examples of CORRECT naming:**

```typescript
// State variables
const [isLoading, setIsLoading] = useState(false);
const [isVisible, setIsVisible] = useState(true);
const [isEditing, setIsEditing] = useState(false);
const [isShowingForm, setIsShowingForm] = useState(false);

// Object properties
interface Todo {
  isCompleted: boolean;
  isDeleted: boolean;
  isPriority: boolean;
}

// Function parameters
function handleSubmit(isFormValid: boolean, canSubmit: boolean) {
  // ...
}

// Variables
const hasPermission = user.role === 'admin';
const shouldShowWarning = errors.length > 0;
const canEdit = isOwner && !isReadOnly;
const wasSuccessful = response.status === 200;
```

### ❌ **Examples of INCORRECT naming:**

```typescript
// These will trigger ESLint errors:
const [loading, setLoading] = useState(false); // Should be: isLoading
const [visible, setVisible] = useState(true); // Should be: isVisible
const [editing, setEditing] = useState(false); // Should be: isEditing
const [showForm, setShowForm] = useState(false); // Should be: isShowingForm

interface Todo {
  completed: boolean; // Should be: isCompleted
  deleted: boolean; // Should be: isDeleted
  priority: boolean; // Should be: isPriority
}

function handleSubmit(valid: boolean, enabled: boolean) {
  // Should be: isValid, isEnabled
  // ...
}

const permission = user.role === 'admin'; // Should be: hasPermission
const success = response.status === 200; // Should be: wasSuccessful
```

## React State Naming Patterns

### useState Hook Patterns

```typescript
// Form state
const [isShowingForm, setIsShowingForm] = useState(false);
const [isSubmittingForm, setIsSubmittingForm] = useState(false);

// Loading states
const [isLoading, setIsLoading] = useState(false);
const [isCreating, setIsCreating] = useState(false);
const [isUpdating, setIsUpdating] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);

// UI state
const [isVisible, setIsVisible] = useState(true);
const [isExpanded, setIsExpanded] = useState(false);
const [isSelected, setIsSelected] = useState(false);

// Validation state
const [isValid, setIsValid] = useState(false);
const [hasErrors, setHasErrors] = useState(false);
const [canSubmit, setCanSubmit] = useState(false);
```

## Database Schema Naming

### MongoDB/Mongoose Models

```typescript
// Todo model example
const todoSchema = new Schema({
  title: String,
  description: String,
  isCompleted: { type: Boolean, default: false }, // ✅ Correct
  isDeleted: { type: Boolean, default: false }, // ✅ Correct
  isPriority: { type: Boolean, default: false }, // ✅ Correct
  // completed: Boolean,  // ❌ Incorrect - use isCompleted
});
```

## Enforcement Mechanisms

This project has multiple layers of enforcement to ensure boolean naming conventions are followed:

### 🔧 **1. ESLint Rules (Automatic)**

ESLint is configured with strict naming convention rules that will automatically catch incorrect boolean variable names:

```javascript
'@typescript-eslint/naming-convention': [
  'error',
  {
    selector: ['variable', 'parameter', 'property'],
    types: ['boolean'],
    format: ['camelCase'],
    custom: {
      regex: '^(is|has|should|can|will|did|was|were|are|am|be|been|being)[A-Z]',
      match: true
    }
  }
]
```

**When this triggers:**

- During development in VSCode (with ESLint extension)
- When running `npm run lint`
- During pre-commit hooks
- In CI/CD pipeline

### 🎣 **2. Pre-commit Hooks (Automatic)**

Husky + lint-staged automatically runs ESLint and Prettier on all staged files before each commit:

```json
"lint-staged": {
  "src/**/*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "backend/src/**/*.{ts,js}": ["eslint --fix", "prettier --write"]
}
```

**What happens:**

- Automatically fixes issues when possible
- Prevents commits with linting errors
- Ensures consistent code formatting

### 🔄 **3. GitHub Actions CI (Automatic)**

Our CI pipeline runs comprehensive checks on every push and pull request:

- **ESLint validation** - Catches any naming violations
- **TypeScript compilation** - Ensures type safety
- **Prettier formatting check** - Ensures consistent formatting
- **Build verification** - Confirms the code compiles correctly

See: `.github/workflows/code-quality.yml`

### 🛠 **4. VSCode Integration (Development)**

VSCode settings are configured to:

- **Format on save** - Automatically applies Prettier formatting
- **Fix on save** - Automatically runs ESLint fixes
- **Real-time validation** - Shows errors as you type
- **Recommended extensions** - Prompts installation of necessary tools

See: `.vscode/settings.json` and `.vscode/extensions.json`

### 📝 **5. Documentation & Examples**

This style guide provides:

- Clear examples of correct and incorrect naming
- Comprehensive patterns for different scenarios
- Context for why these conventions matter

## How to Handle Violations

### During Development

1. **VSCode will show red squiggles** under incorrect boolean names
2. **Hover over the error** to see the expected naming pattern
3. **Use Quick Fix** (Ctrl+. / Cmd+.) to see suggested fixes
4. **Run `npm run lint:fix`** to automatically fix many issues

### During Commit

1. **Pre-commit hooks will run** and attempt to fix issues automatically
2. **If fixes can't be applied automatically**, the commit will be blocked
3. **Fix the issues manually** and try committing again

### In CI/CD

1. **GitHub Actions will fail** if there are any linting violations
2. **Check the Actions tab** in your GitHub repository for detailed error logs
3. **Fix the issues locally** and push again

## Migration Guide

If you're working with existing code that doesn't follow these conventions:

### 1. Automated Refactoring (Recommended)

```bash
# Run ESLint with auto-fix
npm run lint:fix

# Check what still needs manual fixing
npm run lint
```

### 2. Manual Refactoring Checklist

- [ ] Update all boolean state variables (`loading` → `isLoading`)
- [ ] Update all boolean properties (`completed` → `isCompleted`)
- [ ] Update all boolean parameters in functions
- [ ] Update database schema if needed
- [ ] Update API responses to use new property names
- [ ] Update tests to use new variable names

### 3. Testing Your Changes

```bash
# Frontend
npm run lint
npm run build

# Backend
cd backend
npm run lint
npm run build
```

## Benefits of These Conventions

### 🔍 **Improved Code Readability**

```typescript
// Clear intent
if (isLoading) {
  /* ... */
}
if (hasPermission) {
  /* ... */
}

// Unclear intent
if (loading) {
  /* ... */
}
if (permission) {
  /* ... */
}
```

### 🐛 **Reduced Bugs**

Boolean naming makes conditional logic clearer and reduces logical errors.

### 🤝 **Team Consistency**

All developers follow the same patterns, making code reviews and collaboration easier.

### 🔧 **Better Tooling**

IDEs and static analysis tools can better understand boolean context and provide better suggestions.

## Exceptions and Edge Cases

### When NOT to Use These Prefixes

1. **HTML/JSX boolean attributes** (these are already clearly boolean):

   ```tsx
   <button disabled={isFormDisabled} />  // ✅ disabled is clear
   <input required={isFieldRequired} /> // ✅ required is clear
   ```

2. **Well-established library patterns** that expect specific names:

   ```typescript
   // React Router
   const location = useLocation();
   // The 'state' property is defined by React Router
   ```

3. **Configuration objects** from external libraries:
   ```typescript
   const config = {
     strict: true, // ✅ Library-defined property
     debug: false, // ✅ Library-defined property
   };
   ```

### Special Cases

1. **Event handlers** can use descriptive names:

   ```typescript
   const handleToggleVisibility = () => setIsVisible(!isVisible);
   const handleSubmitForm = () => {
     /* ... */
   };
   ```

2. **Computed values** should still follow the convention:
   ```typescript
   const isFormValid = useMemo(() => {
     return email.includes('@') && password.length >= 8;
   }, [email, password]);
   ```

Remember: These conventions are about making your code more maintainable and readable. When in doubt, choose the name that most clearly communicates the variable's purpose and boolean nature.
const TodoSchema = new Schema({
title: String,
description: String,
isCompleted: { // ✅ Correct
type: Boolean,
default: false
},
isDeleted: { // ✅ Correct
type: Boolean,
default: false
},
isPriority: Boolean, // ✅ Correct
// NOT: completed, deleted, priority
});

````

## TypeScript Interface Naming

```typescript
interface TodoType {
  _id: string;
  title: string;
  description?: string;
  isCompleted: boolean;    // ✅ Correct
  isDeleted: boolean;      // ✅ Correct
  hasTags: boolean;        // ✅ Correct
  canEdit: boolean;        // ✅ Correct
  // NOT: completed, deleted, tags, editable
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;      // ✅ Correct
  isAuthenticated: boolean; // ✅ Correct
  // NOT: loading, authenticated
}
````

## Function Parameter Naming

```typescript
// ✅ Correct
function createTodo(
  title: string,
  description: string,
  isCompleted: boolean = false,
  isPriority: boolean = false
) {
  // ...
}

// ❌ Incorrect
function createTodo(
  title: string,
  description: string,
  completed: boolean = false, // Should be: isCompleted
  priority: boolean = false // Should be: isPriority
) {
  // ...
}
```

## API Response Naming

```typescript
// ✅ Correct API response structure
interface TodoResponse {
  success: boolean; // Special case - 'success' is acceptable for API responses
  data: {
    _id: string;
    title: string;
    isCompleted: boolean; // ✅ Correct
    isDeleted: boolean; // ✅ Correct
  };
}
```

## Enforcement

### ESLint Rules

The project includes ESLint rules that automatically enforce these naming conventions:

```javascript
'@typescript-eslint/naming-convention': [
  'error',
  {
    selector: 'variable',
    types: ['boolean'],
    format: ['camelCase'],
    custom: {
      regex: '^(is|has|should|can|will|did|was|were|are|am|be|been|being)[A-Z]',
      match: true
    }
  }
  // ... similar rules for parameters and properties
]
```

### Build-time Checks

- TypeScript compilation will enforce these rules
- ESLint will catch violations during development
- CI/CD pipeline will fail builds with naming violations

## Quick Reference

| Type          | Bad ❌       | Good ✅         |
| ------------- | ------------ | --------------- |
| Loading state | `loading`    | `isLoading`     |
| Visibility    | `visible`    | `isVisible`     |
| Completion    | `completed`  | `isCompleted`   |
| Permission    | `permission` | `hasPermission` |
| Ability       | `editable`   | `canEdit`       |
| Form display  | `showForm`   | `isShowingForm` |
| Validation    | `valid`      | `isValid`       |
| Selection     | `selected`   | `isSelected`    |

## Benefits

1. **Improved Readability**: Code is self-documenting
2. **Better IntelliSense**: IDEs provide better autocomplete
3. **Consistent Codebase**: All boolean variables follow the same pattern
4. **Reduced Bugs**: Clear intent reduces misunderstandings
5. **Professional Standards**: Follows industry best practices

Remember: **Every boolean variable should read like a question that can be answered with true/false.**
