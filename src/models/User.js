import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { roleEnum } from '../utils/enums';

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true,
      match: /^\$2[ayb]\$.{56}$/
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(roleEnum),
      default: roleEnum.USER
    }
  },
  {
    timestamps: true
  }
);

userSchema.methods.convertPasswordToHash = async function() {
  this.password = await bcrypt.hash(
    this.password,
    Number(process.env.SALT_ROUNDS)
  );
};

userSchema.pre('validate', async function() {
  await this.convertPasswordToHash();
});

userSchema.pre('findOneAndUpdate', async function() {
  if (this.getUpdate().password) {
    this.getUpdate().password = await bcrypt.hash(
      this.getUpdate().password,
      Number(process.env.SALT_ROUNDS)
    );
  }
});

export default mongoose.model('User', userSchema);
