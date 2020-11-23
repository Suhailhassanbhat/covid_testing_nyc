import * as d3 from 'd3'
import * as topojson from 'topojson'
import d3Tip from 'd3-tip'
// import d3Annotation from 'd3-svg-annotation'
d3.tip = d3Tip

const margin = { top: 10, left: 0, right: 0, bottom: 0 }
const height = 700 - margin.top - margin.bottom
const width = 1000 - margin.left - margin.right

const tipHeight = 50 - margin.top - margin.bottom
const tipWidth = 75 - margin.left - margin.right

const svg = d3
  .select('#chart-change')
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

const line = d3
  .line()
  .curve(d3.curveCardinal)
  .x(d => xTooltip(+d.datetime))
  .y(function(d) {
    return yTooltip(+d.percent_recycled)
  })

const colorScale = d3
  .scaleOrdinal()
  .domain([0, 40])
  .range(['#f2f0f7', '#cbc9e2', '#9e9ac8', '#756bb1', '#54278f'])

Promise.all([
  d3.json(require('/data/data_NY.json')),
  d3.csv(require('/data/Testing_Sites.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([datapoints, siteData]) {
  // d3.json(require('/data/data_NY.json'))
  //   .then(ready)
  //   .catch(err => {
  //     console.log(err)
  //   })

  // function ready(datapoints) {
  const hood = topojson.feature(datapoints, datapoints.objects.data_NY)
  // console.log(districts)
  console.log(datapoints)
  console.log(siteData)

  const projection = d3
    .geoConicConformal()
    .parallels([40 + 40 / 60, 41 + 2 / 60])
    .rotate([74, 0])
    // .translate([width / 2, height / 2])
    .fitSize([width, height], hood)

  const path = d3.geoPath().projection(projection)

  // colorScaleNegative.domain([0, d3.min(pctPtChange)])
  // ----Draw tip here------

  const formatComma = d3.format(',')
  const tip = d3
    .tip()
    .attr('class', 'd3-tip')
    .style('position', 'absolute')
    .offset([10, 10])
    .html(function(d) {
      return `<b>${
        d.properties.NEIGHBORHOOD_NAME
      }</b> <br>  <b>Pct Tested:</b> <span style='color:red'>${formatComma(d.properties.test_pct)}</span>
    <br> <span style='color:none'>${formatComma(
      d.properties.median_household_income
    )}</span>`
    })
  svg.call(tip)

  // ----- TIP ENDS HERE-------

  // -----DRAW MAP HERE------
  svg
    .selectAll('.hood')
    .data(hood.features)
    .enter()
    .append('path')
    .attr('class', 'hood')
    .attr('d', path)
    .attr('stroke', 'none')
    .attr('fill', function(d) {
      return colorScale(+d.properties.PERCENT_POSITIVE)
    })
    .on('mouseenter', function() {
      d3.select(this)
        .raise()
        .transition()
        .style('transform', 'scale(1,1)')
    })
    .on('mouseleave', function() {
      d3.select(this)
        .lower()
        .transition()
        .style('transform', 'scale(1,1)')
    })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)

  // ----STEP FUNCTIONS START HERE------SHOWs TEST PERCENTAGE

  d3.select('#step1').on('stepin', function() {
    console.log('step1')
    svg
      .selectAll('path')
      .attr('stroke', 'none')
      .attr('fill', function(d) {
        return colorScale(+d.properties.test_pct)
      })
      .on('mouseenter', function() {
        d3.select(this)
          .raise()
          .transition()
          .style('transform', 'scale(1,1)')
      })
      .on('mouseleave', function() {
        d3.select(this)
          .lower()
          .transition()
          .style('transform', 'scale(1,1)')
      })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
  })

  d3.select('#step1').on('stepout', function() {
    svg
      .selectAll('path')
      .attr('stroke', 'none')
      .attr('fill', function(d) {
        return colorScale(+d.properties.PERCENT_POSITIVE)
      })
  })
  // ---------DRAWS A STORKE AROUND LOW INCOME NEIGHBORHOODS----

  d3.select('#step2').on('stepin', function() {
    console.log('step2')
    svg
      .selectAll('path')
      .attr('stroke', function(d) {
        if (+d.properties.median_household_income < 60000) {
          // console.log(+d.properties.median_household_income)
          return 'red'
        } else {
          return 'none'
        }
      })
      .attr('stroke-width', 1.5)
  })
  // -----DRAW A STROKE AROUND NEIGHBOURHOOD WITH HISPANIC, LATINO AND BLACK COMBINED POPULATION IN MAJORITY-------

  d3.select('#step3').on('stepin', function() {
    console.log('step3')
    svg
      .selectAll('path')
      .attr('stroke', function(d) {
        if (
          (+d.properties.pct_hispanic_latino > 0.25) +
          (+d.properties.pct_black > 0.25)
        ) {
          console.log(
            (+d.properties.pct_hispanic_latino > 0.25) +
              (+d.properties.pct_black > 0.25)
          )
          // console.log(+d.properties.pct_black)
          return 'red'
        } else {
          return 'none'
        }
      })

      .attr('stroke-width', 1.5)
  })
  // ----Draws test sites----

  d3.select('#step4').on('stepin', function() {
    console.log('step4')
    svg
      .selectAll('.circle')
      .data(siteData)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('r', 4)
      .attr('opacity', 0.9)
      .attr('transform', function(d) {
        const coords = [+d.longitude, +d.latitude]
        return `translate(${projection(coords)})`
      })
      .attr('fill', 'green')
      .attr('stroke', 'none')
  })
  // d3.select('#step4').on('stepout', function() {
  //   svg.selectAll('circle').attr('fill', 'none')
  // })
}

// // filtering for only manhattan so i can "zoom"
// const manhattanFiltered = districts.features.filter(
//   d => String(d.properties.BOROUGH) === 'Manhattan'
// )
// manhattanFiltered.sort(function(a, b) {
//   return a.properties.pct_change - b.properties.pct_change
// })
// manhattanFiltered.forEach(function(d, i) {
//   d.properties.idx = i
// })
// const manhattanJSON = {
//   features: manhattanFiltered,
//   type: 'FeatureCollection'
// }

// const pctPtChange = districts.features.map(d => +d.properties.pct_change)
// colorScalePositive.domain([0, d3.max(pctPtChange)])
// colorScaleNegative.domain([0, d3.min(pctPtChange)])

// the first graph
// working on making a mouseover chart to show the boros change over each year

// svg.append('path').attr('id', 'yearly-change')

// const xAxis = d3
//   .axisBottom(xTooltip)
//   .tickFormat(d3.timeFormat('%y'))
//   .ticks(5)

// const yAxis = d3.axisLeft(yTooltip)

// // var test_pct = testingData.test_pct

// function(d) {
//   console.log(d)
//   // if (+d.properties.test_pct < 15) {
//   //   return '#DCECF5'

//   // }
//
// .attr('opacity', 1)
//   .on('mouseover', function(d) {
//     if (d.properties.borocd != null) {
//       // lil highlight
//       d3.select(this)
//         .transition()
//         .duration(100)
//         .attr('stroke', 'white')
//         .attr('stroke-width', '3px')
//       // .raise()

//       //  Grabbing this boro and filtering for just it in the long csv
//       const thisBoro = d.properties.boro_cd

//       // tip.show(d, this)

// const tipSVG = d3
//   .select('#tipDiv')
//   .append('svg')
//   .attr('width', tipWidth - 5)
//   .attr('height', tipHeight - 5)
//   .append('g')

// tipSVG
//   .append('g')
//   .attr('class', 'axis x-axis')
//   .attr('transform', 'translate(0,' + 0 + ')')
//   .call(xAxis)

// tipSVG
//   .append('g')
//   .attr('class', 'axis y-axis')
//   .call(yAxis)

//       const tipDataFiltered = tipdata.filter(e => thisBoro === e.borough_code)
//       tipDataFiltered.forEach(function(h) {
//         h.datetime = parseTime(h.year)
//       })
//       // const dateExtent = d3.extent(tipDataFiltered, h => h.datetime)
//       // console.log(tipDataFiltered)
//       // svg
//       //   .select('#yearly-change')
//       //   .datum(tipDataFiltered)
//       //   .transition()
//       //   .ease(d3.easeLinear)
//       //   .attr('d', line)
//       //   .attr('class', 'tip-line')
//       //   .attr('fill', 'none')
//       //   .attr('stroke', 'red')
//       //   .attr('stroke-weight', '2px')
//       tipSVG
//         .append('path')
//         .datum(tipDataFiltered)
//         .attr('d', line)
//         .attr('fill', 'none')
//         .attr('stroke', 'red')
//     }
//   })
//   .on('mouseout', function(d) {
//     d3.select(this)
//       .transition()
//       .duration(100)
//       .attr('stroke', 'none')
//       .attr('stroke-width', '0')
//     // .lower()

//     // tip.hide(d, this)
//   })

// svg
//   .append('text')
//   .style('font-weight', 600)
//   .style('font-size', '42px')
//   .attr('class', 'poverty-level-percent')
//   .text('Recycling')
//   .attr('id', 'text')
//   .attr('text-anchor', 'end')
// svg
//   .append('text')
//   .style('font-weight', 400)
//   .style('font-size', '32px')
//   .attr('class', 'poverty-level-poverty')
//   .text('changes')
//   .attr('id', 'text')
//   .attr('text-anchor', 'end')

// svg
//   .append('text')
//   .text('Graphic by Suhail Bhat')
//   .style('font-size', '10px')
//   .attr('text-anchor', 'end')
//   .attr('alignment-baseline', 'middle')
//   .attr('class', 'credit')

// svg
//   .append('circle')
//   .attr('class', 'pos-circle')
//   .attr('r', 7)
//   .attr('fill', '#7DB7D9')
// svg
//   .append('circle')
//   .attr('class', 'even-circle')
//   .attr('r', 7)
//   .attr('fill', '#f6f6f6')
//   .attr('stroke', '#333')
// svg
//   .append('circle')
//   .attr('class', 'neg-circle')
//   .attr('r', 7)
//   .attr('fill', '#FB8060')

// svg
//   .append('text')
//   .text('+ percent')
//   .style('font-size', '14px')
//   .attr('text-anchor', 'start')
//   .attr('alignment-baseline', 'middle')
//   .attr('class', 'pos-text')
// svg
//   .append('text')
//   .text('no change')
//   .style('font-size', '14px')
//   .attr('text-anchor', 'start')
//   .attr('alignment-baseline', 'middle')
//   .attr('class', 'even-text')
// svg
//   .append('text')
//   .text('- percent')
//   .style('font-size', '14px')
//   .attr('text-anchor', 'start')
//   .attr('alignment-baseline', 'middle')
//   .attr('class', 'neg-text')

// d3.selectAll('#text').attr('opacity', 1)

// function render() {
//   const svgContainer = svg.node().closest('div')
//   const svgWidth = svgContainer.offsetWidth
//   const svgHeight = height + margin.top + margin.bottom

//   const actualSvg = d3.select(svg.node().closest('svg'))
//   actualSvg.attr('width', svgWidth).attr('height', svgHeight)

//   const newWidth = svgWidth - margin.left - margin.right
//   const newHeight = svgHeight - margin.top - margin.bottom
//   // const newTipHeight = newHeight / 4 - margin.left - margin.right
//   // const newTipWidth = newWidth / 2.7 - margin.top - margin.bottom

//   // Update our scale
//   projection.fitSize([newWidth, newHeight], districts)
//   // xTooltip.range([25, newTipWidth])
//   // yTooltip.range([newTipHeight, 0])

//   // Update things you draw
//   svg.selectAll('path').attr('d', path)
//   // svg.select('path.tip-line').attr('d', line)

//   svg
//     .selectAll('.pos-circle')
//     .attr('cx', newWidth - 110)
//     .attr('cy', newHeight - 80)
//   svg
//     .selectAll('.even-circle')
//     .attr('cx', newWidth - 110)
//     .attr('cy', newHeight - 55)
//   svg
//     .selectAll('.neg-circle')
//     .attr('cx', newWidth - 110)
//     .attr('cy', newHeight - 30)

//   svg
//     .selectAll('.pos-text')
//     .attr('x', newWidth - 90)
//     .attr('y', newHeight - 78.5)
//   svg
//     .selectAll('.even-text')
//     .attr('x', newWidth - 90)
//     .attr('y', newHeight - 53.5)
//   svg
//     .selectAll('.neg-text')
//     .attr('x', newWidth - 90)
//     .attr('y', newHeight - 28.5)

//   svg
//     .select('.credit')
//     .attr('x', newWidth)
//     .attr('y', newHeight)

//   svg
//     .select('.poverty-level-percent')
//     .attr('x', () =>
//       window.innerWidth < 600 ? newWidth / 2 : newWidth / 2.4
//     )
//     .style('text-anchor', () => (window.innerWidth < 600 ? 'middle' : 'end'))
//     .attr('y', () => (window.innerWidth < 600 ? 50 : newHeight * 0.4))

//   svg
//     .select('.poverty-level-poverty')
//     .attr('x', () =>
//       window.innerWidth < 600 ? newWidth / 2 : newWidth / 2.4
//     )
//     .attr('y', () => (window.innerWidth < 600 ? 85 : newHeight * 0.46))
//     .style('text-anchor', () => (window.innerWidth < 600 ? 'middle' : 'end'))

//   // responsiveness
//   d3.selectAll('#step1').on('stepin', function() {
//     // console.log('step1')
//     projection.fitSize([newWidth, newHeight], districts)

//     const pctChange = districts.features.map(d => +d.properties.pct_change)
//     colorScalePositive.domain([0, d3.max(pctChange)])
//     colorScaleNegative.domain([0, d3.min(pctChange)])

//     svg
//       .select('.poverty-level-percent')
//       .text('Recycling')
//       .attr('fill', 'black')
//     svg.select('.poverty-level-poverty').text('changes')

//     svg
//       .selectAll('.districts')
//       .transition()
//       .duration(750)
//       .ease(d3.easeLinear)
//       .attr('d', path)
//       .attr('fill', function(d) {
//         if (+d.properties.pct_change > 0) {
//           return colorScalePositive(+d.properties.pct_change)
//         } else if (+d.properties.pct_change < 0) {
//           return colorScaleNegative(+d.properties.pct_change)
//         } else {
//           return '#f6f6f6'
//         }
//       })
//   })

//   d3.selectAll('#step2').on('stepin', function() {
//     // console.log('step2')
//     projection.fitSize([newWidth, newHeight], districts)
//     svg
//       .select('.poverty-level-percent')
//       .text('High')
//       .attr('fill', 'black')
//     svg.select('.poverty-level-poverty').text('poverty')

//     svg
//       .selectAll('.districts')
//       .transition()
//       .delay(200)
//       .duration(750)
//       .ease(d3.easeLinear)
//       .attr('opacity', 1)
//       .attr('d', path)
//       .attr('fill', function(d) {
//         // console.log(d)
//         if (!d.properties.borocd) {
//           return '#f6f6f6'
//         } else {
//           if (d.properties.poverty_rate < 15) {
//             return '#d3d3d3'
//           } else {
//             if (+d.properties.pct_change > 0) {
//               return colorScalePositive(+d.properties.pct_change)
//             } else if (+d.properties.pct_change < 0) {
//               return colorScaleNegative(+d.properties.pct_change)
//             }
//           }
//         }
//       })
//       .attr('stroke', 'none')
//   })

//   d3.selectAll('#step3').on('stepin', function() {
//     // console.log('step3')
//     projection.fitSize([newWidth, newHeight], districts)
//     svg
//       .select('.poverty-level-percent')
//       .text('Less')
//       .attr('fill', '#67000d')
//     svg.select('.poverty-level-poverty').text('recycling')
//     svg
//       .selectAll('#text')
//       .transition()
//       .duration(750)
//       .ease(d3.easeLinear)
//       .attr('opacity', 1)

//     svg
//       .selectAll('.districts')
//       .transition()
//       .delay(200)
//       .duration(750)
//       .ease(d3.easeLinear)
//       .attr('opacity', 1)
//       .attr('d', path)
//       .attr('fill', function(d) {
//         if (!d.properties.borocd) {
//           return '#f6f6f6'
//         } else {
//           if (+d.properties.pct_change < 0) {
//             return colorScaleNegative(+d.properties.pct_change)
//           } else if (+d.properties.pct_change > 0) {
//             return '#d3d3d3'
//           }
//         }
//       })
//       .attr('stroke', 'none')
//   })
//   d3.selectAll('#step-').on('stepin', function() {
//     projection.fitSize([newWidth, newHeight], districts)
//     svg
//       .select('.poverty-level-percent')
//       .text('High')
//       .attr('fill', 'peachpuff')
//     svg.select('.poverty-level-poverty').text('income')

//     svg
//       .selectAll('#text')
//       .transition()
//       .duration(750)
//       .ease(d3.easeLinear)
//       .attr('opacity', 1)

//     svg
//       .selectAll('.districts')
//       .attr('stroke', 'none')
//       .attr('stroke-width', 0)
//       .transition()
//       .duration(750)
//       .ease(d3.easeQuad)
//       .attr('opacity', 1)
//       .attr('d', path)
//       .attr('fill', function(d) {
//         if (!d.properties.borocd) {
//           return '#f6f6f6'
//         } else {
//           if (+d.properties.pct_change < 0) {
//             return colorScaleNegative(+d.properties.pct_change)
//           } else if (+d.properties.pct_change > 0) {
//             return '#d3d3d3'
//           }
//         }
//       })
//       .attr('stroke', function(d) {
//         return d.properties.income > 80000 ? 'peachpuff' : 'none'
//       })
//       .attr('stroke-width', 3)
//     // .raise()
//   })
//   d3.selectAll('#step4').on('stepin', function() {
//     projection.fitSize([newWidth, newHeight], manhattanJSON)

//     svg
//       .selectAll('#text')
//       .transition()
//       .duration(250)
//       .attr('opacity', 0)

//     svg
//       .selectAll('#notmanhattan')
//       .transition()
//       .duration(250)
//       .attr('opacity', 0)

//     svg
//       .selectAll('#manhattan')
//       .attr('visibility', 'visible')
//       .transition()
//       .duration(600)
//       .attr('d', path)
//       .attr('opacity', 1)
//     // .attr('stroke', function(d) {
//     //   return d.properties.income > 90000 ? 'peachpuff' : 'none'
//     // })
//     // .attr('stroke-width', 2)
//   })

//   d3.selectAll('#step5').on('stepin', function() {
//     projection.fitSize([newWidth, newHeight], manhattanJSON)
//     svg
//       .selectAll('.districts')
//       .transition()
//       .duration(750)
//       .attr('opacity', 0.4)
//     svg
//       .selectAll('#notmanhattan')
//       .transition()
//       .duration(750)
//       .attr('opacity', 0)

//     svg
//       .select('.district-101')
//       .transition()
//       .duration(750)
//       .ease(d3.easeLinear)
//       .attr('opacity', 1)

//     svg
//       .select('.district-106')
//       .transition()
//       .duration(750)
//       .ease(d3.easeLinear)
//       .attr('opacity', 1)
//   })
// }

// window.addEventListener('resize', render)
// render()
