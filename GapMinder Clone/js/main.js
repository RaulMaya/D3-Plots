/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/
const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 }
const WIDTH = 600 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 400 - MARGIN.TOP - MARGIN.BOTTOM

d3.json("data/data.json").then(function (data) {
	data.forEach(d => {
		d.year = Number(d.year)
	})
	console.log(data)
	const highestIncome = Math.max(...data.map((d, i) => d.countries[i].income))

	const x = d3.scaleLog()
		.domain([0, d3.max(data, (d, i) => d.countries[i].income)])
		.range([0, 400])
		.base(10)

	const y = d3.scaleLinear()
		.domain([0, d3.max(data, (d, i) => d.countries[i].life_exp)])
		.range([0, HEIGHT])
})