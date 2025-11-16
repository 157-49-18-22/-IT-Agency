import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiArrowLeft, FiCheck, FiX, FiClock, FiAlertTriangle } from 'react-icons/fi';
import { uatAPI } from '../../../services/api';

const UATDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [uat, setUAT] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUAT();
  }, [id]);

  const fetchUAT = async () => {
    try {
      const response = await uatAPI.getById(id);
      setUAT(response.data);
    } catch (err) {
      console.error('Error fetching UAT:', err);
      setError('Failed to load UAT test case');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this UAT test case?')) {
      try {
        setIsDeleting(true);
        await uatAPI.delete(id);
        navigate('/testing/uat');
      } catch (err) {
        console.error('Error deleting UAT:', err);
        setError('Failed to delete UAT test case');
        setIsDeleting(false);
      }
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      await uatAPI.updateStatus(id, { status: newStatus });
      fetchUAT(); // Refresh the UAT data
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    
    const statusText = {
      pending: 'Pending',
      in_progress: 'In Progress',
      completed: 'Completed',
      failed: 'Failed'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClasses[status] || 'bg-gray-100'}`}>
        {statusText[status] || status}
      </span>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading UAT details...</div>;
  }

  if (!uat) {
    return <div className="text-center py-10">UAT test case not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/testing/uat')}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <FiArrowLeft className="mr-1" /> Back to List
        </button>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/testing/uat/${id}/edit`)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiEdit2 className="mr-1.5 h-4 w-4" /> Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            <FiTrash2 className="mr-1.5 h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">{uat.title}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Created on {new Date(uat.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(uat.status)}
            <div className="relative">
              <select
                value={uat.status}
                onChange={(e) => updateStatus(e.target.value)}
                className="block appearance-none bg-white border border-gray-300 text-gray-700 py-1 px-3 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                {uat.description || 'No description provided.'}
              </dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Test Steps</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {uat.steps && uat.steps.length > 0 ? (
                  <ol className="list-decimal pl-5 space-y-2">
                    {uat.steps.map((step, index) => (
                      <li key={index} className="py-1">
                        <div className="flex items-start">
                          <span className="mr-2">{step}</span>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-gray-500">No test steps defined.</p>
                )}
              </dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Details</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Priority</p>
                    <p className="mt-1 capitalize">{uat.priority}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Tester</p>
                    <p className="mt-1">{uat.tester || 'Not assigned'}</p>
                  </div>
                  {uat.projectId && (
                    <div>
                      <p className="text-xs font-medium text-gray-500">Project ID</p>
                      <p className="mt-1">{uat.projectId}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-gray-500">Last Updated</p>
                    <p className="mt-1">
                      {new Date(uat.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </dd>
            </div>
            
            {uat.notes && uat.notes.length > 0 && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="space-y-4">
                    {uat.notes.map((note, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{note.author || 'Anonymous'}</p>
                          <span className="text-xs text-gray-500">
                            {new Date(note.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1">{note.text}</p>
                      </div>
                    ))}
                  </div>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default UATDetail;
