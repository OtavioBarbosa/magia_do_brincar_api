const express = require("express")
const route = express.Router()
const { mysql } = require("../helpers/mysql")
const moment = require("moment")


const people_exists = async (document) => {
    let register = await mysql.queryAsync(`SELECT p.* FROM peoples AS p WHERE p.document = ?`, document)
    return register
} 

route.get('/', async (request, response) => {

    let peoples = await mysql.queryAsync(`SELECT p.* FROM peoples AS p WHERE p.deleted_at IS NULL`)
    
    return response.status(200).json({
        data: peoples
    })

})

route.get('/:id', async (request, response) => {

    let people = await mysql.queryAsync(`SELECT p.* FROM peoples AS p WHERE p.deleted_at IS NULL AND p.id = ?`, [request.params.id])
    
    return response.status(200).json({
        data: people.length == 1 ? people[0] : {}
    })

})

route.post('/', async (request, response) => {

    const {name, last_name, document, birth_date, genre} = request.body

    let validation_people = await people_exists(document)

    if(validation_people.length > 0){
        return response.status(500).json({
            data: `Pessoa já existe`
        })
    }

    let register = await mysql.queryAsync(`INSERT INTO peoples (name, last_name, document, birth_date, genre, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [name, last_name, document, birth_date, genre, moment().format('YYYY-MM-DD HH:mm:ss')])
    
    return response.status(201).json({
        data: register.insertId
    })

})

route.put('/:id', async (request, response) => {

    const {name, last_name, document, birth_date, genre} = request.body

    let validation_people = await people_exists(document)

    if(validation_people.length > 0 && validation_people[0].id !== parseInt(request.params.id)){
        return response.status(500).json({
            data: `Pessoa já existe`
        })
    }

    await mysql.queryAsync(`UPDATE peoples SET name = ?, last_name = ?, document = ?, birth_date = ?, genre = ?, updated_at = ? WHERE id = ?`, [
        name ? name : validation_people[0].name, 
        last_name ? last_name : validation_people[0].last_name, 
        document ? document : validation_people[0].document, 
        birth_date ? birth_date : validation_people[0].birth_date, 
        genre ? genre : validation_people[0].genre, 
        moment().format('YYYY-MM-DD HH:mm:ss'), 
        request.params.id
    ])
    
    return response.status(200).json({
        data: parseInt(request.params.id)
    })

})

route.delete('/:id', async (request, response) => {

    await mysql.queryAsync(`UPDATE peoples SET deleted_at = ? WHERE id = ?`, [moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(204).json({
        data: parseInt(request.params.id)
    })
})


module.exports = route