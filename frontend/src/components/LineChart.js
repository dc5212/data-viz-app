import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LineChart = ({ data }) => {
  const chartRef = useRef();
  
  useEffect(() => {
    
    
    
    d3.select(chartRef.current).selectAll("*").remove();

    if (!data || data.length === 0) {
      
      const svg = d3.select(chartRef.current)
        .append("svg")
        .attr("width", 600)
        .attr("height", 400);
      
      // Add "No data" message
      svg.append("text")
        .attr("x", 300)
        .attr("y", 200)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "#666")
        .text("No data available for the selected filters");
        
      return;
    }
    
    // Sort data by date
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Set dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Parse dates
    const parseDate = d3.timeParse("%Y-%m");
    sortedData.forEach(d => {
      d.parsedDate = parseDate(d.date);
    });
    
    // Create SVG
    const svg = d3.select(chartRef.current)
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const x = d3.scaleTime()
      .domain(d3.extent(sortedData, d => d.parsedDate))
      .range([0, width]);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(sortedData, d => d.count) * 1.1])
      .nice()
      .range([height, 0]);
    
    // Create line generator
    const line = d3.line()
      .x(d => x(d.parsedDate))
      .y(d => y(d.count))
      .curve(d3.curveMonotoneX);
    
    // Add line path
    svg.append("path")
      .datum(sortedData)
      .attr("fill", "none")
      .attr("stroke", "#4682b4")
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Create tooltip div
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("padding", "10px")
      .style("border-radius", "3px")
      .style("pointer-events", "none")
      .style("z-index", "999");
    
    // Add dots
    svg.selectAll(".dot")
      .data(sortedData)
      .enter()
      .append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.parsedDate))
        .attr("cy", d => y(d.count))
        .attr("r", 5)
        .attr("fill", "#4682b4")
        .on("mouseover", function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 8)
            .attr("fill", "#2c5282");
            
          tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);
            
          tooltip.html(`Date: ${d3.timeFormat("%b %Y")(d.parsedDate)}<br>Sales: ${d.count}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 5)
            .attr("fill", "#4682b4");
            
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        });
    
    
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickFormat(d3.timeFormat("%b %Y"))
        .ticks(Math.min(sortedData.length, 6))) 
      .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em");
    
    svg.append("g")
      .call(d3.axisLeft(y));
    
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 0 - margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Sales by Month");
      
    // Add grid lines for better readability
    svg.append("g")			
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.2)
      .call(d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat("")
      );
    
    svg.append("g")			
      .attr("class", "grid")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.2)
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat("")
      );
      
    // Clean up tooltip when component unmounts
    return () => {
      d3.select("body").selectAll(".tooltip").remove();
    };
      
  }, [data]);
  
  return <div ref={chartRef}></div>;
};

export default LineChart;