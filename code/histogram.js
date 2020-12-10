var margin = {top: 80, right: 20, bottom: 60, left: 90},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#my_histogram").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

d3.csv("updatedearthquake.csv")
    .then((data) => {

        // filtering earthquakes with only high magnitude (> 4.5)
        data = data.filter(function(d, i){
            if(d["mag"] > 4.5)
                return d;
        })

        console.log(data);

        // X axis: scale and draw:
        var x = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return +d["depth"] })])
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // set the parameters for the histogram
        var histogram = d3.histogram()
            .value(function(d) { return d["depth"]; })
            .domain(x.domain())
            .thresholds(x.ticks(30));

        var bins = histogram(data);

        console.log(bins);

        // Y axis: scale and draw:
        var y = d3.scaleLinear()
            .range([height, 0]);
        y.domain([d3.min(bins, function(d) { return d.length; }), d3.max(bins, function(d) { return d.length; })]);
        svg.append("g")
            .call(d3.axisLeft(y));

        //Heading
        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text("Histogram of number of earthquake with higher magnitude according to depth");

        //x-axis labels
        svg.append("text")
            .attr("x", (width/2))
            .attr("y", height+margin.bottom-5)
            .style("text-anchor", "middle")
            .text("Depth(in km)");

        //y-axis labels
        svg.append("text")
            .attr("x", -(height/2) )
            .attr("y", 0 - margin.left/1.5)
            .attr("transform","rotate(-90)")
            .style("text-anchor", "middle")
            .text("Number of earthquakes");

        // tooltip
        var tooltip = d3.select("#my_histogram")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")

        // A function that change this tooltip when the user hover a point.
        var showTooltip = function(e,d) {
            console.log("Data : ",d)
            tooltip
                .transition()
                .duration(100)
                .style("opacity", 1)
            tooltip
                .html("Range: " + d.x0 + " - " + d.x1 + "\n" +
                    "Number of earthquakes: "+ d.length)
        }

        // A function that change this tooltip when the leaves a point
        var hideTooltip = function(d) {
            tooltip
                .transition()
                .duration(100)
                .style("opacity", 0)
        }

        // append the bar rectangles to the svg element
        svg.selectAll("rect")
            .data(bins)
            .enter()
            .append("rect")
            .attr("x", 1)
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
            .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
            .attr("height", function(d) { return height - y(d.length); })
            .style("fill", "steelblue")
            .on("mouseover", showTooltip)
            .on("mouseleave", hideTooltip)

    }).catch((error) => {
    throw error;
});
