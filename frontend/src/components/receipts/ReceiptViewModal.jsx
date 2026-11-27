import React from 'react';

const ReceiptViewModal = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div id="printable-receipt" className="receipt-voucher">
        <div className="receipt-header">
          <div className="receipt-org-title">NGO FINANCIAL MANAGEMENT SYSTEM</div>
          <div className="receipt-org-sub">Field Operations & Microfinance Service</div>
          <div className="receipt-badge">MONEY COLLECTION RECEIPT</div>
        </div>

        <div className="receipt-meta-row">
          <div>
            <span className="receipt-label">Receipt No: </span>
            <strong className="receipt-number">{receipt.receiptNumber}</strong>
          </div>
          <div>
            <span className="receipt-label">Date & Time: </span>
            <strong>{formatDate(receipt.collectionDate || receipt.createdAt)}</strong>
          </div>
        </div>

        <div className="receipt-divider"></div>

        <div className="receipt-grid">
          <div className="receipt-col">
            <div className="receipt-section-title">Member Information</div>
            <div className="receipt-row">
              <span className="receipt-label">Full Name:</span>
              <strong>{receipt.member?.fullName || 'N/A'}</strong>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Member ID:</span>
              <span>{receipt.member?.memberId || 'N/A'}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Phone:</span>
              <span>{receipt.member?.phone || 'N/A'}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Address:</span>
              <span>{receipt.member?.address || 'N/A'}</span>
            </div>
          </div>

          <div className="receipt-col">
            <div className="receipt-section-title">Payment Details</div>
            <div className="receipt-row">
              <span className="receipt-label">Collection Type:</span>
              <strong>{receipt.collectionType}</strong>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Payment Method:</span>
              <span>{receipt.paymentMethod}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Collected By:</span>
              <span>{receipt.collectedBy || 'Field Officer'}</span>
            </div>
            {receipt.transactionReference && (
              <div className="receipt-row">
                <span className="receipt-label">Reference ID:</span>
                <span>{receipt.transactionReference}</span>
              </div>
            )}
          </div>
        </div>

        <div className="receipt-amount-box">
          <div className="receipt-amount-label">Total Amount Collected</div>
          <div className="receipt-amount-val">৳ {Number(receipt.amount).toLocaleString()}</div>
        </div>

        {receipt.remarks && (
          <div className="receipt-remarks">
            <span className="receipt-label">Remarks: </span>
            <span>{receipt.remarks}</span>
          </div>
        )}

        <div className="receipt-footer-signatures">
          <div className="receipt-sig-block">
            <div className="receipt-sig-line"></div>
            <div>Member Signature</div>
          </div>
          <div className="receipt-sig-block">
            <div className="receipt-stamp">PAID & VERIFIED</div>
          </div>
          <div className="receipt-sig-block">
            <div className="receipt-sig-line"></div>
            <div>Officer / Cashier Signature</div>
          </div>
        </div>

        <div className="receipt-note">
          This is an official computer-generated digital receipt. Please preserve this receipt for your records.
        </div>
      </div>

      <div className="modal-actions no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
        <button type="button" className="btn btn-primary" onClick={handlePrint}>
          🖨️ Print / Download PDF
        </button>
      </div>
    </div>
  );
};

export default ReceiptViewModal;
