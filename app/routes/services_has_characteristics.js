const express = require("express")
const route = express.Router()
const { mysql } = require("../helpers/mysql")
const moment = require("moment")

route.get('/', async (request, response) => {

    let services_has_characteristics = await mysql.queryAsync(`SELECT s.* FROM services_has_characteristics AS s WHERE s.deleted_at IS NULL`)
    
    return response.status(200).json({
        data: services_has_characteristics
    })

})

route.post('/', async (request, response) => {

    const {service_id, characteristic_id} = request.body

    let register = await mysql.queryAsync(`INSERT INTO services_has_characteristics (service_id, characteristic_id, created_at) VALUES (?, ?, ?)`, [service_id, characteristic_id, moment().format('YYYY-MM-DD HH:mm:ss')])
    
    return response.status(201).json({
        data: register.insertId
    })

})

route.put('/:id', async (request, response) => {

    const {service_id, characteristic_id} = request.body

    await mysql.queryAsync(`UPDATE services_has_characteristics SET service_id = ?, characteristic_id = ?, updated_at = ? WHERE id = ?`, [service_id, characteristic_id, moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(200).json({
        data: parseInt(request.params.id)
    })

})

route.delete('/:id', async (request, response) => {

    await mysql.queryAsync(`UPDATE services_has_characteristics SET deleted_at = ? WHERE id = ?`, [moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(204).json({
        data: parseInt(request.params.id)
    })

})


module.exports = route