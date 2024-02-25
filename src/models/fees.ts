import mongoose, { Schema, Document } from 'mongoose';

interface IFee extends Document {
  amount?: number | null;
  particulars?: string | null;
  student?: string | null;
  dueDate?: string;
  status?: string;
  
}

const feesSchema: Schema<IFee> = new Schema<IFee>(
  {
    amount: {
        type: Number,
        default:0
    },

    particulars: {
        type: String,
      
    },
    status:{
      type:String,
      default:'pending'
    },
    dueDate:{
      type:Date,

    },
    student: {
      type: Object,
      ref:'User'
     
    }

  },
  { timestamps: true }
);

feesSchema.index({ sponsors: 1 });
feesSchema.index({ sponsorId: 1 });

feesSchema.virtual('id').get(function (this: IFee) {
  return this._id?.toHexString();
});



feesSchema.set('toJSON', {
  virtuals: true,
  transform: function (_, ret) {
    const newRet = { id: ret._id };
    delete ret._id;
    delete ret.__v;
    Object.assign(newRet, ret);
    return newRet;
  }
});

feesSchema.post('save', async () => {
  // Your post-save logic here
});

const FeesModel = mongoose.model<IFee>('Fees', feesSchema);

export default FeesModel;
