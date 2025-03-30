import React from 'react';

const TaskStatusIndicator = ({ status }) => {
  let statusClass = '';
  let indicatorText = '';
  
  switch(status) {
    case 'pending':
      statusClass = 'status-pending';
      indicatorText = 'Waiting to process...';
      break;
    case 'in_progress':
      statusClass = 'status-in-progress';
      indicatorText = 'Processing data...';
      break;
    case 'completed':
      statusClass = 'status-completed';
      indicatorText = 'Task completed!';
      break;
    case 'failed':
      statusClass = 'status-failed';
      indicatorText = 'Processing failed';
      break;
    default:
      statusClass = '';
      indicatorText = '';
  }
  
  return (
    <div className={`status-indicator ${statusClass}`}>
      <div className="indicator-icon"></div>
      <span>{indicatorText}</span>
    </div>
  );
};

export default TaskStatusIndicator;