const express = require("express")
const route = express.Router()
const { mysql } = require("../helpers/mysql")
const moment = require("moment")

const remove_text_phone = (number) => {
    return number.replace(/\D/g, '')
} 

route.get('/', async (request, response) => {

    let phones = await mysql.queryAsync(`SELECT p.* FROM phones AS p WHERE p.deleted_at IS NULL`)
    
    return response.status(200).json({
        data: phones
    })

})

route.post('/', async (request, response) => {

    let {number, ddd, type, description} = request.body

    number = remove_text_phone(number)
    ddd = remove_text_phone(ddd)

    let phone = await mysql.queryAsync(`INSERT INTO phones (phone, ddd, type, created_at) VALUES (?, ?, ?, ?)`, [number, ddd, type, moment().format('YYYY-MM-DD HH:mm:ss')])
    
    await mysql.queryAsync(`INSERT INTO users_has_phones (user_id, phone_id, description, created_at) VALUES (?, ?, ?, ?)`, [request.user, phone.insertId, description, moment().format('YYYY-MM-DD HH:mm:ss')])
    
    return response.status(201).json({
        data: phone.insertId
    })

})

route.put('/:id', async (request, response) => {

    let {number, ddd, type} = request.body

    number = remove_text_phone(number)
    ddd = remove_text_phone(ddd)

    await mysql.queryAsync(`UPDATE phones SET phone = ?, ddd = ?, type = ?, updated_at = ? WHERE id = ?`, [number, ddd, type, moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(200).json({
        data: parseInt(request.params.id)
    })

})

route.delete('/:id', async (request, response) => {

    await mysql.queryAsync(`UPDATE phones SET deleted_at = ? WHERE id = ?`, [moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(204).json({
        data: parseInt(request.params.id)
    })
})


module.exports = route