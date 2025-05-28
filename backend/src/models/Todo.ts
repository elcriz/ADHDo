import mongoose, { Document, Schema } from 'mongoose';

export interface ITodo extends Document {
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: Date;
  user: mongoose.Types.ObjectId;
  parent?: mongoose.Types.ObjectId;
  children: mongoose.Types.ObjectId[];
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema = new Schema<ITodo>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Todo',
    default: null
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'Todo'
  }],
  order: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
TodoSchema.index({ user: 1, completed: 1 });
TodoSchema.index({ user: 1, parent: 1 });

// Middleware to update completedAt when completed status changes
TodoSchema.pre('save', function(next) {
  if (this.isModified('completed')) {
    if (this.completed) {
      this.completedAt = new Date();
    } else {
      this.completedAt = undefined;
    }
  }
  next();
});

export default mongoose.model<ITodo>('Todo', TodoSchema);
