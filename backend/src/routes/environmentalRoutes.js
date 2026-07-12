import { Router } from 'express';
import Category from '../models/Category.js';
import EmissionFactor from '../models/EmissionFactor.js';
import EnvironmentalGoal from '../models/EnvironmentalGoal.js';
import CarbonTransaction from '../models/CarbonTransaction.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// ======= CATEGORIES =======
router.get('/categories', authenticate, async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = {};
    if (type) filter.type = type;
    const cats = await Category.find(filter).sort({ name: 1 });
    res.json({ success: true, data: cats });
  } catch (e) { next(e); }
});

router.post('/categories', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json({ success: true, data: cat });
  } catch (e) { next(e); }
});

router.put('/categories/:id', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cat) throw new AppError('Category not found', 404);
    res.json({ success: true, data: cat });
  } catch (e) { next(e); }
});

router.delete('/categories/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (e) { next(e); }
});

// ======= EMISSION FACTORS =======
router.get('/emission-factors', authenticate, async (req, res, next) => {
  try {
    const { category, scope } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (scope) filter.scope = scope;
    const factors = await EmissionFactor.find(filter).sort({ name: 1 });
    res.json({ success: true, data: factors });
  } catch (e) { next(e); }
});

router.post('/emission-factors', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const factor = await EmissionFactor.create(req.body);
    res.status(201).json({ success: true, data: factor });
  } catch (e) { next(e); }
});

router.put('/emission-factors/:id', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const factor = await EmissionFactor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!factor) throw new AppError('Emission factor not found', 404);
    res.json({ success: true, data: factor });
  } catch (e) { next(e); }
});

router.delete('/emission-factors/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    await EmissionFactor.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Emission factor deleted' });
  } catch (e) { next(e); }
});

// ======= ENVIRONMENTAL GOALS =======
router.get('/goals', authenticate, async (req, res, next) => {
  try {
    const { department, status } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (status) filter.status = status;
    const goals = await EnvironmentalGoal.find(filter)
      .populate('department', 'name code')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: goals });
  } catch (e) { next(e); }
});

router.post('/goals', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const goal = await EnvironmentalGoal.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: goal });
  } catch (e) { next(e); }
});

router.put('/goals/:id', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const goal = await EnvironmentalGoal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!goal) throw new AppError('Goal not found', 404);
    res.json({ success: true, data: goal });
  } catch (e) { next(e); }
});

router.delete('/goals/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    await EnvironmentalGoal.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Goal deleted' });
  } catch (e) { next(e); }
});

// ======= CARBON TRANSACTIONS =======
router.get('/carbon-transactions', authenticate, async (req, res, next) => {
  try {
    const { department, sourceType, startDate, endDate, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (sourceType) filter.sourceType = sourceType;
    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) filter.transactionDate.$gte = new Date(startDate);
      if (endDate) filter.transactionDate.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [transactions, total] = await Promise.all([
      CarbonTransaction.find(filter)
        .populate('department', 'name code')
        .populate('emissionFactor', 'name unit')
        .populate('createdBy', 'name')
        .sort({ transactionDate: -1 })
        .skip(skip)
        .limit(Number(limit)),
      CarbonTransaction.countDocuments(filter),
    ]);

    // Summary stats
    const totalCO2 = await CarbonTransaction.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$co2Equivalent' } } },
    ]);

    res.json({
      success: true,
      data: transactions,
      total,
      totalCO2e: totalCO2[0]?.total || 0,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (e) { next(e); }
});

router.post('/carbon-transactions', authenticate, async (req, res, next) => {
  try {
    const { emissionFactorId, quantity, ...rest } = req.body;
    let co2Equivalent = rest.co2Equivalent;

    if (emissionFactorId && quantity) {
      const factor = await EmissionFactor.findById(emissionFactorId);
      if (factor) {
        co2Equivalent = factor.factor * quantity;
      }
    }

    const transaction = await CarbonTransaction.create({
      ...rest,
      emissionFactor: emissionFactorId,
      quantity,
      co2Equivalent,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (e) { next(e); }
});

router.delete('/carbon-transactions/:id', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    await CarbonTransaction.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (e) { next(e); }
});

// Environmental dashboard stats
router.get('/dashboard', authenticate, async (req, res, next) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year}-12-31`);

    const [monthlyEmissions, scopeBreakdown, topDeptEmissions, goalsStats] = await Promise.all([
      CarbonTransaction.aggregate([
        { $match: { transactionDate: { $gte: startOfYear, $lte: endOfYear } } },
        {
          $group: {
            _id: { $month: '$transactionDate' },
            total: { $sum: '$co2Equivalent' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      CarbonTransaction.aggregate([
        { $group: { _id: '$scope', total: { $sum: '$co2Equivalent' } } },
      ]),
      CarbonTransaction.aggregate([
        { $group: { _id: '$department', total: { $sum: '$co2Equivalent' } } },
        { $sort: { total: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
        { $unwind: '$dept' },
        { $project: { deptName: '$dept.name', total: 1 } },
      ]),
      EnvironmentalGoal.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      data: { monthlyEmissions, scopeBreakdown, topDeptEmissions, goalsStats },
    });
  } catch (e) { next(e); }
});

export default router;
