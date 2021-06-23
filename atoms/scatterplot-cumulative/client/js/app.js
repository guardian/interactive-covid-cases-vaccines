import * as d3 from 'd3'
import * as moment from 'moment'
import data from 'assets/all-cumulative.json'
import ScrollyTeller from "shared/js/scrollyteller";

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

const selectedCountries = ['ISR','USA','GBR','ESP','ITA','FRA','DEU','BRA','ARG','IND','PER', 'ZAF']

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
.domain([0,maxDeathsISR])

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

const getLength = (path) => {
	return d3.create("svg:path").attr("d", path).node().getTotalLength();
}

const lengthCountry = []

selectedCountries.map(d => {

	lengthCountry[d] = getLength(line(dataCountry[d]))

})

let ISRGreyline = isrLine.append("path")
.datum(dataCountry['ISR'])
.attr("class", "ISR covid-line grey-line")
.attr('stroke-dasharray', `0,0,0,${lengthCountry['ISR']}`)
.attr("d", line)

selectedCountries.map(code => {

	lines.append("path")
	.datum(dataCountry[code])
	.attr("class", `${code} covid-line red-line`)
	.attr('stroke-dasharray', `0,0,${getLength(line(dataCountry[code].slice(0,1)))},${lengthCountry[code]}`)
	.attr("d", line)
	.attr('display', 'none')

})


const scrolly = new ScrollyTeller({
	parent: document.querySelector("#gv-scrolly-1"),
    triggerTop: .5, // percentage from the top of the screen that the trigger should fire
    triggerTopMobile: 0.75,
    transparentUntilActive: true
});

scrolly.addTrigger({num: 1, do: () => {
	console.log(1, dataCountry['ISR'])

	circles.selectAll('circle').remove()
	labels.selectAll('text').remove()

	animateSegment('ISR', 1, () => {

		circles.selectAll('circle').remove()
		labels.selectAll('text').remove()

		lines.select('.ISR.covid-line.red-line')
		.attr('display', 'none')
	})

	ISRGreyline
	.attr('stroke-dasharray', `0,0,0,${lengthCountry['ISR']}`)


	ISRGreyline
	.transition()
	.duration(500)
	.ease(d3.easeLinear)
	.attr('stroke-dasharray', `0, 0, ${lengthCountry['ISR'] + 200}, ${lengthCountry['ISR'] + 200}`)
	.on('end', d =>{

		circles
		.append('circle')
		.attr('class', 'grey-circle')
		.attr('r', 5)
		.attr('cx', xScale(+dataCountry['ISR'][dataCountry['ISR'].length-1].weekly_deaths_avg_per_million))
		.attr('cy', yScale(+dataCountry['ISR'][dataCountry['ISR'].length-1].total_vaccinations_per_hundred))

		labels
		.append('g')
		.attr("class", `ISR bold auxiliar`)
		.attr("transform", `translate(${xScale(dataCountry['ISR'][dataCountry['ISR'].length-1].weekly_deaths_avg_per_million)},${yScale(dataCountry['ISR'][dataCountry['ISR'].length-1].total_vaccinations_per_hundred)})`)
		.append("text")
		.attr("class", "line-text")
		.attr("dy","-0.8em")
		.text('Week ' + (dataCountry['ISR'].length))

	})



}})

scrolly.addTrigger({num: 2, do: () => {
	console.log(2)

	circles.selectAll('circle').remove()
	labels.selectAll('text').remove()

	animateSegment('ISR', 7)


}})

scrolly.addTrigger({num: 3, do: () => {
	console.log(3)

	circles.selectAll('circle').remove()
	labels.selectAll('text').remove()

	animateSegment('ISR', 8)

	resetLines(['USA', 'GBR'])

	
}})

scrolly.addTrigger({num: 4, do: () => {
	console.log(4)

	circles.selectAll('circle').remove()
	labels.selectAll('text').remove()

	hideLines(['USA', 'GBR'])

	colorLines(['ISR'])

	updateView(getMaxDeaths(['ISR']), getMaxVaccines(['ISR']), () => {

		animateSegment('ISR', dataCountry['ISR'].length)
		resetLines(['USA', 'GBR'])
		ISRGreyline.attr('display', 'block')

	})
	
}})

scrolly.addTrigger({num:5, do: () => {
	console.log(5)

	circles.selectAll('circle').remove()
	labels.selectAll('text').remove()

	ISRGreyline.attr('display', 'none')

	greyLines(['ISR'])

	hideLines(['ESP', 'ITA', 'FRA', 'DEU'])

	updateView(getMaxDeaths(['USA','GBR']), getMaxVaccines(['USA','GBR']), () => {

		animateSegment('USA', 5)
		animateSegment('GBR', 4)

		//resetLines(['USA', 'GBR'])
		
	})	

}})

scrolly.addTrigger({num:6, do: () => {
	console.log(6)

	circles.selectAll('circle').remove()
	labels.selectAll('g').remove()

	hideLines(['ISR', 'ESP', 'ITA', 'FRA', 'DEU'])

	colorLines(['USA', 'GBR'])

	updateView(getMaxDeaths(['USA','GBR']), getMaxVaccines(['USA','GBR']), () => {


		animateSegment('USA', dataCountry['USA'].length)
		animateSegment('GBR', dataCountry['GBR'].length)

		resetLines(['ESP', 'ITA', 'FRA', 'DEU'])
		
	})	

}})

