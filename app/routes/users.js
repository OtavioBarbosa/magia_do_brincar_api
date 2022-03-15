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

const identify_user = async (user, password) => {
    let register = await mysql.queryAsync(`SELECT u.* FROM users AS u WHERE u.id = ? AND u.password = ?`, [user, password])
    return register
}

route.get('/', async (request, response) => {

    let users = await mysql.queryAsync(`SELECT u.id, u.user, u.created_at, u.updated_at FROM users AS u WHERE u.deleted_at IS NULL`)
    
    return response.status(200).json({
        data: users
    })

})


route.get('/addresses', async (request, response) => {

    let addresses = await mysql.queryAsync(`
        SELECT a.*, ua.description 
        FROM users_has_addresses AS ua 
        INNER JOIN addresses AS a ON ua.address_id = a.id 
        WHERE ua.user_id = ? AND a.deleted_at IS NULL AND ua.deleted_at IS NULL
    `, [request.user])
    
    return response.status(200).json({
        data: addresses
    })

})

route.get('/phones', async (request, response) => {

    let phones = await mysql.queryAsync(`
        SELECT p.*, up.description
        FROM users_has_phones AS up 
        INNER JOIN phones AS p ON up.phone_id = p.id 
        WHERE up.user_id = ? AND p.deleted_at IS NULL AND up.deleted_at IS NULL
    `, [request.user])
    
    return response.status(200).json({
        data: phones
    })

})

route.get('/emails', async (request, response) => {

    let emails = await mysql.queryAsync(`
        SELECT e.*, ue.description
        FROM users_has_emails AS ue 
        INNER JOIN emails AS e ON ue.email_id = e.id 
        WHERE ue.user_id = ? AND e.deleted_at IS NULL AND ue.deleted_at IS NULL
    `, [request.user])
    
    return response.status(200).json({
        data: emails
    })

})

route.get('/:id', async (request, response) => {

    let user = await mysql.queryAsync(`SELECT u.* FROM users AS u WHERE u.deleted_at IS NULL AND u.id = ?`, [request.params.id])
    
    return response.status(200).json({
        data: user
    })

})

route.post('/', async (request, response) => {

    const {user, password, name, last_name, document, birth_date, genre, permissions} = request.body

    let validation_people = await people_exists(document)

    let people = null

    if(validation_people.length > 0){
        people = validation_people
    }
    else{
        people = await mysql.queryAsync(`INSERT INTO peoples (name, last_name, document, birth_date, genre, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [name, last_name, document, birth_date, genre, moment().format('YYYY-MM-DD HH:mm:ss')])
    }


    let validation_user = await user_exists(user)

    if(validation_user.length > 0){
        return response.status(500).json({
            data: `Usuário já existe`
        })
    }

    let register = await mysql.queryAsync(`INSERT INTO users (user, password, people_id, created_at) VALUES (?, ?, ?, ?)`, [user, password, people.insertId ? people.insertId : people[0].id, moment().format('YYYY-MM-DD HH:mm:ss')])
    
    permissions.map(async (permission) => {
        await mysql.queryAsync(`INSERT INTO users_has_permissions (user_id, permission_id, created_at) VALUES (?, ?, ?)`, [register.insertId, permission.permission_id, moment().format('YYYY-MM-DD HH:mm:ss')])
        return null
    })

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

route.post('/change_password', async (request, response) => {

    const {old_password, new_password} = request.body
    
    let user = await identify_user(request.user, old_password)

    if(user.length === 0){
        return response.status(404).json({
            data: `Usuário não encontrado, verifique se sua senha antiga está correta.`
        })
    }

    await mysql.queryAsync(`UPDATE users SET password = ?, updated_at = ? WHERE id = ?`, [new_password, moment().format('YYYY-MM-DD HH:mm:ss'), user[0].id])
    
    return response.status(200).json({
        data: parseInt(user[0].id)
    })

})


module.exports = route