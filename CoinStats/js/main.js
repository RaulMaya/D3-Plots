const MARGIN = { LEFT: 100, RIGHT: 150, TOP: 10, BOTTOM: 100 }
const WIDTH = 900 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM

// time parsers/formatters
const parseTime = d3.timeParse("%d/%m/%Y")
const formatTime = d3.timeFormat("%d/%m/%Y")

const svg = d3.select("#chart-area").append("svg")
	.attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
	.attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
	.attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

// Creating the scales
const x = d3.scaleTime().range([0, WIDTH])
const y = d3.scaleLinear().range([HEIGHT, 0])

// This ones will be in charge of generating our axis
const xAxisCall = d3.axisBottom()
const yAxisCall = d3.axisLeft()
	.ticks(5)
	.tickFormat(d => `${parseInt(d / 1000)}k`)

const xAxis = g.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT})`)

const yAxis = g.append("g")
	.attr("class", "y axis")


// X label
const xLabel = g.append("text")
	.attr("class", "x axis-label")
	.attr("x", WIDTH / 2)
	.attr("y", HEIGHT + 60)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Timeline")

// Y label
const yLabel = g.append("text")
	.attr("class", "y axis-label")
	.attr("x", - (HEIGHT / 2))
	.attr("y", - 60)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")

// Add jQuery UI slider
$("#date-slider").slider({
	range: true,
	max: parseTime("31/10/2017").getTime(),
	min: parseTime("12/5/2013").getTime(),
	step: 86400000, // one day
	values: [
		parseTime("12/5/2013").getTime(),
		parseTime("31/10/2017").getTime()
	],
	slide: (event, ui) => {
		$("#dateLabel1").text(formatTime(new Date(ui.values[0])))
		$("#dateLabel2").text(formatTime(new Date(ui.values[1])))
	}
})

// Dropdown selector for variable (y-value)
$("#var-select")
	.on("change", console.log(this))

// Dropdown selector for type of coin
$("#coin-select")
	.on("change", console.log(this))