import mongoose from 'mongoose';

const environmentalGoalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    targetCO2: {
      type: Number,
      required: [true, 'Target CO2 is required'],
      min: [0, 'Target must be non-negative'],
    },
    currentCO2: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: 'tonnes CO2e',
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    status: {
      type: String,
      enum: ['Active', 'On Track', 'At Risk', 'Completed', 'Overdue'],
      default: 'Active',
    },
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Auto-calculate progress
environmentalGoalSchema.pre('save', function (next) {
  if (this.targetCO2 > 0) {
    const reduction = this.targetCO2 - this.currentCO2;
    this.progressPercent = Math.min(100, Math.max(0, (reduction / this.targetCO2) * 100));
  }
  next();
});

environmentalGoalSchema.index({ department: 1, status: 1 });
environmentalGoalSchema.index({ deadline: 1 });

const EnvironmentalGoal = mongoose.model('EnvironmentalGoal', environmentalGoalSchema);
export default EnvironmentalGoal;
