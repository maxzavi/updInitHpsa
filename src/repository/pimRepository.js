const axios = require('axios')
const fs = require('fs')

const fileJsonErr = process.env.FILE_LOGS + "LogJsonErr.txt"
const fileLogErr = process.env.FILE_LOGS + "LogErr.txt"

const auth = {
    username: process.env.PIM_API_USERNAME,
    password: process.env.PIM_API_PASSWORD
}

const updPIm = async (itemPim) => {
    const uniqueId = await getUniqueIdByItemNumber(itemPim.ItemNumber)
    const result = []

    for (let index = 0; index < itemPim.ItemEffCategory.length; index++) {
        const element = itemPim.ItemEffCategory[index];
        const groupName = Object.keys(element)[0]
        const groupId = await getIdGroupAttrib(groupName, uniqueId)
        const attribs = element[groupName][0]
        if (!groupId) {
            const rscreate = await createAttribs(uniqueId, groupName, attribs)
            if (rscreate.status) {
                const rsUpdate = await updateAttribs(uniqueId, groupName, rscreate.groupId, attribs)
                if (!rsUpdate.status) {
                    result.push({
                        groupName: groupName,
                        attribs: attribs,
                        error: rsUpdate.error
                    })
                }
            } else {
                result.push({
                    groupName: groupName,
                    attribs: attribs,
                    error: rscreate.error
                })
            }
        }
        else {
            const rsUpdate = await updateAttribs(uniqueId, groupName, groupId, attribs)
            if (!rsUpdate.status) {
                result.push({
                    groupName: groupName,
                    attribs: attribs,
                    error: rsUpdate.error
                })
            }
        }
    }
    console.log(itemPim.ItemNumber, result)
    return result
}

const getUniqueIdByItemNumber = async (itemNumber) => {
    const path = process.env.PIM_API_URL + 'fscmRestApi/resources/11.13.18.05/itemsV2?q=ItemNumber=' + itemNumber
    const result = await axios.get(path, { auth })
        .then(res => {
            const href = res.data.items[0].links[0].href
            const indexOf = href.lastIndexOf("/") + 1
            const uniqueId = href.substr(indexOf)
            return uniqueId
        })
        .catch(err => {
            errMan(err)
            return null;
        })
    return result
}

const getIdGroupAttrib = async (groupName, uniqueId) => {
    const path = process.env.PIM_API_URL + 'fscmRestApi/resources/11.13.18.05/itemsV2/' + uniqueId + "/child/ItemEffCategory/"
        + uniqueId + '/child/' + groupName
    const result = await axios.get(path, { auth })
        .then(res => {
            if (res.data.items.length == 0) return null;
            const EffLineId = res.data.items[0].EffLineId
            return EffLineId
        })
        .catch(err => {
            errMan(err)
            return null;
        })
    return result
}

const updateAttribs = async (uniqueId, groupName, groupId, attribs) => {
    const path = process.env.PIM_API_URL + 'fscmRestApi/resources/11.13.18.05/itemsV2/' + uniqueId + "/child/ItemEffCategory/"
        + uniqueId + '/child/' + groupName + "/" + groupId
    const result = await axios.patch(path, attribs, { auth })
        .then(res => {
            return {
                status: true,
                error: ""
            }
        })
        .catch(err => {
            fs.appendFile(fileJsonErr, JSON.stringify(attribs) + "\n", err => { })
            const messageErr = err.response.status==400? err.response.data.replace("\n", " ").replace("\r", " ") :  err.response.status
            fs.appendFile(fileLogErr, uniqueId + ";" + err.response.data.replace("\n", " ").replace("\r", " ") + "\n", err => { })

            return {
                status: false,
                error: messageErr
            }
        })
    return result
}

const createAttribs = async (uniqueId, groupName, attribs) => {
    const path = process.env.PIM_API_URL + 'fscmRestApi/resources/11.13.18.05/itemsV2/' + uniqueId + "/child/ItemEffCategory/"
        + uniqueId + '/child/' + groupName
    const result = await axios.post(path, attribs, { auth })
        .then(res => {
            if (res.status == 201) {
                return {
                    status: true,
                    error: "",
                    groupId: res.data.EffLineId
                }
            }
            else {
                return {
                    status: false,
                    error: res.status
                }
            }
        })
        .catch(err => {
            fs.appendFile(fileJsonErr, JSON.stringify(attribs) + "\n", err => { })
            fs.appendFile(fileLogErr, uniqueId + ";" + err.response.data.replace("\n", " ").replace("\r", " ") + "\n", err => { })

            return {
                status: false,
                error: err.response.data.replace("\n", " ").replace("\r", " ")
            }
        })
    return result
}

const errMan = (err) => {
    console.log(err)
    if (err.code === "ERR_BAD_REQUEST") {
        console.log(err.response.status + " -> " + err.response.statusText + " : " + err.response.data)
    } else {
        console.log(err.code)
        console.log(err.cause)
    }
}


module.exports = { updPIm }