// src/components/PriceChart.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const PriceChart = ({ data }) => {
  const chartRef = useRef();
  
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove();
    
    // Set dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(chartRef.current)
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.company))
      .range([0, width])
      .padding(0.2);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.avg_price) * 1.1]) // Add 10% padding
      .nice()
      .range([height, 0]);
    
    // Create bars
    svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.company))
        .attr("y", d => y(d.avg_price))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.avg_price))
        .attr("fill", "#2a9d8f");
    
    // Add price labels on top of bars
    svg.selectAll(".label")
      .data(data)
      .enter()
      .append("text")
        .attr("class", "label")
        .attr("x", d => x(d.company) + x.bandwidth() / 2)
        .attr("y", d => y(d.avg_price) - 5)
        .attr("text-anchor", "middle")
        .text(d => `$${d.avg_price.toLocaleString()}`);
    
    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");
    
    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `$${d}`));
    
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 0 - margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Average Price by Car Company");
      
  }, [data]);
  
  return <div ref={chartRef}></div>;
};

export default PriceChart;