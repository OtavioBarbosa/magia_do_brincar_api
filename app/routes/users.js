const express = require("express")
const route = express.Router()
const { mysql } = require("../helpers/mysql")
const moment = require("moment")


const user_exists = async (user) => {
    let register = await mysql.queryAsync(`SELECT u.* FROM users AS u WHERE u.user = ?`, user)
    return register
} 

const people_exists = async (document) => {
    let register = await mysql.queryAsync(`SELECT p.* FROM peoples AS p WHERE p.document = ?`, document)
    return register
} 

route.get('/', async (request, response) => {

    let users = await mysql.queryAsync(`SELECT u.id, u.user, u.created_at, u.updated_at FROM users AS u WHERE u.deleted_at IS NULL`)
    
    return response.status(200).json({
        data: users
    })

})

route.get('/:id', async (request, response) => {

    let user = await mysql.queryAsync(`SELECT u.* FROM users AS u WHERE u.deleted_at IS NULL AND u.id = ?`, [request.params.id])
    
    return response.status(200).json({
        data: user
    })

})

route.post('/', async (request, response) => {

    const {user, password, name, last_name, document, genre} = request.body

    let validation_people = await people_exists(document)

    let people = null

    if(validation_people.length > 0){
        people = validation_people
    }
    else{
        people = await mysql.queryAsync(`INSERT INTO peoples (name, last_name, document, genre, created_at) VALUES (?, ?, ?, ?, ?)`, [name, last_name, document, genre, moment().format('YYYY-MM-DD HH:mm:ss')])
    }


    let validation_user = await user_exists(user)

    if(validation_user.length > 0){
        return response.status(500).json({
            data: `Usuário já existe`
        })
    }

    let register = await mysql.queryAsync(`INSERT INTO users (user, password, people_id, created_at) VALUES (?, ?, ?, ?)`, [user, password, people.insertId ? people.insertId : people[0].id, moment().format('YYYY-MM-DD HH:mm:ss')])
    
    return response.status(201).json({
        data: register.insertId
    })

})

route.put('/:id', async (request, response) => {

    const {user, password} = request.body

    let validation_user = await user_exists(user)

    if(validation_user.length > 0 && validation_user[0].user !== user){
        return response.status(500).json({
            data: `Usuário já existe`
        })
    }

    await mysql.queryAsync(`UPDATE users SET user = ?, password = ?, updated_at = ? WHERE id = ?`, [user, password, moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(200).json({
        data: parseInt(request.params.id)
    })

})

route.delete('/:id', async (request, response) => {

    await mysql.queryAsync(`UPDATE users SET deleted_at = ? WHERE id = ?`, [moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(204).json({
        data: parseInt(request.params.id)
    })
})


module.exports = route