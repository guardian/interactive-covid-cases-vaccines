import * as d3 from 'd3'
import data from 'assets/all-cumulative.json'


let isMobile = window.matchMedia('(max-width: 700px)').matches;

const atomEl = d3.select('.scatterplot-interactive-wrapper').node();

let width = atomEl.getBoundingClientRect().width;
let height = isMobile ? window.innerHeight / 2 : width * 2.5 / 5;

d3.select('.scroll-text')
.style('top', isMobile ? (height + 80) + 'px' :360 + 'px')
.style('z-index', isMobile ? -1 : 0)

let svg = d3.select('.scatterplot-interactive-wrapper').append("svg")
.attr('id', 'gv-scatterplot-1')
.attr("width", width)
.attr("height", height)

let axis = svg.append('g')
let isrLine = svg.append('g')
let lines = svg.append('g')
let circles = svg.append('g')
let labels = svg.append("g")

const selectedCountries = ['ISR','USA','GBR','ESP','ITA','FRA','DEU']

const dataCountry = []

selectedCountries.map(d => {

	dataCountry[d] = data.filter(f => f.iso_code === d).filter((d,i) => i%7 == 0)

})

let maxVaccinationsISR = d3.max(dataCountry['ISR'], d => +d.total_vaccinations_per_hundred)
let maxDeathsISR = d3.max(dataCountry['ISR'], d => +d.weekly_deaths_avg_per_million)
let maxAll = d3.max(selectedCountries.map(d => d3.max(dataCountry[d], m => +m.weekly_deaths_avg_per_million)))

let getMaxDeaths = (codes) => {

	let arr = []

	codes.forEach(code => {
		arr.push(d3.max(dataCountry[code], m => +m.weekly_deaths_avg_per_million))
	})

	return d3.max(arr)
}

let getMaxVaccines = (codes) => {

	let arr = []

	codes.forEach(code => {
		arr.push(d3.max(dataCountry[code], m => +m.total_vaccinations_per_hundred))
	})

	return d3.max(arr)
}

const margin = {left:isMobile ? 20 : 0, top:20, right:isMobile ? 25 : 20, bottom:20}

let xScale = d3.scaleLinear()
.range([margin.left,width - margin.right])
.domain([0,maxAll])

let yScale = d3.scaleLinear()
.range([margin.top, height - margin.bottom])
.domain([maxVaccinationsISR,0])

let xaxis = axis.append("g")
.attr("transform", "translate(0," + (height - margin.bottom) + ")")
.attr("class", "xaxis")
.call(
	    d3.axisBottom(xScale)
	    .ticks(isMobile ? 3 : 5)
    )
.selectAll("text")
.text(d => d)

let yaxis = axis.append("g")
.attr("class", "yaxis")
yaxis
.call(
	   d3.axisLeft(yScale)
	   .ticks(2)
	   .tickSizeInner(-width)
   )
.selectAll("text")
.attr('dx', 5)
.attr('dy', -10 + 'px')
.text(d => (+d).toLocaleString('en-GB',{maximumFractionDigits: 0}))

const line = d3.line()
.curve(d3.curveCatmullRom.alpha(0.5))
.x(d => xScale(+d.weekly_deaths_avg_per_million))
.y(d => yScale(+d.total_vaccinations_per_hundred))


selectedCountries.map(code => {

	console.log(dataCountry[code])

	lines.append("path")
	.datum(dataCountry[code])
	.attr("class", `${code} covid-line red-line`)
	.attr("d", line)

})



