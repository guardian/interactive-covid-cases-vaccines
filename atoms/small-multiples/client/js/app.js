import * as d3 from 'd3'
import * as moment from 'moment'
import data from 'assets/all-cumulative.json'
import income from 'assets/income.json'

console.log('SMALL MULTIPLES')
let isMobile = window.matchMedia('(max-width: 700px)').matches;

const atomEl = d3.select('.small-multiples-interactive-wrapper').node();

let width = atomEl.getBoundingClientRect().width;

const w = 74;
let h = w;

const lowIncomes = income.filter(d => d.income === 'Low income');
const lowMiddleIncomes = income.filter(d => d.income === 'Lower middle income');


/*const upperMiddleIncomes = income.filter(d => d.income === 'Upper middle income');
const highIncomes = income.filter(d => d.income === 'High income');
*/
const lastDeaths = []
const maxDeathsArr = []
const lastVaccines = []

let maxDeaths = 0;

const codes = [... new Set(data.map(d => d.iso_code))]

const countries = []


codes.forEach(code => {

	let countryWeekly = data.filter(d => d.iso_code === code).filter((d,i) => i%7 == 0);

	countries.push(countryWeekly)

	let countryMaxDeaths = d3.max(countryWeekly, d => d.weekly_deaths_avg_per_million );

	if(countryMaxDeaths > maxDeaths)maxDeaths = countryMaxDeaths

	let countryLastDeaths = +countryWeekly[countryWeekly.length-1].weekly_deaths_avg_per_million;

	let countryLastVaccines = +countryWeekly[countryWeekly.length-1].total_vaccinations_per_hundred;

	lastDeaths.push(countryLastDeaths)
	lastVaccines.push(countryLastVaccines)

})

const meanDeaths = 1 //d3.mean(lastDeaths)

//console.log('**', meanDeaths)

const maxVaccines = d3.max(lastVaccines)
const meanVaccines = d3.mean(lastVaccines)
const minVaccines = d3.min(lastVaccines);


let xScale = d3.scaleLinear()
.range([0, w])
.domain([0,maxDeaths])


let yScale = d3.scaleLinear()
.domain([maxVaccines,0])

const line = d3.line()
.curve(d3.curveBundle.beta(1))
.x(d => xScale(+d.weekly_deaths_avg_per_million))
.y(d => yScale(+d.total_vaccinations_per_hundred))

const makeCharts = (slot, data, i) => {

	let div = d3.select('#' + slot)
	.append('div')
	.attr('class', 'country-div ' + data[0].iso_code)
	.attr('width', w + 'px')
	.attr('height', h + 'px')

	let maxD = d3.max(data, d => +d.weekly_deaths_avg_per_million || 1)

	yScale
	.range([0,h])

	let posX = xScale(+data[data.length-1].weekly_deaths_avg_per_million) + 20 > w ? xScale(+data[data.length-1].weekly_deaths_avg_per_million) - 20 : xScale(+data[data.length-1].weekly_deaths_avg_per_million);
	let posY = yScale(+data[data.length-1].total_vaccinations_per_hundred);

	let label = div.append('div')
	.style('display', 'flex')
	.style('flex-direction', 'column')
	.style('transform', i == 0 ? `translate(0px, ${posY}px)` : `translate(${posX}px, ${posY}px)`)

	//console.log(i)

	let spans = label.append('div')
	.attr('class', 'spans')
	.style('display', 'flex')
	.html(i == 0 ? `<span class='label-text-rate'>${parseFloat(data[data.length-1].weekly_deaths_avg_per_million.toFixed(1))}&nbsp;</span><span class='label-text-week'>deaths</span>` : `<span class='label-text-rate'>${parseFloat(data[data.length-1].weekly_deaths_avg_per_million.toFixed(1))}</span>`)

	let vector = div
	.append('svg')
	.attr('width', w)
	.attr('height', h)

	vector
	.append('path')
	.datum(data)
	.attr('class', +data[data.length-1].weekly_deaths_avg_per_million >= meanDeaths ? 'high-deaths-area' : 'low-deaths-area')
	.attr("d", () => `M0,${h} ` + line(data).replace('M', 'L') + `H0,0`)


	vector
	.append("path")
	.datum(data)
	.attr('class', +data[data.length-1].weekly_deaths_avg_per_million >= meanDeaths ? 'high-deaths-path' : 'low-deaths-path')
	.attr("d", line)

	let circle = vector.append('g')

	circle
	.append('circle')
	.attr('class', +data[data.length-1].weekly_deaths_avg_per_million >= meanDeaths ? 'high-deaths-circle' : 'low-deaths-circle')
	.attr('cx', xScale(+data[data.length-1].weekly_deaths_avg_per_million))
	.attr('cy', posY)
	.attr('r', 3)

	div.append('h2')
	.attr('class', 'country-div-header')
	.html(getCountryName(data[0].location))
	
}

