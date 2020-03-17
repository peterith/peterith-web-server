import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { RoleEnum } from '../utils/enums';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      minlength: 6,
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
      enum: Object.values(RoleEnum),
      default: RoleEnum.USER,
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
