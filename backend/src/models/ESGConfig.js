import mongoose from 'mongoose';

const esgConfigSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      default: 'My Organization',
    },
    // Feature toggles
    autoEmissionCalculation: {
      type: Boolean,
      default: false,
    },
    evidenceRequiredForCSR: {
      type: Boolean,
      default: false,
    },
    badgeAutoAward: {
      type: Boolean,
      default: true,
    },
    // Score weights (must sum to 1.0)
    scoreWeights: {
      environmental: { type: Number, default: 0.4 },
      social: { type: Number, default: 0.3 },
      governance: { type: Number, default: 0.3 },
    },
    // Notification settings
    notifications: {
      complianceAlerts: { type: Boolean, default: true },
      approvalDecisions: { type: Boolean, default: true },
      policyReminders: { type: Boolean, default: true },
      badgeUnlocks: { type: Boolean, default: true },
      overdueIssues: { type: Boolean, default: true },
      emailEnabled: { type: Boolean, default: true },
      inAppEnabled: { type: Boolean, default: true },
    },
    // Fiscal year
    fiscalYearStart: {
      type: String,
      default: 'January',
      enum: [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December',
      ],
    },
    reportingCurrency: {
      type: String,
      default: 'INR',
    },
    co2Unit: {
      type: String,
      default: 'tonnes',
      enum: ['kg', 'tonnes', 'metric_tons'],
    },
  },
  { timestamps: true }
);

const ESGConfig = mongoose.model('ESGConfig', esgConfigSchema);
export default ESGConfig;
