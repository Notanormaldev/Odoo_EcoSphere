import { Router } from 'express';
import ESGPolicy from '../models/ESGPolicy.js';
import PolicyAcknowledgement from '../models/PolicyAcknowledgement.js';
import Audit from '../models/Audit.js';
import ComplianceIssue from '../models/ComplianceIssue.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { createNotification, notifyAdmins } from '../services/notificationService.js';

const router = Router();

// ======= ESG POLICIES =======
router.get('/policies', authenticate, async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const policies = await ESGPolicy.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // Add acknowledgement status for current user
    const policyIds = policies.map((p) => p._id);
    const acks = await PolicyAcknowledgement.find({
      policy: { $in: policyIds },
      employee: req.user._id,
    }).select('policy');
    const ackedSet = new Set(acks.map((a) => a.policy.toString()));

    const enriched = policies.map((p) => ({
      ...p.toObject(),
      isAcknowledged: ackedSet.has(p._id.toString()),
    }));

    res.json({ success: true, data: enriched });
  } catch (e) { next(e); }
});

router.post('/policies', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const policy = await ESGPolicy.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: policy });
  } catch (e) { next(e); }
});

router.put('/policies/:id', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const policy = await ESGPolicy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!policy) throw new AppError('Policy not found', 404);
    res.json({ success: true, data: policy });
  } catch (e) { next(e); }
});

router.delete('/policies/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    await ESGPolicy.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Policy deleted' });
  } catch (e) { next(e); }
});

// Acknowledge policy
router.post('/policies/:id/acknowledge', authenticate, async (req, res, next) => {
  try {
    const policy = await ESGPolicy.findById(req.params.id);
    if (!policy) throw new AppError('Policy not found', 404);

    const existing = await PolicyAcknowledgement.findOne({
      policy: req.params.id,
      employee: req.user._id,
    });
    if (existing) throw new AppError('Already acknowledged this policy', 409);

    const ack = await PolicyAcknowledgement.create({
      policy: req.params.id,
      employee: req.user._id,
      ipAddress: req.ip,
    });

    await ESGPolicy.findByIdAndUpdate(req.params.id, { $inc: { acknowledgedCount: 1 } });

    res.status(201).json({ success: true, data: ack, message: 'Policy acknowledged' });
  } catch (e) { next(e); }
});

router.get('/acknowledgements', authenticate, async (req, res, next) => {
  try {
    const { policy, employee } = req.query;
    const filter = {};
    if (policy) filter.policy = policy;
    if (employee) filter.employee = employee;
    if (req.user.role === 'employee') filter.employee = req.user._id;

    const acks = await PolicyAcknowledgement.find(filter)
      .populate('employee', 'name email avatar department')
      .populate('policy', 'title category version')
      .sort({ acknowledgedAt: -1 });

    res.json({ success: true, data: acks });
  } catch (e) { next(e); }
});

// ======= AUDITS =======
router.get('/audits', authenticate, async (req, res, next) => {
  try {
    const { department, status, scope } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (scope) filter.scope = scope;

    const audits = await Audit.find(filter)
      .populate('department', 'name code')
      .populate('auditor', 'name email')
      .populate('createdBy', 'name')
      .sort({ auditDate: -1 });

    res.json({ success: true, data: audits });
  } catch (e) { next(e); }
});

router.post('/audits', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const audit = await Audit.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: audit });
  } catch (e) { next(e); }
});

router.put('/audits/:id', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const audit = await Audit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!audit) throw new AppError('Audit not found', 404);
    res.json({ success: true, data: audit });
  } catch (e) { next(e); }
});

router.delete('/audits/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    await Audit.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Audit deleted' });
  } catch (e) { next(e); }
});

// ======= COMPLIANCE ISSUES =======
router.get('/compliance-issues', authenticate, async (req, res, next) => {
  try {
    const { status, severity, department, owner } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (department) filter.department = department;
    if (owner) filter.owner = owner;

    const issues = await ComplianceIssue.find(filter)
      .populate('department', 'name code')
      .populate('owner', 'name email avatar')
      .populate('audit', 'title')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: issues });
  } catch (e) { next(e); }
});

router.post('/compliance-issues', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const issue = await ComplianceIssue.create({ ...req.body, createdBy: req.user._id });

    // Notify the owner and admins
    await createNotification({
      recipientId: issue.owner,
      type: 'compliance_issue',
      title: 'New Compliance Issue Assigned',
      message: `A new ${issue.severity} compliance issue "${issue.title}" has been assigned to you. Due: ${issue.dueDate.toLocaleDateString()}`,
      link: '/governance/compliance-issues',
      priority: 'high',
      sendEmail: true,
    });

    await notifyAdmins({
      type: 'compliance_issue',
      title: `New Compliance Issue: ${issue.title}`,
      message: `A new ${issue.severity} severity issue was created in the ${issue.department} department.`,
      link: '/governance/compliance-issues',
      priority: issue.severity === 'Critical' ? 'high' : 'medium',
    });

    res.status(201).json({ success: true, data: issue });
  } catch (e) { next(e); }
});

router.put('/compliance-issues/:id', authenticate, async (req, res, next) => {
  try {
    const { action, resolution } = req.body;
    const issue = await ComplianceIssue.findById(req.params.id);
    if (!issue) throw new AppError('Issue not found', 404);

    Object.assign(issue, req.body);

    if (action === 'resolve') {
      issue.status = 'Resolved';
      issue.resolution = resolution;
      issue.resolvedAt = new Date();
      issue.resolvedBy = req.user._id;
      issue.isOverdue = false;
    }

    await issue.save();
    res.json({ success: true, data: issue });
  } catch (e) { next(e); }
});

router.delete('/compliance-issues/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    await ComplianceIssue.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Issue deleted' });
  } catch (e) { next(e); }
});

export default router;
