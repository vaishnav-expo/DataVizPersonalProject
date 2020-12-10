var margin = {top: 70, right: 30, bottom: 20, left: 120},
    width = 1100 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

// scale for radius of the symbol (bubble)
var radius = d3.scale.sqrt()
    .domain([0, 400])
    .range([0, 10]);

var path = d3.geo.path();

var svg = d3.select("#my_symbolmap").append("svg")
    .attr("width", width + 80)
    .attr("height", height);

var div = d3.select("#my_symbolmap").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

queue()
    .defer(d3.json, "us.json")
    .defer(d3.json, "earthquakecntcentroid.json")
    .defer(d3.csv, "updatedearthquake.csv")
    .await(ready);

function ready(error, us, centroid, data) {
    if (error) throw error;

    //Moves selection to front
    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };

    //Moves selection to back
    d3.selection.prototype.moveToBack = function() {
        return this.each(function() {
            var firstChild = this.parentNode.firstChild;
            if (firstChild) {
                this.parentNode.insertBefore(this, firstChild);
            }
        });
    };

    // adding the us states from the topojson which is opensource
    svg.append("path")
        .attr("class", "states")
        .datum(topojson.feature(us, us.objects.states))
        .attr("d", path);

    var mapStateCount = {};

    // preprocess
    data.forEach((i,k) => {
        if(!(i["1"] in mapStateCount)){
            mapStateCount[i["1"]] = 1;
        }
        else{
            mapStateCount[i["1"]] = mapStateCount[i["1"]] + 1;
        }
    })

    console.log("Map of counts : ",mapStateCount);

    //heading for legend
    svg.append("text").attr("x",width - 60).attr("y",25).text("Number of earthquakes").style("font-size", "15px").attr("alignment-baseline","middle");

    var formatComma = d3.format(",")

    // scale for legend
    var sqrtSize = d3.scale.sqrt()
        .domain([80, 4000])
        .range([5, 30])

    //using d3 legend
    svg.append("g")
        .attr("class", "legendSize")
        .attr("transform", "translate(920, 40)");

    var legendSize = d3.legend.size()
        .scale(sqrtSize)
        .shape('circle')
        .shapePadding(15)
        .labelOffset(20)
        .labelFormat(d3.format(","))
        .orient('vertical');

    // plotting legend
    svg.select(".legendSize")
        .call(legendSize);
    svg.select(".legendSize").selectAll("circle").attr("fill", "#4682b4");

    //plotting symbols on the map according to size of the bubble respect to number of earthquakes and interaction tooltip for hovering
    svg.selectAll(".symbol")
        .data(centroid.features.sort(function(a, b) { return b.properties.earthquakecount - a.properties.earthquakecount; }))
        .enter().append("path")
        .attr("class", "symbol")
        .attr("d", path.pointRadius(function(d) { return radius(d.properties.earthquakecount); }))
        .on("mouseover", function(d) {
            var sel = d3.select(this);
            d3.select("path");
            sel.moveToFront();

            d3.select(this).transition().duration(300).style({'opacity': 1, 'stroke': 'black', 'stroke-width': 1.5});
            div.transition().duration(300)
                .style("opacity", 1)
            div.text(d.properties.name + ": " + formatComma(d.properties.earthquakecount))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY -30) + "px");
        })
        .on("mouseout", function() {
            var sel = d3.select(".tooltip");
            sel.moveToBack();
            d3.select(this)
                .transition().duration(300)
                .style({'opacity': 1, 'stroke': 'white', 'stroke-width': 1});
            div.transition().duration(300)
                .style("opacity", 0);
        });
}