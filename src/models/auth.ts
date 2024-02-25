import mongoose, { Document } from 'mongoose';

interface IAuth extends Document {
  userId?: string;
  email?: string;
  mobile?: string;
  username?: string;
  usernameChangedAt?: Date;
  password: string;
  role?: string;
  permissions?: string[];
  lastActive?: Date | null;
  deletedAt?: Date | null;
}

const authSchema = new mongoose.Schema<IAuth>(
  {
    userId: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
    },
    mobile: {
      type: String,
      of: String,
      trim: true,
      unique: true,
      sparse: true,
      required: false,
    },
    username: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
    },
    usernameChangedAt: Date,
    password: {
      type: String,
      required: true,
      select: false,
      trim: true,
    },
    role: {
      type: String,
      default: 'admin',
       enum: ['superadmin', 'admin', 'parent', 'student']
    },
    permissions: {
      type: Array,
      default: [],
    },
    lastActive: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

authSchema.virtual('id').get(function (this: IAuth) {
  return this._id?.toHexString();
});

authSchema.set('toJSON', {
  virtuals: true,
  transform: function (_doc, ret) {
    const newRet = { id: ret._id };
    delete ret._id;
    delete ret.__v;
    Object.assign(newRet, ret);
    return newRet;
  }
});

authSchema.virtual('user', {
  ref: 'User',
  localField: '_id',
  foreignField: '_id',
  justOne: true
});

authSchema.pre('save', function (next) {
  const data = this.toJSON();
  // console.log('before auth save', data);

  this.mobile = data.mobile;

  if (this.username) this.username = this.username.toLowerCase();
  next();
});

const AuthModel = mongoose.model<IAuth>('Auth', authSchema);

export default AuthModel;
