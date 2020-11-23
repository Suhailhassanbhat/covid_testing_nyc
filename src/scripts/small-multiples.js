import * as d3 from 'd3'
import d3Tip from 'd3-tip'
// import d3Annotation from 'd3-svg-annotation'
d3.tip = d3Tip

const margin = { top: 10, left: 0, right: 0, bottom: 0 }
const height = 1000 - margin.top - margin.bottom
const width = 1000 - margin.left - margin.right

const svg = d3
  .select('#chart-change1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const parseTime = d3.timeParse('%Y')

// const projection = d3.geoMercator().translate([width / 2, height / 2])
// const path = d3.geoPath().projection(projection)

// below is for the tooltip
const xTooltip = d3
  .scaleLinear()
  .domain([parseTime('2009'), parseTime('2019')])
  .range([0, tipWidth])

const yTooltip = d3
  .scaleLinear()
  .domain([0, 100])
  .range([tipHeight, 0])

// Create our scales
const xPositionScale = d3.scaleLinear().range([0, width])
const yPositionScale = d3
  .scaleLinear()
  .domian([0, 200000])
  .range([height, 0])

const line = d3
  .line()
  .x(d => xPositionScale(d.date))
  .y(d => yPositionScale(+d.entries))

d3.csv(require('/data/body.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })

function ready(datapoints) {
  const nested = d3
    .nest()
    .key(d => d.stop_name)
    .entries(datapoints)

  console.log(nested)

  //   svg
  //     .selectAll('lines')
  //     .data(nested)
  //     .enter()
  //     .append('g')
  //     .attr('class', 'lines')
  //     .each(function(d) {
  //       const container = d3.select(this)
  //       const datapoints = d.values
  //       container
  //         .attr('height', height + margin.top + margin.bottom)
  //         .attr('width', width + margin.left + margin.right)
  //         .append('g')
  //         .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  //       //     // .selectAll('path')
  //       //     // .data(datapoints)
  //       //     // .enter()
  //       //     // .append('path')
  //       //     // .attr('fill', 'red')
  //       //     // .attr('stroke', 'black')
  //       //     // .attr('d', function(d) {
  //       //     //   //   console.log('this nested thing is', d)
  //       //     //   // Takes all of the datapoints in that
  //       //     //   // group and feeds them to the line
  //       //     //   // generator that we made before
  //       //     //   return line(d)
  //       //     // })
  //       const xAxis = d3
  //         .axisBottom(xPositionScale)
  //         .tickFormat(d3.timeFormat('%b %y'))
  //         .ticks(9)
  //       container
  //         .append('g')
  //         .attr('class', 'axis x-axis')
  //         .attr('transform', 'translate(0,' + height + ')')
  //         .call(xAxis)

  //       const yAxis = d3.axisLeft(yPositionScale)
  //       container
  //         .append('g')
  //         .attr('class', 'axis y-axis')
  //         .call(yAxis)
  //     })
}
