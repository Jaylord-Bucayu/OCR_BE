import mongoose, { Schema, Document } from 'mongoose';

interface IPayment extends Document {
  amount?: number | null;
  status?: string | null;
  student?: Map<string, string | number | boolean | null>;
  parent?: Map<string, string | number | boolean | null>;
  fee?:Map<string, string | number | boolean | null>;
  
}

const paymentSchema: Schema<IPayment> = new Schema<IPayment>(
  {
    amount: {
        type: Number,
        default:0
    },
    status: {
      type: String,
      default: 'pending',
      enum:['pending','paid','failed']
    },
    fee:{
      type: Object,
      ref:'Fee'
    },
    student: {
      type: Object,
      ref:'User'
     
    },
    parent: {
        type: Object,
        ref:'User'
    },

  },
  { timestamps: true }
);

paymentSchema.index({ sponsors: 1 });
paymentSchema.index({ sponsorId: 1 });

paymentSchema.virtual('id').get(function (this: IPayment) {
  return this._id?.toHexString();
});



paymentSchema.set('toJSON', {
  virtuals: true,
  transform: function (_, ret) {
    const newRet = { id: ret._id };
    delete ret._id;
    delete ret.__v;
    Object.assign(newRet, ret);
    return newRet;
  }
});

paymentSchema.post('save', async () => {
  // Your post-save logic here
});

const PaymentModel = mongoose.model<IPayment>('Payment', paymentSchema);

export default PaymentModel;
