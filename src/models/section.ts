import mongoose, { Schema, Document } from 'mongoose';

interface ISection extends Document {
  section_name?: string | null;
  
  
}

const sectionSchema: Schema<ISection> = new Schema<ISection>(
  {
    section_name: {
      type: String,
      default: null,
    }
   

  },
  { timestamps: true }
);

sectionSchema.virtual('id').get(function (this: ISection) {
  return this._id?.toHexString();
});

sectionSchema.set('toJSON', {
  virtuals: true,
  transform: function (_, ret) {
    const newRet = { id: ret._id };
    delete ret._id;
    delete ret.__v;
    Object.assign(newRet, ret);
    return newRet;
  }
});

sectionSchema.post('save', async () => {
  // Your post-save logic here
});

const SectionModel = mongoose.model<ISection>('Section', sectionSchema);
export default SectionModel;
