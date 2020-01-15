import mongoose from 'mongoose';

export default mongoose.model(
  'User',
  new mongoose.Schema(
    {
      firstName: String,
      lastName: String,
      username: String,
      email: String,
      password: String,
      roles: {
        type: [{ type: String, enum: ['PETE', 'ADMIN', 'USER'] }],
        default: ['USER']
      }
    },
    {
      timestamps: true
    }
  )
);
