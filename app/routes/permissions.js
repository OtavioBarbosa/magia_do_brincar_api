const express = require("express")
const route = express.Router()
const { mysql } = require("../helpers/mysql")
const moment = require("moment")

route.get('/', async (request, response) => {

    let permissions = await mysql.queryAsync(`SELECT p.* FROM permissions AS p WHERE p.deleted_at IS NULL`)
    
    return response.status(200).json({
        data: permissions
    })

})

route.post('/', async (request, response) => {

    const {permission} = request.body

    let register = await mysql.queryAsync(`INSERT INTO permissions (permission, created_at) VALUES (?, ?)`, [permission, moment().format('YYYY-MM-DD HH:mm:ss')])
    
    return response.status(201).json({
        data: register.insertId
    })

})

route.put('/:id', async (request, response) => {

    const {permission} = request.body

    await mysql.queryAsync(`UPDATE permissions SET permission = ?, updated_at = ? WHERE id = ?`, [permission, moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(200).json({
        data: parseInt(request.params.id)
    })

})

route.delete('/:id', async (request, response) => {

    await mysql.queryAsync(`UPDATE permissions SET deleted_at = ? WHERE id = ?`, [moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(204).json({
        data: parseInt(request.params.id)
    })
})


module.exports = route