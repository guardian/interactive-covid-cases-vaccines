import mainHTML from "./atoms/small-multiples/server/templates/main.html!text"
/*import data from 'assets/all.json'
import income from 'assets/income.json'

import fs from 'fs'



let allArr = []


income.forEach(d => {

    allArr.push({
        code:d.code,
        country:d.country,
        income:d.developing
    })

})


fs.writeFileSync('assets/income.json', JSON.stringify(allArr));

console.log(data)*/



export async function render() {
    return mainHTML;
} 