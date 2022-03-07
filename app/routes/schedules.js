const express = require("express")
const route = express.Router()
const { mysql } = require("../helpers/mysql")
const moment = require("moment")

const user_permissions = async (user) => {
    return await mysql.queryAsync(`
        SELECT up.*, p.permission FROM users_has_permissions AS up
        INNER JOIN permissions AS p ON p.id = up.permission_id 
        WHERE up.deleted_at IS NULL AND p.deleted_at IS NULL AND up.user_id = ?
    `, [user])
}

route.get('/', async (request, response) => {

    let schedules = null 

    let permissions = await user_permissions(request.user)

    if(permissions.find(p => p.permission === 'Administrador')){
        schedules = await mysql.queryAsync(`SELECT s.* FROM schedules AS s WHERE s.deleted_at IS NULL`)
    }
    else{
        schedules = await mysql.queryAsync(`SELECT s.* FROM schedules AS s WHERE s.deleted_at IS NULL AND s.user_id = ?`, [request.user])
    }
    
    return response.status(200).json({
        data: schedules
    })

})

route.post('/', async (request, response) => {

    const {user_id, service_id, user_has_address_id, payment_method_id, start_date, end_date, payday, number_children, description_children, service_description, services_has_characteristics, users_has_children} = request.body

    let register = await mysql.queryAsync(`INSERT INTO schedules (user_id, service_id, user_has_address_id, payment_method_id, start_date, end_date, payday, number_children, description_children, service_description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [user_id, service_id, user_has_address_id, payment_method_id, start_date, end_date, payday, number_children, description_children, service_description, moment().format('YYYY-MM-DD HH:mm:ss')])
    
    if(services_has_characteristics && typeof services_has_characteristics === 'object'){
        services_has_characteristics.map(async (sc) => {
            await mysql.queryAsync(`INSERT INTO schedules_has_services_has_characteristics (scheduling_id, service_has_characteristic_id, description, created_at) VALUES (?, ?, ?, ?)`, [register.insertId, sc.service_has_characteristic_id, sc.description, moment().format('YYYY-MM-DD HH:mm:ss')])
        })
    }
    
    if(users_has_children && typeof users_has_children === 'object'){
        users_has_children.map(async (uc) => {
            await mysql.queryAsync(`INSERT INTO schedules_has_users_has_children (scheduling_id, user_has_child_id, created_at) VALUES (?, ?, ?)`, [register.insertId, uc.user_has_child_id, moment().format('YYYY-MM-DD HH:mm:ss')])
        })
    }

    return response.status(201).json({
        data: register.insertId
    })

})

route.put('/:id', async (request, response) => {

    const {user_id, service_id, user_has_address_id, payment_method_id, start_date, end_date, payday, number_children, description_children, service_description} = request.body

    await mysql.queryAsync(`UPDATE schedules SET user_id = ?, service_id = ?, user_has_address_id = ?, payment_method_id = ?, start_date = ?, end_date = ?, payday = ?, number_children = ?, description_children = ?, service_description = ?, updated_at = ? WHERE id = ?`, [user_id, service_id, user_has_address_id, payment_method_id, start_date, end_date, payday, number_children, description_children, service_description, moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(200).json({
        data: parseInt(request.params.id)
    })

})

route.delete('/:id', async (request, response) => {

    await mysql.queryAsync(`UPDATE schedules SET deleted_at = ? WHERE id = ?`, [moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(204).json({
        data: parseInt(request.params.id)
    })

})


module.exports = route