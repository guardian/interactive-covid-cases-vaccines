import * as d3 from 'd3'
import * as moment from 'moment'
import data from 'assets/all.json'
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
let lines = svg.append('g')
let circles = svg.append('g')
let labels = svg.append("g")

const selectedCountries = ['ISR','USA','GBR','ESP','ITA','FRA','DEU','BRA','ARG','IND','PAK', 'ZAF']

const dataCountry = []

selectedCountries.map(d => {

	dataCountry[d] = data.filter(f => f.iso_code === d).filter((d,i) => i%7 == 0)

	console.log(dataCountry[d])

})

let maxVaccinationsISR = d3.max(dataCountry['ISR'], d => +d.daily_vaccinations_per_million)
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
		arr.push(d3.max(dataCountry[code], m => +m.daily_vaccinations_per_million))
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
.y(d => yScale(+d.daily_vaccinations_per_million))

const getLength = (path) => {
	return d3.create("svg:path").attr("d", path).node().getTotalLength();
}

const lengthCountry = []

selectedCountries.map(d => {

	lengthCountry[d] = getLength(line(dataCountry[d]))

})

let ISRGreyline = lines.append("path")
.datum(dataCountry['ISR'])
.attr("class", "ISR covid-line grey-line")
.attr("d", line)

let ISRcircles = circles.selectAll('circle')
.data(dataCountry['ISR'])
.enter()
.append('circle')
.attr('class', (d,i) => 'grey-circle circle' + i)
.attr('cx', d => xScale(+d.weekly_deaths_avg_per_million))
.attr('cy', d => yScale(+d.daily_vaccinations_per_million))
.attr('r', 5)
.attr('display', (d,i) => i % 2 == 0 ? 'block' : 'none')

const halo = (text) => {

	text.select(function() { return this.parentNode.insertBefore(this.cloneNode(true), this); })
	.attr('class' , 'halo-text')
}

labels.selectAll('g')
.data(dataCountry['ISR'])
.enter()
.append('g')
.attr('class', (d,i) => 'ISR label' + i)
.attr("transform", d => `translate(${xScale(d.weekly_deaths_avg_per_million)},${yScale(d.daily_vaccinations_per_million)})`)
.append("text")
.attr("class", "line-text")
.attr("dy","-0.8em")
.text((d,i) => {
	if(i % 2 == 0)return 'Week ' + (i + 1)
})
.call(halo);

labels.transition()
.delay((d, i) => getLength(line(dataCountry['ISR'].slice(0, i + 1))) / getLength(line(dataCountry['ISR'])) * (1000 - 125))
.attr("opacity", 1);

selectedCountries.map(code => {

	lines.append("path")
	.datum(dataCountry[code])
	.attr("class", `${code} covid-line red-line`)
	.attr('stroke-dasharray', `0,0,${getLength(line(dataCountry[code].slice(0,1)))},${lengthCountry[code]}`)
	.attr("d", line)
	.attr('display', 'none')

	circles
	.append('circle')
	.attr('class', code + ' ' + status)
	.attr('cx', xScale(+dataCountry[code][dataCountry[code].length-1].weekly_deaths_avg_per_million))
	.attr('cy', yScale(+dataCountry[code][dataCountry[code].length-1].daily_vaccinations_per_million))
	.attr('r', 5)

	labels
	.append('g')
	.attr("class", `${code} bold auxiliar`)
	.attr("transform", `translate(${xScale(dataCountry[code][dataCountry[code].length-1].weekly_deaths_avg_per_million)},${yScale(dataCountry[code][dataCountry[code].length-1].daily_vaccinations_per_million)})`)
	.append("text")
	.attr("class", "line-text")
	.attr("dy","-0.8em")
	.text('Week ' + dataCountry[code].length)
	.call(halo);

})


const scrolly = new ScrollyTeller({
	parent: document.querySelector("#gv-scrolly-1"),
    triggerTop: .5, // percentage from the top of the screen that the trigger should fire
    triggerTopMobile: 0.75,
    transparentUntilActive: true
});

scrolly.addTrigger({num: 1, do: () => {
	console.log(1)

	circles.selectAll('circle').attr('display', 'none')
	circles.selectAll('.grey-circle').attr('display', 'block')

	labels.selectAll('g').attr('display', 'none')
	labels.selectAll('.ISR').attr('display', 'block')

	d3.select('.ISR.covid-line.grey-line').style('stroke') == 'rgb(218, 218, 218)' ? d3.select('.ISR.covid-line.grey-line').style('stroke', '#c70000') : d3.select('.ISR.covid-line.grey-line').style('stroke', '#dadada')

	d3.selectAll('.grey-circle')
	.style('fill', '#c70000')

	labels.select('.label6')
	.classed(' bold', false)



}})

