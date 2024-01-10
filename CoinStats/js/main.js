const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 }
const WIDTH = 900 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM

let formattedData

const svg = d3.select("#chart-area").append("svg")
	.attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
	.attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
	.attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

// X label
const xLabel = g.append("text")
	.attr("class", "x axis-label")
	.attr("x", WIDTH / 2)
	.attr("y", HEIGHT + 60)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Time")

// Y label
const yLabel = g.append("text")
	.attr("class", "y axis-label")
	.attr("x", - (HEIGHT / 2))
	.attr("y", - 60)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text("24 Hour Trading Volume ($)")

// time parser for x-scale
const parseTime = d3.timeParse("%Y")
// for tooltip
const bisectDate = d3.bisector(d => d.date).left

// scales
const x = d3.scaleTime().range([0, WIDTH])
const y = d3.scaleLinear().range([HEIGHT, 0])

// axis generators
const xAxisCall = d3.axisBottom()
const yAxisCall = d3.axisLeft()
	.ticks(6)
	.tickFormat(d => `${parseInt(d / 1000)}k`)

// axis groups
const xAxis = g.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT})`)
const yAxis = g.append("g")
	.attr("class", "y axis")

// y-axis label
yAxis.append("text")
	.attr("class", "axis-title")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.attr("dy", ".71em")
	.style("text-anchor", "end")
	.attr("fill", "#5D6971")
	.text("Population)")

// line path generator
const line = d3.line()
	.x(d => x(d.year))
	.y(d => y(d.value))

$(function () {
	// Initialize the range slider
	$("#date-slider").slider({
		range: true,
		min: new Date("12/01/2000").getTime(), // set the minimum date in milliseconds
		max: new Date().getTime(), // set the maximum date to the current date
		values: [new Date("12/05/2013").getTime(), new Date("10/31/2017").getTime()], // initial range values in milliseconds
		slide: function (event, ui) {
			// Format the dates and update the labels as the slider is moved
			$("#dateLabel1").text(formatDate(ui.values[0]));
			$("#dateLabel2").text(formatDate(ui.values[1]));
		}
	});

	// Function to format date in dd/mm/yyyy format
	function formatDate(milliseconds) {
		var date = new Date(milliseconds);
		var day = date.getDate();
		var month = date.getMonth() + 1; // January is 0!
		var year = date.getFullYear();

		return (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year;
	}
});

d3.json("data/coins.json").then(data => {
	const coin = $("#coin-select").val()
	const analysisVar = $("#var-select").val()

	formattedData = data[coin].filter(d => {
		const dataExists = (d.date && d[analysisVar])
		return dataExists
	}).map(d => {
		let parts = d.date.split('/');
		let reformattedDate = `${parts[1]}/${parts[0]}/${parts[2]}`;
		d.date = new Date(reformattedDate)
		d.year = d.date.getFullYear()
		d.value = Number(d[analysisVar])
		return d
	})

	console.log(formattedData)

	// set scale domains
	x.domain(d3.extent(formattedData, d => d.date))
	y.domain([
		d3.min(formattedData, d => d.value) / 1.005,
		d3.max(formattedData, d => d.value) * 1.005
	])

	// generate axes once scales have been set
	xAxis.call(xAxisCall.scale(x))
	yAxis.call(yAxisCall.scale(y))

	// add line to chart
	g.append("path")
		.attr("class", "line")
		.attr("fill", "none")
		.attr("stroke", "grey")
		.attr("stroke-width", "3px")
		.attr("d", line(formattedData))

	/******************************** Tooltip Code ********************************/

	const focus = g.append("g")
		.attr("class", "focus")
		.style("display", "none")

	focus.append("line")
		.attr("class", "x-hover-line hover-line")
		.attr("y1", 0)
		.attr("y2", HEIGHT)

	focus.append("line")
		.attr("class", "y-hover-line hover-line")
		.attr("x1", 0)
		.attr("x2", WIDTH)

	focus.append("circle")
		.attr("r", 7.5)

	focus.append("text")
		.attr("x", 15)
		.attr("dy", ".31em")

	g.append("rect")
		.attr("class", "overlay")
		.attr("width", WIDTH)
		.attr("height", HEIGHT)
		.on("mouseover", () => focus.style("display", null))
		.on("mouseout", () => focus.style("display", "none"))
		.on("mousemove", mousemove)

	function mousemove() {
		const x0 = x.invert(d3.mouse(this)[0])
		const i = bisectDate(formattedData, x0, 1)
		const d0 = formattedData[i - 1]
		const d1 = formattedData[i]
		const d = x0 - d0.date > d1.date - x0 ? d1 : d0
		focus.attr("transform", `translate(${x(d.date)}, ${y(d.value)})`)
		focus.select("text").text(d.value)
		focus.select(".x-hover-line").attr("y2", HEIGHT - y(d.value))
		focus.select(".y-hover-line").attr("x2", -x(d.date))
	}

	/******************************** Tooltip Code ********************************/

	update()
})

$("#var-select")
	.on("change", () => {
		update()
	})

$("#coin-select")
	.on("change", () => {
		update()
	})

function update() {
	const analysisVar = $("#var-select").val()
	const coin = $("#coin-select").val()

	yLabel.text(analysisVar)

	console.log(analysisVar)
	console.log(coin)
}