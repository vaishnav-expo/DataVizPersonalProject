var margin = {top: 150, right: 20, bottom: 40, left: 100},
    width = 750 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

var cities = ["CA","Nevada","Idaho"];

var monthsSet = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

var months = {
    1 : "Jan",
    2 : "Feb",
    3 : "Mar",
    4 : "Apr",
    5 : "May",
    6 : "Jun",
    7 : "Jul",
    8 : "Aug",
    9 : "Sep",
    10 : "Oct",
    11 : "Nov",
    12 : "Dec"
};

var years = [2018,2019,2020];

var svg = d3.select("#my_heatmap").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

d3.csv("monthyearcnt.csv")
    .then((data) => {
        console.log(data);

        data = data.filter(function(d, i){ return years.includes(+d["year"]) })

        console.log(data);

        var trial = d3.rollups(data, v=> d3.sum(v,d=>d["numOfEarthquakes"]), d=> {
                if(cities.includes(d["place"]))
                    return d["place"];
            }, d => Number(d["month"]),
            d => Number(d["year"]));
        console.log(trial);

        var maxVal = 0;
        var finalData = [[]];
        trial.forEach((val1,idx1) => {
            val1[1].forEach((val2,idx2) => {
                let count = 0;
                val2[1].forEach((val3,idx3) => {
                    console.log("val ",val3[1]);
                    count = count + Number(val3[1]);
                });

                finalData.push([val1[0],months[val2[0]],count]);
                if(val1[0] !== undefined)
                    maxVal = Math.max(maxVal,count);
            });
        });

        console.log("Max val : ",maxVal);

        finalData = finalData.filter(function( element ) {
            return element[0] !== undefined;
        });

        console.log(finalData);

        //Heading
        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", (margin.top / 2) - 1200)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text("Heat Map of total number of earthquakes in top three states according to months");

        //x-axis labels
        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", height+margin.bottom)
            .style("text-anchor", "middle")
            .text("Months");

        //x-axis
        var xScale = d3.scaleBand().domain(monthsSet).range([0, width]).padding(0.05);
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale).tickSize(0))
            .select(".domain").remove()

        //y-axis labels
        //Building y scales and axis:
        var yScale = d3.scaleBand()
            .range([ height, 0 ])
            .domain(cities)
            .padding(0.05);
        svg.append("g")
            .style("font-size", 15)
            .call(d3.axisLeft(yScale).tickSize(0))
            .select(".domain").remove();

        //Scale for different colour for different values
        var colorScale = d3.scaleQuantile()
            // .interpolator(d3.interpolateRgb("#FFcccc", "#FF0000"))
            .domain([0,20,40,200,400,2000])
            .range(["#fef0d9","#fdd49e","#fdbb84","#fc8d59", "#e34a33", "#b30000"]);

        //creating gradient legend
        var countScale = d3.scaleQuantile()
            .domain([0,20,40,200,400,2000])
            .range([0, width])

        var numStops = 10;
        countRange = countScale.domain();
        countRange[2] = countRange[1] - countRange[0];
        countPoint = [];
        for(var i = 0; i < numStops; i++) {
            countPoint.push(i * countRange[2]/(numStops-1) + countRange[0]);
        }

        svg.append("defs")
            .append("linearGradient")
            .attr("id", "legend-delay")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "100%").attr("y2", "0%")
            .selectAll("stop")
            .data(d3.range(numStops))
            .enter().append("stop")
            .attr("offset", function(d,i) {
                return countScale( countPoint[i] )/width;
            })
            .attr("stop-color", function(d,i) {
                return colorScale( countPoint[i] );
            });


        var legendWidth = Math.min(width*0.8, 400);

        //drawing the gradient legend
        var legendsvg = svg.append("g")
            .attr("class", "legendWrapper")
            .attr("transform", "translate(" + (width/2) + "," + (70) + ")");

        legendsvg.append("rect")
            .attr("class", "legendRect")
            .attr("x", -legendWidth/2)
            .attr("y", -100)
            .attr("width", legendWidth)
            .attr("height", 10)
            .style("fill", "url(#legend-delay)");

        legendsvg.append("text")
            .attr("class", "legendTitle")
            .attr("x", -10)
            .attr("y", -120)
            .style("text-anchor", "middle")
            .text("Number of earthquakes");

        var xScale1 = d3.scaleQuantile()
            .range([-legendWidth/2, legendWidth/2])
            .domain([0,20,40,200,400,2000]);

        var xAxis = d3.axisBottom()
            .ticks(5)
            .scale(xScale1);

        legendsvg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0 , "+ (-90) + ")")
            .call(xAxis);

        // create a tooltip
        var tooltip = d3.select("#my_heatmap")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")

        var mouseover = function(d) {
            tooltip.style("opacity", 1)
        }

        var formatComma = d3.format(",")

        var mousemove = function(e,d) {
            tooltip
                .html("Number of earthquakes : " +formatComma(d[2]))
        }

        var mouseleave = function(d) {
            tooltip.style("opacity", 0)
        }

        //Adding the squares with colour
        svg.selectAll()
            .data(finalData)
            .enter()
            .append("rect")
            .attr("x", function(d) {return xScale(d[1]) })
            .attr("y", function(d) {return yScale(d[0]) })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", xScale.bandwidth() )
            .attr("height", yScale.bandwidth() )
            .style("fill", function(d) { return colorScale(d[2])} )
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

    }).catch((error) => {
    throw error;
});