scrolly.addTrigger({num: 2, do: () => {
	console.log(2)

	circles.selectAll('circle').attr('display', 'none')
	circles.selectAll('.grey-circle').attr('display', 'block')

	labels.select('.label7')
	.selectAll('text')
	.text('')

	circles.select('.circle7')
	.attr('display','none')	

	labels.select('.label6')
	.classed(' bold', true)


	d3.selectAll('.grey-circle')
	.filter((d,i) => i >= 7)
	.style('fill', '#dadada')


	d3.select('.ISR.covid-line.grey-line')
	.transition()
	.duration(500)
	.style('stroke', '#dadada')


	lines.select('.ISR.covid-line.red-line')
	.attr('display', 'block')
	.transition()
	.duration(500)
	.ease(d3.easeLinear)
	.attr('stroke-dasharray', `0, ${getLength(line(dataCountry['ISR'].slice(0,1)))}, ${(getLength(line(dataCountry['ISR'].slice(0,7))) - getLength(line(dataCountry['ISR'].slice(0,1))))}, ${lengthCountry['ISR']}`);


}})

scrolly.addTrigger({num: 3, do: () => {
	console.log(3)

	circles.selectAll('circle').attr('display', 'none')
	circles.selectAll('.grey-circle').attr('display', 'block')

	labels.select('.label6')
	.classed(' bold', false)
	
	labels.select('.label22')
	.classed(' bold', false)

	labels.select('.label7')
	.classed(' bold', true)
	.selectAll('text')
	.text('Week 8')

	circles.select('.circle7')
	.attr('display','block')

	let pos = 8

	let l1 = getLength(line(dataCountry['ISR'].slice(0,1)))
	let l2 = getLength(line(dataCountry['ISR'].slice(0,pos)))

	lines.select('.ISR.covid-line.red-line')
	.attr('display', 'block')
	.transition()
	.duration(500)
	.ease(d3.easeLinear)
	.attr('stroke-dasharray', `0, ${l1}, ${(l2 - l1)}, ${lengthCountry['ISR']}`)

	d3.selectAll('.grey-circle')
	.filter((d,i) => i <= pos-1)
	.style('fill', '#c70000')

	d3.selectAll('.grey-circle')
	.filter((d,i) => i > pos-1)
	.style('fill', '#dadada')

	resetLines(['USA', 'GBR'])

	
}})

scrolly.addTrigger({num: 4, do: () => {
	console.log(4)

	circles.selectAll('circle').attr('display', 'none')

	labels.selectAll('.auxiliar').attr('display', 'none')

	labels.select('.label7')
	.selectAll('text')
	.text('')

	labels.select('.label22')
	.classed(' bold', true)

	hideLines(['USA', 'GBR'])


	updateView(getMaxDeaths(['ISR']), getMaxVaccines(['ISR']), () => {

		lines.select('.ISR.covid-line.red-line')
		.attr('display', 'block')
		.transition()
		.duration(500)
		.ease(d3.easeLinear)
		.attr('stroke-dasharray', `0, 0, ${lengthCountry['ISR']}, ${lengthCountry['ISR']}`)
		
		resetLines(['USA', 'GBR'])

		d3.selectAll('.grey-circle')
		.attr('display', (d,i) => i % 2 == 0 ? 'block' : 'none')
		.style('fill', '#c70000')

		labels.selectAll('g').filter(d => d != undefined).attr('display', 'block')

	})
	
}})

scrolly.addTrigger({num:5, do: () => {
	console.log(5)

	circles.selectAll('circle').attr('display', 'none')

	labels.selectAll('g').attr('display', 'none')

	hideLines(['ISR', 'ESP', 'ITA', 'FRA', 'DEU'])

	updateView(getMaxDeaths(['USA','GBR']), getMaxVaccines(['USA','GBR']), () => {


		let usa1 = getLength(line(dataCountry['USA'].slice(0,1)))
		let usa2 = getLength(line(dataCountry['USA'].slice(0,5)))

		lines.select('.USA.covid-line.red-line')
		.attr('display', 'block')
		.transition()
		.duration(500)
		.ease(d3.easeLinear)
		.attr('stroke-dasharray', `0, ${usa1}, ${(usa2 - usa1)}, ${lengthCountry['USA']}`)
		.on('end', d => {

			circles
			.append('circle')
			.attr('class', 'USA')
			.attr('cx', xScale(+d[4].weekly_deaths_avg_per_million))
			.attr('cy', yScale(+d[4].daily_vaccinations_per_million))
			.attr('r', 5)

			labels
			.append('g')
			.attr("class", "bold auxiliar")
			.attr("transform", `translate(${xScale(d[4].weekly_deaths_avg_per_million)},${yScale(d[4].daily_vaccinations_per_million)})`)
			.append("text")
			.attr("class", "line-text")
			.attr("dy","-0.8em")
			.text('Week 5')
			.call(halo);
		})

		let gbr1 = getLength(line(dataCountry['GBR'].slice(0,1)))
		let gbr2 = getLength(line(dataCountry['GBR'].slice(0,4)))

		lines.select('.GBR.covid-line.red-line')
		.attr('display', 'block')
		.transition()
		.duration(500)
		.ease(d3.easeLinear)
		.attr('stroke-dasharray', `0, ${usa1}, ${(gbr2 - gbr1)}, ${lengthCountry['GBR']}`)
		.on('end', d => {

			circles
			.append('circle')
			.attr('class', 'GBR')
			.attr('cx', xScale(+d[3].weekly_deaths_avg_per_million))
			.attr('cy', yScale(+d[3].daily_vaccinations_per_million))
			.attr('r', 5)

			labels
			.append('g')
			.attr("class", "bold auxiliar")
			.attr("transform", `translate(${xScale(d[3].weekly_deaths_avg_per_million)},${yScale(d[3].daily_vaccinations_per_million)})`)
			.append("text")
			.attr("class", "line-text")
			.attr("dy","-0.8em")
			.text('Week 4')
			.call(halo);
		})

		resetLines(['USA', 'GBR'])
		
	})	

}})

