import React, { useState, useEffect } from 'react';
import { receiptAPI } from '../services/api';
import ReceiptStats from '../components/receipts/ReceiptStats';
import ReceiptTable from '../components/receipts/ReceiptTable';
import ReceiptFormModal from '../components/receipts/ReceiptFormModal';
import ReceiptViewModal from '../components/receipts/ReceiptViewModal';
import { LoadingSpinner, Alert, EmptyState, Modal } from '../components/common/UIComponents';

const ReceiptsPage = () => {
  const [receipts, setReceipts] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const [search, setSearch] = useState('');
  const [collectionTypeFilter, setCollectionTypeFilter] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);

  const fetchReceipts = async () => {
    setIsLoading(true);
    try {
      const [receiptsRes, statsRes] = await Promise.all([
        receiptAPI.getAll({
          search: search.trim() || undefined,
          collectionType: collectionTypeFilter || undefined,
          limit: 100,
        }),
        receiptAPI.getStats().catch(() => ({ data: { data: {} } })),
      ]);

      setReceipts(receiptsRes.data.data || []);
      setStats(statsRes.data.data || null);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to fetch receipts.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [collectionTypeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReceipts();
  };

  const handleCreateReceipt = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await receiptAPI.create(formData);
      setAlert({ type: 'success', message: 'Digital receipt generated successfully!' });
      setShowCreateModal(false);
      await fetchReceipts();
      if (res.data.data) {
        setViewingReceipt(res.data.data);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to generate receipt.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReceipt = async (id) => {
    if (!window.confirm('Are you sure you want to delete this receipt?')) return;
    try {
      await receiptAPI.delete(id);
      setAlert({ type: 'success', message: 'Receipt deleted successfully.' });
      fetchReceipts();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete receipt.',
      });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Receipt Generation</h1>
          <p>Digital receipt builder that instantly generates printable/downloadable PDF payment receipts upon collection</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Generate Instant Receipt
        </button>
      </div>

      <div className="page-content">
        <Alert type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

        <ReceiptStats stats={stats} />

        <div className="card mb-4">
          <div className="card-body">
            <div className="toolbar">
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, gap: '8px' }}>
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by receipt number, member name or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-secondary">
                  Search
                </button>
                {search && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setSearch('');
                      setTimeout(fetchReceipts, 0);
                    }}
                  >
                    Clear
                  </button>
                )}
              </form>

              <select
                className="form-control"
                style={{ width: '200px' }}
                value={collectionTypeFilter}
                onChange={(e) => setCollectionTypeFilter(e.target.value)}
              >
                <option value="">All Collection Types</option>
                <option value="Savings Deposit">Savings Deposit</option>
                <option value="Loan Installment">Loan Installment</option>
                <option value="Membership Fee">Membership Fee</option>
                <option value="Other Collection">Other Collection</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Generated Payment Receipts ({receipts.length})</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {isLoading ? (
              <LoadingSpinner message="Loading receipts..." />
            ) : receipts.length === 0 ? (
              <EmptyState
                icon="🧾"
                title="No receipts found"
                description={
                  search || collectionTypeFilter
                    ? 'No receipts match the search criteria.'
                    : 'Click "Generate Instant Receipt" to create your first digital receipt upon collection.'
                }
              />
            ) : (
              <ReceiptTable
                receipts={receipts}
                onView={(r) => setViewingReceipt(r)}
                onDelete={handleDeleteReceipt}
              />
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showCreateModal}
        title="Generate Collection Receipt"
        onClose={() => setShowCreateModal(false)}
      >
        <ReceiptFormModal
          onSubmit={handleCreateReceipt}
          onCancel={() => setShowCreateModal(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={Boolean(viewingReceipt)}
        title="Official Payment Receipt Voucher"
        onClose={() => setViewingReceipt(null)}
      >
        <ReceiptViewModal
          receipt={viewingReceipt}
          onClose={() => setViewingReceipt(null)}
        />
      </Modal>
    </div>
  );
};

export default ReceiptsPage;
