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

route.get('/:id', async (request, response) => {

    let schedule = null 

    let permissions = await user_permissions(request.user)

    if(permissions.find(p => p.permission === 'Administrador')){
        schedule = await mysql.queryAsync(`SELECT s.* FROM schedules AS s WHERE s.id = ? AND s.deleted_at IS NULL`, [request.params.id])
    }
    else{
        schedule = await mysql.queryAsync(`SELECT s.* FROM schedules AS s WHERE s.id = ? AND s.deleted_at IS NULL AND s.user_id = ?`, [request.params.id, request.user])
    }

    if(schedule.length > 0){
        schedule = schedule[0]

        let user = await mysql.queryAsync(`
            SELECT p.*, s.user_id
            FROM schedules AS s 
            INNER JOIN users AS u ON s.user_id = u.id
            INNER JOIN peoples AS p ON u.people_id = p.id
            WHERE s.id = ?
        `, [request.params.id])

        let service = await mysql.queryAsync(`
            SELECT ssc.id AS schedules_has_services_has_characteristics, sc.id AS services_has_characteristics, 
            se.service, se.description, se.image
            FROM schedules AS s 
            INNER JOIN schedules_has_services_has_characteristics AS ssc ON ssc.scheduling_id = s.id
            INNER JOIN services_has_characteristics AS sc ON ssc.service_has_characteristic_id = sc.id
            INNER JOIN services AS se ON sc.service_id = se.id
            WHERE s.id = ?
        `, [request.params.id])

        let characteristics = await mysql.queryAsync(`
            SELECT c.id AS characteristic_id, c.characteristic
            FROM schedules AS s 
            INNER JOIN schedules_has_services_has_characteristics AS ssc ON ssc.scheduling_id = s.id
            INNER JOIN services_has_characteristics AS sc ON ssc.service_has_characteristic_id = sc.id
            INNER JOIN characteristics AS c ON sc.characteristic_id = c.id
            WHERE s.id = ?
        `, [request.params.id])
        
        let children = await mysql.queryAsync(`
            SELECT suc.id AS schedules_has_users_has_children, uc.id AS users_has_children, 
            c.id AS child_id, c.name, c.last_name, c.birth_date, c.genre, c.description
            FROM schedules_has_users_has_children AS suc
            INNER JOIN users_has_children AS uc ON suc.user_has_child_id = uc.id
            INNER JOIN children AS c ON uc.child_id = c.id
            WHERE suc.scheduling_id = ?
        `, [request.params.id])
        
        let payment_method = await mysql.queryAsync(`
            SELECT pm.*
            FROM schedules AS s
            INNER JOIN payment_methods AS pm ON pm.id = s.payment_method_id
            WHERE s.id = ?
        `, [request.params.id])

        schedule.user = user.length > 0 ? user[0] : null
        schedule.service = service.length > 0 ? service[0] : null
        schedule.characteristics = characteristics
        schedule.children = children
        schedule.payment_method = payment_method.length > 0 ? payment_method[0].payment_method : null

    }
    
    return response.status(200).json({
        data: schedule
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