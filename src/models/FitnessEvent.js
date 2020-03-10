import mongoose from 'mongoose';
import { FitnessEventTypeEnum, ExerciseEnum } from '../utils/enums';

const fitnessEventSchema = new mongoose.Schema(
  {
    calendarEvent: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'CalendarEvent',
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(FitnessEventTypeEnum),
    },
    exercises: [
      {
        type: {
          type: String,
          required: true,
          enum: Object.values(ExerciseEnum),
        },
        sets: [
          {
            weight: {
              type: Number,
              required: true,
              min: 0,
            },
            repetitions: {
              type: Number,
              required: true,
              min: 0,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('FitnessEvent', fitnessEventSchema);
