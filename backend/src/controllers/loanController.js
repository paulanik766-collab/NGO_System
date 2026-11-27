/**
 * Loan Controller — NGO Management System (SE331 Group 04 Section C2)
 * Handles loan application creation, listing, status transitions, and payment recording.
 */
const mongoose = require('mongoose');
const Loan = require('../models/Loan');
const Member = require('../models/Member');
const { calculateLoanFinancials, generateRepaymentSchedule } = require('../utils/loanCalculator');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * Generate unique Loan ID (LN-1001, LN-1002, ...)
 */
const generateLoanId = async () => {
  const lastLoan = await Loan.findOne({}, { loanId: 1 }).sort({ createdAt: -1 });
  if (!lastLoan || !lastLoan.loanId) {
    return 'LN-1001';
  }
  const match = lastLoan.loanId.match(/\d+$/);
  const nextNum = match ? parseInt(match[0], 10) + 1 : 1001;
  return `LN-${nextNum}`;
};

/**
 * @route   GET /api/loans
 * @desc    Get all loans with search and status filtering
 */
const getLoans = async (req, res) => {
  try {
    const { status, member, search } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (member && isValidObjectId(member)) {
      query.member = member;
    }

    let loans = await Loan.find(query)
      .populate('member', 'memberId fullName phone email address status')
      .sort({ createdAt: -1 });

    // Client-side search across loanId or populated member name/id
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      loans = loans.filter((loan) => {
        const loanIdMatch = loan.loanId && loan.loanId.toLowerCase().includes(term);
        const memberNameMatch = loan.member?.fullName && loan.member.fullName.toLowerCase().includes(term);
        const memberIdMatch = loan.member?.memberId && loan.member.memberId.toLowerCase().includes(term);
        return loanIdMatch || memberNameMatch || memberIdMatch;
      });
    }

    res.json({
      success: true,
      count: loans.length,
      data: loans,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching loans', error: err.message });
  }
};

/**
 * @route   GET /api/loans/:id
 * @desc    Get single loan detail with member and installment schedule
 */
const getLoanById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid loan ID format' });
    }

    const loan = await Loan.findById(req.params.id).populate('member', 'memberId fullName phone email address status');
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan record not found' });
    }

    res.json({ success: true, data: loan });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * @route   POST /api/loans
 * @desc    Create a new loan application (initial status: Pending)
 */
const createLoan = async (req, res) => {
  try {
    const { member, principalAmount, interestRate, termDuration, termType, purpose } = req.body;

    if (!member || !isValidObjectId(member)) {
      return res.status(400).json({ success: false, message: 'Valid member ID is required' });
    }

    const memberDoc = await Member.findById(member);
    if (!memberDoc) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    if (!principalAmount || Number(principalAmount) < 1000) {
      return res.status(400).json({ success: false, message: 'Principal amount must be at least 1,000 BDT' });
    }

    if (interestRate === undefined || Number(interestRate) < 0 || Number(interestRate) > 100) {
      return res.status(400).json({ success: false, message: 'Interest rate must be between 0 and 100%' });
    }

    if (!termDuration || Number(termDuration) < 1) {
      return res.status(400).json({ success: false, message: 'Term duration must be at least 1' });
    }

    if (!purpose || !purpose.trim()) {
      return res.status(400).json({ success: false, message: 'Loan purpose is required' });
    }

    // Perform financial calculations
    const financials = calculateLoanFinancials(
      principalAmount,
      interestRate,
      termDuration,
      termType || 'Monthly'
    );

    const loanId = await generateLoanId();

    const newLoan = await Loan.create({
      loanId,
      member,
      ...financials,
      purpose: purpose.trim(),
      status: 'Pending',
      applicationDate: new Date(),
      installments: [],
    });

    const populated = await Loan.findById(newLoan._id).populate('member', 'memberId fullName phone email status');

    res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully',
      data: populated,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * @route   PATCH /api/loans/:id/status
 * @desc    Update loan status workflow (Approved, Rejected, Disbursed, Closed)
 */
const updateLoanStatus = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid loan ID format' });
    }

    const { status, rejectionReason } = req.body;
    const validStatuses = ['Approved', 'Rejected', 'Disbursed', 'Closed'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    // State transition validations
    if (status === 'Approved') {
      if (loan.status !== 'Pending') {
        return res.status(400).json({ success: false, message: 'Only Pending loans can be Approved' });
      }
      loan.status = 'Approved';
      loan.approvedDate = new Date();
      loan.rejectionReason = null;
    } else if (status === 'Rejected') {
      if (loan.status !== 'Pending') {
        return res.status(400).json({ success: false, message: 'Only Pending loans can be Rejected' });
      }
      loan.status = 'Rejected';
      loan.rejectionReason = rejectionReason || 'Application rejected by administration';
    } else if (status === 'Disbursed') {
      if (loan.status !== 'Approved') {
        return res.status(400).json({ success: false, message: 'Loan must be Approved before Disbursement' });
      }
      loan.status = 'Disbursed';
      loan.disbursedDate = new Date();

      // Automatically generate installment schedule upon disbursement
      loan.installments = generateRepaymentSchedule(
        loan.totalPayable,
        loan.installmentAmount,
        loan.termDuration,
        loan.termType,
        loan.disbursedDate
      );
    } else if (status === 'Closed') {
      if (loan.status !== 'Disbursed') {
        return res.status(400).json({ success: false, message: 'Only Disbursed loans can be Closed' });
      }
      loan.status = 'Closed';
    }

    await loan.save();

    const populated = await Loan.findById(loan._id).populate('member', 'memberId fullName phone email status');

    res.json({
      success: true,
      message: `Loan status transitioned to ${status}`,
      data: populated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   POST /api/loans/:id/installments/:installmentNumber/pay
 * @desc    Record an installment payment
 */
const recordInstallmentPayment = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid loan ID format' });
    }

    const { installmentNumber } = req.params;
    const { amount } = req.body;

    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    if (loan.status !== 'Disbursed') {
      return res.status(400).json({ success: false, message: 'Payments can only be recorded on Disbursed loans' });
    }

    const installment = loan.installments.find(
      (inst) => inst.installmentNumber === parseInt(installmentNumber, 10)
    );

    if (!installment) {
      return res.status(404).json({ success: false, message: 'Installment not found' });
    }

    if (installment.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'This installment is already paid' });
    }

    const paymentAmount = amount ? Number(amount) : installment.amount;
    installment.paidAmount = paymentAmount;
    installment.paidDate = new Date();
    installment.status = 'Paid';

    // Recalculate total paid
    loan.totalPaid = loan.installments.reduce((sum, inst) => sum + (inst.paidAmount || 0), 0);

    // If all installments are paid, auto-close the loan
    const allPaid = loan.installments.every((inst) => inst.status === 'Paid');
    if (allPaid) {
      loan.status = 'Closed';
    }

    await loan.save();

    const populated = await Loan.findById(loan._id).populate('member', 'memberId fullName phone email status');

    res.json({
      success: true,
      message: `Installment #${installmentNumber} payment recorded successfully`,
      data: populated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route   DELETE /api/loans/:id
 * @desc    Delete a loan application (only if Pending or Rejected)
 */
const deleteLoan = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid loan ID format' });
    }

    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    if (loan.status === 'Disbursed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an active disbursed loan with repayment commitments',
      });
    }

    await Loan.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Loan record deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getLoans,
  getLoanById,
  createLoan,
  updateLoanStatus,
  recordInstallmentPayment,
  deleteLoan,
};
