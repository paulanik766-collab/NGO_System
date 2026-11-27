const mongoose = require('mongoose');
const Receipt = require('../models/Receipt');
const Member = require('../models/Member');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getReceipts = async (req, res) => {
  try {
    const { search, collectionType, page = 1, limit = 50 } = req.query;
    const query = {};

    if (collectionType) {
      query.collectionType = collectionType;
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      const matchedMembers = await Member.find({
        $or: [{ fullName: searchRegex }, { memberId: searchRegex }, { phone: searchRegex }],
      }).select('_id');
      const memberIds = matchedMembers.map((m) => m._id);

      query.$or = [{ receiptNumber: searchRegex }, { member: { $in: memberIds } }, { collectedBy: searchRegex }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [receipts, total] = await Promise.all([
      Receipt.find(query)
        .populate('member', 'memberId fullName phone address')
        .sort({ collectionDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Receipt.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: receipts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch receipts', error: error.message });
  }
};

const getReceiptById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid receipt ID format' });
    }

    const receipt = await Receipt.findById(id).populate('member', 'memberId fullName phone address');
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    res.json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch receipt', error: error.message });
  }
};

const createReceipt = async (req, res) => {
  try {
    const {
      member,
      receiptNumber,
      collectionType,
      amount,
      paymentMethod,
      collectedBy,
      collectionDate,
      remarks,
      transactionReference,
    } = req.body;

    if (!member || !isValidObjectId(member)) {
      return res.status(400).json({ success: false, message: 'Valid member ID is required' });
    }

    const targetMember = await Member.findById(member);
    if (!targetMember) {
      return res.status(404).json({ success: false, message: 'Referenced member does not exist' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
    }

    let recNumber = receiptNumber?.trim()?.toUpperCase();
    if (!recNumber) {
      recNumber = `REC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const existingReceipt = await Receipt.findOne({ receiptNumber: recNumber });
    if (existingReceipt) {
      return res.status(409).json({ success: false, message: 'Receipt number already exists' });
    }

    const receipt = await Receipt.create({
      receiptNumber: recNumber,
      member,
      collectionType: collectionType || 'Savings Deposit',
      amount: parsedAmount,
      paymentMethod: paymentMethod || 'Cash',
      collectedBy: collectedBy || 'Field Officer',
      collectionDate: collectionDate ? new Date(collectionDate) : new Date(),
      remarks: remarks || '',
      transactionReference: transactionReference || '',
    });

    const populated = await Receipt.findById(receipt._id).populate('member', 'memberId fullName phone address');

    res.status(201).json({
      success: true,
      message: 'Receipt generated successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate receipt', error: error.message });
  }
};

const deleteReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid receipt ID format' });
    }

    const receipt = await Receipt.findByIdAndDelete(id);
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    res.json({
      success: true,
      message: 'Receipt deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete receipt', error: error.message });
  }
};

const getReceiptStats = async (req, res) => {
  try {
    const receipts = await Receipt.find().select('amount collectionType paymentMethod');
    const totalReceipts = receipts.length;
    const totalAmount = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
    const cashTotal = receipts.filter((r) => r.paymentMethod === 'Cash').reduce((sum, r) => sum + (r.amount || 0), 0);
    const digitalTotal = totalAmount - cashTotal;

    res.json({
      success: true,
      data: {
        totalReceipts,
        totalAmount,
        cashTotal,
        digitalTotal,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to compute receipt statistics', error: error.message });
  }
};

module.exports = {
  getReceipts,
  getReceiptById,
  createReceipt,
  deleteReceipt,
  getReceiptStats,
};
