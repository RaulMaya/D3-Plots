/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/
const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 }
const WIDTH = 900 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM

let year = 1800
let time = 0
let interval
let formattedData

const setContinents = ["europe", "asia", "americas", "africa"]

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
	.text("Life Expectancy (Years)")

// Y label
const yLabel = g.append("text")
	.attr("class", "y axis-label")
	.attr("x", - (HEIGHT / 2))
	.attr("y", -60)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text("GDP Per Capita ($)")

const yearLabel = g.append("text")
	.attr("class", "x axis-label")
	.attr("x", WIDTH - 30)
	.attr("y", HEIGHT - 20)
	.attr("font-size", "35px")
	.attr("text-anchor", "middle")
	.style("fill", "lightgray")
	.style("font-weight", "bold")  // Make the text bold
	.text(year);

const tip = d3.tip()
	.attr("class", "d3-tip")
	.html(d => {
		let text = `<strong>Country:</strong> <span style='color:red; text-transform:capitalize'>${d.country}</span><br>`
		text += `<strong>Continent:</strong> <span style='color:red; text-transform:capitalize'>${d.continent}</span><br>`
		text += `<strong>Life Expectacy:</strong> <span style='color:red'>${d3.format(".2f")(d.life_exp)}</span><br>`
		text += `<strong>GDP Per Capita:</strong> <span style='color:red'>${d3.format("$,.0f")(d.income)}</span><br>`
		text += `<strong>Populationn:</strong> <span style='color:red'>${d3.format(",.0f")(d.population)}</span><br>`
		return text
	})
g.call(tip)

const x = d3.scaleLog()
	.range([0, WIDTH])
	.base(10)
	.domain([142, 200000])

const y = d3.scaleLinear()
	.range([HEIGHT, 0])
	.domain([0, 90])

// Define a color scale
const colorScale = d3.scaleOrdinal()
	.range(["#FFE382", "#4CB9E7", "#65B741", "#EF4040"]);

const radiusScale = d3.scaleSqrt()
	.range([7, 35]);

const xAxisGroup = g.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT})`)

const yAxisGroup = g.append("g")
	.attr("class", "y axis")

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

const legends = g.append("g").attr("transform", `translater(${WIDTH - 10}, ${HEIGHT - 125})`)

d3.json("data/data.json").then(function (data) {
	formattedData = data.map(year => {
		return year["countries"].filter(country => {
			const dataExists = (country.income && country.life_exp)
			return dataExists
		}).map(country => {
			country.income = Number(country.income)
			country.life_exp = Number(country.life_exp)
			return country
		})
	})

	const uniqueContinents = Array.from(new Set(data.flatMap(d =>
		d.countries.map(country => country.continent)
	)));

	uniqueContinents.forEach((continent, i) => {
		const legendRow = legends.append("g").attr("transform", `translate(0, ${i * 20})`)

		legendRow.append("rect")
			.attr("x", 790)
			.attr("y", 260)
			.attr("width", 10)
			.attr("height", 10)
			.attr("fill", colorScale(continent))

		legendRow.append("text")
			.attr("x", 780)
			.attr("y", 270)
			.attr("text-anchor", "end")
			.style("text-transform", "capitalize")
			.text(continent)
	})

	update(formattedData[0], uniqueContinents)
})

function step() {
	time = (time < 214) ? time + 1 : 0
	update(formattedData[time], setContinents)
}

$("#play-button")
	.on("click", function () {
		const button = $(this)
		if (button.text() === "Play") {
			button.text("Pause")
			interval = setInterval(step, 100)
		} else {
			button.text("Play")
			clearInterval(interval)
		}
	})

$("#reset-button")
	.on("click", function () {
		time = 0
		update(formattedData[0], setContinents)
	})

$("#continent-select")
	.on("change", () => {
		update(formattedData[time], setContinents)
	})

$('#date-slider').slider({
	min: 1800,
	max: 2014,
	step: 1,
	slide: (event, ui) => {
		time = ui.value - 1800
		update(formattedData[time], setContinents)
	}
})

function update(data, uniqueContinents) {
	const t = d3.transition().duration(100)
	const minPop = d3.min(data, d => d.population);
	const maxPop = d3.max(data, d => d.population);

	const continent = $("#continent-select").val()

	const filteredContinent = data.filter(d => {
		if (continent === "all") return true
		else {
			return d.continent == continent
		}
	})
	yearLabel.text(year + time);

	colorScale.domain(uniqueContinents)
	radiusScale.domain([minPop, maxPop])


	const circles = g.selectAll("circle")
		.data(filteredContinent, d => d.country)

	circles.exit().remove()

	circles.enter().append("circle")
		.attr("fill", d => colorScale(d.continent))
		.attr("opacity", 0.7)
		.attr("stroke", "black")
		.attr("stroke-width", 2)
		.on("mouseover", function (d) {
			d3.select(this).style("cursor", "pointer");
			tip.show(d, this);
		})
		.on("mouseout", function (d) {
			d3.select(this).style("cursor", "default");
			tip.hide(d, this);
		})
		.merge(circles)
		.transition(t)
		.attr("cx", (d) => x(d.income))
		.attr("cy", (d) => y(d.life_exp))
		.attr("r", d => radiusScale(d.population))

	$("#year")[0].innerHTML = String(time + 1800)
	$("#date-slider").slider("value", Number(time + 1800))
}