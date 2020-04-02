import mongoose from 'mongoose';

const sleepSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    date: {
      type: Date,
      required: true,
    },
    minutesAsleep: {
      type: Number,
      required: true,
      minlength: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Sleep', sleepSchema);
