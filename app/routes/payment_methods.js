const express = require("express")
const route = express.Router()
const { mysql } = require("../helpers/mysql")
const moment = require("moment")

route.get('/', async (request, response) => {

    let payment_methods = await mysql.queryAsync(`SELECT p.* FROM payment_methods AS p WHERE p.deleted_at IS NULL`)
    
    return response.status(200).json({
        data: payment_methods
    })

})

route.post('/', async (request, response) => {

    const {payment_method} = request.body

    let register = await mysql.queryAsync(`INSERT INTO payment_methods (payment_method, created_at) VALUES (?, ?)`, [payment_method, moment().format('YYYY-MM-DD HH:mm:ss')])
    
    return response.status(201).json({
        data: register.insertId
    })

})

route.put('/:id', async (request, response) => {

    const {payment_method} = request.body

    await mysql.queryAsync(`UPDATE payment_methods SET payment_method = ?, updated_at = ? WHERE id = ?`, [payment_method, moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(200).json({
        data: parseInt(request.params.id)
    })

})

route.delete('/:id', async (request, response) => {

    await mysql.queryAsync(`UPDATE payment_methods SET deleted_at = ? WHERE id = ?`, [moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(204).json({
        data: parseInt(request.params.id)
    })
})


module.exports = route