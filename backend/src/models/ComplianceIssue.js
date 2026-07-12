import mongoose from 'mongoose';

const complianceIssueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Issue title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'Description is required'],
    },
    audit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Audit',
      default: null,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    severity: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      required: [true, 'Severity is required'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Overdue'],
      default: 'Open',
    },
    resolution: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isOverdue: {
      type: Boolean,
      default: false,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Auto-flag overdue issues
complianceIssueSchema.pre('save', function (next) {
  if (this.status !== 'Resolved' && this.dueDate < new Date()) {
    this.isOverdue = true;
    this.status = 'Overdue';
  }
  next();
});

complianceIssueSchema.index({ status: 1, severity: 1 });
complianceIssueSchema.index({ department: 1 });
complianceIssueSchema.index({ owner: 1 });
complianceIssueSchema.index({ dueDate: 1 });

const ComplianceIssue = mongoose.model('ComplianceIssue', complianceIssueSchema);
export default ComplianceIssue;
