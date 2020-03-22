import mongoose from 'mongoose';
import { TaskListEnum } from '../utils/enums';

const TaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    list: {
      type: String,
      required: true,
      enum: Object.values(TaskListEnum),
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    deadline: Date,
    isPublic: {
      type: Boolean,
      required: true,
      default: false,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Task', TaskSchema);
