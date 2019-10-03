import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    username: String,
    email: String,
    password: String,
    role: {
      type: String,
      enum: ['PETE', 'ADMIN', 'USER'],
      default: 'USER'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('User', userSchema);
