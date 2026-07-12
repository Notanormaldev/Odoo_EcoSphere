import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Audit title is required'],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    auditor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Auditor is required'],
    },
    auditorName: {
      type: String,
      trim: true,
    },
    auditDate: {
      type: Date,
      required: [true, 'Audit date is required'],
    },
    type: {
      type: String,
      enum: ['Internal', 'External', 'Regulatory'],
      default: 'Internal',
    },
    scope: {
      type: String,
      enum: ['Environmental', 'Social', 'Governance', 'Full ESG'],
      required: true,
    },
    findings: {
      type: String,
      trim: true,
    },
    findingsCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Under Review', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    reportUrl: {
      type: String,
      default: null,
    },
    nextAuditDate: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

auditSchema.index({ department: 1, status: 1 });
auditSchema.index({ auditDate: -1 });

const Audit = mongoose.model('Audit', auditSchema);
export default Audit;
