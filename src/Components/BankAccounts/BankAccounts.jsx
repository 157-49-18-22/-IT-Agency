import React, { useState } from 'react';
import { FiPlus, FiChevronDown, FiChevronUp, FiEdit2, FiTrash2, FiCreditCard, FiDollarSign, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import './BankAccounts.css';

const BankAccounts = () => {
  const [expandedAccount, setExpandedAccount] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      bankName: 'Chase Bank',
      accountNumber: '****4532',
      accountType: 'Checking',
      routingNumber: '*****1234',
      isPrimary: true,
      verified: true,
      balance: 12500.75
    },
    {
      id: 2,
      bankName: 'Bank of America',
      accountNumber: '****7890',
      accountType: 'Savings',
      routingNumber: '*****5678',
      isPrimary: false,
      verified: true,
      balance: 8750.25
    }
  ]);

  const toggleAccount = (id) => {
    setExpandedAccount(expandedAccount === id ? null : id);
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };

  const handleMakePrimary = (id) => {
    setAccounts(accounts.map(account => ({
      ...account,
      isPrimary: account.id === id
    })));
  };

  const handleRemoveAccount = (id) => {
    if (window.confirm('Are you sure you want to remove this bank account?')) {
      setAccounts(accounts.filter(account => account.id !== id));
    }
  };

  return (
    <div className="bank-accounts">
      <div className="bank-accounts-header">
        <h2>Bank Accounts</h2>
        <button className="btn btn-primary" onClick={toggleAddForm}>
          <FiPlus size={18} /> Add Bank Account
        </button>
      </div>

      {showAddForm && (
        <div className="add-account-form">
          <h3>Add New Bank Account</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Bank Name</label>
              <input type="text" placeholder="e.g. Chase, Bank of America" />
            </div>
            <div className="form-group">
              <label>Account Number</label>
              <input type="text" placeholder="Enter account number" />
            </div>
            <div className="form-group">
              <label>Routing Number</label>
              <input type="text" placeholder="Enter routing number" />
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <select>
                <option value="">Select account type</option>
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </select>
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={toggleAddForm}>
                Cancel
              </button>
              <button className="btn btn-primary">
                Save Account
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="accounts-list">
        {accounts.length === 0 ? (
          <div className="empty-state">
            <FiCreditCard size={48} className="empty-icon" />
            <h3>No Bank Accounts</h3>
            <p>You haven't added any bank accounts yet. Click the button above to get started.</p>
          </div>
        ) : (
          accounts.map(account => (
            <div key={account.id} className={`account-card ${expandedAccount === account.id ? 'expanded' : ''}`}>
              <div className="account-summary" onClick={() => toggleAccount(account.id)}>
                <div className="account-info">
                  <div className="account-icon">
                    <FiCreditCard size={24} />
                  </div>
                  <div>
                    <h4>{account.bankName}</h4>
                    <p className="account-number">{account.accountNumber} • {account.accountType}</p>
                  </div>
                </div>
                <div className="account-balance">
                  <span className="balance-label">Available Balance</span>
                  <span className="balance-amount">${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="account-status">
                  {account.isPrimary && <span className="badge primary">Primary</span>}
                  {account.verified ? (
                    <span className="badge success">Verified</span>
                  ) : (
                    <span className="badge warning">Pending Verification</span>
                  )}
                </div>
                <div className="account-toggle">
                  {expandedAccount === account.id ? <FiChevronUp /> : <FiChevronDown />}
                </div>
              </div>
              
              {expandedAccount === account.id && (
                <div className="account-details">
                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-label">Account Type</span>
                      <span className="detail-value">{account.accountType}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Routing Number</span>
                      <span className="detail-value">{account.routingNumber}</span>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-item">
                      <span className="detail-label">Account Number</span>
                      <span className="detail-value">{account.accountNumber}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Status</span>
                      <span className={`status ${account.verified ? 'verified' : 'pending'}`}>
                        {account.verified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </div>
                  </div>
                  <div className="account-actions">
                    {!account.isPrimary && (
                      <button 
                        className="btn btn-secondary"
                        onClick={() => handleMakePrimary(account.id)}
                      >
                        Make Primary
                      </button>
                    )}
                    <button className="btn btn-icon">
                      <FiEdit2 /> Edit
                    </button>
                    <button 
                      className="btn btn-icon danger"
                      onClick={() => handleRemoveAccount(account.id)}
                    >
                      <FiTrash2 /> Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BankAccounts;
