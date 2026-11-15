/**
 * Installment Controller — Member 3 (Module 2: Installment Management)
 * SE331 Software Engineering Design Capstone Project (Group 04 Section C2)
 *
 * Responsibilities:
 * 1. Automated calculation and generation of repayment schedules upon loan disbursement.
 * 2. Collecting and recording installment payments with receipt generation.
 * 3. Schedule generation previews (supporting Member 2 loan application & Member 3 views).
 * 4. Aggregated collection metrics, collection histories, and installment status tracking.
 */
const mongoose = require('express');
const Loan = require('../models/Loan');
const Member = require('../models/Member');
const Employee = require('../models/Employee');
const InstallmentPayment = require('../models/InstallmentPayment');
const { generateRepaymentSchedule, calculateLoanFinancials } = require('../utils/loanCalculator');

const isValidObjectId = (id) => mongoose.Types?.ObjectId?.isValid ? mongoose.Types.ObjectId.isValid(id) : /^[0-9a-fA-F]{24}$/.test(id);

/**
 * Generate unique receipt number: RCP-YYYYMMDD-XXXX
 */
const generateReceiptNumber = async () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = await InstallmentPayment.countDocuments();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `RCP-${dateStr}-${count + 1}-${randomSuffix}`;
};

/**
 * @route   GET /api/installments/calculator-preview
 * @desc    Simulate and preview repayment schedule without saving to database
 */
