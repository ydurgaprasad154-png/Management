import asyncHandler from 'express-async-handler';
import Payment from '../models/Payment.js';
import Client from '../models/Client.js';
import Project from '../models/Project.js';

// Helper: compute payment fields
const computePaymentFields = (totalAmount, advanceAmount) => {
  const total = Math.max(0, Number(totalAmount) || 0);
  const advance = Math.min(Math.max(0, Number(advanceAmount) || 0), total);
  const pending = Math.max(0, total - advance);
  const fullyPaid = total > 0 && advance >= total;
  let status = 'Pending';
  if (fullyPaid) status = 'Completed';
  else if (advance > 0) status = 'Partial';
  return { totalAmount: total, advanceAmount: advance, pendingAmount: pending, fullyPaid, status };
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
const getPayments = asyncHandler(async (req, res) => {
  let payments;
  if (req.user.role === 'admin') {
    payments = await Payment.find({ isDeleted: { $ne: true } })
      .populate({ path: 'client', populate: { path: 'user', select: 'name email' } })
      .populate('project', 'name')
      .sort({ createdAt: -1 });
  } else {
    const client = await Client.findOne({ user: req.user._id });
    if (!client) return res.json([]);
    const projects = await Project.find({ client: client._id });
    const projectIds = projects.map(p => p._id);
    payments = await Payment.find({ project: { $in: projectIds }, isDeleted: { $ne: true } })
      .populate('project', 'name')
      .sort({ createdAt: -1 });
  }
  res.json(payments);
});

// @desc    Create a payment record
// @route   POST /api/payments
// @access  Private/Admin
const createPayment = asyncHandler(async (req, res) => {
  const { client, project, totalAmount, advanceAmount, notes, paymentDate } = req.body;

  let invoiceUrl = '';
  if (req.file) invoiceUrl = req.file.path;

  const computed = computePaymentFields(totalAmount, advanceAmount);

  const payment = await Payment.create({
    client: client || undefined,
    project: project || undefined,
    ...computed,
    notes,
    paymentDate: paymentDate || Date.now(),
    invoiceUrl,
  });

  const populated = await Payment.findById(payment._id)
    .populate({ path: 'client', populate: { path: 'user', select: 'name email' } })
    .populate('project', 'name');

  res.status(201).json(populated);
});

// @desc    Update a payment (edit amounts or mark fully paid)
// @route   PUT /api/payments/:id
// @access  Private/Admin
const updatePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });

  const { totalAmount, advanceAmount, notes, markFullyPaid } = req.body;

  // Use existing values as fallback for old documents that may have legacy 'amount' field
  const currentTotal = totalAmount !== undefined ? Number(totalAmount) : (payment.totalAmount || payment.amount || 0);
  const currentAdvance = markFullyPaid ? currentTotal : (advanceAmount !== undefined ? Number(advanceAmount) : (payment.advanceAmount || 0));

  const computed = computePaymentFields(currentTotal, currentAdvance);

  payment.totalAmount = computed.totalAmount;
  payment.advanceAmount = computed.advanceAmount;
  payment.pendingAmount = computed.pendingAmount;
  payment.fullyPaid = computed.fullyPaid;
  payment.status = computed.status;
  if (notes !== undefined) payment.notes = notes;

  await payment.save();

  const populated = await Payment.findById(payment._id)
    .populate({ path: 'client', populate: { path: 'user', select: 'name email' } })
    .populate('project', 'name');

  res.json(populated);
});

export { getPayments, createPayment, updatePayment };
