const mongoose = require('mongoose');
const SavingsAccount = require('../models/SavingsAccount');
const SavingsLedger = require('../models/SavingsLedger');
const Member = require('../models/Member');
const { recordTransactionHelper } = require('./transactionController');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getAccounts = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    let memberIds = [];
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      const matchedMembers = await Member.find({
        $or: [{ fullName: searchRegex }, { memberId: searchRegex }, { phone: searchRegex }],
      }).select('_id');
      memberIds = matchedMembers.map((m) => m._id);

      query.$or = [{ accountNumber: searchRegex }, { member: { $in: memberIds } }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [accounts, total] = await Promise.all([
      SavingsAccount.find(query)
        .populate('member', 'memberId fullName phone status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      SavingsAccount.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: accounts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch savings accounts', error: error.message });
  }
};

const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid account ID format' });
    }

    const account = await SavingsAccount.findById(id).populate('member', 'memberId fullName phone address status');
    if (!account) {
      return res.status(404).json({ success: false, message: 'Savings account not found' });
    }

    const recentTransactions = await SavingsLedger.find({ account: id })
      .sort({ date: -1, createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        account,
        recentTransactions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch account details', error: error.message });
  }
};

const createAccount = async (req, res) => {
  try {
    const { member, accountNumber, accountType, mandatoryAmount, initialDeposit } = req.body;

    if (!member) {
      return res.status(400).json({ success: false, message: 'Member reference is required' });
    }

    if (!isValidObjectId(member)) {
      return res.status(400).json({ success: false, message: 'Invalid member ID format' });
    }

    const targetMember = await Member.findById(member);
    if (!targetMember) {
      return res.status(404).json({ success: false, message: 'Referenced member does not exist' });
    }

    const existingAccount = await SavingsAccount.findOne({ member, status: 'Active' });
    if (existingAccount) {
      return res.status(409).json({
        success: false,
        message: `Member already has an active savings account (${existingAccount.accountNumber})`,
      });
    }

    let accNumber = accountNumber?.trim()?.toUpperCase();
    if (!accNumber) {
      const count = await SavingsAccount.countDocuments();
      accNumber = `SAV-${String(count + 1).padStart(4, '0')}`;
    }

    const existingNumber = await SavingsAccount.findOne({ accountNumber: accNumber });
    if (existingNumber) {
      return res.status(409).json({ success: false, message: 'Account number already exists' });
    }

    const depositAmount = parseFloat(initialDeposit) || 0;
    if (depositAmount < 0) {
      return res.status(400).json({ success: false, message: 'Initial deposit cannot be negative' });
    }

    const newAccount = await SavingsAccount.create({
      accountNumber: accNumber,
      member,
      accountType: accountType || 'General Savings',
      balance: depositAmount,
      mandatoryAmount: mandatoryAmount !== undefined ? parseFloat(mandatoryAmount) : 200,
      status: 'Active',
      openedDate: new Date(),
    });

    if (depositAmount > 0) {
      const transactionId = `TXN-SAV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      await SavingsLedger.create({
        transactionId,
        account: newAccount._id,
        member,
        type: 'Deposit',
        savingsType: 'Mandatory',
        amount: depositAmount,
        balanceBefore: 0,
        balanceAfter: depositAmount,
        paymentMethod: 'Cash',
        collectedBy: 'Branch Staff',
        remarks: 'Initial deposit upon account opening',
      });

      try {
        await recordTransactionHelper({
          type: 'savings_deposit',
          amount: depositAmount,
          member,
          referenceId: transactionId,
          referenceModel: 'SavingsLedger',
          paymentMethod: 'Cash',
          performedBy: 'Branch Staff',
          remarks: 'Initial deposit upon account opening',
        });
      } catch (txE) {}
    }

    const populated = await SavingsAccount.findById(newAccount._id).populate('member', 'memberId fullName phone');

    res.status(201).json({
      success: true,
      message: 'Savings account opened successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create savings account', error: error.message });
  }
};

const updateAccountStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid account ID' });
    }

    if (!['Active', 'Dormant', 'Closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Active, Dormant, or Closed' });
    }

    const account = await SavingsAccount.findById(id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Savings account not found' });
    }

    if (status === 'Closed' && account.balance > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot close account with positive balance (৳${account.balance}). Please withdraw all savings first.`,
      });
    }

    account.status = status;
    await account.save();

    res.json({
      success: true,
      message: `Account status updated to ${status}`,
      data: account,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update account status', error: error.message });
  }
};

