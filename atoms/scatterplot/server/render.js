import mainHTML from "./atoms/scatterplot/server/templates/main.html!text"
/*import fs from 'fs'
import axios from 'axios'
import csvParse from "csv-parse/lib/es5/sync";
import moment from 'moment'


const urls = [
'https://interactive.guim.co.uk/2021/jan/jhu/processed-jhu-cases-data.json',
'https://interactive.guim.co.uk/2021/jan/jhu/processed-jhu-deaths-data.json',
'https://interactive.guim.co.uk/2021/jan/vaccinations/vaccinations.csv'
]


async function fetch(url){

    const dataRaw = await axios.get(url);

    return dataRaw

}


const prettyCountryName = (name) => {

    switch(name) {
        case 'Cabo Verde': return 'Cape Verde'; break;
        case 'Congo (Brazzaville)' : return 'Congo'; break;
        case 'Czech Republic' : return 'Czechia'; break;
        case 'Congo (Kinshasa)' : return 'Democratic Republic of Congo'; break;
        case 'Burma' : return 'Myanmar'; break;
        case 'Cyprus' : return 'Northern Cyprus'; break;
        case 'West Bank and Gaza' : return 'Palestine'; break;
        case 'Korea, South' : return 'South Korea'; break;
        case 'Timor-Leste' : return 'Timor'; break;
        case 'UK' : return 'United Kingdom'; break;
        case 'US' : return 'United States'; break;
        default: return name;
    }

}

Promise.all(urls.map(u=>fetch(u)))
.then(results => {


    let allArr = [];

    const cases = results[0].data;
    const deaths = results[1].data;
    const vaccinationsRaw = csvParse(results[2].data.toString(),{columns: true});
    let vaccinations = [];

    vaccinationsRaw.map((d,i) => {

        if(d.iso_code.length <= 3)vaccinations.push(d)
    })

    let casesDates = [];
    let deathsDates = [];

    Object.keys(cases[0]).map( d => {
       d.split('/').length == 3 ? casesDates.push(d) : ''
    })

    Object.keys(deaths[0]).map( d => {
       d.split('/').length == 3 ? deathsDates.push(d) : ''
    })


    let casesDaily = []

    cases.map(country => {

        let obj = {country:prettyCountryName(country['Country/Region']), population:country.population, cases:[]}

        casesDates.map((d,i) => {

            let daily = i > 0 ? country[d] - country[casesDates[i-1]] : 0

            obj.cases.push({date:d, cases:daily})
        })


        casesDaily.push(obj)
       
    })

    let deathsDaily = []

    deaths.map(country => {

        let obj = {country:prettyCountryName(country['Country/Region']), population:country.population, deaths:[]}

        deathsDates.map((d,i) => {

            let daily = i > 0 ? country[d] - country[deathsDates[i-1]] : 0

            obj.deaths.push({date:d, deaths:daily})
        })


        deathsDaily.push(obj)
       
    })

//console.log(casesDaily, deathsDaily)
//daily_vaccinations_per_million
//weekly_deaths_avg_per_million

    const vaccinationsCountryNames = [... new Set(vaccinations.map(d => d.location))]


    vaccinationsCountryNames.map(d => {

        let vaccines = vaccinations.filter(f => f.location === d)
        let matchCases = casesDaily.find(f => f.country === d);
        let matchDeaths = deathsDaily.find(f => f.country === d);

        if(matchCases && matchDeaths){

            vaccines.map(f => {

                let vacDate = moment(f.date, "YYYY-MM-DD");

                f.daily_cases = +matchCases.cases.find(f => f.date === moment(vacDate).format('M/D/YY')).cases
                f.daily_deaths = +matchDeaths.deaths.find(f => f.date === moment(vacDate).format('M/D/YY')).deaths
            
            })

            let country = vaccines.filter(e => e.location === d);

            country.forEach((date,i) => {


                let sevenDayStretch = vaccines.filter((r, j) => { return (i - j) < 7 && (i - j) > -1 });

                let arrCases = sevenDayStretch.map(d => d.daily_cases)

                let avgCases = arrCases.reduce((a, b) => (a + b)) / arrCases.length;

                let arrDeaths = sevenDayStretch.map(d => d.daily_deaths)

                let avgDeaths = arrDeaths.reduce((a, b) => (a + b)) / arrDeaths.length;

                country[i].weekly_cases_avg = avgCases;
                country[i].weekly_deaths_avg = avgDeaths;
                country[i].weekly_cases_avg_per_million = +((avgCases / +matchCases.population) * 1000000).toFixed(2);
                country[i].weekly_deaths_avg_per_million = +((avgDeaths / +matchDeaths.population) * 1000000).toFixed(2);

                allArr.push(
                {
                    location: date.location,
                    iso_code: date.iso_code,
                    date: date.date,
                    weekly_deaths_avg_per_million:+((avgDeaths / +matchDeaths.population) * 1000000).toFixed(2),
                    weekly_cases_avg_per_million:+((avgCases / +matchCases.population) * 1000000).toFixed(2),
                    daily_vaccinations_per_million:+date.daily_vaccinations_per_million,
                    people_vaccinated_per_hundred:+date.people_vaccinated_per_hundred
                })

            })
        }
        else
        {
            console.log(d)
        }


        //console.log(allArr)

        

    })


    fs.writeFileSync('assets/all.json', JSON.stringify(allArr));



})*/



export async function render() {
    return mainHTML;
} 