const fs = require('fs')
const { convert } = require('../config/convert')

const getItemsInput = async ()=>{
    const filepath= process.env.FILE_PATH
    const data = fs.readFileSync(filepath,'utf8')
    const rows = data.split('\n')

    const tags = rows[0].replace("\r","").split(';')

    const csv=require('csvtojson')

    const items = await csv({
        noheader:false,
        output: "csv",
        delimiter: ";"
    })
    .fromString(data)
    .then((csvRow)=>{

        const items =[] 
        for (let index = 0; index < csvRow.length; index++) {
            const {item,sku} =  convert  (csvRow[index],tags)
            items.push({item:item, sku:sku})
         }
         return items
    })

    console.log('Son: ' + items.length)

    const chunkedArray = [];
    let chunk = [];
    for (let i = 0; i < items.length; i++) {
      chunk.push(items[i]);
      if ((i + 1) % 40 === 0) {
        chunkedArray.push(chunk);
        chunk = [];
      }
    }
    if (chunk.length > 0) {
      chunkedArray.push(chunk);
    }
    return chunkedArray;
}

module.exports = {getItemsInput}