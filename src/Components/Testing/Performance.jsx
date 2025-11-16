import React, { useState, useEffect } from 'react';
import { FiActivity, FiClock, FiAlertTriangle, FiTrendingUp, FiServer, FiZap } from 'react-icons/fi';
import './Performance.css';

const Performance = () => {
  const [metrics, setMetrics] = useState({
    responseTime: '0ms',
    uptime: '99.9%',
    requestsPerSecond: '0',
    errorRate: '0%',
    cpuUsage: '0%',
    memoryUsage: '0%'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch performance metrics
    const fetchMetrics = async () => {
      try {
        // In a real app, you would fetch this from your API
        // const response = await performanceAPI.getMetrics();
        // setMetrics(response.data);
        
        // Mock data for demonstration
        setTimeout(() => {
          setMetrics({
            responseTime: '42ms',
            uptime: '99.95%',
            requestsPerSecond: '1,243',
            errorRate: '0.05%',
            cpuUsage: '32%',
            memoryUsage: '45%'
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching performance metrics:', error);
        setLoading(false);
      }
    };

    fetchMetrics();
    
    // Set up polling in a real app
    // const interval = setInterval(fetchMetrics, 30000);
    // return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading performance metrics...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Performance Metrics</h1>
        <p className="text-gray-600">Monitor your application's performance in real-time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Response Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FiZap size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Response Time</p>
              <p className="text-2xl font-bold">{metrics.responseTime}</p>
            </div>
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FiClock size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Uptime</p>
              <p className="text-2xl font-bold">{metrics.uptime}</p>
            </div>
          </div>
        </div>

        {/* Requests per Second */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <FiTrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Requests / Second</p>
              <p className="text-2xl font-bold">{metrics.requestsPerSecond}</p>
            </div>
          </div>
        </div>

        {/* Error Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
              <FiAlertTriangle size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Error Rate</p>
              <p className="text-2xl font-bold">{metrics.errorRate}</p>
            </div>
          </div>
        </div>

        {/* CPU Usage */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <FiActivity size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">CPU Usage</p>
              <p className="text-2xl font-bold">{metrics.cpuUsage}</p>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
              <FiServer size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Memory Usage</p>
              <p className="text-2xl font-bold">{metrics.memoryUsage}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional performance charts and data can be added here */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Performance Over Time</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          Performance charts will be displayed here
        </div>
      </div>
    </div>
  );
};

export default Performance;