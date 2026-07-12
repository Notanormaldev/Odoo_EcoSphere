import mongoose from 'mongoose';

const departmentScoreSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    period: {
      type: String,
      required: true,
      // Format: 'YYYY-MM' for monthly
    },
    environmentalScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    socialScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    governanceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    weights: {
      environmental: { type: Number, default: 0.4 },
      social: { type: Number, default: 0.3 },
      governance: { type: Number, default: 0.3 },
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
    // Raw metrics
    metrics: {
      carbonTransactions: { type: Number, default: 0 },
      goalsOnTrack: { type: Number, default: 0 },
      csrParticipationRate: { type: Number, default: 0 },
      challengeCompletionRate: { type: Number, default: 0 },
      policyAcknowledgementRate: { type: Number, default: 0 },
      openComplianceIssues: { type: Number, default: 0 },
      overdueIssues: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

departmentScoreSchema.index({ department: 1, period: 1 }, { unique: true });
departmentScoreSchema.index({ totalScore: -1 });

const DepartmentScore = mongoose.model('DepartmentScore', departmentScoreSchema);
export default DepartmentScore;
