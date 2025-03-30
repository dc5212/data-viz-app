import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchTask, fetchTaskAnalytics } from '../services/api';
import BarChart from '../components/BarChart';
import LineChart from '../components/LineChart';
import { exportTaskData } from '../services/api';
import PriceChart from '../components/PriceChart';

const TaskDetails = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasData, setHasData] = useState(true);
  const [filters, setFilters] = useState({
    company: '',
    year: ''
  });
  
  useEffect(() => {
    const loadTaskData = async () => {
      try {
        const taskData = await fetchTask(taskId);
        setTask(taskData);
        
        if (taskData.status === 'completed') {
          const analyticsData = await fetchTaskAnalytics(taskId);
          setAnalytics(analyticsData);
        }
      } catch (err) {
        setError('Error loading task data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadTaskData();
    
    // Poll for updates if task is not completed
    let intervalId;
    if (task && task.status !== 'completed') {
      intervalId = setInterval(loadTaskData, 2000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [taskId, task?.status]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleExportCSV = () => {
    exportTaskData(taskId, 'csv', filters);
  };

  const handleExportExcel = () => {
      exportTaskData(taskId, 'excel', filters);
  };
  
  
  // Add this right after you apply filters
  const applyFilters = async () => {
    setLoading(true);
    try {
      // Fetch analytics with the current filters
      const analyticsData = await fetchTaskAnalytics(taskId, filters);
      setAnalytics(analyticsData);
      
      // Check if the filtered data is empty
      const hasTimelineData = analyticsData.timeline_chart && analyticsData.timeline_chart.length > 0;
      const hasBarData = analyticsData.bar_chart && analyticsData.bar_chart.length > 0;
      
      // Set a state variable to track if we have data
      setHasData(hasTimelineData || hasBarData);
    } catch (err) {
      console.error('Error applying filters:', err);
      setError('Error applying filters. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !task) {
    return <div>Loading task data...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  if (!task) {
    return <div>Task not found</div>;
  }
  
  return (
    <div className="task-details">
      <h1>Task {taskId} Details</h1>
      
      <div className="task-info">
        <h2>Task Information</h2>
        <table>
          <tbody>
            <tr>
              <td>Status:</td>
              <td>{task.status}</td>
            </tr>
            <tr>
              <td>Created:</td>
              <td>{new Date(task.created_at).toLocaleString()}</td>
            </tr>
            <tr>
              <td>Parameters:</td>
              <td>
                <ul>
                  <li>Start Year: {task.parameters.start_year}</li>
                  <li>End Year: {task.parameters.end_year}</li>
                  <li>
                    Companies: {task.parameters.companies && task.parameters.companies.length > 0
                      ? task.parameters.companies.join(', ')
                      : 'All'
                    }
                  </li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {task.status !== 'completed' ? (
        <div className="processing-message">
          <p>Task is currently {task.status}. Please wait for it to complete.</p>
        </div>
      ) : (
        <div className="visualization-section">
          <h2>Data Visualization</h2>
          
          <div className="filters">
            <h3>Filter Data</h3>
            <div className="filter-form">
              <div className="form-group">
                <label>Company:</label>
                <select
                  name="company"
                  value={filters.company}
                  onChange={handleFilterChange}
                >
                  <option value="">All Companies</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Honda">Honda</option>
                  <option value="Ford">Ford</option>
                  <option value="Chevrolet">Chevrolet</option>
                  <option value="Nissan">Nissan</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Year:</label>
                <select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                >
                  <option value="">All Years</option>
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                </select>
              </div>
              
              <button onClick={applyFilters}>Apply Filters</button>
            </div>
          </div>

          {task.status === 'completed' && (
              <div className="export-buttons">
                  <h3>Export Data</h3>
                  <div className="button-group">
                      <button onClick={handleExportCSV} className="export-btn">
                          Export as CSV
                      </button>
                      <button onClick={handleExportExcel} className="export-btn">
                          Export as Excel
                      </button>
                  </div>
              </div>
          )}

          
          {analytics && (
            <div className="charts">
              <div className="chart-container">
                <h3>Sales by Month</h3>
                <LineChart data={analytics.timeline_chart} />
              </div>
              
              <div className="chart-container">
                <h3>Sales by Company</h3>
                <BarChart data={analytics.bar_chart} />
              </div>
              
              <div className="chart-container">
                <h3>Average Price by Company</h3>
                <PriceChart data={analytics.price_chart} />
              </div>
            </div>
          )}

          {analytics && analytics.bar_chart.length > 0 && (
            <div className="analysis-cards">
              <div className="card">
                <h3>Total Sales</h3>
                <p className="card-value">
                  {analytics.bar_chart.reduce((sum, item) => sum + item.count, 0)}
                </p>
              </div>

              <div className="card">
                <h3>Top Company</h3>
                <p className="card-value">
                  {analytics.bar_chart[0].company}
                </p>
                <p className="card-subtitle">
                  {analytics.bar_chart[0].count} sales
                </p>
              </div>

              <div className="card">
                <h3>Average Price</h3>
                <p className="card-value">
                  ${((analytics.price_chart.reduce((sum, item) => sum + item.avg_price, 0) / 
                    analytics.price_chart.length) || 0).toFixed(2)}
                </p>
              </div>
              
              <div className="card">
                <h3>Price Range</h3>
                <p className="card-value">
                  ${Math.min(...analytics.price_chart.map(item => item.avg_price)).toFixed(2)} - 
                  ${Math.max(...analytics.price_chart.map(item => item.avg_price)).toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskDetails;