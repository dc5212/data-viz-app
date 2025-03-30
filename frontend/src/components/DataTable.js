import React, { useState } from 'react';

const DataTable = ({ data }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });
  
  // Paginate data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  return (
    <div className="data-table-container">
      <h3>Raw Data</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th onClick={() => requestSort('sale_date')}>
              Date {sortConfig.key === 'sale_date' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
            <th onClick={() => requestSort('company')}>
              Company {sortConfig.key === 'company' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
            <th onClick={() => requestSort('model')}>
              Model {sortConfig.key === 'model' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
            <th onClick={() => requestSort('price')}>
              Price {sortConfig.key === 'price' && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
            </th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, index) => (
            <tr key={index}>
              <td>{new Date(item.sale_date).toLocaleDateString()}</td>
              <td>{item.company}</td>
              <td>{item.model}</td>
              <td>${item.price.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage} of {Math.ceil(sortedData.length / itemsPerPage)}</span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === Math.ceil(sortedData.length / itemsPerPage)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DataTable;