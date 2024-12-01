import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Streamgraph = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const tooltip = d3.select('body').append('div').attr('class', 'tooltip');

    const showTooltip = (event, d) => {
      if (!d || !d.data) return;

      tooltip
        .style('display', 'block')
        .html(`<strong>${d.key}</strong>`)
        .style('background', color(d.key))
        .style('position', 'absolute')
        .style('top', `${event.pageY + 10}px`)
        .style('left', `${event.pageX + 10}px`);

      const barChartData = d.data.map((item) => ({
        Date: new Date(item.Date),
        Count: item[d.key],
      }));

      createBarChart(barChartData, color(d.key));
    };

    const moveTooltip = (event) => {
      tooltip
        .style('top', `${event.pageY + 10}px`)
        .style('left', `${event.pageX + 10}px`);
    };

    const hideTooltip = () => {
      tooltip.style('display', 'none');
      d3.select('.mini-bar-chart').remove();
    };

    const createBarChart = (data, color) => {
      if (!data || data.length === 0) return;

      const barChartWidth = 150;
      const barChartHeight = 100;
      const margin = { top: 10, right: 10, bottom: 30, left: 30 };

      const miniBarChartSvg = tooltip
        .append('svg')
        .attr('class', 'mini-bar-chart')
        .attr('width', barChartWidth)
        .attr('height', barChartHeight)
        .style('background', 'darkgray');

      const xBar = d3
        .scaleBand()
        .domain(data.map((d) => d.Date))
        .range([margin.left, barChartWidth - margin.right])
        .padding(0.1);

      const yBar = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.Count)])
        .range([barChartHeight - margin.bottom, margin.top]);

      const monthFormat = d3.timeFormat('%b');

      miniBarChartSvg
        .selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', (d) => xBar(d.Date))
        .attr('y', (d) => yBar(d.Count))
        .attr('width', xBar.bandwidth())
        .attr('height', (d) => barChartHeight - margin.bottom - yBar(d.Count))
        .attr('fill', color);

      miniBarChartSvg
        .append('g')
        .attr('transform', `translate(0,${barChartHeight - margin.bottom})`)
        .call(
          d3.axisBottom(xBar)
            .tickFormat((d) => monthFormat(new Date(d)))
            .tickSize(0)
            .tickPadding(10)
        )
        .selectAll('text')
        .style('fill', 'white');

      miniBarChartSvg
        .append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yBar).ticks(3))
        .selectAll('text')
        .style('fill', 'white');
    };

    const margin = { top: 20, right: 200, bottom: 100, left: 50 }; // Increased bottom margin for x-axis
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom + 50); // Increased height to accommodate x-axis

    svg.selectAll('*').remove();

    const chartArea = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Force the x-axis domain to span from January to December (even if data doesn't cover the entire year)
    const x = d3
      .scaleTime()
      .domain([new Date('2024-02-01'), new Date('2024-9-31')]) // Set the domain from January to December
      .range([0, width])
      .nice(d3.timeMonth); // Ensure months are aligned properly

    //console.log('X-axis domain:', [new Date('2024-01-01'), new Date('2024-12-31')]); // Debug: Check x-axis domain

    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, (d) =>
          ['GPT-4', 'Gemini', 'PaLM-2', 'Claude', 'LLaMA-3.1'].reduce(
            (sum, key) => sum + d[key],
            0
          )
        ),
      ])
      .range([height, 0]);

    const color = d3
      .scaleOrdinal()
      .domain(['GPT-4', 'Gemini', 'PaLM-2', 'Claude', 'LLaMA-3.1'])
      .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00']);

    const stack = d3
      .stack()
      .keys(['GPT-4', 'Gemini', 'PaLM-2', 'Claude', 'LLaMA-3.1'])
      .offset(d3.stackOffsetWiggle);
    const layers = stack(data);

    const area = d3
      .area()
      .x((d) => x(new Date(d.data.Date)))
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]))
      .curve(d3.curveBasis);

    chartArea
      .selectAll('path')
      .data(layers)
      .enter()
      .append('path')
      .attr('d', area)
      .attr('fill', (d) => color(d.key))
      .on('mouseover', (event, d) => {
        const layerData = data.map((item) => ({
          Date: new Date(item.Date),
          [d.key]: item[d.key],
        }));
        showTooltip(event, { key: d.key, data: layerData });
      })
      .on('mousemove', moveTooltip)
      .on('mouseout', hideTooltip);

    chartArea
      .append('g')
      .attr('transform', `translate(0,${height + 50})`) 
      .call(
        d3.axisBottom(x)
          .tickSize(10)
          .tickFormat(d3.timeFormat('%b')) // Abbreviated month names
      )
      .selectAll('text')
      .style('fill', 'black');

    const legend = svg.append('g').attr('transform', `translate(${width + 80}, 90)`);

    const models = ['GPT-4', 'Gemini', 'PaLM-2', 'Claude', 'LLaMA-3.1'];
    models.forEach((key, index) => {
      legend
        .append('rect')
        .attr('x', -5)
        .attr('y', index * 30 + 15)
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', color(key))
        .on('mouseover', (event) => {
          const legendData = data.map((item) => ({
            Date: new Date(item.Date),
            Count: item[key],
          }));
          showTooltip(event, { key, data: legendData });
        })
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip);

      legend
        .append('text')
        .attr('x', 15)
        .attr('y', index * 30 + 20)
        .attr('dy', '0.35em')
        .text(key)
        .style('font-size', '12px')
        .style('fill', 'black');
    });
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default Streamgraph;
