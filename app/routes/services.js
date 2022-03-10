const express = require("express")
const route = express.Router()
const { mysql } = require("../helpers/mysql")
const upload_image = require("../helpers/upload_image")
const moment = require("moment")

route.get('/', async (request, response) => {

    let services = await mysql.queryAsync(`SELECT s.* FROM services AS s WHERE s.deleted_at IS NULL`)
    
    return response.status(200).json({
        data: services
    })

})

route.post('/', async (request, response) => {

    const {service, description, image, name, extension} = request.body

    let path = await upload_image(name, extension, 'services', image)
    
    if(!path){
        return response.status(500).json({
            data: "Erro ao salvar imagem"
        })
    }

    let register = await mysql.queryAsync(`INSERT INTO services (service, description, image, created_at) VALUES (?, ?, ?)`, [service, description, path, moment().format('YYYY-MM-DD HH:mm:ss')])
    
    return response.status(201).json({
        data: register.insertId
    })

})

route.put('/:id', async (request, response) => {

    const {service, description, image, name, extension} = request.body

    let path = image

    if(image.indexOf('images') == -1){
        path = await upload_image(name, extension, 'services', image)
    }
    
    if(!path){
        return response.status(500).json({
            data: "Erro ao salvar imagem"
        })
    }

    await mysql.queryAsync(`UPDATE services SET service = ?, description = ?, image = ?, updated_at = ? WHERE id = ?`, [service, description, path, moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(200).json({
        data: parseInt(request.params.id)
    })

})

route.delete('/:id', async (request, response) => {

    await mysql.queryAsync(`UPDATE services SET deleted_at = ? WHERE id = ?`, [moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(204).json({
        data: parseInt(request.params.id)
    })

})


module.exports = route