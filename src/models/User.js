import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { roleEnum } from '../utils/enums';

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      match: /^\$2[ayb]\$.{56}$/,
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(roleEnum),
      default: roleEnum.USER,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.methods.convertPasswordToHash = async function convertPasswordToHash() {
  this.password = await bcrypt.hash(this.password, Number(process.env.SALT_ROUNDS));
};

userSchema.pre('validate', async function pre() {
  if (this.isModified('password')) {
    await this.convertPasswordToHash();
  }
});

export default mongoose.model('User', userSchema);
