const express = require("express")
const route = express.Router()
const { mysql } = require("../helpers/mysql")
const moment = require("moment")

route.get('/', async (request, response) => {

    let services = await mysql.queryAsync(`SELECT s.* FROM services AS s WHERE s.deleted_at IS NULL`)
    
    return response.status(200).json({
        data: services
    })

})

route.post('/', async (request, response) => {

    const {service, description} = request.body

    let register = await mysql.queryAsync(`INSERT INTO services (service, description, created_at) VALUES (?, ?, ?)`, [service, description, moment().format('YYYY-MM-DD HH:mm:ss')])
    
    return response.status(201).json({
        data: register.insertId
    })

})

route.put('/:id', async (request, response) => {

    const {service, description} = request.body

    await mysql.queryAsync(`UPDATE services SET service = ?, description = ?, updated_at = ? WHERE id = ?`, [service, description, moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(200).json({
        data: parseInt(request.params.id)
    })

})

route.delete('/:id', async (request, response) => {

    await mysql.queryAsync(`UPDATE services SET deleted_at = ? WHERE id = ?`, [moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(204).json({
        data: parseInt(request.params.id)
    })

})


module.exports = route