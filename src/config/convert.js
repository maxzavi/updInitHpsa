const { ItemPIM } = require("./itemPim")
const { map } = require("./map")

const convert = (row, tags)=>{
    if(!row) return
    const item = JSON.parse(JSON.stringify(ItemPIM))
    //item.ItemDescription=getValueByTag(row,tags,"<Name>")
    //item.ItemCategory[0].ItemCatalog="HPSA"
    //item.ItemCategory[0].CategoryCode="HPSA_LIN_"+getValueByTag(row,tags,"Línea Promart").substring(0,5)
    sku =getValueByTag(row,tags,"SKU.")
    item.ItemNumber=getValueByTag(row,tags,"Item Number")    

    map.forEach(mapRow=>{
        let valueAttrib= getValueByTag(row,tags,mapRow[2])
        if (valueAttrib){
            let vattribName = mapRow[0]

            let valueAttribUOM= null
            let vattribNameUOM= null
            //split by mapRow[3]
            if (mapRow[3]){
                if (mapRow[3]!=""){
                    valueAttrib = valueAttrib.split(mapRow[3])[mapRow[4]]
                }    
            }
            //UOM mapRow[5]
            if (mapRow[5]){
                if (mapRow[5]="1"){
                    valueAttribUOM=valueAttrib.split(" ")[1] 
                    vattribNameUOM=vattribName+ "UEUOM"    
                    valueAttrib=valueAttrib.split(" ")[0] 
                    vattribName="u"+vattribName+ "UE"
                    if(valueAttrib==="0") valueAttrib=""
                }
            }
            //Yes/NOT
            if(mapRow[7]){
                if(mapRow[7]==1){
                    valueAttrib= valueAttrib.substring(0,2)
                }
            }

            if (valueAttrib){
                //Multislect mapRow[6]
                if (mapRow[6]){
                    const multivalues = valueAttrib.split(";")
                    addValue(mapRow[1],vattribName, multivalues[0], item)

                    for (let indexMv = 1; indexMv < multivalues.length; indexMv++) {
                        const element = multivalues[indexMv];
                        addDefaultAttribMultiselect(mapRow[1],vattribName, element, item,indexMv)
                    }

                }else{
                    addValue(mapRow[1],vattribName, valueAttrib, item)
                }
            }
            if (valueAttribUOM){
                addValue(mapRow[1],vattribNameUOM, valueAttribUOM, item)
            }

        }
    })

    let attrGroup = item.ItemEffCategory.find(t => Object.keys(t)[0] === "HpsaAtributosLogisticos")
    if (attrGroup){        
        addValue("HpsaAtributosLogisticos","volumenDelProductoUEUOM", "cm3", item)
        addValue("HpsaAtributosLogisticos","volumenUlTextUEUOM", "cm3", item)
        addValue("HpsaAtributosLogisticos","pesoDelMasterpackLogisticaUEUOM", "kg", item)
        addValue("HpsaAtributosLogisticos","volumenDeLaUnidadLogisticaUEUOM", "cm3", item)
        addValue("HpsaAtributosLogisticos","volumenDelMasterpackLogisticaUEUOM", "cm3", item)
    }
    return {item:item, sku:sku}
}

//Attrib by default in Attr Group
const addDefaultAttrib = (groupName, attribName, attribValue, item)=>{
    let attrGroup = item.ItemEffCategory.find(t => Object.keys(t)[0] === groupName)
    if (attrGroup){
        const attribExists = attrGroup[groupName].find(t => Object.keys(t)[0] === attribName)
        if(!attribExists) attrGroup[groupName][0][attribName]=attribValue
    }
}

const getValueByTag = (row, tags, tag)=>{
    const index = tags.findIndex(t=> t===tag)
    return row[index]
}

const addValue = (groupName, attribName, attribValue, item)=>{

    let valFinal;
    if (isFloat(attribValue)){
        valFinal= parseFloat(attribValue)
    }else{
        valFinal=attribValue
    }

    let attrGroup = item.ItemEffCategory.find(t => Object.keys(t)[0] === groupName)
    if(!attrGroup){
        const attribGroup={}
        attribGroup[groupName]=[]
        item.ItemEffCategory.push(attribGroup)
        attrGroup = item.ItemEffCategory.find(t => Object.keys(t)[0] === groupName)
    }
    if (attrGroup[groupName].length==0){
        attrGroup[groupName].push({})
    }
    attrGroup[groupName][0][attribName]=valFinal
}

function isFloat(n) {
    if( n.match(/^-?\d*(\.\d+)?$/) && !isNaN(parseFloat(n))  )
       return true;
    return false;
 }

//Attrib MultiSelect in Attr Group
const addDefaultAttribMultiselect = (groupName, attribName, attribValue, item, index)=>{
    let attrGroup = item.ItemEffCategory.find(t => Object.keys(t)[0] === groupName)
    if (attrGroup){
        attrGroup[groupName].push({})
        attrGroup[groupName][index][attribName]=attribValue
    }
}
module.exports={convert}