const { map } = require("./config/map");

//console.log(map)
console.log("AttribPim;AttribTypePIM;Field Name Excel;SplitBy;fieldIdInSplit;Is UOM;Is Multirow;Yes/NOT;Allow blank")
map.forEach(element => {
    console.log(element[0]+";"+ element[1]+";"+ element[2] + ";" + element[3]+";"+element[4]+";"+element[5]+";"+element[6]+";"+element[7]+";"+element[8])
});

