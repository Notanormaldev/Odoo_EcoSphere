import mongoose from 'mongoose';

const policyAcknowledgementSchema = new mongoose.Schema(
  {
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ESGPolicy',
      required: [true, 'Policy is required'],
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee is required'],
    },
    acknowledgedAt: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
    },
    signature: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

policyAcknowledgementSchema.index({ policy: 1, employee: 1 }, { unique: true });

const PolicyAcknowledgement = mongoose.model('PolicyAcknowledgement', policyAcknowledgementSchema);
export default PolicyAcknowledgement;