const getCountryName = (name) => {

	if(name === 'United Arab Emirates') name = 'UAE'
	if(name === 'United Kingdom') name = 'UK'
	if(name === 'United States') name = 'US'
	if(name === 'Czechia') name = 'Czech Republic'

	return name
}

let highRateCountries = countries.filter(country => +country[country.length-1].total_vaccinations_per_hundred >= 50)

highRateCountries.sort((b,a) => +b[b.length-1].weekly_deaths_avg_per_million - +a[a.length-1].weekly_deaths_avg_per_million )


let leg1 = d3.select('#interactive-slot-1')
.append('div')
.attr('class', 'sm-legend')
.html(
	`
	<h2>Average weekly deaths</h2>
	<div class="sm-color-container">
		<div class="color-bundle">
			<span class="sm-text">Low</span>
			<div class="sm-color green"></div>
		</div>
		<div class="color-bundle">
			<div class="sm-color red"></div>
			<span class="sm-text">High</span>
		</div>
	</div>
`)


let cont = 0;

highRateCountries.forEach((country,i) => {

	if(country.length >= 10 && d3.sum(country, d => +d.total_vaccinations_per_hundred) > 1 && d3.sum(country, d => +d.weekly_deaths_avg_per_million) >= 5)
	{
		makeCharts('interactive-slot-1', country, cont)

		cont ++

		let low = lowIncomes.find(f => f.code === country[0].iso_code)
		let lowM = lowMiddleIncomes.find(f => f.code === country[0].iso_code)

		console.log(low, lowM)


		//if(country.lowIncomes || lowMiddleIncomes)

	}
})


let mediumRateCountries = countries.filter(country => +country[country.length-1].total_vaccinations_per_hundred < 50 && country[country.length-1].total_vaccinations_per_hundred >= 30)

mediumRateCountries.sort((b,a) => b[b.length-1].weekly_deaths_avg_per_million - a[a.length-1].weekly_deaths_avg_per_million )

let leg2 = d3.select('#interactive-slot-2')
.append('div')
.attr('class', 'sm-legend')
.html(
	`
	<h2>Average weekly deaths</h2>
	<div class="sm-color-container">
		<div class="color-bundle">
			<span class="sm-text">Low</span>
			<div class="sm-color green"></div>
		</div>
		<div class="color-bundle">
			<div class="sm-color red"></div>
			<span class="sm-text">High</span>
		</div>
	</div>
`)

cont = 0;

mediumRateCountries.forEach((country,i) => {

	if(country.length >= 10 && d3.sum(country, d => +d.total_vaccinations_per_hundred) > 1 && d3.sum(country, d => +d.weekly_deaths_avg_per_million) >= 5)
	{
		makeCharts('interactive-slot-2', country,cont)

		cont++
	}
})


let lowRateCountries = countries.filter(country => +country[country.length-1].total_vaccinations_per_hundred < 30)

lowRateCountries.sort((b,a) => b[b.length-1].weekly_deaths_avg_per_million - a[a.length-1].weekly_deaths_avg_per_million )

let leg3 = d3.select('#interactive-slot-3')
.append('div')
.attr('class', 'sm-legend')
.html(
	`
	<h2>Average weekly deaths</h2>
	<div class="sm-color-container">
		<div class="color-bundle">
			<span class="sm-text">Low</span>
			<div class="sm-color green"></div>
		</div>
		<div class="color-bundle">
			<div class="sm-color red"></div>
			<span class="sm-text">High</span>
		</div>
	</div>
`)
cont = 0;

lowRateCountries.forEach((country,i) => {

	if(country.length >= 10 && d3.sum(country, d => +d.total_vaccinations_per_hundred) > 1 && d3.sum(country, d => +d.weekly_deaths_avg_per_million) >= 5)
	{
		//console.log(country)
		makeCharts('interactive-slot-3', country, cont)

		cont++
	}
})
