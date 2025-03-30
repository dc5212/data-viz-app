import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const PriceRangeChart = ({ data }) => {
  const chartRef = useRef();
  
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    
    d3.select(chartRef.current).selectAll("*").remove();
    
    // Extract prices
    const prices = data.map(d => d.price);
    
    // Set dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(chartRef.current)
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    
    const histogram = d3.histogram()
      .value(d => d)
      .domain(d3.extent(prices))
      .thresholds(d3.thresholdSturges(prices));
    
    const bins = histogram(prices);
    
    // Create scales
    const x = d3.scaleLinear()
      .domain([d3.min(prices), d3.max(prices)])
      .range([0, width]);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .nice()
      .range([height, 0]);
    
    // Create bars
    svg.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
        .attr("x", d => x(d.x0))
        .attr("y", d => y(d.length))
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr("height", d => height - y(d.length))
        .attr("fill", "#4682b4");
    
    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => `$${d}`));
    
    svg.append("g")
      .call(d3.axisLeft(y));
    
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 0 - margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Price Distribution");
      
  }, [data]);
  
  return <div ref={chartRef}></div>;
};

export default PriceRangeChart;