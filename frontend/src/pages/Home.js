import React, { useState } from 'react';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';

const Home = () => {
  const [taskCreated, setTaskCreated] = useState(false);
  
  const handleTaskCreated = (task) => {
    setTaskCreated(true);
    setTimeout(() => setTaskCreated(false), 3000);
  };
  
  return (
    <div className="home-page">
      <h1>Data Visualization App</h1>
      
      {taskCreated && (
        <div className="alert success">
          Task created successfully! It will process in the background.
        </div>
      )}
      
      <div className="container">
        <div className="form-container">
          <TaskForm onTaskCreated={handleTaskCreated} />
        </div>
        
        <div className="list-container">
          <TaskList />
        </div>
      </div>
    </div>
  );
};

export default Home;