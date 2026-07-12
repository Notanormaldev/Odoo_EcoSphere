import mongoose from 'mongoose';

const carbonTransactionSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    emissionFactor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmissionFactor',
    },
    sourceType: {
      type: String,
      enum: ['Purchase', 'Manufacturing', 'Expense', 'Fleet', 'Energy', 'Manual'],
      required: [true, 'Source type is required'],
    },
    sourceDescription: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity must be non-negative'],
    },
    unit: {
      type: String,
      trim: true,
    },
    co2Equivalent: {
      type: Number,
      required: [true, 'CO2 equivalent is required'],
      min: [0, 'CO2e must be non-negative'],
    },
    scope: {
      type: String,
      enum: ['Scope 1', 'Scope 2', 'Scope 3'],
      default: 'Scope 3',
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    isAutoCalculated: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

carbonTransactionSchema.index({ department: 1, transactionDate: -1 });
carbonTransactionSchema.index({ sourceType: 1 });
carbonTransactionSchema.index({ transactionDate: -1 });

const CarbonTransaction = mongoose.model('CarbonTransaction', carbonTransactionSchema);
export default CarbonTransaction;
