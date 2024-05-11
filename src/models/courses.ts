import mongoose, { Document } from 'mongoose';

interface IAuth extends Document {
  book?: string;
  students?:Map<string, string | number | boolean | null>;
  teacher?:string;
  code?:string;
}

const authSchema = new mongoose.Schema<IAuth>(
  {
    book: {
        type: Object,
        ref:'User'
       
      },
      students: {
        type: [Object],
        ref:'User'
       
      },
      teacher:{
         type: Object,
         ref:'User'
    },
    code:{
        type:String,
        default:'',
        required:true
    }
  
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




const CourseModel = mongoose.model<IAuth>('Model', authSchema);

export default CourseModel;
