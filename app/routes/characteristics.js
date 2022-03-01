const express = require("express")
const route = express.Router()
const { mysql } = require("../helpers/mysql")
const moment = require("moment")

route.get('/', async (request, response) => {

    let characteristics = await mysql.queryAsync(`SELECT c.* FROM characteristics AS c WHERE c.deleted_at IS NULL`)
    
    return response.status(200).json({
        data: characteristics
    })

})

route.post('/', async (request, response) => {

    const {characteristic} = request.body

    let register = await mysql.queryAsync(`INSERT INTO characteristics (characteristic, created_at) VALUES (?, ?)`, [characteristic, moment().format('YYYY-MM-DD HH:mm:ss')])
    
    return response.status(201).json({
        data: register.insertId
    })

})

route.put('/:id', async (request, response) => {

    const {characteristic} = request.body

    await mysql.queryAsync(`UPDATE characteristics SET characteristic = ?, updated_at = ? WHERE id = ?`, [characteristic, moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(200).json({
        data: parseInt(request.params.id)
    })

})

route.delete('/:id', async (request, response) => {

    await mysql.queryAsync(`UPDATE characteristics SET deleted_at = ? WHERE id = ?`, [moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(204).json({
        data: parseInt(request.params.id)
    })

})


module.exports = route