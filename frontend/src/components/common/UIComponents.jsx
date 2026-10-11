import React from 'react';

export const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="spinner-container">
    <div className="spinner"></div>
    <span className="spinner-text">{message}</span>
  </div>
);

export const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;
  const icons = {
    success: '✓',
    error: '⚠',
    warning: '!',
    info: 'ℹ',
  };

  return (
    <div className={`alert alert-${type}`}>
      <span className="alert-icon">{icons[type] || 'ℹ'}</span>
      <div style={{ flex: 1 }}>{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export const EmptyState = ({ icon = '📁', title = 'No data found', description = 'Try adjusting your search or add a new record.' }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

export const Modal = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};
