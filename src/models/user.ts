import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  firstname?: string | null;
  middlename?: string | null;
  lastname?: string | null;
  avatar?: string | null;
  userTypes?: string[];
  gender?: Date | null;
  birthdate?: string | null;
  bio?: string | null;
  section?: string;
  studentId?:string | null;
  data?: Map<string, string | number | boolean | null>;
  parent?: Map<string, string | number | boolean | null>;
  
}

const userSchema: Schema<IUser> = new Schema<IUser>(
  {
    firstname: {
      type: String,
      default: null,
    },
    middlename: {
      type: String,
      default: null,
    },
    lastname: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      default: null,
    },
    studentId: {
      type: String,
      default: null,
    },
    birthdate: {
      type: Date,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    userTypes: [{
      type: String,
    }],
    bio: {
      type: String,
      default: null,
    },
    section: {
      type: String,
    
    },
    data: {
      type: Map,
      default: {}
    },
    parent: {
      type: Object,
      ref: 'User'
    },

  },
  { timestamps: true }
);

userSchema.index({ sponsors: 1 });
userSchema.index({ sponsorId: 1 });

userSchema.virtual('id').get(function (this: IUser) {
  return this._id?.toHexString();
});

userSchema.virtual('fullname').get(function (this: IUser) {
  if (this.firstname) return `${this.firstname} ${this.lastname}`;
  return undefined;
});

userSchema.set('toJSON', {
  virtuals: true,
  transform: function (_, ret) {
    const newRet = { id: ret._id };
    delete ret._id;
    delete ret.__v;
    Object.assign(newRet, ret);
    return newRet;
  }
});

userSchema.post('save', async () => {
  // Your post-save logic here
});

const UserModel = mongoose.model<IUser>('User', userSchema);

export default UserModel;
