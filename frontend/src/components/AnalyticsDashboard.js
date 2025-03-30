import React from 'react';

const AnalyticsDashboard = ({ data }) => {
  // Calculate metrics
  const totalSales = data.length;
  const totalRevenue = data.reduce((sum, item) => sum + item.price, 0);
  const averagePrice = totalRevenue / totalSales;
  
  // Get top selling company
  const companySales = {};
  data.forEach(item => {
    companySales[item.company] = (companySales[item.company] || 0) + 1;
  });
  const topCompany = Object.entries(companySales).sort((a, b) => b[1] - a[1])[0][0];
  
  return (
    <div className="analytics-dashboard">
      <h2>Dashboard Summary</h2>
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Sales</h3>
          <p className="metric-value">{totalSales}</p>
        </div>
        <div className="metric-card">
          <h3>Total Revenue</h3>
          <p className="metric-value">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="metric-card">
          <h3>Average Price</h3>
          <p className="metric-value">${averagePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>
        <div className="metric-card">
          <h3>Top Selling Brand</h3>
          <p className="metric-value">{topCompany}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;