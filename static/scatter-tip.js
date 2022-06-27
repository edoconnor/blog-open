/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    5.8 - Scatter plots in D3
 */

const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 };
const WIDTH = 600 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 400 - MARGIN.TOP - MARGIN.BOTTOM;

let flag = true;

const svg = d3
  .select("#chart-area")
  .append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

const g = svg
  .append("g")
  .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

const tip = d3
  .tip()
  .attr("class", "d3-tip")
  .html((d) => {
    let text = `<strong>Player:</strong> <span style='color:#e74c3c';text-transform:capitalize'>${d.player}</span><br>`;
    text += `<strong>Top 10 Finishes:</strong> <span style='color:#e74c3c';text-transform:capitalize'>${d.top10}</span><br>`;
    text += `<strong>FEDEX POINTS:</strong> <span style='color:#e74c3c'>${d3.format(
      ",.2r"
    )(d.fedex)}</span><br>`;
    text += `<strong>PERCENTILE RANK:</strong> <span style='color:#e74c3c'>${d3.format(
      ".2"
    )(d.rank)}</span><br>`;
    return text;
  });
g.call(tip);

// X label
g.append("text")
  .attr("class", "x axis-label")
  .attr("x", WIDTH / 2)
  .attr("y", HEIGHT + 60)
  .attr("font-size", "20px")
  .attr("fill", "#2d3436")
  .attr("text-anchor", "middle")
  .text("MEMORIAL TOURNAMENT - Percentile Rank");

// Y label
const yLabel = g
  .append("text")
  .attr("class", "y axis-label")
  .attr("x", -(HEIGHT / 2))
  .attr("y", -60)
  .attr("font-size", "20px")
  .attr("fill", "#2d3436")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)");

const x = d3.scaleBand().range([WIDTH, 0]).paddingInner(0.3).paddingOuter(0.2);

const y = d3.scaleLinear().range([HEIGHT, 0]);

const xAxisGroup = g
  .append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0, ${HEIGHT})`);

const yAxisGroup = g.append("g").attr("class", "y axis");

d3.csv("data/golf.csv").then((data) => {
  data.forEach((d) => {
    d.top10 = Number(d.top10);
    d.fedex = Number(d.fedex);
    d.rank = Number(d.rank);
  });

  d3.interval(() => {
    flag = !flag;
    const newData = flag ? data : data.slice(1);
    update(newData);
  }, 5000);

  update(data);
});

function update(data) {
  const value = flag ? "top10" : "fedex";
  const t = d3.transition().duration(750);

  x.domain(data.map((d) => d.rank));
  y.domain([0, d3.max(data, (d) => d[value])]);

  const xAxisCall = d3.axisBottom(x);
  xAxisGroup
    .transition(t)
    .call(xAxisCall)
    .selectAll("text")
    .attr("y", "10")
    .attr("x", "9")
    .attr("text-anchor", "end");
  //   .attr("transform", "rotate(-10)")

  const yAxisCall = d3
    .axisLeft(y)
    .ticks(3)
    .tickFormat((d) => d);
  yAxisGroup.transition(t).call(yAxisCall);

  // JOIN new data with old elements.
  const circles = g.selectAll("circle").data(data, (d) => d.rank);

  // EXIT old elements not present in new data.
  circles
    .exit()
    .attr("fill", "#dfe6e9")
    .transition(t)
    .attr("cy", y(0))
    .remove();

  // ENTER new elements present in new data...
  circles
    .enter()
    .append("circle")
    .attr("fill", "#27ae60")
    .attr("cy", y(0))
    .attr("r", 5)
    // ADDED TOOLTIP EVENT LISTENERS
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide)
    // AND UPDATE old elements present in new data.
    .merge(circles)
    .transition(t)
    .attr("cx", (d) => x(d.rank) + x.bandwidth() / 2)
    .attr("cy", (d) => y(d[value]));

  const text = flag ? "TOP 10 FINISHES" : "FEDEX POINTS";
  yLabel.text(text);
}
