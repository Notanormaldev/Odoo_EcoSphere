import mongoose from 'mongoose';

const challengeParticipationSchema = new mongoose.Schema(
  {
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
      required: [true, 'Challenge is required'],
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee is required'],
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    proof: {
      url: { type: String, default: null },
      fileName: { type: String, default: null },
      uploadedAt: { type: Date, default: null },
    },
    approvalStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Not Submitted'],
      default: 'Not Submitted',
    },
    xpAwarded: {
      type: Number,
      default: 0,
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
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
  },
  { timestamps: true }
);

challengeParticipationSchema.index({ challenge: 1, employee: 1 }, { unique: true });
challengeParticipationSchema.index({ approvalStatus: 1 });
challengeParticipationSchema.index({ employee: 1 });

const ChallengeParticipation = mongoose.model('ChallengeParticipation', challengeParticipationSchema);
export default ChallengeParticipation;
