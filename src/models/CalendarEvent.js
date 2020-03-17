import mongoose from 'mongoose';
import { CalendarEventTypeEnum } from '../utils/enums';

const calendarEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(CalendarEventTypeEnum),
    },
    isPublic: {
      type: Boolean,
      required: true,
      default: false,
    },
    isAllDay: {
      type: Boolean,
      required: true,
      default: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
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

export default mongoose.model('CalendarEvent', calendarEventSchema);
