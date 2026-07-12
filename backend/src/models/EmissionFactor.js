import mongoose from 'mongoose';

const emissionFactorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Emission factor name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Purchase', 'Manufacturing', 'Expense', 'Fleet', 'Energy', 'Waste', 'Other'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
      // e.g., 'kg CO2e/km', 'kg CO2e/kWh', 'kg CO2e/unit'
    },
    factor: {
      type: Number,
      required: [true, 'Emission factor value is required'],
      min: [0, 'Factor must be non-negative'],
    },
    source: {
      type: String,
      trim: true,
      // e.g., 'IPCC 2023', 'GHG Protocol'
    },
    description: {
      type: String,
      trim: true,
    },
    scope: {
      type: String,
      enum: ['Scope 1', 'Scope 2', 'Scope 3'],
      default: 'Scope 3',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

emissionFactorSchema.index({ category: 1, isActive: 1 });

const EmissionFactor = mongoose.model('EmissionFactor', emissionFactorSchema);
export default EmissionFactor;
