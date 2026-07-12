import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Category type is required'],
      enum: ['CSR Activity', 'Challenge', 'Emission', 'General'],
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: '📋',
    },
    color: {
      type: String,
      default: '#64748B',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

categorySchema.index({ type: 1, status: 1 });

const Category = mongoose.model('Category', categorySchema);
export default Category;
