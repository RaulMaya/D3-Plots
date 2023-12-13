/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/
const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 }
const WIDTH = 600 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 400 - MARGIN.TOP - MARGIN.BOTTOM

const svg = d3.select("#chart-area").append("svg")
	.attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
	.attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
	.attr("trasnform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

// X label
g.append("text")
	.attr("class", "x axis-label")
	.attr("x", WIDTH / 2)
	.attr("y", HEIGHT + 60)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Month")

// Y label
g.append("text")
	.attr("class", "y axis-label")
	.attr("x", - (HEIGHT / 2))
	.attr("y", -60)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text("Revenue ($)")

d3.json("data/data.json").then(function (data) {
	data.forEach(d => {
		d.year = Number(d.year)
	})
	console.log(data)

	const x = d3.scaleLog()
		.domain([1, d3.max(data, (d, i) => d.countries[i].income)])
		.range([0, WIDTH])
		.base(10)

	const y = d3.scaleLinear()
		.domain([0, d3.max(data, (d, i) => d.countries[i].life_exp)])
		.range([HEIGHT, 0])

	const xAxisGroup = g.append("g")
		.attr("class", "x axis")
		.attr("transform", `translate(0, ${HEIGHT})`)

	const yAxisGroup = g.append("g")
		.attr("class", "y axis")

	const circles = g.selectAll("circle")
		.data(data)

	const xAxisCall = d3.axisBottom(x)
		.ticks(3)
		.tickFormat(d => "$" + d)
	xAxisGroup.call(xAxisCall)
		.selectAll("text")
		.attr("y", "10")
		.attr("x", "-5")
		.attr("text-anchor", "end")

	const yAxisCall = d3.axisLeft(y)

	yAxisGroup.call(yAxisCall)

	circles.enter().append("circle")
		.attr("cx", (d, i) => x(d.countries[i].income))
		.attr("cy", (d, i) => y(d.countries[i].life_exp))
		.attr("r", 5)
		.attr("fill", "skyblue")
	// .attr("width", x.bandwidth)
	// .attr("height", (d, i) => HEIGHT - y(d.countries[i].life_exp))
})