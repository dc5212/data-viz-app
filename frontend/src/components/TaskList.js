import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchTasks, retryTask } from '../services/api';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(null);
  
  const loadTasks = async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadTasks();
    
    // Set up polling to refresh task status
    const intervalId = setInterval(loadTasks, 3000);
    return () => clearInterval(intervalId);
  }, []);
  
  const handleRetry = async (taskId) => {
    setRetrying(taskId);
    try {
      await retryTask(taskId);
      await loadTasks(); 
    } catch (error) {
      console.error('Error retrying task:', error);
    } finally {
      setRetrying(null);
    }
  };
  
  if (loading) {
    return <div>Loading tasks...</div>;
  }
  
  return (
    <div className="task-list">
      <h2>Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks yet. Create a new task to get started.</p>
      ) : (
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
            {tasks.map(task => (
              <tr key={task.id} className={task.status === 'failed' ? 'failed-task' : ''}>
                <td>{task.id}</td>
                <td>
                  <span className={`status-${task.status}`}>
                    {task.status}
                  </span>
                </td>
                <td>{new Date(task.created_at).toLocaleString()}</td>
                <td>
                  {task.status === 'completed' ? (
                    <Link to={`/tasks/${task.id}`}>View Results</Link>
                  ) : task.status === 'failed' ? (
                    <button 
                      className="retry-button" 
                      onClick={() => handleRetry(task.id)}
                      disabled={retrying === task.id}
                    >
                      {retrying === task.id ? 'Retrying...' : 'Retry Task'}
                    </button>
                  ) : (
                    <span>Processing...</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TaskList;