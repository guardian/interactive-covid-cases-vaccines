import * as d3 from 'd3'
import * as moment from 'moment'
import data from 'assets/all.json'
import ScrollyTeller from "shared/js/scrollyteller";


let isMobile = window.matchMedia('(max-width: 700px)').matches;

const atomEl = d3.select('.scatterplot-interactive-wrapper').node();

let width = atomEl.getBoundingClientRect().width;
let height = isMobile ? window.innerHeight - svgY - (arrowY * 2) - 20 : width * 2.5 / 5;

let svg = d3.select('.scatterplot-interactive-wrapper').append("svg")
.attr('id', 'gv-scatterplot-1')
.attr("width", width)
.attr("height", height)

let axis = svg.append('g')
let lines = svg.append('g')
let circles = svg.append('g')

const ISRData = data.filter(f => f.iso_code === 'ISR').filter((d,i) => i%7 == 0)

console.log(ISRData)

let maxVaccinations = d3.max(ISRData, d => +d.daily_vaccinations_per_million)
let maxDeaths = d3.max(ISRData, d => +d.weekly_deaths_avg_per_million)
let minDeaths = d3.min(ISRData, d => +d.weekly_deaths_avg_per_million)

let xScale = d3.scaleLinear()
.range([20,width-20])
.domain([minDeaths,maxDeaths])

let yScale = d3.scaleLinear()
.range([20, height -20])
.domain([maxVaccinations,0])

const line = d3.line()
.curve(d3.curveCatmullRom.alpha(0))
.x(d => xScale(+d.weekly_deaths_avg_per_million))
.y(d => yScale(+d.daily_vaccinations_per_million))


//set offsets for each entry

var lastX = Math.abs(xScale(ISRData[0].weekly_deaths_avg_per_million));
var lastY = Math.abs(yScale(ISRData[0].daily_vaccinations_per_million));
var currentXOffset, currentYOffset, lineSegmentLength;
var currentLineOffset = 0;


ISRData.forEach((d,i) => {
	currentXOffset = Math.abs(xScale(ISRData[i].weekly_deaths_avg_per_million) - lastX);
	currentYOffset = Math.abs(lastY - yScale(ISRData[i].daily_vaccinations_per_million));

	lineSegmentLength = Math.hypot(currentXOffset, currentYOffset);

	currentLineOffset += lineSegmentLength;

	ISRData[i].offset = currentLineOffset;

	lastX = Math.abs(xScale(ISRData[i].weekly_deaths_avg_per_million));

	lastY = Math.abs(yScale(ISRData[i].daily_vaccinations_per_million));
})

const length = (path) => {
	return d3.create("svg:path").attr("d", path).node().getTotalLength();
}

let xaxis = axis.append("g")
.attr("transform", "translate(0," + (height-20) + ")")
.attr("class", "xaxis")
.call(
	d3.axisBottom(xScale)
	.ticks(5)
	)
.selectAll("text")
.text(d => d)

let yaxis = axis.append("g")
.attr("class", "yaxis")
.call(
	d3.axisLeft(yScale)
	.ticks(5)
	.tickSizeInner(-width)
	)
.selectAll("text")
.attr('x', 5)
.attr('y', -10)
.text(d => d)

let l = length(line(ISRData));

console.log('l',l)

let totalLineLength = 0;

let ISRline = lines.append("path")
.datum(ISRData)
.attr('class', 'grey-line')
.attr("stroke-dasharray", `0,${l}`)
.attr("d", line)
.transition()
.duration(1000)
.ease(d3.easeLinear)
.attr("stroke-dasharray", `${l},${l}`)
.on('end', d => {
	circles.selectAll('circle')
	.data(ISRData)
	.enter()
	.append('circle')
	.attr('class', 'grey-circle')
	.attr('cx', d => xScale(+d.weekly_deaths_avg_per_million))
	.attr('cy', d => yScale(+d.daily_vaccinations_per_million))
	.attr('r', 5)
	.style('opacity', 0)
	.transition()
	.duration(500)
	.style('opacity', 1)
});

let ISRlineRed = lines.append("path")
.datum(ISRData)
.attr('class', 'red-line')
.attr("d", line)




totalLineLength = currentLineOffset;


const makeTransition = (data, i) => {

	if (data[i] != undefined && data[i].offset != undefined) {

		var lineTarget = data[i].offset / totalLineLength;
		
		ISRline
		.attr("stroke-dashoffset", length - (length * lineTarget))

	}
}


const scrolly = new ScrollyTeller({
    parent: document.querySelector("#gv-scrolly-1"),
        triggerTop: .5, // percentage from the top of the screen that the trigger should fire
        triggerTopMobile: 0.75,
        transparentUntilActive: true
    });

scrolly.addTrigger({num: 1, do: () => {

   console.log('1')

   console.log(line(ISRData))
}})

scrolly.addTrigger({num: 2, do: () => {

   var lineTarget = ISRData[2].offset / currentLineOffset;

   console.log(ISRline.node().getTotalLength(), ISRline.node().getTotalLength() - (ISRline.node().getTotalLength() * lineTarget))

   //ISRlineRed.attr("stroke-dashoffset", ISRline.node().getTotalLength() - (ISRline.node().getTotalLength() * lineTarget))

   let len = ISRline.node().getTotalLength() - (ISRline.node().getTotalLength() * lineTarget);

   ISRlineRed.attr("stroke-dasharray", `${len},${len}`)


}})

scrolly.watchScroll();


