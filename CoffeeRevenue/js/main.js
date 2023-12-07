/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 1 - Star Break Coffee
*/
const MARGIN = { left: 100, right: 10, top: 10, bottom: 100 }
const WIDTH = 600 - MARGIN.left - MARGIN.right
const HEIGHT = 400 - MARGIN.top - MARGIN.bottom

let flag = true

const svg = d3.select("#chart-area").append("svg")
    .attr("width", WIDTH + MARGIN.left + MARGIN.right)
    .attr("height", HEIGHT + MARGIN.top + MARGIN.bottom)

const g = svg.append("g")
    .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`)

g.append("text")
    .attr("class", "x axis-label")
    .attr("x", WIDTH / 2)
    .attr("y", HEIGHT + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Month")

const yLabel = g.append("text")
    .attr("class", "y axis-label")
    .attr("x", -(HEIGHT / 2))
    .attr("y", -60)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")


const x = d3.scaleBand()
    .range([0, WIDTH])
    .paddingInner(0.3)
    .paddingOuter(0.2)

const y = d3.scaleLinear()
    .range([HEIGHT, 0])

const xAxisGroup = g.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${HEIGHT})`)

const yAxisGroup = g.append("g")
    .attr("class", "y axis")

d3.csv("data/revenues.csv").then(data => {
    data.forEach(d => {
        d.revenue = Number(d.revenue)
        d.profit = Number(d.profit)
    })

    d3.interval(() => {
        flag = !flag
        update(data)
    }, 3000)

    update(data)
})

function update(data) {
    const value = flag ? "profit" : "revenue"
    x.domain(data.map(d => d.month))
    y.domain([0, d3.max(data, d => d[value])])

    const xAxisCall = d3.axisBottom(x)
    xAxisGroup
        .call(xAxisCall)

    const yAxisCall = d3.axisLeft(y)
        .tickFormat(d => "$" + d)
        .ticks(5)
    yAxisGroup
        .call(yAxisCall)

    const bars = g.selectAll("rect")
        .data(data)

    bars.exit().remove()

    bars.attr("y", d => y(d[value]))
        .attr("x", d => x(d.month))
        .attr("width", x.bandwidth)
        .attr("height", d => HEIGHT - y(d[value]))
        .attr("fill", () => {
            if (value === "revenue") {
                return "green"
            } else {
                return "#527853"
            }
        })

    bars.enter().append("rect")
        .attr("y", d => y(d[value]))
        .attr("x", d => x(d.month))
        .attr("width", x.bandwidth)
        .attr("height", d => HEIGHT - y(d[value]))
        .attr("fill", () => {
            if (value === "revenue") {
                return "green"
            } else {
                return "#527853"
            }
        })

    const text = flag ? "Profit ($)" : "Revenue ($)"
    yLabel.text(text)
}