const logTransaction = async (req, res) => {
  try {
    const {
      accountId,
      type,
      savingsType,
      amount,
      paymentMethod = 'Cash',
      collectedBy = 'Field Officer',
      remarks = '',
      date,
    } = req.body;

    if (!accountId || !isValidObjectId(accountId)) {
      return res.status(400).json({ success: false, message: 'Valid savings account ID is required' });
    }

    if (!['Deposit', 'Withdrawal'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Transaction type must be Deposit or Withdrawal' });
    }

    if (!['Mandatory', 'Voluntary'].includes(savingsType)) {
      return res.status(400).json({ success: false, message: 'Savings type must be Mandatory or Voluntary' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Transaction amount must be a positive number' });
    }

    const account = await SavingsAccount.findById(accountId);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Savings account not found' });
    }

    if (account.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: `Transactions cannot be performed on a ${account.status} account`,
      });
    }

    const balanceBefore = account.balance;
    let balanceAfter = balanceBefore;

    if (type === 'Withdrawal') {
      if (balanceBefore < parsedAmount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient balance. Available: ৳${balanceBefore}, Requested: ৳${parsedAmount}`,
        });
      }
      balanceAfter = balanceBefore - parsedAmount;
    } else {
      balanceAfter = balanceBefore + parsedAmount;
    }

    account.balance = balanceAfter;
    await account.save();

    const transactionId = `TXN-SAV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const ledgerEntry = await SavingsLedger.create({
      transactionId,
      account: account._id,
      member: account.member,
      type,
      savingsType,
      amount: parsedAmount,
      balanceBefore,
      balanceAfter,
      paymentMethod,
      collectedBy,
      remarks,
      date: date ? new Date(date) : new Date(),
    });

    try {
      await recordTransactionHelper({
        type: type === 'Withdrawal' ? 'savings_withdrawal' : 'savings_deposit',
        amount: parsedAmount,
        member: account.member,
        referenceId: transactionId,
        referenceModel: 'SavingsLedger',
        paymentMethod: paymentMethod || 'Cash',
        performedBy: collectedBy || 'Field Officer',
        remarks: remarks || `${savingsType} ${type}`,
      });
    } catch (txE) {}

    const populated = await SavingsLedger.findById(ledgerEntry._id)
      .populate('member', 'memberId fullName phone')
      .populate('account', 'accountNumber accountType');

    res.status(201).json({
      success: true,
      message: `${type} of ৳${parsedAmount} recorded successfully`,
      data: {
        transaction: populated,
        newBalance: balanceAfter,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record transaction', error: error.message });
  }
};

const getLedger = async (req, res) => {
  try {
    const {
      accountId,
      memberId,
      type,
      savingsType,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    if (accountId && isValidObjectId(accountId)) {
      query.account = accountId;
    }

    if (memberId && isValidObjectId(memberId)) {
      query.member = memberId;
    }

    if (type && ['Deposit', 'Withdrawal'].includes(type)) {
      query.type = type;
    }

    if (savingsType && ['Mandatory', 'Voluntary'].includes(savingsType)) {
      query.savingsType = savingsType;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      query.$or = [{ transactionId: searchRegex }, { remarks: searchRegex }, { collectedBy: searchRegex }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [entries, total, allEntriesForSummary] = await Promise.all([
      SavingsLedger.find(query)
        .populate('member', 'memberId fullName phone')
        .populate('account', 'accountNumber accountType')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      SavingsLedger.countDocuments(query),
      SavingsLedger.find(query).select('type savingsType amount'),
    ]);

    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let mandatoryDeposits = 0;
    let voluntaryDeposits = 0;

    allEntriesForSummary.forEach((item) => {
      if (item.type === 'Deposit') {
        totalDeposits += item.amount;
        if (item.savingsType === 'Mandatory') mandatoryDeposits += item.amount;
        if (item.savingsType === 'Voluntary') voluntaryDeposits += item.amount;
      } else if (item.type === 'Withdrawal') {
        totalWithdrawals += item.amount;
      }
    });

    res.json({
      success: true,
      data: entries,
      summary: {
        totalDeposits,
        totalWithdrawals,
        netSavings: totalDeposits - totalWithdrawals,
        mandatoryDeposits,
        voluntaryDeposits,
        totalTransactions: total,
      },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch savings ledger', error: error.message });
  }
};

const getSavingsStats = async (req, res) => {
  try {
    const [accounts, ledgerEntries] = await Promise.all([
      SavingsAccount.find(),
      SavingsLedger.find().select('type savingsType amount'),
    ]);

    const totalAccounts = accounts.length;
    const activeAccounts = accounts.filter((a) => a.status === 'Active').length;
    const totalBalance = accounts
      .filter((a) => a.status === 'Active')
      .reduce((sum, a) => sum + (a.balance || 0), 0);

    let totalDepositsAmount = 0;
    let totalDepositsCount = 0;
    let totalWithdrawalsAmount = 0;
    let totalWithdrawalsCount = 0;
    let mandatoryTotal = 0;
    let voluntaryTotal = 0;

    ledgerEntries.forEach((entry) => {
      if (entry.type === 'Deposit') {
        totalDepositsAmount += entry.amount;
        totalDepositsCount += 1;
        if (entry.savingsType === 'Mandatory') mandatoryTotal += entry.amount;
        if (entry.savingsType === 'Voluntary') voluntaryTotal += entry.amount;
      } else if (entry.type === 'Withdrawal') {
        totalWithdrawalsAmount += entry.amount;
        totalWithdrawalsCount += 1;
      }
    });

    res.json({
      success: true,
      data: {
        totalAccounts,
        activeAccounts,
        totalBalance,
        totalDepositsAmount,
        totalDepositsCount,
        totalWithdrawalsAmount,
        totalWithdrawalsCount,
        mandatoryTotal,
        voluntaryTotal,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to compute savings stats', error: error.message });
  }
};

const getMemberSavings = async (req, res) => {
  try {
    const { memberId } = req.params;
    let query = {};

    if (isValidObjectId(memberId)) {
      query = { member: memberId };
    } else {
      const member = await Member.findOne({ memberId: memberId.toUpperCase() });
      if (!member) {
        return res.status(404).json({ success: false, message: 'Member not found' });
      }
      query = { member: member._id };
    }

    const account = await SavingsAccount.findOne(query).populate('member', 'memberId fullName phone address');
    if (!account) {
      return res.status(404).json({ success: false, message: 'No savings account found for this member' });
    }

    const ledger = await SavingsLedger.find({ account: account._id }).sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      data: {
        account,
        ledger,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch member savings', error: error.message });
  }
};

module.exports = {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccountStatus,
  logTransaction,
  getLedger,
  getSavingsStats,
  getMemberSavings,
};