scrolly.addTrigger({num:7, do: () => {
	console.log(7)

	circles.selectAll('circle').remove()
	labels.selectAll('g').remove()

	greyLines(['USA', 'GBR'])

	hideLines(['BRA','ARG','IND','PER', 'ZAF'])

	stretchLines(['USA', 'GBR'])

	updateView(getMaxDeaths(['ESP','ITA', 'FRA', 'DEU']), getMaxVaccines(['ESP','ITA', 'FRA', 'DEU']), () => {

		animateSegment('ESP', 6)
		animateSegment('ITA', 4)
		animateSegment('FRA', 6)
		animateSegment('DEU', 3)
		
	})

}})

scrolly.addTrigger({num:8, do: () => {
	console.log(8)

	circles.selectAll('circle').remove()
	labels.selectAll('g').remove()

	resetLines(['BRA','ARG','IND','PER', 'ZAF'])

	hideLines(['BRA','ARG','IND','PER', 'ZAF'])

	colorLines(['ESP','ITA', 'FRA', 'DEU'])


	updateView(getMaxDeaths(['ESP','ITA', 'FRA', 'DEU']), getMaxVaccines(['ESP','ITA', 'FRA', 'DEU']), () => {

		animateSegment('ESP', dataCountry['ESP'].length)
		animateSegment('ITA', dataCountry['ITA'].length)
		animateSegment('FRA', dataCountry['FRA'].length)
		animateSegment('DEU', dataCountry['DEU'].length)

	})

}})

scrolly.addTrigger({num:9, do: () => {
	console.log(9)

	let arr = ['BRA','ARG','IND','PER', 'ZAF']

	circles.selectAll('circle').remove()
	labels.selectAll('g').remove()

	greyLines(['ESP','ITA', 'FRA', 'DEU'])

	updateView(getMaxDeaths(arr), getMaxVaccines(arr), () => {

		animateSegment('BRA', 12)
		animateSegment('ARG', 12)
		animateSegment('IND', 12)
		animateSegment('PER', 12)
		animateSegment('ZAF', 12)
	})

}})

scrolly.addTrigger({num:10, do: () => {
	console.log(10)

	let arr = ['BRA','ARG','IND','PER', 'ZAF']

	circles.selectAll('circle').remove()
	labels.selectAll('g').remove()


	animateSegment('BRA', dataCountry['BRA'].length)
	animateSegment('ARG', dataCountry['ARG'].length)
	animateSegment('IND', dataCountry['IND'].length)
	animateSegment('PER', dataCountry['PER'].length)
	animateSegment('ZAF', dataCountry['ZAF'].length)
	

}})


scrolly.watchScroll();

const updateView = (maxDeaths = maxAll, maxVaccines = maxVaccinationsISR, callback = null) => {

	xScale.domain([0,maxDeaths])
	yScale.domain([maxVaccines,0])

	d3.select(".xaxis")
	.transition()
	.duration(500)
	.call(
		   d3.axisBottom(xScale)
		   .ticks(isMobile ? 3 : maxDeaths)
	)

	d3.select(".yaxis")
	.transition()
	.duration(500)
	.call(
		   d3.axisLeft(yScale)
		   .ticks(2)
		   .tickSizeInner(-width)
   )
	.selectAll("text")
	.attr('dx', 5)
	.attr('dy', -10 + 'px')

	let ls = lines.selectAll(".covid-line")

	
	ls.each( (d,i) => {

		let path = lines.select('.' + d[0].iso_code)

		path
		.transition()
		.duration(500)
		.attr('d', line(d))
		.on('end', () => {
	
			if(i === ls.nodes().length-1) callback()
		})
	})

}

const hideLines = (codes) => {

	codes.forEach(code => {

		d3.select(`.${code}.covid-line.red-line`)
		.attr('display', 'none')

	})

}

const resetLines = (codes) => {

	codes.forEach(code => {

		lines.select(`.${code}.covid-line.red-line`)
		.attr('stroke-dasharray', `0,0,0,${lengthCountry[code]}`)

	})
}


const animateSegment = (code, position, callback = null) => {

	let pointA = getLength(line(dataCountry[code].slice(0,1)));
	let pointB = getLength(line(dataCountry[code].slice(0,position)));

	lines.select(`.${code}.covid-line.red-line`)
	.attr('display', 'block')
	.transition()
	.duration(500)
	.ease(d3.easeLinear)
	.attr('stroke-dasharray', `0, ${pointA}, ${(pointB - pointA)}, ${lengthCountry[code]}`)
	.on('end', d => {

		circles
		.append('circle')
		.attr('class', code)
		.attr('cx', xScale(+d[position-1].weekly_deaths_avg_per_million))
		.attr('cy', yScale(+d[position-1].total_vaccinations_per_hundred))
		.attr('r', 5)

		labels
		.append('g')
		.attr("class", "bold auxiliar")
		.attr("transform", `translate(${xScale(d[position-1].weekly_deaths_avg_per_million)},${yScale(d[position-1].total_vaccinations_per_hundred)})`)
		.append("text")
		.attr("class", "line-text")
		.attr("dy","-0.8em")
		.text('Week ' + position)
		.call(halo)

		if(callback)callback()
	})
}

function halo(text) {
  text.select(function() { return this.parentNode.insertBefore(this.cloneNode(true), this); })
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 4)
      .attr("stroke-linejoin", "round");
}

const greyLines = (codes) => {

	codes.forEach(code => {

		lines.select(`.${code}.covid-line.red-line`).classed('red-line', false)
		lines.select(`.${code}.covid-line`).classed('grey-line', true)

	})
}

const colorLines = (codes) => {

	codes.forEach(code => {

		lines.select(`.${code}.covid-line.grey-line`).classed('grey-line', false)
		lines.select(`.${code}.covid-line`).classed('red-line', true)

	})
}

const stretchLines = (codes) => {

	codes.forEach(code => {

		lines.select(`.${code}.covid-line.grey-line`).attr('stroke-dasharray', `0,0,9000,9000`)

	})
}




