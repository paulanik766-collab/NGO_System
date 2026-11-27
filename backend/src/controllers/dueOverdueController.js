/**
 * Due & Overdue Controller — NGO Management System (SE331 Group 04 Section C2)
 * Assigned to Member 2 (Module 2: Credit, Savings & Field Operations).
 * Automated detection engine to filter past-due unpaid installments and compile real-time defaulters list.
 */
const Loan = require('../models/Loan');

/**
 * Calculates days difference between past date and now.
 */
const getDaysDifference = (targetDate) => {
  const diffTime = Date.now() - new Date(targetDate).getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
};

/**
 * @route   GET /api/due-overdue/summary
 * @desc    Get summary analytics of due and overdue installments
 */
const getDueAndOverdueSummary = async (req, res) => {
  try {
    const now = new Date();
    const loans = await Loan.find({ status: 'Disbursed' }).populate('member', 'fullName memberId phone');

    let totalOverdueAmount = 0;
    let totalOverdueCount = 0;
    const defaulterMemberIds = new Set();
    let criticalOverdueCount = 0; // 30+ days overdue

    let upcomingDueCount = 0;
    let upcomingDueAmount = 0;
    const next7Days = new Date();
    next7Days.setDate(now.getDate() + 7);

    loans.forEach((loan) => {
      loan.installments.forEach((inst) => {
        if (inst.status !== 'Paid') {
          const dueDate = new Date(inst.dueDate);
          if (dueDate < now) {
            // Overdue
            const overdueDays = getDaysDifference(dueDate);
            totalOverdueAmount += inst.amount;
            totalOverdueCount += 1;
            defaulterMemberIds.add(loan.member?._id?.toString() || loan._id.toString());
            if (overdueDays >= 30) {
              criticalOverdueCount += 1;
            }
          } else if (dueDate <= next7Days) {
            // Due within next 7 days
            upcomingDueCount += 1;
            upcomingDueAmount += inst.amount;
          }
        }
      });
    });

    res.json({
      success: true,
      data: {
        totalOverdueAmount,
        totalOverdueCount,
        defaulterCount: defaulterMemberIds.size,
        criticalOverdueCount,
        upcomingDueCount,
        upcomingDueAmount,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error compiling summary', error: err.message });
  }
};

/**
 * @route   GET /api/due-overdue/defaulters
 * @desc    Compile a real-time Defaulters List with overdue days, amounts, and risk status
 */
const getDefaultersList = async (req, res) => {
  try {
    const { riskLevel, search } = req.query; // riskLevel: 'Low' (1-15d), 'Moderate' (16-30d), 'Critical' (30+d)
    const now = new Date();

    const loans = await Loan.find({ status: 'Disbursed' }).populate(
      'member',
      'memberId fullName phone email address status'
    );

    const defaultersMap = new Map();

    loans.forEach((loan) => {
      const overdueInstallments = loan.installments.filter(
        (inst) => inst.status !== 'Paid' && new Date(inst.dueDate) < now
      );

      if (overdueInstallments.length > 0) {
        // Calculate max overdue days and total overdue amount for this loan
        let loanOverdueAmount = 0;
        let maxDaysOverdue = 0;

        overdueInstallments.forEach((inst) => {
          loanOverdueAmount += inst.amount;
          const days = getDaysDifference(inst.dueDate);
          if (days > maxDaysOverdue) {
            maxDaysOverdue = days;
          }
        });

        const memberKey = loan.member ? loan.member._id.toString() : loan._id.toString();

        if (!defaultersMap.has(memberKey)) {
          let risk = 'Low';
          if (maxDaysOverdue > 30) risk = 'Critical';
          else if (maxDaysOverdue > 15) risk = 'Moderate';

          defaultersMap.set(memberKey, {
            member: loan.member,
            loanId: loan.loanId,
            loanObjectId: loan._id,
            principalAmount: loan.principalAmount,
            totalPayable: loan.totalPayable,
            totalPaid: loan.totalPaid,
            overdueInstallmentsCount: overdueInstallments.length,
            totalOverdueAmount: loanOverdueAmount,
            maxDaysOverdue,
            riskLevel: risk,
            earliestDueDate: overdueInstallments[0].dueDate,
          });
        } else {
          // If member has multiple loans with overdue
          const existing = defaultersMap.get(memberKey);
          existing.overdueInstallmentsCount += overdueInstallments.length;
          existing.totalOverdueAmount += loanOverdueAmount;
          if (maxDaysOverdue > existing.maxDaysOverdue) {
            existing.maxDaysOverdue = maxDaysOverdue;
            existing.riskLevel = maxDaysOverdue > 30 ? 'Critical' : maxDaysOverdue > 15 ? 'Moderate' : 'Low';
          }
        }
      }
    });

    let defaulters = Array.from(defaultersMap.values()).sort((a, b) => b.maxDaysOverdue - a.maxDaysOverdue);

    // Filter by riskLevel
    if (riskLevel && riskLevel !== 'All') {
      defaulters = defaulters.filter((d) => d.riskLevel === riskLevel);
    }

    // Filter by search
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      defaulters = defaulters.filter(
        (d) =>
          d.member?.fullName?.toLowerCase().includes(term) ||
          d.member?.memberId?.toLowerCase().includes(term) ||
          d.member?.phone?.includes(term) ||
          d.loanId?.toLowerCase().includes(term)
      );
    }

    res.json({
      success: true,
      count: defaulters.length,
      data: defaulters,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error generating defaulters list', error: err.message });
  }
};

/**
 * @route   GET /api/due-overdue/upcoming
 * @desc    Get upcoming installments due within specified days (default 7 days)
 */
const getUpcomingDueInstallments = async (req, res) => {
  try {
    const daysAhead = parseInt(req.query.days || '7', 10);
    const now = new Date();
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + daysAhead);

    const loans = await Loan.find({ status: 'Disbursed' }).populate('member', 'memberId fullName phone');

    const upcoming = [];

    loans.forEach((loan) => {
      loan.installments.forEach((inst) => {
        const due = new Date(inst.dueDate);
        if (inst.status !== 'Paid' && due >= now && due <= targetDate) {
          upcoming.push({
            loanId: loan.loanId,
            loanObjectId: loan._id,
            member: loan.member,
            installmentNumber: inst.installmentNumber,
            dueDate: inst.dueDate,
            amount: inst.amount,
            daysUntilDue: Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
          });
        }
      });
    });

    upcoming.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    res.json({
      success: true,
      count: upcoming.length,
      data: upcoming,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching upcoming dues', error: err.message });
  }
};

module.exports = {
  getDueAndOverdueSummary,
  getDefaultersList,
  getUpcomingDueInstallments,
};
