import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiFilter, FiCheck, FiX, FiClock, FiAlertTriangle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { uatAPI } from '../../../services/api';
import { toast } from 'react-toastify';
import './UATList.css';

const UATList = () => {
  const [uats, setUATs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUATs();
  }, []);

  const fetchUATs = async () => {
    try {
      const response = await uatAPI.getAll();
      setUATs(response.data);
    } catch (error) {
      console.error('Error fetching UATs:', error);
      toast.error('Failed to fetch UATs');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e, id, newStatus) => {
    e.stopPropagation();
    try {
      // Optimistic update
      setUATs(prev => prev.map(uat =>
        uat.id === id ? { ...uat, status: newStatus } : uat
      ));

      await uatAPI.updateStatus(id, newStatus);
      toast.success(`UAT marked as ${newStatus}`);
      fetchUATs(); // Refresh to ensure consistency
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      fetchUATs(); // Revert on error
    }
  };

  const filteredUATs = uats.filter(uat => {
    const matchesSearch = uat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uat.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || uat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800', // Forward compatibility
      failed: 'bg-red-100 text-red-800' // Forward compatibility
    };

    const statusText = {
      pending: 'Pending',
      in_progress: 'In Progress',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed',
      failed: 'Failed'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100'}`}>
        {statusText[status] || status}
      </span>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading UATs...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Acceptance Testing</h1>
        <button
          onClick={() => navigate('/testing/uat/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FiPlus className="mr-2" /> New UAT
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search UATs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <FiFilter className="text-gray-400 mr-2" />
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tester</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUATs.length > 0 ? (
                filteredUATs.map((uat) => (
                  <tr
                    key={uat.id}
                    className={`hover:bg-gray-50 cursor-pointer ${uat.status === 'approved' ? 'border-l-4 border-l-green-600' : ''}`}
                    onClick={() => navigate(`/testing/uat/${uat.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{uat.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{uat.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(uat.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {uat.priority.charAt(0).toUpperCase() + uat.priority.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {uat.tester || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2 items-center">
                        <button
                          className={`btn-icon-action pass ${uat.status === 'approved' ? 'active' : ''}`}
                          title="Approve UAT"
                          onClick={(e) => handleStatusUpdate(e, uat.id, 'approved')}
                        >
                          <FiCheckCircle size={20} />
                        </button>
                        <button
                          className={`btn-icon-action fail ${uat.status === 'rejected' ? 'active' : ''}`}
                          title="Reject UAT"
                          onClick={(e) => handleStatusUpdate(e, uat.id, 'rejected')}
                        >
                          <FiXCircle size={20} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/testing/uat/${uat.id}/edit`);
                          }}
                          className="text-blue-600 hover:text-blue-900 ml-2"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No UAT test cases found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UATList;
