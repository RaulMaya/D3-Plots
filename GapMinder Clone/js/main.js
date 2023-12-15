/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/
const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 }
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 600 - MARGIN.TOP - MARGIN.BOTTOM
let c = 0

const svg = d3.select("#chart-area").append("svg")
	.attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
	.attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
	.attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

// X label
g.append("text")
	.attr("class", "x axis-label")
	.attr("x", WIDTH / 2)
	.attr("y", HEIGHT + 60)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Life Expectancy (Years)")

// Y label
g.append("text")
	.attr("class", "y axis-label")
	.attr("x", - (HEIGHT / 2))
	.attr("y", -60)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text("GDP Per Capita ($)")

const year = g.append("text")
	.attr("class", "x axis-label")
	.attr("x", WIDTH - 30)
	.attr("y", HEIGHT - 20)
	.attr("font-size", "35px")
	.attr("text-anchor", "middle")
	.style("fill", "lightgray")
	.style("font-weight", "bold")  // Make the text bold


const x = d3.scaleLog()
	.range([0, WIDTH])
	.base(10)

const y = d3.scaleLinear()
	.range([HEIGHT, 0])

// Define a color scale
const colorScale = d3.scaleOrdinal()
	.range(["#FFE382", "#4CB9E7", "#65B741", "#EF4040"]);

const xAxisGroup = g.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT})`)

const yAxisGroup = g.append("g")
	.attr("class", "y axis")

d3.json("data/data.json").then(function (data) {
	data.forEach(d => {
		d.year = Number(d.year)
	})

	const uniqueContinents = Array.from(new Set(data.flatMap(d =>
		d.countries.map(country => country.continent)
	)));

	console.log(uniqueContinents)

	d3.interval(() => {
		const newData = data[c]
		update(newData, uniqueContinents)
		c += 1
	}, 1000)

})

function update(data, uniqueContinents) {
	const t = d3.transition().duration(750)
	
	year.text(data.year);

	x.domain([1, d3.max(data.countries, (d) => d.income)])
	y.domain([0, d3.max(data.countries, (d, i) => d.life_exp)])
	colorScale.domain(uniqueContinents)


	const circles = g.selectAll("circle")
		.data(data.countries)

	const xAxisCall = d3.axisBottom(x)
		.ticks(3)
		.tickFormat(d => "$" + d)
	xAxisGroup.call(xAxisCall)
		.selectAll("text")
		.attr("y", "10")
		.attr("x", "0")
		.attr("text-anchor", "center")

	const yAxisCall = d3.axisLeft(y)

	yAxisGroup.call(yAxisCall)

	// EXIT old elements not present in new data.
	circles.exit().remove()

	circles.enter().append("circle")
		.attr("r", 5)
		.attr("fill", d => colorScale(d.continent))
		.merge(circles)
		.transition(t)
		.attr("cx", (d) => x(d.income))
		.attr("cy", (d) => y(d.life_exp))

}