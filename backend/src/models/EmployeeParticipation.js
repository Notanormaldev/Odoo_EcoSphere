import mongoose from 'mongoose';

const employeeParticipationSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee is required'],
    },
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CSRActivity',
      required: [true, 'Activity is required'],
    },
    proof: {
      url: { type: String, default: null },
      fileName: { type: String, default: null },
      uploadedAt: { type: Date, default: null },
    },
    approvalStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    xpEarned: {
      type: Number,
      default: 0,
    },
    completionDate: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Unique constraint: one employee per activity
employeeParticipationSchema.index({ employee: 1, activity: 1 }, { unique: true });
employeeParticipationSchema.index({ approvalStatus: 1 });
employeeParticipationSchema.index({ activity: 1 });

const EmployeeParticipation = mongoose.model('EmployeeParticipation', employeeParticipationSchema);
export default EmployeeParticipation;
