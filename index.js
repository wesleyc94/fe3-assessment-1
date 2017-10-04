/* Gebaseerd op https://bl.ocks.org/mbostock/4063269 van Mike Bostock
De data die ik heb gebruikt is afkomstig van wikipedia.org. "Top languages by number of speaker" 
*/

// Hier zijn de variabelen aangemaakt om svg te gaan gebruiken met de breedte en hoogte aangegeven.
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var format = d3.format(",d");

// Met deze scale ontstaat er een nieuwe scale met een range om de kleur te bepalen.
var color = d3.scaleOrdinal(d3.schemeCategory20c);
// Met d3pack wordt er een nieuwe layout gemaakt.
var pack = d3.pack()
    .size([width, height])
    .padding(1.5);

//De records worden uit het CSV bestand gehaald. Verder zoekt het naar "Speakers" en "Languages".
d3.csv("index.csv", function(d) {
        d.speakers = +d.speakers;
        if (d.speakers) return d;
    },
    function(error, classes) {
        if (error) throw error;
        // Met deze code ontstaat er een hiërarchie met cirkels
        var root = d3.hierarchy({ children: classes })
            .sum(function(d) { return d.speakers; })
            .each(function(d) {
                if (id = d.data.language) {
                    var id, i = id.lastIndexOf(".");
                    d.language = id;
                    d.package = id.slice(0, i);
                    d.class = id.slice(i + 1);
                }
            });

        // Bij elke record worden er elementen aangemaakt om erbij te koppelen, zo ontstaat de cirkel met de tekst.
        var node = svg.selectAll(".node")
            .data(pack(root).leaves())
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        // Hier wordt de cirkel aangemaakt
        node.append("circle")
            .attr("id", function(d) { return d.language; })
            .attr("r", function(d) { return d.r; })
            .style("fill", function(d) { return color(d.package); });
        // Deze clippath dient als de hover als je over de cirkel heen gaat, Hierop komt de tekst te staan
        node.append("clipPath")
            .attr("id", function(d) { return "clip-" + d.language; })
            .append("use")
            .attr("xlink:href", function(d) { return "#" + d.language; });
        // Het aanmaken van de tekst
        node.append("text")
            .attr("clip-path", function(d) { return "url(#clip-" + d.language + ")"; })
            .selectAll("tspan")
            .data(function(d) { return d.class.split(/(?=[A-Z][^A-Z])/g); })
            .enter().append("tspan")
            .attr("x", 0)
            .attr("y", function(d, i, nodes) { return 13 + (i - nodes.length / 2 - 0.5) * 10; })
            .text(function(d) { return d; });
        // De titel die aangemaakt is de hover op een cirkel. Hier returnen de waarde Language + speaker uit de velden van het CSV bestand.
        node.append("title")
            .text(function(d) { return d.language + "\n" + format(d.value); });

});
