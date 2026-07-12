import { Router } from 'express';
import CSRActivity from '../models/CSRActivity.js';
import EmployeeParticipation from '../models/EmployeeParticipation.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { createNotification } from '../services/notificationService.js';
import { awardXPAndPoints } from '../services/badgeService.js';
import ESGConfig from '../models/ESGConfig.js';

const router = Router();

// ======= CSR ACTIVITIES =======
router.get('/activities', authenticate, async (req, res, next) => {
  try {
    const { status, department, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;

    const skip = (Number(page) - 1) * Number(limit);
    const [activities, total] = await Promise.all([
      CSRActivity.find(filter)
        .populate('organizer', 'name avatar')
        .populate('department', 'name code')
        .populate('category', 'name icon')
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      CSRActivity.countDocuments(filter),
    ]);

    // Check participation for current user
    const activityIds = activities.map((a) => a._id);
    const participations = await EmployeeParticipation.find({
      employee: req.user._id,
      activity: { $in: activityIds },
    }).select('activity approvalStatus');

    const participationMap = {};
    participations.forEach((p) => {
      participationMap[p.activity.toString()] = p.approvalStatus;
    });

    const enriched = activities.map((a) => ({
      ...a.toObject(),
      userParticipationStatus: participationMap[a._id.toString()] || null,
    }));

    res.json({ success: true, data: enriched, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (e) { next(e); }
});

router.post('/activities', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const activity = await CSRActivity.create({ ...req.body, organizer: req.user._id });
    res.status(201).json({ success: true, data: activity });
  } catch (e) { next(e); }
});

router.put('/activities/:id', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const activity = await CSRActivity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!activity) throw new AppError('Activity not found', 404);
    res.json({ success: true, data: activity });
  } catch (e) { next(e); }
});

router.delete('/activities/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    await CSRActivity.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Activity deleted' });
  } catch (e) { next(e); }
});

// JOIN an activity
router.post('/activities/:id/join', authenticate, async (req, res, next) => {
  try {
    const activity = await CSRActivity.findById(req.params.id);
    if (!activity) throw new AppError('Activity not found', 404);
    if (activity.status !== 'Open') throw new AppError('Activity is not open for participation', 400);

    const existing = await EmployeeParticipation.findOne({
      employee: req.user._id,
      activity: req.params.id,
    });
    if (existing) throw new AppError('Already joined this activity', 409);

    const participation = await EmployeeParticipation.create({
      employee: req.user._id,
      activity: req.params.id,
    });

    await CSRActivity.findByIdAndUpdate(req.params.id, { $inc: { participantCount: 1 } });

    res.status(201).json({ success: true, data: participation, message: 'Joined activity successfully' });
  } catch (e) { next(e); }
});

// ======= EMPLOYEE PARTICIPATION (approval queue) =======
router.get('/participation', authenticate, async (req, res, next) => {
  try {
    const { approvalStatus, employee, activity, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    if (employee) filter.employee = employee;
    if (activity) filter.activity = activity;

    // Non-admins see only their own
    if (req.user.role === 'employee') filter.employee = req.user._id;

    const skip = (Number(page) - 1) * Number(limit);
    const [participations, total] = await Promise.all([
      EmployeeParticipation.find(filter)
        .populate('employee', 'name email avatar department')
        .populate('activity', 'title pointsAwarded evidenceRequired')
        .populate('approvedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      EmployeeParticipation.countDocuments(filter),
    ]);

    res.json({ success: true, data: participations, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (e) { next(e); }
});

// Submit proof
router.put('/participation/:id/proof', authenticate, async (req, res, next) => {
  try {
    const { proofUrl, proofFileName } = req.body;
    const participation = await EmployeeParticipation.findOne({
      _id: req.params.id,
      employee: req.user._id,
    });
    if (!participation) throw new AppError('Participation not found', 404);

    participation.proof = { url: proofUrl, fileName: proofFileName, uploadedAt: new Date() };
    participation.approvalStatus = 'Pending';
    await participation.save();

    res.json({ success: true, data: participation, message: 'Proof submitted' });
  } catch (e) { next(e); }
});

// Approve/Reject participation
router.put('/participation/:id/approve', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const { action, rejectionReason } = req.body; // action: 'approve' | 'reject'
    const participation = await EmployeeParticipation.findById(req.params.id)
      .populate('activity', 'title pointsAwarded evidenceRequired')
      .populate('employee', 'name email');

    if (!participation) throw new AppError('Participation not found', 404);

    const esgConfig = await ESGConfig.findOne();

    if (action === 'approve') {
      // Check evidence requirement
      if (esgConfig?.evidenceRequiredForCSR && !participation.proof?.url) {
        throw new AppError('Evidence/proof is required before approval', 400);
      }

      const points = participation.activity.pointsAwarded || 50;
      const xp = Math.floor(points * 0.8);

      participation.approvalStatus = 'Approved';
      participation.approvedBy = req.user._id;
      participation.approvedAt = new Date();
      participation.completionDate = new Date();
      participation.pointsEarned = points;
      participation.xpEarned = xp;
      await participation.save();

      // Award XP and points
      await awardXPAndPoints(participation.employee._id, xp, points);

      // Notify employee
      await createNotification({
        recipientId: participation.employee._id,
        type: 'csr_approval',
        title: 'Activity Approved! 🎉',
        message: `Your participation in "${participation.activity.title}" has been approved. You earned ${xp} XP and ${points} points!`,
        link: '/social/participation',
        priority: 'high',
        sendEmail: true,
      });
    } else if (action === 'reject') {
      participation.approvalStatus = 'Rejected';
      participation.rejectionReason = rejectionReason;
      participation.approvedBy = req.user._id;
      participation.approvedAt = new Date();
      await participation.save();

      await createNotification({
        recipientId: participation.employee._id,
        type: 'csr_approval',
        title: 'Activity Participation Rejected',
        message: `Your participation in "${participation.activity.title}" was not approved. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
        link: '/social/participation',
        sendEmail: true,
      });
    }

    res.json({ success: true, data: participation });
  } catch (e) { next(e); }
});

// Diversity dashboard
router.get('/diversity', authenticate, async (req, res, next) => {
  try {
    const [genderDistribution, deptDistribution, totalEmployees] = await Promise.all([
      User.aggregate([
        { $match: { isActive: true, role: { $ne: 'admin' } } },
        { $group: { _id: '$gender', count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
        { $unwind: { path: '$dept', preserveNullAndEmpty: true } },
        { $project: { deptName: { $ifNull: ['$dept.name', 'Unassigned'] }, count: 1 } },
      ]),
      User.countDocuments({ isActive: true }),
    ]);

    // Participation rate by dept
    const participationRate = await EmployeeParticipation.aggregate([
      { $match: { approvalStatus: 'Approved' } },
      {
        $lookup: {
          from: 'users',
          localField: 'employee',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $group: { _id: '$user.department', participated: { $addToSet: '$employee' } } },
      { $project: { participatedCount: { $size: '$participated' } } },
    ]);

    res.json({
      success: true,
      data: { genderDistribution, deptDistribution, totalEmployees, participationRate },
    });
  } catch (e) { next(e); }
});

export default router;
