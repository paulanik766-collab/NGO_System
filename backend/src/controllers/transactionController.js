const Transaction = require('../models/Transaction');
const Member = require('../models/Member');

const generateTransactionId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TRX-${timestamp}-${random}`;
};

const recordTransactionHelper = async ({
  type,
  amount,
  member,
  referenceId = '',
  referenceModel = '',
  paymentMethod = 'Cash',
  performedBy = 'System',
  remarks = '',
  status = 'Completed',
  category = null,
}) => {
  try {
    let assignedCategory = category;
    if (!assignedCategory) {
      if (['installment_payment', 'savings_deposit', 'fee_payment'].includes(type)) {
        assignedCategory = 'credit';
      } else {
        assignedCategory = 'debit';
      }
    }

    const transactionId = generateTransactionId();

    const transaction = await Transaction.create({
      transactionId,
      type,
      category: assignedCategory,
      amount: Number(amount),
      member,
      referenceId,
      referenceModel,
      paymentMethod,
      performedBy,
      remarks,
      status,
    });

    return transaction;
  } catch (err) {
    console.error('Error recording ledger transaction:', err);
    return null;
  }
};

const getTransactions = async (req, res) => {
  try {
    const {
      type,
      category,
      paymentMethod,
      status,
      memberId,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (type) query.type = type;
    if (category) query.category = category;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (status) query.status = status;
    if (memberId) query.member = memberId;

    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) query.transactionDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.transactionDate.$lte = end;
      }
    }

    if (search) {
      const matchingMembers = await Member.find({
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { memberId: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      const memberIds = matchingMembers.map((m) => m._id);

      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { referenceId: { $regex: search, $options: 'i' } },
        { remarks: { $regex: search, $options: 'i' } },
        { member: { $in: memberIds } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('member', 'fullName memberId phone')
        .sort({ transactionDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Transaction.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      transactions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: err.message,
    });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id).populate(
      'member',
      'fullName memberId phone email address center'
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction details',
      error: err.message,
    });
  }
};

const createTransaction = async (req, res) => {
  try {
    const {
      type,
      amount,
      memberId,
      category,
      referenceId,
      referenceModel,
      paymentMethod,
      performedBy,
      remarks,
      status,
    } = req.body;

    if (!type || !amount || !memberId) {
      return res.status(400).json({
        success: false,
        message: 'Type, amount, and memberId are required',
      });
    }

    const memberExists = await Member.findById(memberId);
    if (!memberExists) {
      return res.status(404).json({
        success: false,
        message: 'Associated member not found',
      });
    }

    const transaction = await recordTransactionHelper({
      type,
      amount,
      member: memberId,
      category,
      referenceId: referenceId || '',
      referenceModel: referenceModel || 'Manual',
      paymentMethod: paymentMethod || 'Cash',
      performedBy: performedBy || req.user?.name || 'Staff',
      remarks: remarks || '',
      status: status || 'Completed',
    });

    if (!transaction) {
      return res.status(500).json({
        success: false,
        message: 'Failed to record transaction',
      });
    }

    const populated = await Transaction.findById(transaction._id).populate(
      'member',
      'fullName memberId phone'
    );

    res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully in unified ledger',
      transaction: populated,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error creating transaction',
      error: err.message,
    });
  }
};

const getTransactionStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [aggregations, todayAggs, countTotal, typeGroup, methodGroup] = await Promise.all([
      Transaction.aggregate([
        { $match: { status: 'Completed' } },
        {
          $group: {
            _id: '$category',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            status: 'Completed',
            transactionDate: { $gte: startOfToday },
          },
        },
        {
          $group: {
            _id: '$category',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      Transaction.countDocuments(),
      Transaction.aggregate([
        { $match: { status: 'Completed' } },
        {
          $group: {
            _id: '$type',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      Transaction.aggregate([
        { $match: { status: 'Completed' } },
        {
          $group: {
            _id: '$paymentMethod',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    let totalInflow = 0;
    let totalOutflow = 0;

    for (const item of aggregations) {
      if (item._id === 'credit') totalInflow = item.totalAmount;
      if (item._id === 'debit') totalOutflow = item.totalAmount;
    }

    let todayInflow = 0;
    let todayOutflow = 0;

    for (const item of todayAggs) {
      if (item._id === 'credit') todayInflow = item.totalAmount;
      if (item._id === 'debit') todayOutflow = item.totalAmount;
    }

    res.status(200).json({
      success: true,
      stats: {
        totalInflow,
        totalOutflow,
        netBalance: totalInflow - totalOutflow,
        totalTransactions: countTotal,
        todayInflow,
        todayOutflow,
        typeBreakdown: typeGroup,
        paymentMethodBreakdown: methodGroup,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error computing transaction statistics',
      error: err.message,
    });
  }
};

const exportTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('member', 'fullName memberId phone')
      .sort({ transactionDate: -1 });

    const exportData = transactions.map((t) => ({
      transactionId: t.transactionId,
      date: t.transactionDate,
      type: t.type,
      category: t.category,
      amount: t.amount,
      memberName: t.member ? (t.member.fullName || t.member.name) : 'N/A',
      memberId: t.member ? (t.member.memberId || t.member.accountNumber) : 'N/A',
      paymentMethod: t.paymentMethod,
      referenceId: t.referenceId,
      status: t.status,
      performedBy: t.performedBy,
      remarks: t.remarks,
    }));

    res.status(200).json({
      success: true,
      count: exportData.length,
      data: exportData,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error exporting transactions',
      error: err.message,
    });
  }
};

module.exports = {
  recordTransactionHelper,
  getTransactions,
  getTransactionById,
  createTransaction,
  getTransactionStats,
  exportTransactions,
};
