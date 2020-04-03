import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { RoleEnum } from '../utils/enums';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      default: '',
      trim: true,
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^(?=.{6,36}$)[A-Za-z0-9]+(?:[._-][A-Za-z0-9]+)*$/,
      minlength: 6,
      maxlength: 36,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 254,
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
    fitbit: {
      id: String,
      accessToken: String,
      refreshToken: String,
      sleepGoal: Number,
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
