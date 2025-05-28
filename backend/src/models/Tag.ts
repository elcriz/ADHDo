import mongoose, { Document, Schema } from 'mongoose';

export interface ITag extends Document {
  name: string;
  color: string;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>({
  name: {
    type: String,
    required: [true, 'Tag name is required'],
    trim: true,
    maxlength: [50, 'Tag name cannot be more than 50 characters']
  },
  color: {
    type: String,
    required: [true, 'Tag color is required'],
    trim: true,
    match: [/^#[0-9A-F]{6}$/i, 'Tag color must be a valid hex color']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries and ensure unique tag names per user
TagSchema.index({ user: 1, name: 1 }, { unique: true });

export default mongoose.model<ITag>('Tag', TagSchema);
