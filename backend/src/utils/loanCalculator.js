/**
 * Loan Calculator Helper (SE331 Group 04 Section C2 — Member 2)
 * Computes interest amounts, total payable amounts, installment breakdowns,
 * and generates repayment schedules upon loan disbursement.
 */

/**
 * Calculates loan financials based on principal, interest rate, and term duration.
 * @param {number} principal - Loan principal amount (e.g., 20000)
 * @param {number} interestRate - Annual interest rate percentage (e.g., 10%)
 * @param {number} termDuration - Duration count in months or weeks
 * @param {string} termType - 'Monthly' or 'Weekly'
 */
const calculateLoanFinancials = (principal, interestRate, termDuration, termType = 'Monthly') => {
  const p = Number(principal);
  const r = Number(interestRate);
  const duration = Number(termDuration);

  // Convert term into fraction of years for interest computation
  // Monthly: duration / 12 years; Weekly: duration / 52 years
  const years = termType === 'Weekly' ? duration / 52 : duration / 12;

  // Simple interest calculation: I = P * R * T / 100
  const totalInterest = Math.round((p * r * years) / 100);
  const totalPayable = p + totalInterest;

  // Periodic installment amount
  const installmentAmount = Math.ceil(totalPayable / duration);

  return {
    principalAmount: p,
    interestRate: r,
    termDuration: duration,
    termType,
    totalInterest,
    totalPayable,
    installmentAmount,
  };
};

/**
 * Generates the sequential installment repayment schedule starting from disbursement date.
 * @param {number} totalPayable - Total loan payable amount
 * @param {number} installmentAmount - Standard installment amount
 * @param {number} termDuration - Total number of installments
 * @param {string} termType - 'Monthly' or 'Weekly'
 * @param {Date} startDate - Disbursement date (defaults to now)
 */
const generateRepaymentSchedule = (
  totalPayable,
  installmentAmount,
  termDuration,
  termType = 'Monthly',
  startDate = new Date()
) => {
  const installments = [];
  let remainingBalance = totalPayable;
  const start = new Date(startDate);

  for (let i = 1; i <= termDuration; i++) {
    const dueDate = new Date(start);

    if (termType === 'Weekly') {
      dueDate.setDate(start.getDate() + i * 7);
    } else {
      // Monthly installment
      dueDate.setMonth(start.getMonth() + i);
    }

    // For the final installment, adjust to reconcile any rounding differences
    const amount = i === termDuration ? remainingBalance : Math.min(installmentAmount, remainingBalance);
    remainingBalance -= amount;

    installments.push({
      installmentNumber: i,
      dueDate,
      amount,
      status: 'Unpaid',
      paidDate: null,
      paidAmount: 0,
    });
  }

  return installments;
};

module.exports = {
  calculateLoanFinancials,
  generateRepaymentSchedule,
};
