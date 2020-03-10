import mongoose from 'mongoose';
import { StoryTypeEnum } from '../utils/enums';

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(StoryTypeEnum),
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    sections: [
      {
        title: {
          type: String,
          trim: true,
          maxlength: 100,
        },
        contents: [
          {
            title: {
              type: String,
              trim: true,
              maxlength: 100,
            },
            text: {
              type: String,
              trim: true,
            },
            order: {
              type: Number,
              required: true,
              min: 0,
            },
          },
        ],
        order: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Story', storySchema);
