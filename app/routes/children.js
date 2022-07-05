const express = require("express")
const route = express.Router()
const { mysql } = require("../helpers/mysql")
const moment = require("moment")

route.get('/', async (request, response) => {

    let children = await mysql.queryAsync(`SELECT c.* FROM children AS c WHERE c.deleted_at IS NULL`)
    
    return response.status(200).json({
        data: children
    })

})

route.post('/', async (request, response) => {

    const {name, last_name, birth_date, genre, description, type} = request.body

    let register = await mysql.queryAsync(`INSERT INTO children (name, last_name, birth_date, genre, description, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [name, last_name, birth_date, genre, description, moment().format('YYYY-MM-DD HH:mm:ss')])
    
    await mysql.queryAsync(`INSERT INTO users_has_children (user_id, child_id, type, created_at) VALUES (?, ?, ?, ?)`, [request.user, register.insertId, type, moment().format('YYYY-MM-DD HH:mm:ss')])

    return response.status(201).json({
        data: register.insertId
    })

})

route.put('/:id', async (request, response) => {

    const {name, last_name, birth_date, genre, description, type} = request.body

    await mysql.queryAsync(`UPDATE children SET name = ?, last_name = ?, birth_date = ?, genre = ?, description = ?, updated_at = ? WHERE id = ?`, [name, last_name, birth_date, genre, description, moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    await mysql.queryAsync(`UPDATE users_has_children SET type = ?, updated_at = ? WHERE user_id = ? AND child_id = ?`, [type, moment().format('YYYY-MM-DD HH:mm:ss'), request.user, request.params.id])

    return response.status(200).json({
        data: parseInt(request.params.id)
    })

})

route.delete('/:id', async (request, response) => {

    await mysql.queryAsync(`UPDATE children SET deleted_at = ? WHERE id = ?`, [moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(204).json({
        data: parseInt(request.params.id)
    })
})


module.exports = route