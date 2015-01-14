//skeleton for stacked bar chart: http://bl.ocks.org/mbostock/3886394
$(document).ready(function() {

  var startYear = 1960;
  var endYear = 2013;
  var genres = ['alternative', 'ballad', 'blues', 'country', 'dance', 'disco', 'electronic', 'folk', 'funk', 
                'hip-hop', 'jazz', 'metal', 'new wave', 'r&b', 'reggae', 'rock', 'soul'];
  var includedGenres = ["hip-hop", "rock", "funk"];
  var lengthMarkers = [200, 270, 1012];
  var lengthGroups = []
  for (var i = 0; i < lengthMarkers.length; i++) {
    lengthGroups.push("group"+i);
  }
  var excludedGenres;
  var selectedGenre;
  var errorType = "stderr";
  updateExcludedGenres();

  function updateExcludedGenres() {
    excludedGenres = genres.filter(function(genre) {
      return includedGenres.indexOf(genre) == -1;
    });
  }

  var margin = {top: 5, right: 65, bottom: 30, left: 40},
      width = 600 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

  var y = d3.scale.linear()
      .rangeRound([height, 0]);

  var color;

  var xAxis = d3.svg.axis()
      .ticks(5)
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(d3.format(".0%"));

  var svg = d3.select(".svgs").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + 60)
      .attr("class", "primaryChart")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  createStackedBarChart("genre");

  d3.selectAll(".stackedSelector").on("change", function () {
    svg.selectAll("*").remove();
    createStackedBarChart(this.value);
  });

  function createStackedBarChart(type) {
    color = type == "genre" ? d3.scale.category20() : d3.scale.category10();

    var dataFile = "data/" + type + "_primary_data.csv";
    var secondaryDataFile = "data/" + type + "_secondary_data.csv";

    d3.csv(dataFile, function(error, data) {
      d3.csv(secondaryDataFile, function(error, secondaryData) {
        d3.selectAll(".errorSelector").on("change", function () {
          errorType = this.value;
          refreshGraph();
        });

        x.domain(data.map(function(d) { return +d.year; }));

        var year;

        createBars();

        createAxes();

        hideExtraTickText();

        d3.select(".errorBarForm").classed("invisible", type != "length");

        if (type == "genre") {
          var filter;
          var filterRects;
          setupGenreFilter();
          var formattedSecondaryData = getFormattedGenreSecondaryData(secondaryData);
        }

        else {
          reformatSecondaryLengthData();
        }

        refreshGraph();

        function createBars() {
          year = svg.selectAll(".year")
              .data(data)
            .enter().append("g")
              .attr("class", function(d) {return type + "Year toggler year y"+d.year;})
              .attr("year", function(d) {return d.year;})
              .attr("transform", function(d) { return "translate(" + x(d.year) + ",0)"; });
        }

        function createAxes() {    
          svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);

          svg.append("g")
              .attr("class", "y axis")
              .call(yAxis);
        }

        function hideExtraTickText() {
          d3.selectAll(".x.axis text")[0].forEach(function(e) {
            if (parseInt(e.textContent) % 5 != 0) {
              e.parentNode.setAttribute("visibility", "hidden");
            }
          });
        }

        function refreshGraph() {
          if (type == "genre") {
            color.domain(genres);
          }
          else {
            color.domain(lengthGroups);
          }

          reformatData();

          updateBars();

          createLegend();

          removeSecondaryChart();

          if (type == "genre") {
            updateGenreFilter();
            createBarChart(selectedGenre, formattedSecondaryData[selectedGenre], color(selectedGenre));
          }

          else {
            makeSlider();
            createLineGraph(errorType, secondaryData);
          }

          //Reference for slider: https://gist.github.com/mbostock/6232537
          function makeSlider() {
            var margin = {top: 10, right: 60, bottom: 30, left: 40},
                width = 600 - margin.left - margin.right,
                height = 60 - margin.top - margin.bottom;
             
            var x = d3.time.scale()
                .domain([durationToDate(0), durationToDate(lengthMarkers[2])])
                .range([0, width]);
             
            var brush = d3.svg.brush()
                .x(x)
                .extent([durationToDate(lengthMarkers[0]), durationToDate(lengthMarkers[1])])
                .on("brushend", brushended)
                .on("brush", brush);
             
            var svg = d3.select(".slider").append("svg")
                .attr("class", "slider")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var leftRect = svg.append("rect")
                .attr("width", x(durationToDate(lengthMarkers[0])))
                .attr("height", height)
                .style("fill", color("group0"))

            var rightRect = svg.append("rect")
                .attr("x", x(durationToDate(lengthMarkers[1])))
                .attr("width", x(durationToDate(lengthMarkers[2])) - x(durationToDate(lengthMarkers[1])))
                .attr("height", height)
                .style("fill", color("group2"))

            var twoMinutes = function (a,b){return d3.time.minute.range(a,b,2)};

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.svg.axis()
                  .scale(x)
                  .orient("bottom")
                  .ticks(twoMinutes)
                  .tickFormat(d3.time.format("%-M:%S"))
                  .tickPadding(0))
              .selectAll("text")
                .style("text-anchor", "middle")
                .attr("dy", "1em")
             
            var gBrush = svg.append("g")
                .attr("class", "brush")
                .call(brush)
                .call(brush.event);
             
            gBrush.selectAll("rect")
                .attr("height", height);

            gBrush.selectAll(".extent")
                .style("fill", color("group1"))

            svg.append("g")
                .attr("class", "x grid")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    .tickSize(-height)
                    .tickFormat(""))
              .selectAll(".tick")
                .classed("minor", function(d) { return d.getMinutes(); });
            
            function brush() {
              if (!d3.event.sourceEvent) return;
              var extent0 = brush.extent();

              leftRect.attr("width", x(extent0[0]));

              rightRect.attr("x", x(extent0[1]))
                .attr("width", x(durationToDate(lengthMarkers[2])) - x(extent0[1]));
            }

            function brushended() {
              if (!d3.event.sourceEvent) return; // only transition after input
              var extent0 = brush.extent();

              lengthMarkers[0] = dateToDuration(extent0[0]);
              lengthMarkers[1] = dateToDuration(extent0[1]);

              reformatData();
              updateBars();
              createLegend();
            }

            function durationToDate(duration) {
              return new Date(18000000+1000*duration);
            }

            function dateToDuration(date) {
              return date.getMinutes()*60+date.getSeconds();
            }
          }

          function reformatData() {
            data.forEach(function(d) {
              var domain = type == "genre" ? includedGenres : lengthGroups;
              if (type == "length") {
                updateLengthData(d);
              }
              var y0 = 0;
              d.groups = domain.map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
              d.groups.forEach(function(d) { if (y0 != 0) {d.y0 /= y0; d.y1 /= y0; }});
            });
          }

          function updateBars() {
            var rects = year.selectAll("rect")
              .data(function(d) { return d.groups; }, nameFn);

            rects.enter().append("rect");

            rects.exit().remove();

            rects.attr("width", x.rangeBand())
  			      .attr("class", function(d) {
                if (d.name == selectedGenre) {return 'selected';}
                else {return 'notselected';}
              })
  			      .attr("class", function(d) {
                if (d.name == selectedGenre) {return 'selected';}
                else {return 'notselected';}
              })
              .on("click", function(d) {
                if (type == "genre") {  
                  if (selectedGenre == d.name) {
                    selectedGenre = null;
                  }
                  else {
                    selectedGenre = d.name;
                  }
                  refreshGraph();
                }
              })
              .transition()
              .attr("y", function(d) { return y(d.y1); })
  			      .attr("title", function(d) { return d.name; })
              .attr("height", function(d) { return y(d.y0) - y(d.y1); })
              .style("fill", function(d) { return color(d.name); });
          }

          function createLegend() {
            var legend = svg.select(".year.y2013").selectAll(".legend")
                .data(function(d) { return d.groups; }, nameFn);

            legend.enter().append("g")
              .attr("class", "legend")
              .each(function() { //hack to append two things on enter
                d3.select(this).append("line")
                  .attr("x2", 10)
                d3.select(this).append("text")
                  .attr("x", 13)
                  .attr("dy", ".35em")
              });
              d3.selectAll(".legend").selectAll("text").text(function(d) { 
                if (type == "genre") {
                  return d.name;
                }
                else {
                  var i = parseInt(d.name[5]);
                  return getFormattedLengthRange(i);
                }
              });
                
            legend.transition()
              .attr("transform", function(d) { return "translate(" + x.rangeBand() / 2 + "," + y((d.y0 + d.y1) / 2) + ")"; });

            legend.exit().remove();
          }

          function updateLengthData(d) {
            for (var i = 0; i < lengthMarkers.length; i++) {
              d["group"+i] = 0;
            }
            group = 0;
            for (i = 0; i < 100; i++) {
              var length = d["length"+i];
              if (length == "") {
                break;
              }
              length = parseInt(length);
              if (length >= lengthMarkers[group]) {
                group++;
              }
              d["group"+group]++;
            }
          }

          function updateGenreFilter() {
            filter.transition().attr("transform", function(d, i) { return "translate(" + (18 + Math.floor(getIndex(d)/3) * 80) + "," + (height + 24 + Math.floor(getIndex(d)%3) * 20) + ")"; });
            
            filterRects.style("fill", function(d) {
              if (isIncluded(d)) {
                return color(d);
              }
              else {
                return "white";
              }
            });
          }
        }

        function setupGenreFilter() {
          filter = svg.selectAll(".filter")
              .data(genres)
            .enter().append("g")
              .attr("class", "filter")

          filterRects = filter.append("rect")
            .attr("width", 16)
            .attr("height", 16)
            .style("stroke", "black")
            .style("stroke-width", 2)
            .on("click", function(d) {
              if (isIncluded(d)) {
                includedGenres.splice(includedGenres.indexOf(d), 1);
                if (d == selectedGenre) {
                  selectedGenre = null;
                }
              }
              else if (includedGenres.length == 5) {
                var tooManyGenres = $("#tooManyGenres");
                tooManyGenres.fadeIn();
                setTimeout(function() {
                  tooManyGenres.fadeOut();
                }, 2500);
                return;
              }
              else {
                includedGenres.push(d);
              }
              updateExcludedGenres();
              refreshGraph();
            });

          filter.append("text")
            .attr("x", -3)
            .attr("y", 8)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d; })
        }

        function getFormattedGenreSecondaryData(data) {
          var formattedData = {}
          var i = 0;
          outer:
          while (true) {
            var currentGenre = data[i].genre;
            formattedData[currentGenre] = []
            while (currentGenre == data[i].genre) {
              var currentArtist = data[i].artist;
              var newEntry = {"artist":currentArtist, "numHits": 0, "hits": []};
              formattedData[currentGenre].push(newEntry);
              while (currentArtist == data[i].artist) {
                newEntry["numHits"] += 1
                newEntry["hits"].push({
                  year: data[i].year,
                  rank: data[i].rank,
                  song: data[i].song
                });
                i++;
                if (i == data.length) {
                  break outer;
                }
              }
            }
          }
          return formattedData;
        }

        //converts durations to datetimes
        function reformatSecondaryLengthData() {
          var parseDate = d3.time.format("%Y").parse;

          secondaryData.forEach(function(d) {
            d.date = parseDate(d.date);
            d.year = new Date(d.date).getFullYear();
            d.ave = 18000000+1000*d.ave;
            d.stderr = 1000*d.stderr;
            d.stddev = 1000*d.stddev;
            d.conf = 1000*d.conf;
          });
        }
      });
    });
  }

  function isIncluded(genre) {
    return includedGenres.indexOf(genre) != -1
  }

  function getIndex(genre) {
    if (isIncluded(genre)) {
      return includedGenres.indexOf(genre);
    }
    else {
      return includedGenres.length + excludedGenres.indexOf(genre);
    }
  }

  function getFormattedLengthRange(index) {
    var t0
    if (index == 0) {
      t0 = 0;
    }
    else {
      t0 = lengthMarkers[index-1];
    }
    var t1 = lengthMarkers[index];
    return formatTime(t0) + " - " + formatTime(t1);
  }

  function formatTime(time) {
    var min = +parseInt(time/60);
    var sec = time%60;
    if (sec<10) {
      sec = "0" + sec;
    }
    return min + ":" + sec;
  }

  function nameFn(d) {
    return d.name;
  }

  function removeSecondaryChart() {
    d3.select("svg.secondaryChart").remove();
    d3.select("svg.slider").remove();
  }

});