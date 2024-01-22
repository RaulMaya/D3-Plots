const MARGIN = { LEFT: 100, RIGHT: 150, TOP: 10, BOTTOM: 100 }
const WIDTH = 900 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM

let formattedData
let coin = $("#coin-select").val()
let analysisVar = $("#var-select").val()

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

// time parser for x-scale
const parseTime = d3.timeParse("%d/%m/%Y")
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

// add jQuery UI slider
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
		update()
	}
})
d3.json("data/coins.json").then(data => {
	update(data)

	$("#var-select")
		.on("change", () => {
			update(data)
		})

	$("#coin-select")
		.on("change", () => {
			update(data)
		})
})


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




function update(data) {
	coin = $("#coin-select").val()
	analysisVar = $("#var-select").val()

	formattedData = data[coin].filter(d => {
		const dataExists = (d.date && d[analysisVar] && d["price_usd"] != null)
		return dataExists
	}).map(d => {
		d["date"] = parseTime(d["date"])
		d["price_usd"] = Number(d["price_usd"])
		d["24h_vol"] = Number(d["24h_vol"])
		d["market_cap"] = Number(d["market_cap"])
		d.value = Number(d[analysisVar])
		return d
	})

	const sliderValues = $("#date-slider").slider("values")
	const dataTimeFiltered = formattedData.filter(d => {
		return ((d.date >= sliderValues[0]) && (d.date <= sliderValues[1]))
	})

	console.log(dataTimeFiltered)
	// set scale domains
	x.domain(d3.extent(dataTimeFiltered, d => d.date))
	y.domain([
		d3.min(dataTimeFiltered, d => d.analysisVar) / 1.005,
		d3.max(dataTimeFiltered, d => d.analysisVar) * 1.005
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

	let getAnalysisValue = () => {
		if (analysisVar == "price_usd") {
			return "Price in dollars"
		} else if (analysisVar == "market_cap") {
			return "Market capitalization"
		} else if (analysisVar == "24h_vol") {
			return "24 hour trading volume"
		}
	}

	yLabel.text(getAnalysisValue())
}