function drawScatterplot(data) {
    // Set dimensions and margins
    const margin = { top: 50, right: 40, bottom: 60, left: 70 },
        width = 1200 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // Remove old SVG container 
    d3.select("#scatterplot").select("svg").remove();

    // Create new SVG container
    const svg = d3.select("#scatterplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // VARIABLES
    let dataPoints, scales;
    let x, y, sizeScale, colorScale;
    let x_axis, y_axis;
    let vLine, hLine;
    let tooltip, legend;
    let scatter, zoom;
    let isZooming = false;
    let mouseEventHandlers;
    let selectedType = null;
    let selectedCircle = null;
    let currentTransform = d3.zoomIdentity;

    // MAIN EXECUTION
    dataPoints = getData(data);
    scales = getScales();
    initializeChart();

    tooltip = getTooltip();
    scatter = getClipPath();
    initializeGuideLines();

    mouseEventHandlers = getMouseEventHandlers();

    drawPoints();
    drawLegend();
    initializeZoom();

    // FUNCTION DEFINITIONS
    function initializeChart() {
        // X: Retail Price (0 to max rounded to 10k)
        x = d3.scaleLinear()
            .domain([0, scales.maxPrice])
            .range([0, width]);

        // Y: City Miles (0 to max rounded to 10)
        y = d3.scaleLinear()
            .domain([0, scales.maxCity])
            .range([height, 0]);

        // Size scale for Engine Size (liters)
        const base = Math.min(width, height);
        const minRadius = base * 0.01;
        const maxRadius = base * 0.03;

        sizeScale = d3.scalePow()
            .exponent(5 / 7)
            .domain([scales.minEngine, scales.maxEngine])
            .range([minRadius, maxRadius]);

        // Color coding for Type of Vehicle
        const types = Array.from(new Set(dataPoints.map(d => d.Type).filter(Boolean)));
        colorScale = d3.scaleOrdinal()
            .domain(types)
            .range(d3.schemeCategory10);

        // X and Y axes
        x_axis = svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(20).tickFormat(d3.format(".2s")));

        y_axis = svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(y).ticks(10));

        // Labels
        svg.append("text")
            .attr("class", "x axis-label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + 40)
            .text("Retail Price (USD)");

        svg.append("text")
            .attr("class", "y axis-label")
            .attr("text-anchor", "middle")
            .attr("x", -height / 2)
            .attr("y", -40)
            .attr("transform", "rotate(-90)")
            .text("City Miles Per Gallon (MPG)");
    }

    function initializeGuideLines() {
        // Vertical guide lines
        vLine = scatter.append("line")
            .attr("stroke", "black")
            .attr("stroke-dasharray", "4 4")
            .attr("stroke-width", 1)
            .attr("opacity", 0)
            .style("pointer-events", "none");

        // Horizontal guide lines
        hLine = scatter.append("line")
            .attr("stroke", "black")
            .attr("stroke-dasharray", "4 4")
            .attr("stroke-width", 1)
            .attr("opacity", 0)
            .style("pointer-events", "none");
    }

    function initializeZoom() {
        // Zoom functionality
        zoom = d3.zoom()
            .scaleExtent([0.5, 50])
            .extent([[0, 0], [width, height]])
            .translateExtent([[0, 0], [width, height]])
            .on("zoom", updateChart);

        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .lower()
            .call(zoom);
    }

    function getData(d) {
        // Filter out data points with null values 
        return d.filter(d => d.Retail_Price != null && d.City_Miles != null && d.Engine_Size != null
            && d.AWD != null && d.RWD != null && d.Dealer_Cost != null
        );
    }

    function getScales() {
        const maxPrice = d3.max(dataPoints, d => d.Retail_Price);
        const maxPriceRounded = maxPrice % 10000 === 0 ? maxPrice + 10000 : Math.ceil(maxPrice / 10000) * 10000;

        // console.log("Max Price:", maxPrice, "Rounded:", maxPriceRounded);

        const maxCity = d3.max(dataPoints, d => d.City_Miles);
        const maxCityRounded = maxCity % 5 === 0 ? maxCity + 5 : Math.ceil(maxCity / 5) * 5;

        // console.log("Max City Miles:", maxCity, "Rounded:", maxCityRounded);

        const minEngineSize = d3.min(dataPoints, d => d.Engine_Size);
        const maxEngineSize = d3.max(dataPoints, d => d.Engine_Size);

        // console.log("Engine Size - Min:", minEngineSize, "Max:", maxEngineSize);

        const scales = {};
        scales.maxPrice = maxPriceRounded;
        scales.maxCity = maxCityRounded;
        scales.minEngine = minEngineSize;
        scales.maxEngine = maxEngineSize;

        return scales;
    }

    function getTooltip() {
        // Remove old tooltip if exists
        d3.select("#scatterplot").selectAll(".tooltip").remove();

        // Create new tooltip
        return d3.select("#scatterplot")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("position", "absolute")
            .style("pointer-events", "none");
    }

    function getClipPath() {
        // Create scatter group with clip path
        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("x", 0)
            .attr("y", 0);

        return svg.append("g")
            .attr("clip-path", "url(#clip)");
    }

    function getMouseEventHandlers() {
        function mouseOver(d) {
            if (isZooming) return; // not hover if zooming
            if (selectedCircle) return; // not hover if a circle is selected
            if (selectedType && selectedType !== d.Type) return; // not hover if different type is selected

            // Show tooltip
            tooltip
                .style("opacity", 1)

            // Dim all other circles
            d3.selectAll("circle")
                .attr("fill-opacity", c => {
                    if (selectedType && c.Type !== selectedType) {
                        return 0.1;
                    }
                    return 0.5;
                })
                .attr("stroke-opacity", c => {
                    if (selectedType && c.Type !== selectedType) {
                        return 0.1;
                    }
                    return 1;
                });

            // Highlight hovered circle
            d3.select(this)
                .attr("stroke-width", 2)
                .attr("fill-opacity", 1)
                .attr("stroke-opacity", 1);

            vLine.attr("opacity", 1);
            hLine.attr("opacity", 1);
        }

        function mouseMove(d) {
            if (isZooming) return; // not hover if zooming
            if (selectedCircle) return; // not hover if a circle is selected
            if (selectedType && selectedType !== d.Type) return; // not hover if different type is selected

            // Update tooltip position and content
            tooltip
                .html(
                    "Name: " + d.Name + "<br/>" +
                    "Type: " + d.Type + "<br/>" +
                    "Retail Price: $" + d.Retail_Price.toLocaleString() + "<br/>" +
                    "City MPG: " + d.City_Miles + "<br/>" +
                    "Engine Size: " + d.Engine_Size + " L"
                )
                .style("left", (d3.event.pageX + 15) + "px")
                .style("top", (d3.event.pageY - 28) + "px");

            // Update guide lines
            const xScale = currentTransform.rescaleX(x);
            const yScale = currentTransform.rescaleY(y);
            updateGuideLines(d, xScale, yScale);
        };

        function mouseLeave(d) {
            if (isZooming) return; // not hover if zooming
            if (selectedCircle) return; // not hover if a circle is selected
            if (selectedType && selectedType !== d.Type) return; // not hover if different type is selected

            // Hide tooltip
            tooltip
                .style("opacity", 0);

            // Reset all circles
            d3.selectAll("circle")
                .attr("fill-opacity", c => {
                    if (selectedType && c.Type !== selectedType) {
                        return 0.1;
                    }
                    if (selectedType === c.Type) {
                        return 0.8;
                    }
                    return 0.5;
                })
                .attr("stroke-opacity", c => {
                    if (selectedType && c.Type !== selectedType) {
                        return 0.1;
                    }
                    return 1;
                });

            // Reset hovered circle
            d3.select(this)
                .attr("stroke-width", 1)
                .attr("fill-opacity", c => {
                    if (selectedType && c.Type !== selectedType) {
                        return 0.1;
                    }
                    if (selectedType === c.Type) {
                        return 0.8;
                    }
                    return 0.5;
                });

            // Hide guide lines
            vLine.attr("opacity", 0);
            hLine.attr("opacity", 0);
        }

        function mouseCircleClick(d) {
            if (isZooming) return; // not click if zooming

            if (selectedType && d.Type !== selectedType) return; // not click if different type is selected

            // select the same circle --> deselect
            if (selectedCircle === this) {
                selectedCircle = null;
                d3.select("#details-panel").html("");

                scatter.selectAll("circle")
                    .sort((a, b) => {
                        const aSel = a.Type === selectedType ? 1 : 0;
                        const bSel = b.Type === selectedType ? 1 : 0;

                        if (aSel !== bSel) return aSel - bSel;
                        return a._order - b._order;

                    })
                    .attr("stroke-width", 1)
                    .attr("fill-opacity", c => {
                        if (selectedType && c.Type !== selectedType) {
                            return 0.1;
                        }
                        return 0.5;
                    })
                    .attr("stroke-opacity", c => {
                        if (selectedType && c.Type !== selectedType) {
                            return 0.1;
                        }
                        return 1;
                    });

                d3.select(this)
                    .attr("stroke-width", 2)
                    .attr("fill-opacity", 1);

                tooltip
                    .style("opacity", 0);

                return;
            }

            // select a different circle --> ignore
            if (selectedCircle && selectedCircle !== this) {
                return;
            }

            // select a new circle --> highlight
            selectedCircle = this;

            scatter.selectAll("circle")
                .attr("fill-opacity", 0.1)
                .attr("stroke-opacity", 0.1)

            d3.select(this)
                .raise()
                .attr("fill-opacity", 1)
                .attr("stroke-opacity", 1)
                .attr("stroke-width", 4);

            tooltip
                .style("opacity", 0);

            showDetails(d);
        }

        function mouseTypeClick(type) {
            if (selectedCircle) return; // not click if a circle is selected

            // select same type --> deselect    
            if (selectedType === type) {
                selectedType = null;

                scatter.selectAll("circle")
                    .attr("fill-opacity", 0.5)
                    .attr("stroke-opacity", 1)
                    .attr("stroke-width", 1)
                    .sort((a, b) => a._order - b._order);

                legend.selectAll(".color-legend g rect")
                    .attr("fill-opacity", 1);
                legend.selectAll(".color-legend g text")
                    .attr("fill-opacity", 1)
                    .style("font-weight", "normal");

                return;
            }

            // select a new type --> highlight
            selectedType = type;

            legend.selectAll(".color-legend g rect")
                .attr("fill-opacity", 0.2);
            legend.selectAll(".color-legend g text")
                .attr("fill-opacity", 0.2)
                .style("font-weight", "normal");

            d3.select(this).select("rect")
                .attr("fill-opacity", 1);
            d3.select(this).select("text")
                .attr("fill-opacity", 1)
                .style("font-weight", "bold");

            scatter.selectAll("circle")
                .attr("fill-opacity", c => c.Type === selectedType ? 0.8 : 0.1)
                .attr("stroke-opacity", c => c.Type === selectedType ? 1 : 0.1)
                .attr("stroke-width", 1);

            scatter.selectAll("circle").sort((a, b) => {
                const aSel = a.Type === selectedType ? 1 : 0;
                const bSel = b.Type === selectedType ? 1 : 0;

                if (aSel !== bSel) return aSel - bSel;

                return a._order - b._order;
            });
        }

        return {
            mouseOver: mouseOver,
            mouseMove: mouseMove,
            mouseLeave: mouseLeave,
            mouseCircleClick: mouseCircleClick,
            mouseTypeClick: mouseTypeClick
        }
    }

    function drawPoints() {
        // Assign order based on Engine Size for proper layering
        const dataPointsSorted = dataPoints.slice().sort((a, b) => b.Engine_Size - a.Engine_Size);
        dataPointsSorted.forEach((d, i) => d._order = i);

        // Draw circles
        scatter.selectAll("circle")
            .data(dataPointsSorted)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.Retail_Price))
            .attr("cy", d => y(d.City_Miles))
            .attr("r", d => sizeScale(d.Engine_Size))
            .attr("fill", d => colorScale(d.Type))
            .attr("fill-opacity", 0.5)
            .attr("stroke", "black")
            .attr("stroke-opacity", 1)
            .attr("stroke-width", 1)
            .on("mouseover", mouseEventHandlers.mouseOver)
            .on("mousemove", mouseEventHandlers.mouseMove)
            .on("mouseleave", mouseEventHandlers.mouseLeave)
            .on("click", mouseEventHandlers.mouseCircleClick);
    }

    function drawLegend() {
        // Remove old legend if exists
        svg.select("#legend").remove();

        // Create new legend
        legend = svg.append("g")
            .attr("id", "legend")
            .attr("transform", `translate(${width - 125}, 10)`);

        // Color legend
        function colorLegend() {
            const types = colorScale.domain();
            const rowHeight = 18;

            const colorLegend = legend.append("g")
                .attr("class", "color-legend");

            types.forEach((type, i) => {
                const g = colorLegend.append("g")
                    .attr("transform", `translate(0, ${i * rowHeight})`)
                    .style("cursor", "pointer")
                    .on("click", function () {
                        mouseEventHandlers.mouseTypeClick.call(this, type);
                    });

                g.append("rect")
                    .attr("width", 14)
                    .attr("height", 14)
                    .attr("fill", colorScale(type));

                g.append("text")
                    .attr("x", 20)
                    .attr("y", 12)
                    .style("font-size", "12px")
                    .style("cursor", "pointer")
                    .text(type);
            });
        }
        colorLegend();
    }

    function updateChart() {
        if (selectedCircle) return; // not zoom if a circle is selected

        // Indicate zooming state
        currentTransform = d3.event.transform;

        // Update scales
        const newX = currentTransform.rescaleX(x);
        const newY = currentTransform.rescaleY(y);

        // Update axes
        x_axis.call(d3.axisBottom(newX).ticks(20).tickFormat(d3.format(".2s")));
        y_axis.call(d3.axisLeft(newY).ticks(10));

        // Update points
        scatter.selectAll("circle")
            .attr("cx", d => newX(d.Retail_Price))
            .attr("cy", d => newY(d.City_Miles));
    }

    function updateGuideLines(d, xScale, yScale) {
        // Update guide line positions
        const xPos = xScale(d.Retail_Price);
        const yPos = yScale(d.City_Miles);

        // Update vertical line
        vLine
            .attr("x1", xPos)
            .attr("x2", xPos)
            .attr("y1", height)
            .attr("y2", yPos);

        // Update horizontal line
        hLine
            .attr("x1", 0)
            .attr("x2", xPos)
            .attr("y1", yPos)
            .attr("y2", yPos);
    }

    function showDetails(d) {
        // Populate details panel with selected data point information
        d3.select("#details-panel").html(`
        <h3>${d.Name}</h3>
        <p><strong>Type:</strong> ${d.Type}</p>
        <p><strong>AWD:</strong> ${d.AWD === true ? "Yes" : d.AWD === false ? "No" : "N/A"}</p>
        <p><strong>RWD:</strong> ${d.RWD === true ? "Yes" : d.RWD === false ? "No" : "N/A"}</p>
        <p><strong>Retail Price:</strong> $${d.Retail_Price.toLocaleString()}</p>
        <p><strong>Dealer Cost:</strong> $${d.Dealer_Cost != null ? d.Dealer_Cost.toLocaleString() : "N/A"}</p>
        <p><strong>Engine Size:</strong> ${d.Engine_Size} L</p>
        <p><strong>Cylinders:</strong> ${d.Cyl != null ? d.Cyl : "N/A"}</p>
        <p><strong>Horsepower:</strong> ${d.Horsepower != null ? d.Horsepower : "N/A"}</p>
        <p><strong>City MPG:</strong> ${d.City_Miles}</p>
        <p><strong>Highway MPG:</strong> ${d.Highway_Miles != null ? d.Highway_Miles : "N/A"}</p>
        <p><strong>Weight:</strong> ${d.Weight != null ? d.Weight.toLocaleString() + " lbs" : "N/A"}</p>
        <p><strong>Wheel Base:</strong> ${d.Wheel_Base != null ? d.Wheel_Base + " inches" : "N/A"}</p>
        <p><strong>Length:</strong> ${d.Len != null ? d.Len + " inches" : "N/A"}</p>
        <p><strong>Width:</strong> ${d.Width != null ? d.Width + " inches" : "N/A"}</p>
    `);
    }

}
