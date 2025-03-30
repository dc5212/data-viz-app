import React, { useState } from 'react';
import { createTask } from '../services/api';

const TaskForm = ({ onTaskCreated }) => {
  const [formData, setFormData] = useState({
    start_year: 2023,
    end_year: 2025,
    companies: []
  });
  const [loading, setLoading] = useState(false);
  
  const carCompanies = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan'];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleCompanyChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        companies: [...formData.companies, value]
      });
    } else {
      setFormData({
        ...formData,
        companies: formData.companies.filter(company => company !== value)
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const newTask = await createTask(formData);
      if (onTaskCreated) onTaskCreated(newTask);
      setFormData({
        start_year: 2023,
        end_year: 2025,
        companies: []
      });
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="task-form">
      <h2>Create New Data Task</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Start Year:</label>
          <input
            type="number"
            name="start_year"
            value={formData.start_year}
            onChange={handleChange}
            min="2020"
            max="2025"
            required
          />
        </div>
        
        <div className="form-group">
          <label>End Year:</label>
          <input
            type="number"
            name="end_year"
            value={formData.end_year}
            onChange={handleChange}
            min="2020"
            max="2025"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Filter by Companies:</label>
          <div className="checkbox-group">
            {carCompanies.map(company => (
              <div key={company}>
                <input
                  type="checkbox"
                  id={`company-${company}`}
                  name="companies"
                  value={company}
                  checked={formData.companies.includes(company)}
                  onChange={handleCompanyChange}
                />
                <label htmlFor={`company-${company}`}>{company}</label>
              </div>
            ))}
          </div>
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Creating task...' : 'Create Task'}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;