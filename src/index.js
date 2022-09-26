const d3 = require('d3');
const dscc = require('@google/dscc');
const local = require('./localMessage.js');

// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = false;

function getMaxMetric(message){
  var max = 0;
  
  var tblList = message.tables.DEFAULT;
  tblList.forEach(function(row) {
    if(row["metric"][0] > max){
      max = row["metric"][0];
    }   
  });
  
  return Math.ceil(max/100)*100;
}
function split_at_index_first(value, index)
{
 return value.substring(0, index);
}
function split_at_index_last(value, index)
{
 return value.substring(index);
}
function sortDate(a, b){
  return a.Name - b.Name;
}


// parse the style value
const styleVal = (message, styleId) => {
    if (typeof message.style[styleId].defaultValue === "object") {

      return message.style[styleId].value.color !== undefined
        ? message.style[styleId].value.color
        : message.style[styleId].defaultValue.color;
    }
    return message.style[styleId].value !== undefined
      ? message.style[styleId].value
      : message.style[styleId].defaultValue;
};
  

const drawViz = message => {
  
  // set the dimensions and margins of the graph
  let margin = {top: 10, right: 30, bottom: 40, left: 100},
  width = 460 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

  if (document.querySelector("svg")) {
    //console.log("hello");
    let oldSvg = document.querySelector("svg");
    oldSvg.parentNode.removeChild(oldSvg);
  }

  // append the svg object to the body of the page
  let svg = d3.select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

  let tblList = message.tables.DEFAULT;
  let data = tblList.map(row => {
      let name = split_at_index_first( split_at_index_last(row["dimension"][0], 8), 2);
        return {
          Name:  name,
          Value:  row["metric"][0]
        }
        }).sort(sortDate);

  let max = getMaxMetric(message);

  // Add X axis
 let x = d3.scaleLinear()
  .domain([0, max])
  .range([ 0, width]);
  svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  // Y axis
  let y = d3.scaleBand()
  .range([ 0, height ])
  .domain(data.map(function(d) { return d.Name; }))
  .padding(1);
  svg.append("g")
  .call(d3.axisLeft(y))

  // Lines
  svg.selectAll("myline")
  .data(data)
  .enter()
  .append("line")
  .attr("x1", function(d) { return x(d.Value); })
  .attr("x2", x(0))
  .attr("y1", function(d) { return y(d.Name); })
  .attr("y2", function(d) { return y(d.Name); })
  .attr("stroke", "grey")

  // Circles
  svg.selectAll("mycircle")
  .data(data)
  .enter()
  .append("circle")
  .attr("cx", function(d) { return x(d.Value); })
  .attr("cy", function(d) { return y(d.Name); })
  .attr("r", "4")
  .style("fill", "#69b3a2")
  .attr("stroke", "black")
};

// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, {transform: dscc.objectTransform});
}