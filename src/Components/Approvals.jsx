import React, { useMemo, useState, useEffect, useContext, useCallback } from 'react';
import {
  FiCheck,
  FiX,
  FiSearch,
  FiFilter,
  FiChevronRight,
  FiClock,
  FiFile,
  FiUser,
  FiCalendar,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiDownload,
  FiEye,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight as FiChevronRightIcon,
  FiChevronsLeft,
  FiChevronsRight
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Approvals.css';
import { getFullUrl } from '../utils/urlHelper';
import { AuthContext } from '../context/AuthContext';
import { approvalAPI } from '../services/api';

const Approvals = () => {
  const { user } = useContext(AuthContext);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selected, setSelected] = useState([]);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    sortField: 'createdAt',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchApprovals = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);

      const params = {
        status: activeTab === 'All' ? undefined : activeTab,
        search: searchQuery || undefined,
        type: typeFilter === 'All' ? undefined : typeFilter,
        priority: priorityFilter === 'All' ? undefined : priorityFilter,
        page: pagination.page,
        limit: pagination.limit,
        sortBy: pagination.sortField,
        order: pagination.sortOrder,
        assignedTo: user?.id // Only fetch approvals assigned to the current user
      };

      const response = await approvalAPI.getAll(params);

      // Check for valid response structure
      // Some APIs return { success: true, data: { items: [], total: 0 } }
      // Others might return { items: [], total: 0 } directly or arrays
      let items = [];
      let total = 0;
      let totalPages = 1;

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          items = response.data;
          total = items.length;
        } else if (response.data.items) {
          items = response.data.items;
          total = response.data.total || 0;
          totalPages = response.data.totalPages || 1;
        } else if (response.data.data) { // Handle { success: true, data: [...] } generic wrapper
          if (Array.isArray(response.data.data)) {
            items = response.data.data;
            total = items.length;
          } else if (response.data.data.items) {
            items = response.data.data.items;
            total = response.data.data.total;
            totalPages = response.data.data.totalPages;
          }
        }
      }

      setApprovals(items || []);
      setPagination(prev => ({
        ...prev,
        total: total || 0,
        totalPages: totalPages || 1
      }));

    } catch (err) {
      console.error('Error fetching approvals:', err);
      // Only show error if it's not a cancellation or expected interference
      const errorMessage = 'Failed to load approvals.';
      if (err.response && err.response.status !== 304) {
        setError(errorMessage);
        toast.error(errorMessage);
      }
      setApprovals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, searchQuery, typeFilter, priorityFilter, pagination.page, pagination.limit, pagination.sortField, pagination.sortOrder, user?.id, refreshing]);

  // Effect to fetch approvals when dependencies change
  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const handleApprove = async (id, notes = '') => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const approvalData = {
        approvedBy: user.id,
        approvedAt: new Date().toISOString(),
        notes: notes || `Approved by ${user.name || user.email}`,
        status: 'Approved'
      };

      // Optimistic update
      setApprovals(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, status: 'Approved', ...approvalData }
            : item
        )
      );

      // Remove from selected
      setSelected(prev => prev.filter(itemId => itemId !== id));

      // Make API call
      await approvalAPI.approve(id, approvalData);

      toast.success('Approval completed successfully');

      // Refresh the list if we're running low on items
      if (approvals.length <= 2) {
        fetchApprovals();
      }

      return true;
    } catch (error) {
      console.error('Error approving:', error);

      // Revert optimistic update on error
      fetchApprovals();

      const errorMessage = error.response?.data?.message ||
        error.message ||
        'Failed to approve. Please try again.';

      toast.error(errorMessage);
      return false;
    }
  };

  const handleReject = async (id, reason = '') => {
    if (!reason) {
      const userReason = window.prompt('Please provide a reason for rejection:');
      if (!userReason || !userReason.trim()) {
        toast.warning('Rejection reason is required');
        return false;
      }
      reason = userReason;
    }

    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const rejectionData = {
        rejectedBy: user.id,
        rejectedAt: new Date().toISOString(),
        reason,
        status: 'Rejected'
      };

      // Optimistic update
      setApprovals(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, status: 'Rejected', ...rejectionData }
            : item
        )
      );

      // Remove from selected
      setSelected(prev => prev.filter(itemId => itemId !== id));

      // Make API call
      await approvalAPI.reject(id, rejectionData);

      toast.success('Rejection completed successfully');

      // Refresh the list if we're running low on items
      if (approvals.length <= 2) {
        fetchApprovals();
      }

      return true;
    } catch (error) {
      console.error('Error rejecting:', error);

      // Revert optimistic update on error
      fetchApprovals();

      const errorMessage = error.response?.data?.message ||
        error.message ||
        'Failed to reject. Please try again.';

      toast.error(errorMessage);
      return false;
    }
  };

  const refreshApprovals = useCallback(() => {
    setRefreshing(true);
    setPagination(prev => ({ ...prev, page: 1 }));
    // fetchApprovals will be called by the effect
  }, []);

  const handleSearch = useCallback((e) => {
    e?.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    // fetchApprovals will be called by the effect
  }, []);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  }, [pagination.totalPages]);

  const handleSort = useCallback((field) => {
    setPagination(prev => ({
      ...prev,
      sortField: field,
      sortOrder: prev.sortField === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1 // Reset to first page when sorting
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setTypeFilter('All');
    setPriorityFilter('All');
    setPagination(prev => ({
      ...prev,
      page: 1,
      sortField: 'createdAt',
      sortOrder: 'desc'
    }));
  }, []);

  // Calculate counts for tabs
  const counts = useMemo(() => {
    return approvals.reduce((acc, it) => {
      if (it.status) {
        acc[it.status] = (acc[it.status] || 0) + 1;
      }
      return acc;
    }, { Pending: 0, Approved: 0, Rejected: 0 });
  }, [approvals]);

  // Get unique priorities and types for filters
  const filterOptions = useMemo(() => {
    const priorities = new Set();
    const types = new Set();

    approvals.forEach(item => {
      if (item.priority) priorities.add(item.priority);
      if (item.type) types.add(item.type);
    });

    return {
      priorities: ['All', ...Array.from(priorities).sort()],
      types: ['All', ...Array.from(types).sort()]
    };
  }, [approvals]);

  // Filter and sort approvals
  const filteredApprovals = useMemo(() => {
    return [...approvals]
      .filter(approval => {
        if (!approval) return false;

        // Search across all string fields
        const matchesSearch = !searchQuery ||
          Object.entries(approval).some(([key, value]) => {
            if (typeof value === 'string') {
              return value.toLowerCase().includes(searchQuery.toLowerCase());
            } else if (typeof value === 'number') {
              return value.toString().includes(searchQuery);
            }
            return false;
          });

        // Filter by type
        const matchesType = typeFilter === 'All' || approval.type === typeFilter;

        // Filter by priority
        const matchesPriority = priorityFilter === 'All' || approval.priority === priorityFilter;

        // Filter by status
        const matchesStatus = activeTab === 'All' || approval.status === activeTab;

        return matchesSearch && matchesType && matchesPriority && matchesStatus;
      })
      .sort((a, b) => {
        // Handle sorting
        const { sortField, sortOrder } = pagination;
        if (!sortField) return 0;

        let aValue = a[sortField];
        let bValue = b[sortField];

        // Handle date fields
        if (sortField.includes('Date') || sortField.includes('At')) {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        // Handle string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle number comparison
        return sortOrder === 'asc'
          ? (aValue || 0) - (bValue || 0)
          : (bValue || 0) - (aValue || 0);
      });
  }, [approvals, searchQuery, typeFilter, priorityFilter, activeTab, pagination.sortField, pagination.sortOrder]);

  // Move 'selected' logic callbacks UP before any early returns
  const toggleSelect = useCallback((id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    const currentPageItems = filteredApprovals
      .slice(
        (pagination.page - 1) * pagination.limit,
        pagination.page * pagination.limit
      )
      .map(item => item.id);

    // If all current page items are selected, deselect all
    if (currentPageItems.every(id => selected.includes(id))) {
      setSelected(prev => prev.filter(id => !currentPageItems.includes(id)));
    } else {
      // Otherwise select all current page items
      setSelected(prev => [...new Set([...prev, ...currentPageItems])]);
    }
  }, [filteredApprovals, pagination.page, pagination.limit, selected]);

  const quickApprove = useCallback(async (id) => {
    const confirmed = window.confirm('Are you sure you want to approve this item?');
    if (confirmed) {
      await handleApprove(id, 'Approved via quick action');
    }
  }, [handleApprove]);

  const quickReject = useCallback(async (id) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (reason && reason.trim()) {
      await handleReject(id, reason);
    } else if (reason !== null) {
      toast.warning('Rejection reason cannot be empty');
    }
  }, [handleReject]);

  const batchUpdateStatus = useCallback(async (status) => {
    if (!selected.length) {
      toast.warning('Please select at least one approval');
      return;
    }

    const action = status.toLowerCase();
    const confirmMessage = `Are you sure you want to ${action} ${selected.length} selected item(s)?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);

      const results = await Promise.allSettled(
        selected.map(id =>
          status === 'Approved'
            ? handleApprove(id, `Batch approved by ${user?.name || user?.email || 'Admin'} on ${new Date().toLocaleString()}`)
            : handleReject(id, `Batch rejected by ${user?.name || user?.email || 'Admin'} on ${new Date().toLocaleString()}`)
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
      const failed = results.length - successful;

      if (successful > 0) {
        toast.success(`Successfully processed ${successful} item(s)`);
      }

      if (failed > 0) {
        toast.error(`Failed to process ${failed} item(s)`);
      }

      // Refresh the list
      fetchApprovals();

    } catch (error) {
      console.error(`Error ${action}ing items:`, error);
      toast.error(`Error ${action}ing items. Please try again.`);
    } finally {
      setLoading(false);
      setSelected([]);
    }
  }, [selected, user, handleApprove, handleReject, fetchApprovals]);

  // View helpers
  const renderStatusBadge = (status) => {
    const statusMap = {
      'Pending': <FiClock />,
      'Approved': <FiCheckCircle />,
      'Rejected': <FiXCircle />
    };

    const icon = statusMap[status] || <FiInfo />;

    return (
      <span className={`status-badge ${status.toLowerCase()}`}>
        {icon}
        <span>{status}</span>
      </span>
    );
  };

  const renderPriorityBadge = (priority) => {
    const priorityMap = {
      'High': 'danger',
      'Medium': 'warning',
      'Low': 'info'
    };

    const priorityClass = priorityMap[priority] || 'default';

    return (
      <span className={`priority-badge ${priorityClass}`}>
        {priority || 'N/A'}
      </span>
    );
  };

  // Calculate pagination helpers after hooks but before conditional returns
  const totalPages = Math.ceil(filteredApprovals.length / pagination.limit);
  const startIdx = (pagination.page - 1) * pagination.limit;
  const paginatedItems = filteredApprovals.slice(startIdx, startIdx + pagination.limit);
  const totalCount = filteredApprovals.length;

  // IMPORTANT: NOW we can do conditional rendering safely

  if (loading && !refreshing) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>Loading approvals...</p>
      </div>
    );
  }

  // Render empty state
  if (!loading && approvals.length === 0) {
    return (
      <div className="empty-state">
        <FiInfo className="empty-icon" />
        <h3>No approvals found</h3>
        <p>There are no pending approvals at the moment.</p>
        <button
          className="btn primary"
          onClick={refreshApprovals}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    );
  }

  // Render error state
  if (error && !refreshing) {
    return (
      <div className="error-state">
        <FiAlertCircle className="error-icon" />
        <h3>Error loading approvals</h3>
        <p>{error}</p>
        <button
          className="btn primary"
          onClick={refreshApprovals}
          disabled={refreshing}
        >
          {refreshing ? 'Retrying...' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className="approvals">

      <div className="approvals-header">
        <div className="header-left">
          <h1 className="title">Approvals</h1>
          <div className="meta">
            <span className="badge" onClick={() => setActiveTab('Pending')}>
              <FiClock /> Pending {counts.Pending || 0}
            </span>
            <span className="badge success" onClick={() => setActiveTab('Approved')}>
              <FiCheckCircle /> Approved {counts.Approved || 0}
            </span>
            <span className="badge danger" onClick={() => setActiveTab('Rejected')}>
              <FiXCircle /> Rejected {counts.Rejected || 0}
            </span>
            <button
              className="btn icon"
              onClick={refreshApprovals}
              disabled={refreshing}
              title="Refresh"
            >
              <FiRefreshCw className={refreshing ? 'spinning' : ''} />
            </button>
          </div>
        </div>

        <div className="header-actions">
          <button
            className={`btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          <button
            className="btn secondary"
            onClick={resetFilters}
            disabled={!searchQuery && typeFilter === 'All' && priorityFilter === 'All'}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['Pending', 'Approved', 'Rejected', 'All'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
          >
            {tab} {tab !== 'All' && `(${counts[tab] || 0})`}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className={`filters-container ${showFilters ? 'expanded' : ''}`}>
        <form onSubmit={handleSearch} className="search-form">
          <div className="search">
            <FiSearch className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onBlur={handleSearch}
              placeholder="Search by title, ID, requester..."
              className="search-input"
              aria-label="Search approvals"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search"
                onClick={() => {
                  setSearchQuery('');
                  handleSearch();
                }}
                aria-label="Clear search"
              >
                <FiX />
              </button>
            )}
          </div>

          <div className="filter-options">
            <div className="filter-group">
              <label htmlFor="type-filter">Type</label>
              <select
                id="type-filter"
                value={typeFilter}
                onChange={e => {
                  setTypeFilter(e.target.value);
                  handleSearch();
                }}
                className="filter-select"
              >
                <option value="All">All Types</option>
                {filterOptions.types
                  .filter(type => type !== 'All')
                  .map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="priority-filter">Priority</label>
              <select
                id="priority-filter"
                value={priorityFilter}
                onChange={e => {
                  setPriorityFilter(e.target.value);
                  handleSearch();
                }}
                className="filter-select"
              >
                <option value="All">All Priorities</option>
                {filterOptions.priorities
                  .filter(priority => priority !== 'All')
                  .map(priority => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="filter-group">
              <label>Results per page</label>
              <select
                value={pagination.limit}
                onChange={e => {
                  setPagination(prev => ({
                    ...prev,
                    limit: parseInt(e.target.value, 10),
                    page: 1 // Reset to first page
                  }));
                }}
                className="filter-select"
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="bulk-actions-bar">
          <div className="selected-count">
            <input
              type="checkbox"
              checked={selected.length > 0}
              onChange={selectAll}
              aria-label="Select all items"
            />
            <span>{selected.length} item{selected.length !== 1 ? 's' : ''} selected</span>
          </div>

          <div className="bulk-buttons">
            <button
              className="btn success"
              onClick={() => batchUpdateStatus('Approved')}
              disabled={loading}
              title="Approve selected items"
            >
              <FiCheckCircle /> Approve Selected
            </button>

            <button
              className="btn danger"
              onClick={() => batchUpdateStatus('Rejected')}
              disabled={loading}
              title="Reject selected items"
            >
              <FiXCircle /> Reject Selected
            </button>

            <button
              className="btn icon"
              onClick={() => setSelected([])}
              title="Clear selection"
            >
              <FiX />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="list-container">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Loading approvals...</p>
          </div>
        )}

        <div className="list">
          <div className="list-head">
            <div className="cell w-5">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={selected.length > 0 &&
                    paginatedItems.every(item => selected.includes(item.id))}
                  onChange={selectAll}
                  aria-label={selected.length ? 'Deselect all' : 'Select all'}
                />
                <span></span>
              </label>
            </div>

            <div
              className={`cell w-30 sortable ${pagination.sortField === 'title' ? 'sorted' : ''}`}
              onClick={() => handleSort('title')}
            >
              Item
              {pagination.sortField === 'title' && (
                <span className="sort-indicator">
                  {pagination.sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>

            <div
              className={`cell w-20 sortable ${pagination.sortField === 'project' ? 'sorted' : ''}`}
              onClick={() => handleSort('project')}
            >
              Project
              {pagination.sortField === 'project' && (
                <span className="sort-indicator">
                  {pagination.sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>

            <div
              className={`cell w-15 sortable ${pagination.sortField === 'priority' ? 'sorted' : ''}`}
              onClick={() => handleSort('priority')}
            >
              Priority
              {pagination.sortField === 'priority' && (
                <span className="sort-indicator">
                  {pagination.sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>

            <div
              className={`cell w-15 sortable ${pagination.sortField === 'requestedBy' ? 'sorted' : ''}`}
              onClick={() => handleSort('requestedBy')}
            >
              Requested By
              {pagination.sortField === 'requestedBy' && (
                <span className="sort-indicator">
                  {pagination.sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>

            <div
              className={`cell w-15 sortable ${pagination.sortField === 'createdAt' ? 'sorted' : ''}`}
              onClick={() => handleSort('createdAt')}
            >
              Requested On
              {pagination.sortField === 'createdAt' && (
                <span className="sort-indicator">
                  {pagination.sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>

            <div className="cell w-15 right">Status</div>
            <div className="cell w-15 right">Actions</div>
          </div>

          <div className="list-body">
            {paginatedItems.length > 0 ? (
              paginatedItems.map(item => (
                <div key={item.id} className={`row ${item.status.toLowerCase()}`}>
                  <div className="cell w-5">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={selected.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        disabled={item.status !== 'Pending' && activeTab === 'Pending'}
                        aria-label={`Select ${item.title}`}
                      />
                      <span></span>
                    </label>
                  </div>

                  <div className="cell w-30">
                    <div className="item-meta">
                      <div className="item-title">
                        <FiFile className="item-icon" />
                        <span className="text-ellipsis">{item.title || 'Untitled'}</span>
                        <span className={`pill ${(item.type || '').replace(/\s/g, '').toLowerCase()}`}>
                          {item.type || 'N/A'}
                        </span>
                      </div>
                      <div className="item-sub">
                        <span className="item-id">#{item.id}</span>
                        {item.requester && (
                          <>
                            <span className="separator">•</span>
                            <span className="requester">
                              <FiUser className="icon" /> {item.requester}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="cell w-20">
                    <div className="project-cell">
                      <span className="text-ellipsis" title={item.project?.name || item.project || 'N/A'}>
                        {item.project?.name || item.project || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="cell w-15">
                    {renderPriorityBadge(item.priority)}
                  </div>

                  <div className="cell w-15">
                    <div className="requester-info">
                      <div className="requester-avatar">
                        {(() => {
                          const name = item.requestedBy?.name || item.requestedBy || 'NA';
                          return typeof name === 'string'
                            ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                            : 'NA';
                        })()}
                      </div>
                      <span className="requester-name text-ellipsis" title={item.requestedBy?.name || item.requestedBy || 'N/A'}>
                        {item.requestedBy?.name || item.requestedBy || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="cell w-15">
                    <div className="date-cell">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </div>

                  <div className="cell w-15 right">
                    {renderStatusBadge(item.status)}
                  </div>

                  <div className="cell w-15 right actions">
                    <div className="action-buttons">
                      {item.status === 'Pending' ? (
                        <>
                          <button
                            className="btn-icon success"
                            onClick={() => quickApprove(item.id)}
                            disabled={loading}
                            title="Approve"
                            aria-label={`Approve ${item.title}`}
                          >
                            <FiCheck />
                          </button>
                          <button
                            className="btn-icon danger"
                            onClick={() => quickReject(item.id)}
                            disabled={loading}
                            title="Reject"
                            aria-label={`Reject ${item.title}`}
                          >
                            <FiX />
                          </button>
                        </>
                      ) : (
                        <span className="status-message">
                          {item.status} by {item[`${item.status.toLowerCase()}By`] || 'System'}
                        </span>
                      )}

                      <button
                        className="btn-icon primary"
                        onClick={() => setDetail(item)}
                        title="View Details"
                        aria-label={`View details for ${item.title}`}
                      >
                        <FiEye />
                      </button>

                      {item.attachmentUrl && (
                        <a
                          href={item.attachmentUrl}
                          className="btn-icon"
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Download Attachment"
                          aria-label="Download attachment"
                        >
                          <FiDownload />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <FiInfo className="empty-icon" />
                <h3>No approvals found</h3>
                <p>
                  {activeTab !== 'All'
                    ? `There are no ${activeTab.toLowerCase()} approvals matching your criteria.`
                    : 'No approvals found with the current filters.'}
                </p>
                <button
                  className="btn primary"
                  onClick={resetFilters}
                  disabled={!searchQuery && typeFilter === 'All' && priorityFilter === 'All'}
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing {Math.min(startIdx + 1, totalCount)}-{Math.min(startIdx + pagination.limit, totalCount)} of {totalCount}
              </div>

              <div className="pagination-controls">
                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page === 1}
                  aria-label="First page"
                >
                  <FiChevronsLeft />
                </button>

                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  aria-label="Previous page"
                >
                  <FiChevronLeft />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Calculate page numbers to show (current page in the middle if possible)
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      className={`pagination-button ${pagination.page === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                      aria-label={`Page ${pageNum}`}
                      aria-current={pagination.page === pageNum ? 'page' : undefined}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= totalPages}
                  aria-label="Next page"
                >
                  <FiChevronRight />
                </button>

                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={pagination.page >= totalPages}
                  aria-label="Last page"
                >
                  <FiChevronsRight />
                </button>
              </div>

              <div className="pagination-size">
                <span>Show:</span>
                <select
                  value={pagination.limit}
                  onChange={e => {
                    setPagination(prev => ({
                      ...prev,
                      limit: parseInt(e.target.value, 10),
                      page: 1 // Reset to first page
                    }));
                  }}
                  aria-label="Items per page"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail View Modal */}
      {detail && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDetail(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Approval Details</h3>
              <button
                className="close"
                onClick={() => setDetail(null)}
                aria-label="Close modal"
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <div className="detail-row">
                    <div className="detail-label">Title</div>
                    <div className="detail-value">{detail.title || 'N/A'}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Status</div>
                    <div className="detail-value">
                      {renderStatusBadge(detail.status || 'Pending')}
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Type</div>
                    <div className="detail-value">{detail.type || 'N/A'}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Project</div>
                    <div className="detail-value">{detail.project?.name || detail.project || 'N/A'}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Priority</div>
                    <div className="detail-value">
                      {renderPriorityBadge(detail.priority || 'Medium')}
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Request Details</h4>
                  <div className="detail-row">
                    <div className="detail-label">Requested By</div>
                    <div className="detail-value">{detail.requestedBy?.name || detail.requestedBy || 'N/A'}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Assigned To</div>
                    <div className="detail-value">{detail.assignedTo?.name || detail.assignedTo || 'N/A'}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-label">Requested On</div>
                    <div className="detail-value">
                      {detail.createdAt
                        ? new Date(detail.createdAt).toLocaleString()
                        : 'N/A'}
                    </div>
                  </div>
                  {detail.updatedAt && (
                    <div className="detail-row">
                      <div className="detail-label">Last Updated</div>
                      <div className="detail-value">
                        {new Date(detail.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {detail.dueDate && (
                    <div className="detail-row">
                      <div className="detail-label">Due Date</div>
                      <div className="detail-value">
                        {new Date(detail.dueDate).toLocaleDateString()}
                        {new Date(detail.dueDate) < new Date() && (
                          <span className="overdue"> (Overdue)</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {detail.description && (
                  <div className="detail-section full-width">
                    <h4>Description</h4>
                    <div className="detail-description">
                      {detail.description.split('\n').map((para, i) => (
                        <p key={i}>{para || <br />}</p>
                      ))}
                    </div>
                  </div>
                )}

                {(detail.notes || detail.reason) && (
                  <div className="detail-section full-width">
                    <h4>{detail.status === 'Approved' ? 'Approval Notes' : 'Rejection Reason'}</h4>
                    <div className="detail-notes">
                      {detail.notes || detail.reason || 'N/A'}
                    </div>
                    {detail.approvedBy && (
                      <div className="detail-meta">
                        Approved by {detail.approvedBy} on {detail.approvedAt ? new Date(detail.approvedAt).toLocaleString() : 'N/A'}
                      </div>
                    )}
                    {detail.rejectedBy && (
                      <div className="detail-meta">
                        Rejected by {detail.rejectedBy} on {detail.rejectedAt ? new Date(detail.rejectedAt).toLocaleString() : 'N/A'}
                      </div>
                    )}
                  </div>
                )}

                {detail.attachmentUrl && (
                  <div className="detail-section full-width">
                    <h4>Attachments</h4>
                    <div className="attachments">
                      <a
                        href={getFullUrl(detail.attachmentUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="attachment"
                      >
                        <FiFile className="attachment-icon" />
                        <span className="attachment-name">
                          {detail.attachmentUrl.split('/').pop() || 'Download'}
                        </span>
                        <FiDownload className="download-icon" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              {detail.status === 'Pending' && (
                <>
                  <button
                    className="btn success"
                    onClick={() => {
                      const notes = prompt('Enter approval notes (optional):');
                      if (notes !== null) {
                        handleApprove(detail.id, notes || 'Approved via details view');
                        setDetail(null);
                      }
                    }}
                    disabled={loading}
                  >
                    <FiCheck /> Approve
                  </button>
                  <button
                    className="btn danger"
                    onClick={() => {
                      const reason = prompt('Please provide a reason for rejection:');
                      if (reason && reason.trim()) {
                        handleReject(detail.id, reason);
                        setDetail(null);
                      } else if (reason !== null) {
                        toast.warning('Rejection reason cannot be empty');
                      }
                    }}
                    disabled={loading}
                  >
                    <FiX /> Reject
                  </button>
                </>
              )}

              <div className="spacer"></div>

              <button
                className="btn secondary"
                onClick={() => setDetail(null)}
                disabled={loading}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Approvals);
