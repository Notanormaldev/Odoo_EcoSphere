import { Router } from 'express';
import Department from '../models/Department.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// GET all departments
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const departments = await Department.find(filter)
      .populate('head', 'name email avatar')
      .populate('parentDepartment', 'name code')
      .sort({ name: 1 });

    res.json({ success: true, data: departments, count: departments.length });
  } catch (error) { next(error); }
});

// GET single department
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const dept = await Department.findById(req.params.id)
      .populate('head', 'name email avatar')
      .populate('parentDepartment', 'name code');
    if (!dept) throw new AppError('Department not found', 404);
    res.json({ success: true, data: dept });
  } catch (error) { next(error); }
});

// CREATE department
router.post('/', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json({ success: true, data: dept });
  } catch (error) { next(error); }
});

// UPDATE department
router.put('/:id', authenticate, authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!dept) throw new AppError('Department not found', 404);
    res.json({ success: true, data: dept });
  } catch (error) { next(error); }
});

// DELETE department
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) throw new AppError('Department not found', 404);
    res.json({ success: true, message: 'Department deleted' });
  } catch (error) { next(error); }
});

export default router;
