const express = require("express")
const route = express.Router()
const { mysql } = require("../helpers/mysql")
const moment = require("moment")

route.get('/', async (request, response) => {

    let addresses = await mysql.queryAsync(`SELECT a.* FROM addresses AS a WHERE a.deleted_at IS NULL`)
    
    return response.status(200).json({
        data: addresses
    })

})

route.post('/', async (request, response) => {

    const {postal_code, public_place, number, district, city, uf, complement, description} = request.body

    let address = await mysql.queryAsync(`INSERT INTO addresses (postal_code, public_place, number, district, city, uf, complement, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [postal_code, public_place, number, district, city, uf, complement, moment().format('YYYY-MM-DD HH:mm:ss')])
    
    await mysql.queryAsync(`INSERT INTO users_has_addresses (user_id, address_id, description, created_at) VALUES (?, ?, ?, ?)`, [request.user, address.insertId, description, moment().format('YYYY-MM-DD HH:mm:ss')])

    return response.status(201).json({
        data: address.insertId
    })

})

route.put('/:id', async (request, response) => {

    const {postal_code, public_place, number, district, city, uf, complement, description} = request.body

    await mysql.queryAsync(`UPDATE addresses SET postal_code = ?, public_place = ?, number = ?, district = ?, city = ?, uf = ?, complement = ?, updated_at = ? WHERE id = ?`, [postal_code, public_place, number, district, city, uf, complement, moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    await mysql.queryAsync(`UPDATE users_has_addresses SET description = ?, updated_at = ? WHERE user_id = ? AND address_id = ?`, [description, moment().format('YYYY-MM-DD HH:mm:ss'), request.user, request.params.id])

    return response.status(200).json({
        data: parseInt(request.params.id)
    })

})

route.delete('/:id', async (request, response) => {

    await mysql.queryAsync(`UPDATE addresses SET deleted_at = ? WHERE id = ?`, [moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(204).json({
        data: parseInt(request.params.id)
    })

})


module.exports = route