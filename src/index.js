require('dotenv').config()
const fs = require('fs')
const { updPIm } = require('./repository/pimRepository')
const { getItemsInput } = require('./repository/inputRepository')


const main = async()=>{
    const itemsInput = await getItemsInput()
    const fileLogOk= process.env.FILE_LOGS+ "LogOk.txt"
    const fileLogErr=process.env.FILE_LOGS+ "LogErr.txt"
    const fileSkuOk= process.env.FILE_LOGS+ "LogSkuOk.txt"
    const fileSkuErr=process.env.FILE_LOGS+ "LogSkuErr.txt"
    const fileJsonErr = process.env.FILE_LOGS + "LogJsonErr.txt"
        
    fs.writeFile(fileLogOk, "", err=>{})
    fs.writeFile(fileLogErr, "", err=>{})
    fs.writeFile(fileSkuOk, "", err=>{})
    fs.writeFile(fileSkuErr, "", err=>{})
    fs.writeFile(fileJsonErr, "", err=>{})
    
    for (let x = 0; x < itemsInput.length; x++) {
        const element = itemsInput[x];
        await Promise.all(element.map(async ({item, sku}) => {
            
            const contents = await updPIm(item)
            if (contents.length==0){
                fs.appendFile(fileSkuOk,item.ItemNumber + "\n", err=>{})
            }else{
                fs.appendFile(fileSkuErr,item.ItemNumber + JSON.stringify(contents) +  "\n", err=>{})
            }
          }))
    }

}

main()