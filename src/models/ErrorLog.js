import mongoose from 'mongoose';

const errorLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    endpoint: String,
    message: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('ErrorLog', errorLogSchema);
