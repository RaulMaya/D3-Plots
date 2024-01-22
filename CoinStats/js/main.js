const MARGIN = { LEFT: 100, RIGHT: 150, TOP: 10, BOTTOM: 100 }
const WIDTH = 900 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM

const svg = d3.select("#chart-area").append("svg")
	.attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
	.attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
	.attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

// time parsers/formatters
const parseTime = d3.timeParse("%d/%m/%Y")
const formatTime = d3.timeFormat("%d/%m/%Y")
// for tooltip
const bisectDate = d3.bisector(d => d.date).left

// add the line for the first time
g.append("path")
	.attr("class", "line")
	.attr("fill", "none")
	.attr("stroke", "grey")
	.attr("stroke-width", "3px")

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


$("#var-select")
	.on("change", () => {
		update()
	})

$("#coin-select")
	.on("change", () => {
		update()
	})

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

	update()
})

function update() {
	const t = d3.transition().duration(5000)

	// filter data based on selections
	const coin = $("#coin-select").val()
	const analysisVar = $("#var-select").val()
	const coinFilter = dataObj[coin]

	const sliderValues = $("#date-slider").slider("values")
	const dataTimeFiltered = coinFilter.filter(d => {
		return ((d.date >= sliderValues[0]) && (d.date <= sliderValues[1]))
	})

	// set scale domains
	x.domain(d3.extent(dataTimeFiltered, d => d.date))
	y.domain([
		d3.min(dataTimeFiltered, d => d[analysisVar]) / 1.005,
		d3.max(dataTimeFiltered, d => d[analysisVar]) * 1.005
	])

	// fix for format values
	const formatSi = d3.format(".2s")
	function formatAbbreviation(x) {
		const s = formatSi(x)
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


	d3.select(".focus").remove()
	d3.select(".overlay").remove()

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
		const i = bisectDate(dataTimeFiltered, x0, 1)
		const d0 = dataTimeFiltered[i - 1]
		const d1 = dataTimeFiltered[i]
		const d = x0 - d0.date > d1.date - x0 ? d1 : d0
		focus.attr("transform", `translate(${x(d.date)}, ${y(d[analysisVar])})`)
		focus.select("text").text(d[analysisVar])
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
		.attr("d", line(dataTimeFiltered))



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