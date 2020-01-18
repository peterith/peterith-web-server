import mongoose from 'mongoose';
import { roleEnum } from '../utils/enums';

export default mongoose.model(
  'User',
  new mongoose.Schema(
    {
      firstName: String,
      lastName: String,
      username: String,
      email: String,
      password: String,
      role: {
        type: String,
        enum: Object.values(roleEnum),
        default: roleEnum.USER
      }
    },
    {
      timestamps: true
    }
  )
);