scrolly.addTrigger({num:6, do: () => {
	console.log(6)

	circles.selectAll('circle').attr('display', 'none')

	labels.selectAll('g').attr('display', 'none')

	hideLines(['ISR', 'ESP', 'ITA', 'FRA', 'DEU'])

	updateView(getMaxDeaths(['USA','GBR']), getMaxVaccines(['USA','GBR']), () => {


		animateLines(['USA', 'GBR'])

		resetLines(['ESP', 'ITA', 'FRA', 'DEU'])
		
	})	

}})

scrolly.addTrigger({num:7, do: () => {
	console.log(7)

	circles.selectAll('circle').attr('display', 'none')

	labels.selectAll('g').attr('display', 'none')

	greyLines(['USA', 'GBR'])

	hideLines(['BRA','ARG','IND','PAK', 'ZAF'])

	updateView(getMaxDeaths(['ESP','ITA', 'FRA', 'DEU']), getMaxVaccines(['ESP','ITA', 'FRA', 'DEU']), () => {

		animateLines(['ESP','ITA', 'FRA', 'DEU'])
		
	})

}})

scrolly.addTrigger({num:8, do: () => {
	console.log(8)

	let arr = ['BRA','ARG','IND','PAK', 'ZAF']

	labels.selectAll('g').attr('display', 'none')

	circles.selectAll('circle').attr('display', 'none')

	greyLines(['ESP','ITA', 'FRA', 'DEU'])

	arr.forEach(d => {
		lines.select('.' + d)
		.classed('black', true)
	})

	updateView(getMaxDeaths(arr), getMaxVaccines(arr), () => {

		animateLines(arr, 'black')
	})

}})

scrolly.addTrigger({num:9, do: () => {
	console.log(9)

	//circles.selectAll('circle').attr('display', 'none')

	circles.selectAll('circle').classed('black', false)
	lines.selectAll('.black').classed('black', false)

	let arr = ['BRA','ARG','IND','PAK', 'ZAF']



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

	lines.selectAll(".covid-line")
	.each( d => {

		d3.select('.' + d[0].iso_code)
		.transition()
		.duration(500)
		.attr('d', line(d))
		.on('end', callback)
	})

}

const hideLines = (codes) => {

	codes.forEach(code => {

		lines.select(`.${code}.covid-line.red-line`)
		.attr('display', 'none')

	})

}

const resetLines = (codes) => {

	codes.forEach(code => {

		lines.select(`.${code}.covid-line.red-line`)
		.attr('stroke-dasharray', `0,0,0,${lengthCountry[code]}`)

	})
}

const animateLines = (codes , status = null) => {

	codes.forEach(code => {

		lines.select(`.${code}.covid-line.red-line`)
		.attr("d", line)
		.attr('display', 'block')
		.transition()
		.duration(500)
		.ease(d3.easeLinear)
		.attr('stroke-dasharray', `0, 0, ${lengthCountry[code] + 200}, ${lengthCountry[code] + 200}`)
		.on('end', d =>{
			circles
			.select('.' + code)
			.attr('cx', xScale(+dataCountry[code][dataCountry[code].length-1].weekly_deaths_avg_per_million))
			.attr('cy', yScale(+dataCountry[code][dataCountry[code].length-1].daily_vaccinations_per_million))
			.attr('display', 'block')
			

			let st = status ? true : false

			circles
			.select('.' + code)
			.classed('black', st)

			labels
			.select('.'+code)
			.attr("transform", `translate(${xScale(dataCountry[code][dataCountry[code].length-1].weekly_deaths_avg_per_million)},${yScale(dataCountry[code][dataCountry[code].length-1].daily_vaccinations_per_million)})`)
			.attr('display', 'block')
		})

		let cl = lines.select(`.${code}.covid-line`).attr('class').indexOf('red-line') != -1 ? 'grey-line' : 'red-line'

		lines.select(`.${code}.covid-line`)
		.classed(cl, true)
	})

}

const greyLines = (codes) => {

	codes.forEach(code => {

		lines.select(`.${code}.covid-line.red-line`).classed('red-line', false)
		lines.select(`.${code}.covid-line`).classed('grey-line', true)

	})
}





