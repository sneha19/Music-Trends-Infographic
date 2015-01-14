//skeleton for bar chart: http://bl.ocks.org/mbostock/3885304
function createBarChart(genre, data, color) {  
  if (!genre) {
    return;
  }

  var numArtists = 10;
  var numSongsOnDemand = 5;

  data = data.slice(0, numArtists);

  var margin = {top: 5, right: 0, bottom: 90, left: 45},
      width = 500 - margin.left - margin.right,
      height = 510 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .5);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(d3.format("2s"));

  var svg = d3.select(".svgs").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("class", "secondaryChart")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  	$page = 'datafiles/'+genre+'.csv';

  x.domain(data.map(function(d) { return d.artist; }));
  y.domain([0, d3.max(data, function(d) { return parseInt(d.numHits)})]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("transform", "rotate(-25)")
      .attr("dy", ".60em");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Number of billboard hits from 1960 to today");

  var bar = svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.artist)})
      .attr("width", x.rangeBand())
      .attr("y", function(d) {return y(d.numHits)})
      .attr("height", function(d) {return height - y(d.numHits)})
      .style("fill", color)

	// mouseover function  
	bar.on('mouseover',function(){
	  var table = "<table><tr><div class='top'>Top Songs by " + d3.select(this).data()[0].artist + "</div></tr>";
    table += "<tr><th>Year</th><th>Rank</th><th>Song</th></tr>";
    var hits = d3.select(this).data()[0].hits;
	  for(var k =0; k<numSongsOnDemand && k < hits.length ;k++)
	  {
	    var rank = hits[k].rank;
		  var year = hits[k].year;
      var song = hits[k].song;
	    table += "<tr><td>"+year+"</td><td>"+rank+"</td><td>"+song+"</td></tr>";
	  }
	  table += "</table>";
	  $('.infodiv').append(table);
	  
	  $(this).on('mousemove',function(e){
	    var xval = e.pageX;
	    var yval = e.pageY;
	    $('.infodiv').css({'right': window.innerWidth - xval + 5 ,'top':yval-5});
	  });
	})
  .on('mouseout',function(){
	  $('.infodiv').text('');
	});
}