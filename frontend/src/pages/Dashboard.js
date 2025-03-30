import React, { useState, useEffect } from 'react';
import { fetchTasks, fetchTaskAnalytics } from '../services/api';
import LineChart from '../components/LineChart';
import BarChart from '../components/BarChart';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [aggregatedData, setAggregatedData] = useState({
    total_sales: 0,
    companies: {},
    timeline: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load all tasks
        const tasksData = await fetchTasks();
        setTasks(tasksData);
        
        // Process only completed tasks
        const completedTasks = tasksData.filter(task => task.status === 'completed');
        
        // Aggregate data from all completed tasks
        let totalSales = 0;
        const companySales = {};
        const timelineSales = {};
        
        for (const task of completedTasks) {
          const analytics = await fetchTaskAnalytics(task.id);
          
          // Count total sales from bar chart
          analytics.bar_chart.forEach(item => {
            totalSales += item.count;
            
            // Aggregate by company
            if (!companySales[item.company]) {
              companySales[item.company] = 0;
            }
            companySales[item.company] += item.count;
          });
          
          // Aggregate timeline data
          analytics.timeline_chart.forEach(item => {
            if (!timelineSales[item.date]) {
              timelineSales[item.date] = 0;
            }
            timelineSales[item.date] += item.count;
          });
        }
        
        // Format data for charts
        const companyChartData = Object.keys(companySales).map(company => ({
          company,
          count: companySales[company]
        }));
        
        const timelineChartData = Object.keys(timelineSales)
          .sort()
          .map(date => ({
            date,
            count: timelineSales[date]
          }));
        
        setAggregatedData({
          total_sales: totalSales,
          company_chart: companyChartData,
          timeline_chart: timelineChartData
        });
        
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);
  
  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  return (
    <div className="dashboard">
      <h1>Dashboard Overview</h1>
      
      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Total Tasks</h3>
          <p className="summary-value">{tasks.length}</p>
        </div>
        
        <div className="summary-card">
          <h3>Completed Tasks</h3>
          <p className="summary-value">{tasks.filter(t => t.status === 'completed').length}</p>
        </div>
        
        <div className="summary-card">
          <h3>Total Car Sales</h3>
          <p className="summary-value">{aggregatedData.total_sales.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="recent-tasks">
        <h2>Recent Tasks</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.slice(0, 5).map(task => (
              <tr key={task.id}>
                <td>{task.id}</td>
                <td>
                  <span className={`status-${task.status}`}>
                    {task.status}
                  </span>
                </td>
                <td>{new Date(task.created_at).toLocaleString()}</td>
                <td>
                  <Link to={`/tasks/${task.id}`}>View Details</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>All Sales by Month</h3>
          {aggregatedData.timeline_chart && aggregatedData.timeline_chart.length > 0 ? (
            <LineChart data={aggregatedData.timeline_chart} />
          ) : (
            <p>No timeline data available</p>
          )}
        </div>
        
        <div className="chart-container">
          <h3>All Sales by Company</h3>
          {aggregatedData.company_chart && aggregatedData.company_chart.length > 0 ? (
            <BarChart data={aggregatedData.company_chart} />
          ) : (
            <p>No company data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;