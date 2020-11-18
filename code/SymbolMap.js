var margin = {top: 70, right: 30, bottom: 20, left: 120},
    width = 900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var radius = d3.scale.sqrt()
    .domain([0, 400])
    .range([0, 10]);

var path = d3.geo.path();

var svg = d3.select("#my_symbolmap").append("svg")
    .attr("width", width)
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

    //Moves selction to back
    d3.selection.prototype.moveToBack = function() {
        return this.each(function() {
            var firstChild = this.parentNode.firstChild;
            if (firstChild) {
                this.parentNode.insertBefore(this, firstChild);
            }
        });
    };

    svg.append("path")
        .attr("class", "states")
        .datum(topojson.feature(us, us.objects.states))
        .attr("d", path);

    var mapStateCount = {};

    data.forEach((i,k) => {
        if(!(i["1"] in mapStateCount)){
            mapStateCount[i["1"]] = 1;
        }
        else{
            mapStateCount[i["1"]] = mapStateCount[i["1"]] + 1;
        }
    })

    console.log("Map of counts : ",mapStateCount);

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
            div.text(d.properties.name + ": " + d.properties.earthquakecount)
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