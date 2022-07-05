const express = require("express")
const route = express.Router()
const { mysql } = require("../helpers/mysql")
const moment = require("moment")

route.get('/', async (request, response) => {

    let users_has_children = await mysql.queryAsync(`SELECT u.* FROM users_has_children AS u WHERE u.deleted_at IS NULL`)
    
    return response.status(200).json({
        data: users_has_children
    })

})

route.post('/', async (request, response) => {

    const {user_id, child_id, type} = request.body

    let register = await mysql.queryAsync(`INSERT INTO users_has_children (user_id, child_id, type, created_at) VALUES (?, ?, ?, ?)`, [user_id, child_id, type, moment().format('YYYY-MM-DD HH:mm:ss')])
    
    return response.status(201).json({
        data: register.insertId
    })

})

route.put('/:id', async (request, response) => {

    const {user_id, child_id, type} = request.body

    await mysql.queryAsync(`UPDATE users_has_children SET user_id = ?, child_id = ?, type = ?, updated_at = ? WHERE id = ?`, [user_id, child_id, type, moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(200).json({
        data: parseInt(request.params.id)
    })

})

route.delete('/:id', async (request, response) => {

    await mysql.queryAsync(`UPDATE users_has_children SET deleted_at = ? WHERE id = ?`, [moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(204).json({
        data: parseInt(request.params.id)
    })
})


module.exports = route