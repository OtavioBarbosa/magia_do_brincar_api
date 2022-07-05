const express = require("express")
const route = express.Router()
const { mysql } = require("../helpers/mysql")
const moment = require("moment")

route.get('/', async (request, response) => {

    let emails = await mysql.queryAsync(`SELECT e.* FROM emails AS e WHERE e.deleted_at IS NULL`)
    
    return response.status(200).json({
        data: emails
    })

})

route.post('/', async (request, response) => {

    const {email, description} = request.body

    let register = await mysql.queryAsync(`INSERT INTO emails (email, created_at) VALUES (?, ?)`, [email, moment().format('YYYY-MM-DD HH:mm:ss')])
    
    await mysql.queryAsync(`INSERT INTO users_has_emails (user_id, email_id, description, created_at) VALUES (?, ?, ?, ?)`, [request.user, register.insertId, description, moment().format('YYYY-MM-DD HH:mm:ss')])

    return response.status(201).json({
        data: register.insertId
    })

})

route.put('/:id', async (request, response) => {

    const {email, description} = request.body

    await mysql.queryAsync(`UPDATE emails SET email = ?, updated_at = ? WHERE id = ?`, [email, moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    await mysql.queryAsync(`UPDATE users_has_emails SET description = ?, updated_at = ? WHERE user_id = ? AND email_id = ?`, [description, moment().format('YYYY-MM-DD HH:mm:ss'), request.user, request.params.id])

    return response.status(200).json({
        data: parseInt(request.params.id)
    })

})

route.delete('/:id', async (request, response) => {

    await mysql.queryAsync(`UPDATE emails SET deleted_at = ? WHERE id = ?`, [moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(204).json({
        data: parseInt(request.params.id)
    })
})


module.exports = route