import mongoose from 'mongoose';

const esgPolicySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Policy title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Policy content is required'],
    },
    category: {
      type: String,
      enum: ['Environmental', 'Social', 'Governance', 'Health & Safety', 'Data Privacy', 'Code of Conduct', 'Other'],
      required: true,
    },
    version: {
      type: String,
      default: '1.0',
    },
    effectiveDate: {
      type: Date,
      required: [true, 'Effective date is required'],
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Under Review', 'Expired', 'Archived'],
      default: 'Draft',
    },
    applicableTo: {
      type: String,
      enum: ['All', 'Department-Specific'],
      default: 'All',
    },
    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
      },
    ],
    requiresAcknowledgement: {
      type: Boolean,
      default: true,
    },
    acknowledgementDeadline: {
      type: Date,
      default: null,
    },
    documentUrl: {
      type: String,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    acknowledgedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

esgPolicySchema.index({ status: 1, category: 1 });
esgPolicySchema.index({ effectiveDate: 1 });

const ESGPolicy = mongoose.model('ESGPolicy', esgPolicySchema);
export default ESGPolicy;