const previewRepaymentSchedule = async (req, res) => {
  try {
    const { principalAmount, interestRate, termDuration, termType, startDate } = req.query;

    if (!principalAmount || !interestRate || !termDuration) {
      return res.status(400).json({
        success: false,
        message: 'Principal amount, interest rate, and term duration are required',
      });
    }

    const financials = calculateLoanFinancials(
      principalAmount,
      interestRate,
      termDuration,
      termType || 'Monthly'
    );

    const schedule = generateRepaymentSchedule(
      financials.totalPayable,
      financials.installmentAmount,
      financials.termDuration,
      financials.termType,
      startDate ? new Date(startDate) : new Date()
    );

    res.json({
      success: true,
      data: {
        financials,
        schedule,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   POST /api/installments/generate-schedule/:loanId
 * @desc    Generate/Regenerate repayment schedule for an approved loan upon disbursement
 */
const generateScheduleForLoan = async (req, res) => {
  try {
    const { loanId } = req.params;
    const { disbursementDate } = req.body;

    const query = isValidObjectId(loanId)
      ? { $or: [{ _id: loanId }, { loanId }] }
      : { loanId };

    const loan = await Loan.findOne(query).populate('member', 'memberId fullName phone');
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    if (loan.status === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate repayment schedule for a rejected loan',
      });
    }

    const effectiveDate = disbursementDate ? new Date(disbursementDate) : new Date();

    const schedule = generateRepaymentSchedule(
      loan.totalPayable,
      loan.installmentAmount,
      loan.termDuration,
      loan.termType,
      effectiveDate
    );

    loan.installments = schedule;
    if (loan.status === 'Approved') {
      loan.status = 'Disbursed';
      loan.disbursedDate = effectiveDate;
    }

    await loan.save();

    res.json({
      success: true,
      message: `Repayment schedule with ${schedule.length} installments generated successfully`,
      data: loan,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   POST /api/installments/collect
 * @desc    Collect and record an installment payment with receipt tracking
 */
const collectInstallmentPayment = async (req, res) => {
  try {
    const {
      loanId,
      installmentNumber,
      amount,
      paymentMethod = 'Cash',
      collectedBy,
      collectorName,
      lateFine = 0,
      notes = '',
    } = req.body;

    if (!loanId) {
      return res.status(400).json({ success: false, message: 'Loan ID is required' });
    }

    if (!installmentNumber) {
      return res.status(400).json({ success: false, message: 'Installment number is required' });
    }

    const query = isValidObjectId(loanId)
      ? { $or: [{ _id: loanId }, { loanId }] }
      : { loanId };

    const loan = await Loan.findOne(query).populate('member', 'memberId fullName phone email');
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    if (loan.status !== 'Disbursed') {
      return res.status(400).json({
        success: false,
        message: `Payments can only be collected on Disbursed loans. Current loan status is "${loan.status}".`,
      });
    }

    const instNum = parseInt(installmentNumber, 10);
    const targetInstallment = loan.installments.find(
      (inst) => inst.installmentNumber === instNum
    );

    if (!targetInstallment) {
      return res.status(404).json({
        success: false,
        message: `Installment #${instNum} does not exist in loan schedule`,
      });
    }

    if (targetInstallment.status === 'Paid') {
      return res.status(400).json({
        success: false,
        message: `Installment #${instNum} has already been marked as Paid on ${new Date(targetInstallment.paidDate).toLocaleDateString()}`,
      });
    }

    const payAmount = amount ? Number(amount) : targetInstallment.amount;
    if (payAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero' });
    }

    // Resolve field officer / collector details if provided
    let collectorEmp = null;
    let finalCollectorName = collectorName || 'Field Officer';
    if (collectedBy && isValidObjectId(collectedBy)) {
      collectorEmp = await Employee.findById(collectedBy);
      if (collectorEmp) {
        finalCollectorName = `${collectorEmp.fullName} (${collectorEmp.employeeId})`;
      }
    }

    const receiptNumber = await generateReceiptNumber();

    // 1. Update installment status in Loan model
    targetInstallment.paidAmount = payAmount;
    targetInstallment.paidDate = new Date();
    targetInstallment.status = 'Paid';

    // 2. Recompute total paid and auto-close loan if all installments paid
    loan.totalPaid = loan.installments.reduce((sum, inst) => sum + (inst.paidAmount || 0), 0);
    const allPaid = loan.installments.every((inst) => inst.status === 'Paid');
    if (allPaid) {
      loan.status = 'Closed';
    }

    await loan.save();

    // 3. Record individual transaction ledger entry in InstallmentPayment
    const paymentRecord = await InstallmentPayment.create({
      receiptNumber,
      loan: loan._id,
      member: loan.member._id,
      installmentNumber: instNum,
      amount: payAmount,
      paymentDate: new Date(),
      paymentMethod,
      collectedBy: collectorEmp ? collectorEmp._id : null,
      collectorName: finalCollectorName,
      lateFine: Number(lateFine) || 0,
      notes,
    });

    res.status(201).json({
      success: true,
      message: `Installment #${instNum} payment of ৳${payAmount.toLocaleString()} recorded successfully`,
      data: {
        payment: paymentRecord,
        receiptNumber,
        loanStatus: loan.status,
        totalPaid: loan.totalPaid,
        remainingBalance: Math.max(0, loan.totalPayable - loan.totalPaid),
        installment: targetInstallment,
        member: loan.member,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   GET /api/installments/schedule/:loanId
 * @desc    Get detailed installment schedule & collection breakdown for a loan
 */
const getLoanSchedule = async (req, res) => {
  try {
    const { loanId } = req.params;

    const query = isValidObjectId(loanId)
      ? { $or: [{ _id: loanId }, { loanId }] }
      : { loanId };

    const loan = await Loan.findOne(query).populate('member', 'memberId fullName phone email');
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    // Retrieve payment transaction history for this loan
    const paymentRecords = await InstallmentPayment.find({ loan: loan._id })
      .populate('collectedBy', 'fullName employeeId designation')
      .sort({ installmentNumber: 1 });

    const totalInstallments = loan.installments.length;
    const paidInstallments = loan.installments.filter((i) => i.status === 'Paid').length;
    const unpaidInstallments = totalInstallments - paidInstallments;

    res.json({
      success: true,
      data: {
        loan,
        installments: loan.installments,
        paymentRecords,
        stats: {
          totalInstallments,
          paidInstallments,
          unpaidInstallments,
          totalPayable: loan.totalPayable,
          totalPaid: loan.totalPaid,
          remainingBalance: Math.max(0, loan.totalPayable - loan.totalPaid),
          progressPercent: totalInstallments > 0 ? Math.round((paidInstallments / totalInstallments) * 100) : 0,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   GET /api/installments/payments
 * @desc    Get list of all installment collection transactions with filters and search
 */
const getAllPayments = async (req, res) => {
  try {
    const { search, paymentMethod, loanId, page = 1, limit = 50 } = req.query;
    const query = {};

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (loanId && isValidObjectId(loanId)) {
      query.loan = loanId;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    let payments = await InstallmentPayment.find(query)
      .populate('member', 'memberId fullName phone')
      .populate('loan', 'loanId principalAmount totalPayable status')
      .populate('collectedBy', 'employeeId fullName designation')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limitNum);

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      payments = payments.filter((p) => {
        return (
          p.receiptNumber?.toLowerCase().includes(q) ||
          p.member?.fullName?.toLowerCase().includes(q) ||
          p.member?.memberId?.toLowerCase().includes(q) ||
          p.loan?.loanId?.toLowerCase().includes(q) ||
          p.collectorName?.toLowerCase().includes(q)
        );
      });
    }

    const total = await InstallmentPayment.countDocuments(query);

    res.json({
      success: true,
      data: payments,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   GET /api/installments/stats
 * @desc    Get aggregated installment collections statistics
 */
const getInstallmentStats = async (req, res) => {
  try {
    const [payments, disbursedLoans] = await Promise.all([
      InstallmentPayment.find(),
      Loan.find({ status: 'Disbursed' }),
    ]);

    const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPaymentsCount = payments.length;

    let totalPendingInstallmentCount = 0;
    let totalPendingInstallmentAmount = 0;

    disbursedLoans.forEach((loan) => {
      loan.installments.forEach((inst) => {
        if (inst.status !== 'Paid') {
          totalPendingInstallmentCount += 1;
          totalPendingInstallmentAmount += inst.amount;
        }
      });
    });

    res.json({
      success: true,
      data: {
        totalCollected,
        totalPaymentsCount,
        disbursedLoansCount: disbursedLoans.length,
        totalPendingInstallmentCount,
        totalPendingInstallmentAmount,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  previewRepaymentSchedule,
  generateScheduleForLoan,
  collectInstallmentPayment,
  getLoanSchedule,
  getAllPayments,
  getInstallmentStats,
};
