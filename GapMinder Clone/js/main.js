/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/
const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 }
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 600 - MARGIN.TOP - MARGIN.BOTTOM

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

d3.json("data/data.json").then(function (data) {
	data.forEach(d => {
		d.year = Number(d.year)
	})

	const uniqueContinents = Array.from(new Set(data.flatMap(d =>
		d.countries.map(country => country.continent)
	)));

	console.log(uniqueContinents)

	data = data[0]
	console.log(data)

	g.append("text")
		.attr("class", "x axis-label")
		.attr("x", WIDTH - 30)
		.attr("y", HEIGHT - 20)
		.attr("font-size", "35px")
		.attr("text-anchor", "middle")
		.style("fill", "lightgray")
		.style("font-weight", "bold")  // Make the text bold
		.text(data.year);

	const x = d3.scaleLog()
		.domain([1, d3.max(data.countries, (d) => d.income)])
		.range([0, WIDTH])
		.base(10)

	const y = d3.scaleLinear()
		.domain([0, d3.max(data.countries, (d, i) => d.life_exp)])
		.range([HEIGHT, 0])

	// Define a color scale
	const colorScale = d3.scaleOrdinal()
		.domain(uniqueContinents)
		.range(["#FFE382", "#4CB9E7", "#65B741", "#EF4040"]);

	const xAxisGroup = g.append("g")
		.attr("class", "x axis")
		.attr("transform", `translate(0, ${HEIGHT})`)

	const yAxisGroup = g.append("g")
		.attr("class", "y axis")

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

	circles.enter().append("circle")
		.attr("cx", (d) => x(d.income))
		.attr("cy", (d) => y(d.life_exp))
		.attr("r", 5)
		.attr("fill", d => colorScale(d.continent));
})