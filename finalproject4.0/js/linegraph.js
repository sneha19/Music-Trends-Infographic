function createLineGraph(errorType, data) {
	//Reference for Line Chart: http://bl.ocks.org/mbostock/3883245#index.html
	var margin = {top: 5, right: 5, bottom: 90, left: 45},
	width = 500 - margin.left - margin.right,
	height = 510 - margin.top - margin.bottom;

	//var bisectDate = d3.bisector(function(d) { return d.date; }).left;

	var x = d3.time.scale()
	//var x = d3.scale.linear()
		.range([0, width])

	var y = d3.time.scale()
		.range([height, 0]);

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(y)
		.tickFormat(d3.time.format("%-M:%S"))
		.orient("left");

	var line = d3.svg.line()
		.x(function(d) { return x(d.date); })
		.y(function(d) { return y(d.ave); });

	var svg = d3.select(".svgs").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("class", "secondaryChart")
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	x.domain(d3.extent(data, function(d) { return d.date; }));
	//y.domain(d3.extent(data, function(d) { return d.ave; }));
	y.domain([18000000, d3.max(data, function(d) { return d.ave; }) + 100000]);

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Mean Song Duration");

	function showAllDetails() {
		d3.selectAll(".toggleable").classed("hide", false);
	}

	function hideAllDetails() {
		d3.selectAll(".toggleable").classed("hide", true);
	}

	function showSingleDetail(year) {
		d3.selectAll(".toggleable"+year).classed("hide", false);
	}

	function hideSingleDetail(year) {
		d3.selectAll(".toggleable"+year).classed("hide", true);
	}
	
	svg.append("path")
		.datum(data)
		.attr("class", "line")
		.attr("d", line);
	
	//----------------------------
	//		Data Points 
	//Reference: http://bl.ocks.org/mbostock/3887118
	//----------------------------
	//var dots = svg.selectAll(".dot");
	
	var dot = svg.selectAll(".dot")
		.data(data)
		.enter().append("circle")
		.attr("class", function(d) {return "toggleable"+d.year})
		.classed("toggleable", true)
		.classed("hide", true)
		.attr("r", 3)
		.attr("cx", function(d) { return x(d.date); })
		.attr("cy", function(d) { return y(d.ave); });

	//----------------------------
				
	
	//----------------------------
	//		Error Bars
	//Reference: http://stackoverflow.com/questions/22620064/adding-y-error-bars-to-grouped-bar-chart-with-d3-js
	//----------------------------
	var errorBarArea = d3.svg.area()
		.x(function(d) {return x(d.date); })
		.y0(function(d) {return y(d.ave - d[errorType]); })
		.y1(function(d) {return y(d.ave + d[errorType]); })
		.interpolate("linear");

	var errorBars = svg.selectAll("path.errorBar")
		.data(data);

	errorBars.enter().append("path").attr("class", "errorBar");

	errorBars.attr("d", function (d) {return errorBarArea([d]); })
		//turn the data into a one-element array 
		//and pass it to the area function
		.attr("stroke", "red")
		.attr("stroke-width", 2.5)
		.attr("class", function(d) {return "toggleable"+d.year})
		.classed("toggleable", true)
		.classed("hide", true)
	//----------------------------
	
	d3.selectAll(".toggler")
		.on("mouseover", function() {
			d3.select(this).selectAll("rect").attr("class", "selected");
			showSingleDetail(d3.select(this).attr("year"));
		})
		.on("mouseout", function() {
			d3.select(this).selectAll("rect").attr("class", "unselected");
			hideSingleDetail(d3.select(this).attr("year"));
		});

	d3.select(".secondaryChart").on("mouseover", showAllDetails)
		.on("mouseout", hideAllDetails);

}