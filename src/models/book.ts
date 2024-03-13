import mongoose, { Schema, Document } from 'mongoose';

interface I extends Document {
  title?: string | null;
  description?: string | null;
  photos?: string | null;
  timestamp?:  Map<string, string | number | boolean | null>;
  text?: string | null;
  audio?: string | null;
  
}

const bookSchema: Schema<I> = new Schema<I>(
  {
    title: {
        type: String,
    },

    description: {
        type: String,  
    },
    photos:{
      type:[String],
     
    },
    timestamp:{
      type:Object,

    },
    text:{
      type:String
    },
    audio:{
      type:String
    }


  },
  { timestamps: true }
);

bookSchema.index({ sponsors: 1 });
bookSchema.index({ sponsorId: 1 });

bookSchema.virtual('id').get(function (this: I) {
  return this._id?.toHexString();
});



bookSchema.set('toJSON', {
  virtuals: true,
  transform: function (_, ret) {
    const newRet = { id: ret._id };
    delete ret._id;
    delete ret.__v;
    Object.assign(newRet, ret);
    return newRet;
  }
});

bookSchema.post('save', async () => {
  // Your post-save logic here
});

const BookModel = mongoose.model<I>('Books', bookSchema);

export default BookModel;
