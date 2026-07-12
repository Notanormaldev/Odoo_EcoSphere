import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import CarbonTransaction from '../models/CarbonTransaction.js';
import EmployeeParticipation from '../models/EmployeeParticipation.js';
import ChallengeParticipation from '../models/ChallengeParticipation.js';
import ESGPolicy from '../models/ESGPolicy.js';
import PolicyAcknowledgement from '../models/PolicyAcknowledgement.js';
import ComplianceIssue from '../models/ComplianceIssue.js';
import Audit from '../models/Audit.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import DepartmentScore from '../models/DepartmentScore.js';
import EnvironmentalGoal from '../models/EnvironmentalGoal.js';

const router = Router();

// Helper: build date filter
const dateFilter = (startDate, endDate) => {
  const filter = {};
  if (startDate) filter.$gte = new Date(startDate);
  if (endDate) filter.$lte = new Date(endDate);
  return Object.keys(filter).length ? filter : null;
};

// ESG Summary (for dashboard)
router.get('/summary', authenticate, async (req, res, next) => {
  try {
    const [
      totalCO2,
      activeGoals,
      csrApproved,
      challengesApproved,
      openIssues,
      activeUsers,
      departments,
    ] = await Promise.all([
      CarbonTransaction.aggregate([{ $group: { _id: null, total: { $sum: '$co2Equivalent' } } }]),
      EnvironmentalGoal.countDocuments({ status: { $in: ['Active', 'On Track'] } }),
      EmployeeParticipation.countDocuments({ approvalStatus: 'Approved' }),
      ChallengeParticipation.countDocuments({ approvalStatus: 'Approved' }),
      ComplianceIssue.countDocuments({ status: { $in: ['Open', 'Overdue'] } }),
      User.countDocuments({ isActive: true }),
      Department.countDocuments({ status: 'active' }),
    ]);

    // Monthly CO2 (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const monthlyEmissions = await CarbonTransaction.aggregate([
      { $match: { transactionDate: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$transactionDate' }, month: { $month: '$transactionDate' } },
          co2: { $sum: '$co2Equivalent' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Department scores ranking
    const deptScores = await DepartmentScore.find()
      .populate('department', 'name code')
      .sort({ totalScore: -1 })
      .limit(10);

    // Overall ESG Score (weighted avg of dept scores)
    const avgScores = await DepartmentScore.aggregate([
      {
        $group: {
          _id: null,
          avgEnv: { $avg: '$environmentalScore' },
          avgSoc: { $avg: '$socialScore' },
          avgGov: { $avg: '$governanceScore' },
          avgTotal: { $avg: '$totalScore' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        kpi: {
          totalCO2e: totalCO2[0]?.total || 0,
          activeGoals,
          csrParticipations: csrApproved,
          challengeCompletions: challengesApproved,
          openComplianceIssues: openIssues,
          activeEmployees: activeUsers,
          departments,
        },
        scores: avgScores[0] || { avgEnv: 0, avgSoc: 0, avgGov: 0, avgTotal: 0 },
        monthlyEmissions,
        deptRanking: deptScores,
      },
    });
  } catch (e) { next(e); }
});

// Environmental Report
router.get('/environmental', authenticate, async (req, res, next) => {
  try {
    const { department, startDate, endDate } = req.query;
    const filter = {};
    if (department) filter.department = department;
    const df = dateFilter(startDate, endDate);
    if (df) filter.transactionDate = df;

    const [transactions, goals, scopeBreakdown, deptBreakdown] = await Promise.all([
      CarbonTransaction.find(filter)
        .populate('department', 'name code')
        .populate('emissionFactor', 'name unit scope')
        .sort({ transactionDate: -1 }),
      EnvironmentalGoal.find(department ? { department } : {})
        .populate('department', 'name code'),
      CarbonTransaction.aggregate([
        ...(Object.keys(filter).length ? [{ $match: filter }] : []),
        { $group: { _id: '$scope', total: { $sum: '$co2Equivalent' }, count: { $sum: 1 } } },
      ]),
      CarbonTransaction.aggregate([
        ...(Object.keys(filter).length ? [{ $match: filter }] : []),
        { $group: { _id: '$department', total: { $sum: '$co2Equivalent' } } },
        { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
        { $unwind: '$dept' },
        { $project: { deptName: '$dept.name', total: 1 } },
        { $sort: { total: -1 } },
      ]),
    ]);

    res.json({ success: true, data: { transactions, goals, scopeBreakdown, deptBreakdown } });
  } catch (e) { next(e); }
});

// Social Report
router.get('/social', authenticate, async (req, res, next) => {
  try {
    const { department, employee, startDate, endDate } = req.query;
    const epFilter = {};
    const df = dateFilter(startDate, endDate);
    if (df) epFilter.createdAt = df;
    if (employee) epFilter.employee = employee;

    const [participations, genderDistrib, deptParticipation] = await Promise.all([
      EmployeeParticipation.find({ ...epFilter, approvalStatus: 'Approved' })
        .populate('employee', 'name email department gender')
        .populate('activity', 'title category'),
      User.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$gender', count: { $sum: 1 } } },
      ]),
      EmployeeParticipation.aggregate([
        { $match: { approvalStatus: 'Approved' } },
        { $lookup: { from: 'users', localField: 'employee', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $group: { _id: '$user.department', count: { $sum: 1 }, totalXP: { $sum: '$xpEarned' } } },
        { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
        { $unwind: { path: '$dept', preserveNullAndEmpty: true } },
        { $project: { deptName: { $ifNull: ['$dept.name', 'Unassigned'] }, count: 1, totalXP: 1 } },
      ]),
    ]);

    res.json({ success: true, data: { participations, genderDistrib, deptParticipation } });
  } catch (e) { next(e); }
});

// Governance Report
router.get('/governance', authenticate, async (req, res, next) => {
  try {
    const { department, startDate, endDate } = req.query;
    const df = dateFilter(startDate, endDate);
    const issueFilter = {};
    if (department) issueFilter.department = department;
    if (df) issueFilter.createdAt = df;

    const [policies, acknowledgements, audits, issues, issuesBySeverity] = await Promise.all([
      ESGPolicy.find().sort({ createdAt: -1 }),
      PolicyAcknowledgement.find()
        .populate('employee', 'name email department')
        .populate('policy', 'title category'),
      Audit.find(department ? { department } : {}).populate('department', 'name'),
      ComplianceIssue.find(issueFilter).populate('department', 'name').populate('owner', 'name'),
      ComplianceIssue.aggregate([
        { $group: { _id: { severity: '$severity', status: '$status' }, count: { $sum: 1 } } },
      ]),
    ]);

    res.json({ success: true, data: { policies, acknowledgements, audits, issues, issuesBySeverity } });
  } catch (e) { next(e); }
});

// Department scores calculation & upsert
router.post('/calculate-scores', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const { period } = req.body;
    const currentPeriod = period || new Date().toISOString().slice(0, 7); // YYYY-MM

    const departments = await Department.find({ status: 'active' });
    const results = [];

    for (const dept of departments) {
      const deptId = dept._id;

      const [
        carbonCount,
        goalsOnTrack,
        totalCSRPossible,
        csrApproved,
        totalChallengePossible,
        challengesApproved,
        policyCount,
        acksCount,
        openIssues,
        overdueIssues,
      ] = await Promise.all([
        CarbonTransaction.countDocuments({ department: deptId }),
        EnvironmentalGoal.countDocuments({ department: deptId, status: { $in: ['On Track', 'Completed'] } }),
        EmployeeParticipation.countDocuments({ 'activity.department': deptId }),
        EmployeeParticipation.countDocuments({ approvalStatus: 'Approved' }),
        ChallengeParticipation.countDocuments({}),
        ChallengeParticipation.countDocuments({ approvalStatus: 'Approved' }),
        ESGPolicy.countDocuments({ status: 'Active' }),
        PolicyAcknowledgement.countDocuments({}),
        ComplianceIssue.countDocuments({ department: deptId, status: { $in: ['Open', 'In Progress'] } }),
        ComplianceIssue.countDocuments({ department: deptId, status: 'Overdue' }),
      ]);

      // Simple scoring algorithm
      const envScore = Math.min(100, Math.max(0,
        (goalsOnTrack * 20) +
        (carbonCount > 0 ? 40 : 20) +
        40
      ));

      const csrRate = totalCSRPossible > 0 ? (csrApproved / totalCSRPossible) * 100 : 50;
      const challengeRate = totalChallengePossible > 0 ? (challengesApproved / totalChallengePossible) * 100 : 50;
      const socialScore = Math.min(100, Math.round((csrRate * 0.5 + challengeRate * 0.5)));

      const ackRate = policyCount > 0 ? (acksCount / (policyCount * dept.employeeCount || 1)) * 100 : 50;
      const issuesPenalty = (openIssues * 5) + (overdueIssues * 10);
      const govScore = Math.min(100, Math.max(0, Math.round(ackRate) - issuesPenalty + 20));

      const totalScore = Math.round(envScore * 0.4 + socialScore * 0.3 + govScore * 0.3);

      const score = await DepartmentScore.findOneAndUpdate(
        { department: deptId, period: currentPeriod },
        {
          department: deptId,
          period: currentPeriod,
          environmentalScore: envScore,
          socialScore,
          governanceScore: govScore,
          totalScore,
          calculatedAt: new Date(),
          metrics: { carbonTransactions: carbonCount, goalsOnTrack, openComplianceIssues: openIssues, overdueIssues },
        },
        { upsert: true, new: true }
      );

      results.push(score);
    }

    res.json({ success: true, data: results, message: `Scores calculated for ${results.length} departments` });
  } catch (e) { next(e); }
});

export default router;
