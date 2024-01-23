const MARGIN = { LEFT: 100, RIGHT: 150, TOP: 10, BOTTOM: 100 }
const WIDTH = 900 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM

// Time parsers/formatters
const parseTime = d3.timeParse("%d/%m/%Y")
const formatTime = d3.timeFormat("%d/%m/%Y")
const bisectDate = d3.bisector(d => d.date).left

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
	.ticks(6)
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
		update()
	}
})

// Dropdown selector for variable (y-value)
$("#var-select")
	.on("change", update)

// Dropdown selector for type of coin
$("#coin-select")
	.on("change", update)

// Add the line for the first time
g.append("path")
	.attr("class", "line")
	.attr("fill", "none")
	.attr("stroke", "blue")
	.attr("stroke-width", "2px")



d3.json("data/coins.json").then(data => {
	dataObj = {}
	Object.keys(data).forEach((coin) => {
		dataObj[coin] = data[coin].filter(d => {
			const dataExists = (d.date && d["price_usd"] != null)
			return dataExists
		}).map(d => {
			d["date"] = parseTime(d["date"])
			d["price_usd"] = Number(d["price_usd"])
			d["24h_vol"] = Number(d["24h_vol"])
			d["market_cap"] = Number(d["market_cap"])
			return d
		})
	})

	console.log(dataObj)
	update()
})

function update() {
	// Defining the transition and its duration
	const t = d3.transition().duration(1500)

	// Filter based in coin selection and stock variable selection
	const coin = $("#coin-select").val()
	const analysisVar = $("#var-select").val()
	const coinFilter = dataObj[coin]

	const sliderVal = $("#date-slider").slider("values")
	const dataFiltered = coinFilter.filter(d => {
		return ((d.date >= sliderVal[0]) && (d.date <= sliderVal[1]))
	})

	// set scale domains
	x.domain(d3.extent(dataFiltered, d => d.date))
	y.domain([
		d3.min(dataFiltered, d => d[analysisVar]) / 1.005,
		d3.max(dataFiltered, d => d[analysisVar]) * 1.005
	])

	// fix for format values
	const formatSi = d3.format(".2s")
	function formatAbbreviation(x) {
		const s = formatSi(x)
		console.log(s[s.length - 1])
		switch (s[s.length - 1]) {
			case "G": return s.slice(0, -1) + "B" // billions
			case "k": return s.slice(0, -1) + "K" // thousands
		}
		return s
	}

	// update axes
	xAxisCall.scale(x)
	xAxis.transition(t).call(xAxisCall)
	yAxisCall.scale(y)
	yAxis.transition(t).call(yAxisCall.tickFormat(formatAbbreviation))

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
		const i = bisectDate(dataFiltered, x0, 1)
		const d0 = dataFiltered[i - 1]
		const d1 = dataFiltered[i]
		const d = x0 - d0.date > d1.date - x0 ? d1 : d0
		focus.attr("transform", `translate(${x(d.date)}, ${y(d[analysisVar])})`)
		focus.select("text").text(`${d[analysisVar]}`)
		focus.select(".x-hover-line").attr("y2", HEIGHT - y(d[analysisVar]))
		focus.select(".y-hover-line").attr("x2", -x(d.date))
	}

	/******************************** Tooltip Code ********************************/

	// line path generator
	line = d3.line()
		.x(d => x(d.date))
		.y(d => y(d[analysisVar]))

	// Update our line path
	g.select(".line")
		.transition(t)
		.attr("d", line(dataFiltered))



	let getAnalysisValue = () => {
		if (analysisVar == "price_usd") {
			return "Price ($)"
		} else if (analysisVar == "market_cap") {
			return "Market Capitalization"
		} else if (analysisVar == "24h_vol") {
			return "24 Hour Trading Volume"
		}
	}

	yLabel.text(getAnalysisValue())
}