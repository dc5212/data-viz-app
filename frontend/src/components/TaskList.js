import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchTasks } from '../services/api';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
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
    
    loadTasks();
    
    // Set up polling to refresh task status
    const intervalId = setInterval(loadTasks, 3000);
    return () => clearInterval(intervalId);
  }, []);
  
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
              <tr key={task.id}>
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