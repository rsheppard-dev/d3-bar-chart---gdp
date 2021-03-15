const width = 800;
const height = 600;

// tooltip settings
const tooltip = d3.select('body')
  .append('div')
  .attr('id', 'tooltip')
  .style('position', 'absolute')
  .style('opacity', 0);

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("height", height)
  .attr("width", width)

// setup margins and dimensions
const margin = { top: 20, right: 20, bottom: 100, left: 100 };
const graphWidth = width - margin.left - margin.right;
const graphHeight = height - margin.top - margin.bottom;

const graph = svg
  .append("g")
  .attr("width", graphWidth)
  .attr("height", graphHeight)
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json")
  .then(data => {

    // format year and quarter for tooltip
    const year = data.data.map(d => {
      let quarter = '';
      const qCheck = d[0].substring(5, 7);

      switch (qCheck) {
        case '01':
          quarter = 'Q1';
          break;
        case '04':
          quarter = 'Q2';
          break;
        case '07':
          quarter = 'Q3';
          break;
        case '10':
          quarter = 'Q4';
          break;
        default:
          break;
      }

      return `${d[0].substring(0, 4)} ${quarter}`;
    });

    // get all dates from data
    const yearDate = data.data.map(d => new Date(d[0]));

    // set x scale and axis
    const xMax = new Date(d3.max(yearDate));
    xMax.setMonth(xMax.getMonth() + 3);

    const xScale = d3
      .scaleTime()
      .domain([d3.min(yearDate), xMax])
      .range([0, graphWidth]);

    const xAxis = d3
      .axisBottom()
      .scale(xScale);

    graph
      .append("g")
      .call(xAxis)
      .attr('id', 'x-axis')
      .attr("transform", `translate(0, ${graphHeight})`);

    // get all gdp from data
    const gdp = data.data.map(d => d[1]);

    const yMax = d3.max(gdp);

    const linearScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .range([0, graphHeight]);

    const scaledGDP = gdp.map(d => linearScale(d));

    // set y scale and axis
    const barWidth = graphWidth / scaledGDP.length;

    const yScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .range([graphHeight, 0]);

    const yAxis = d3.axisLeft(yScale)

    graph
      .append('g')
      .call(yAxis)
      .attr('id', 'y-axis');

    // create bars with data
    graph
      .selectAll("rect")
      .data(scaledGDP)
      .enter()
      .append("rect")
      .attr("data-date", (d, i) => data.data[i][0])
      .attr("data-gdp", (d, i) => data.data[i][1])
      .attr("class", "bar")
      .attr("x", (d, i) => xScale(yearDate[i]))
      .attr("y", d => graphHeight - d)
      .attr("width", d => barWidth)
      .attr("height", d => d)
      .attr("fill", "#1A936F")

      // tooltip events
      .on('mouseover', (d, i) => {
        tooltip
          .transition()
          .delay(200)
          .style('opacity', 0.8)
        
        tooltip
          .html(
            `<p>${year[i]}</p>
            <p>$${gdp[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')} Billion`
          )
          .attr('data-date', data.data[i][0])
          .style('left', i * barWidth + margin.left + 'px')
          .style('top', graphHeight + 'px')
          .style('transform', 'translateX(100px)');
      })

      .on('mouseout', () => {
        tooltip
          .transition()
          .delay(200)
          .style('opacity', 0);
      })
  });
