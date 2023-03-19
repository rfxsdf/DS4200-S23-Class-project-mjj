// Set frame dimensions for visualizations
const FRAME_HEIGHT = 500;
const FRAME_WIDTH = 500; 

// Set margins for visualizations
const MARGINS = {left: 50, right: 50, top: 50, bottom: 50};

// Set vis dimensions for visualizations
const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right; 

// Create frame for the line chart 
const FRAME1 = d3.select("#vis1")
                 .append("svg")
                 .attr("height", FRAME_HEIGHT)
                 .attr("width", FRAME_WIDTH)
                 .attr("class", "frame"); 

// Create frame for map
const FRAME2 = d3.select("#vis2")
                 .append("svg")
                 .attr("height", FRAME_HEIGHT)
                 .attr("width", FRAME_WIDTH)
                 .attr("class", "frame"); 

// Create frame for scatterplot
const FRAME3 = d3.select("#vis3")
                 .append("svg")
                 .attr("height", FRAME_HEIGHT)
                 .attr("width", FRAME_WIDTH)
                 .attr("class", "frame"); 

// // Parse the standard precipitation index data
// d3.csv("data/Massachusetts_SPI_all.csv").then((spi) => {
//  console.log(spi)});

// Parse the precipitation pattern data
d3.csv("data/precipitation_cleaned.csv").then((precipitation) => {
	console.log(precipitation);

// Parse the combined precipitation and standard precipitation index data
d3.csv("data/combined_prep_spi.csv").then((combined) => {
  console.log(combined);

  // normalizedPrecipData = {}
  // normalizedPrecipData =
  // Object.keys(precipitation).map(function(Region) {
  //   precipitation[ columnName.toLowerCase().replace(" ", "") ] = precipitation[columnName]
  // })

  //console.log(normalizedPrecipData)

  // Set up precipitation line chart

  // Get a subset of the data based on the month
  // Choosing to show data from June across all the years (just for PM-03 since we will add filters later) 

  // Find min year (x) value
  const MIN_YEAR = d3.min(precipitation, (d) => { return parseInt(d.YEAR); });

  // Find max year (x) value
  const MAX_YEAR = d3.max(precipitation, (d) => { return parseInt(d.YEAR); });

  // Find max precipitation (y) value
  const MAX_PRECIP = d3.max(precipitation, (d) => { return parseFloat(d.JUN); });

  // Scale years for the x-axis
  const x = d3.scaleLinear() 
                     .domain([MIN_YEAR - 10, (MAX_YEAR + 10)]) // add some padding  
                     .range([0, VIS_WIDTH]); 

  // Scale the precipitation values for the y-axis
  const y = d3.scaleLinear()
                     .domain([0, (MAX_PRECIP + 1)]) // add some padding
                     .range([VIS_HEIGHT, 0]);

  // Add X axis  
  let xAxis = FRAME1.append("g") 
              .attr("transform", "translate(" + MARGINS.left + "," + (VIS_HEIGHT + MARGINS.top) + ")") 
              .call(d3.axisBottom(x).ticks(25).tickFormat(d3.format("d"))) 
              .attr("font-size", "10px")
              .selectAll("text")
                .attr("transform", "translate(-12, 10)rotate(-90)")
                .style("text-anchor", "end");

  // Add Y axis
  let yAxis = FRAME1.append("g")       
              .attr("transform", "translate(" + MARGINS.left + "," + MARGINS.bottom + ")")
              .call(d3.axisLeft(y).ticks(20))
              .attr("font-size", "10px");

  // Set color based on region
  const region_color = d3.scaleOrdinal()
    .domain(['Connecticut River', 'Northeast', 'Central', 'Southeast', 'Western', 'Cape Cod and Islands'])
    .range(['red','orange','yellow','green','indigo','pink']);

  // group the data: I want to draw one line per group
  let sumstat = 
    d3.group(precipitation, (d) => { return (d.Region); }); // group function allows to group the calculation per level of a factor

  // console.log(sumstat);
  // // color palette
  // let region_map = sumstat.keys() 
  // let regions = Array.from(region_map) // list of region names
  // console.log(regions)
  // let precip_plot = Object.fromEntries(sumstat)
  // console.log(precip_plot)


  // //Draw the line
  // FRAME1.selectAll(".line")
  //     .data(sumstat)
  //     .enter()
  //     .append("path")
  //       .attr("fill", "none")
  //       .attr("stroke", (d) => { return color(d.Region); })
  //       .attr("stroke-width", 1.5)
  //       .attr("d", ((d) => {
  //         return d3.line()
  //           .x(function(d) { return x(d.YEAR); })
  //           .y(function(d) { return y(d.JUN); })
  //           (d.values);
  //       }));

  // Plot points on scatter plot
    let myPoint1 = FRAME1.append("g")
                         .selectAll("points")  
                         .data(precipitation)  
                         .enter()       
                         .append("circle")  
                         .attr("cx", (d) => { return (x(d.YEAR) + MARGINS.left); }) 
                         .attr("cy", (d) => { return (y(d.JUN) + MARGINS.top); }) 
                         .attr("r", 3)
                         .attr("fill", (d) => { return region_color(d.Region); })
                         .attr("class", "mark")

  // Add brushing
  FRAME1.call( d3.brush()                 // Use d3.brush to initalize a brush feature
                 .extent( [ [0,0], [FRAME_WIDTH, FRAME_HEIGHT] ] ) // establish the brush area (maximum brush window = entire graph area)
                 .on("start brush", updateChart1)); // 'updateChart' is triggered every time the brush window gets altered

  // When points are brushed over in any plot, the aligned points in the other two plots get highlighted with a raised opacity and attain a purple border. 
  function updateChart1(event) {
    selection = event.selection;
    myPoint1.classed("selected", (precipitation, (d) => { return isBrushed(selection, x(d.YEAR) + MARGINS.left, y(d.JUN) + MARGINS.top ); }) )
    myPoint3.classed("selected", (precipitation, (d) => { return isBrushed(selection, x(d.YEAR) + MARGINS.left, y(d.JUN) + MARGINS.top ); }) )
  };

  // // Add the line
  // FRAME1.append("path")
  //  .datum(precipitation)
  //  .attr("fill", "none")
  //  .attr("fill", "none")
  //  .attr("stroke", "steelblue")
  //  .attr("stroke-width", 1.5)
  //  .attr("d", d3.line()
  //    .x(precipitation, (d) => { return parseInt(d.YEAR); })
  //    .y(precipitation, (d) => { return parseInt(d.JUN); })
  //    );

  // Nest the data by type
  // nested = d3.nest()
  //  .key(precipitation, (d) => { return d.Region; })
  //  .entries(data)

  // // Append line groups
  // groups = container.selectAll('g.full-line')
  //   .data(nested, (d) => { return d.key })

  // // ENTER
  // groups.enter().append('svg:g')
  // .attr( 'class', (d,i) => "full-line#{i}" )

  // // EXIT
  // d3.transition(groups.exit()).remove()

  // // TRANSITION
  // d3.transition(groups)

  // // Individual Lines
  // lines = groups.selectAll('.line').data, (d) => { return [d.values] }

  // // Append chart lines
  // // ENTER
  // lines.enter().append("svg:path")
  //  .attr("class","line")
  //  .attr("d", d3.svg.line()
  //   .interpolate(interpolate)
  //   .defined(defined)
  //   .x( (d,i) => { return  xScale(d,i) })
  //   .y( (d,i) => { return yScale(d,i) })

  // // EXIT
  // d3.transition( groups.exit().selectAll('.line') )
  //   .attr("d", 
  //     d3.svg.line()
  //       .interpolate(interpolate)
  //       .defined(defined)
  //       .x( (d,i) => { return xScale(d,i) })
  //       .y( (d,i) => { return yScale(d,i) })

  // // TRANSITION
  // d3.transition(lines)
  //   .attr("d", 
  //  d3.svg.line()
  //    .interpolate(interpolate)
  //    .defined(defined)
  //        .x( (d,i) => { return xScale(d,i) })
  //        .y( (d,i) => { return yScale(d,i) })


  // Set up precipitation vs drought level scatterplot
  // For PM-03, just focus on precipitation from June across all years (2017, 2018, 2019) and all regions 3-month SPI
  // User will know what years the points represent when we enable the tooltip function

  // Find min SPI (x) value
  const MIN_DROUGHT = d3.min(combined, (d) => { return parseFloat(d.JUN_x); });

  // Find max SPI (x) value
  const MAX_DROUGHT = d3.max(combined, (d) => { return parseFloat(d.JUN_x); });

  // Find max precipitation (y) value
  const MAX_PRECIP3 = d3.max(combined, (d) => { return parseFloat(d.JUN_y); });

  // Scale SPI for the x-axis
  const x3 = d3.scaleLinear() 
                     .domain([MIN_DROUGHT - 1, (MAX_DROUGHT + 1)]) // add some padding  
                     .range([0, VIS_WIDTH]); 

  // Scale the precipitation values for the y-axis
  const y3 = d3.scaleLinear()
                     .domain([2.5, (MAX_PRECIP3 + 1)]) // add some padding
                     .range([VIS_HEIGHT, 0]);

  // Add X axis  
  let xAxis3 = FRAME3.append("g") 
              .attr("transform", "translate(" + MARGINS.left + "," + (VIS_HEIGHT + MARGINS.top) + ")") 
              .call(d3.axisBottom(x3).ticks(5).tickFormat(d3.format("d"))) 
              .attr("font-size", "10px")
              .selectAll("text")
                .attr("transform", "translate(-12, 10)rotate(-90)")
                .style("text-anchor", "end");

  // Add Y axis
  let yAxis3 = FRAME3.append("g")       
              .attr("transform", "translate(" + MARGINS.left + "," + MARGINS.bottom + ")")
              .call(d3.axisLeft(y3).ticks(20))
              .attr("font-size", "10px");

  // Set color based on year 
  const year_color = d3.scaleOrdinal()
    .domain([2017, 2018, 2019])
    .range(['brown', 'black', 'navy']);

  // Plot points on scatter plot
  let myPoint3 = FRAME3.append("g")
                       .selectAll("points")  
                       .data(combined)  
                       .enter()       
                       .append("circle")  
                       .attr("cx", (d) => { return (x3(d.JUN_x) + MARGINS.left); }) 
                       .attr("cy", (d) => { return (y3(d.JUN_y) + MARGINS.top); }) 
                       .attr("r", 3)
                       .attr("fill", (d) => { return year_color(d.YEAR); })
                       .attr("class", "mark")

  // Add brushing
  // FRAME3.call( d3.brush()                 // Use d3.brush to initalize a brush feature
  //                .extent( [ [0,0], [FRAME_WIDTH, FRAME_HEIGHT] ] ) // establish the brush area (maximum brush window = entire graph area)
  //                .on("start brush", updateChart2)); // 'updateChart' is triggered every time the brush window gets altered

  // When points are brushed over in the precipitation vs. drought severity plot, the aligned points in the other two plots get highlighted with a raised opacity and attain 
  // purple border. 
  function updateChart2(event) {
    selection = event.selection;
    myPoint1.classed("selected", (combined, (d) => { return isBrushed(selection, x3(d.JUN_x) + MARGINS.left, y3(d.JUN_y) + MARGINS.top ); }) )
    myPoint3.classed("selected", (combined, (d) => { return isBrushed(selection, x3(d.JUN_x) + MARGINS.left, y3(d.JUN_y) + MARGINS.top ); }) )
  };

  // Returns TRUE if a point is in the selection window, returns FALSE if it is not
  function isBrushed(brush_coords, cx, cy) {
    let x0 = brush_coords[0][0],
        x1 = brush_coords[1][0],
        y0 = brush_coords[0][1],
        y1 = brush_coords[1][1];
    return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;    // indicates which points are in the selection window via booleans
  };

  // Tooltip

  // Create tooltip
  const TOOLTIP = d3.select("#vis3")
                    .append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0); 

  // Event handler
  function handleMouseover(event, d) {
    // on mouseover, make opaque 
      TOOLTIP.style("opacity", 1); 
  }

  // Event handler
  function handleMousemove(event, d) {
   // position the tooltip and fill in information 
   TOOLTIP.html("3-Month SPI: " + d.JUN_x + "<br>Precipitation: " + d.JUN_y)
           .style("left", (event.pageX + 10) + "px") //add offset
                                                       // from mouse
           .style("top", (event.pageY - 50) + "px"); 
  }

  // Event handler
  function handleMouseleave(event, d) {
    // on mouseleave, make the tooltip transparent again 
    TOOLTIP.style("opacity", 0); 
  } 

  // Add tooltip event listeners
  FRAME3.selectAll(".mark")
        .on("mouseover", handleMouseover)
        .on("mousemove", handleMousemove)
        .on("mouseleave", handleMouseleave); 
});
});