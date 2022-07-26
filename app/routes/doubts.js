const express = require("express")
const route = express.Router()
const { mysql } = require("../helpers/mysql")
const moment = require("moment")

route.get('/', async (request, response) => {

    let doubts = await mysql.queryAsync(`SELECT d.* FROM doubts AS d WHERE d.deleted_at IS NULL ORDER BY d.frequency DESC`)
    
    return response.status(200).json({
        data: doubts
    })

})

route.post('/', async (request, response) => {

    const {question, answer, frequency} = request.body

    let register = await mysql.queryAsync(`INSERT INTO doubts (question, answer, frequency, created_at) VALUES (?, ?, ?, ?)`, [question, answer, frequency, moment().format('YYYY-MM-DD HH:mm:ss')])
    
    return response.status(201).json({
        data: register.insertId
    })

})

route.put('/:id', async (request, response) => {

    const {question, answer, frequency} = request.body

    await mysql.queryAsync(`UPDATE doubts SET question = ?, answer = ?, frequency = ?, updated_at = ? WHERE id = ?`, [question, answer, frequency, moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(200).json({
        data: parseInt(request.params.id)
    })

})

route.delete('/:id', async (request, response) => {

    await mysql.queryAsync(`UPDATE doubts SET deleted_at = ? WHERE id = ?`, [moment().format('YYYY-MM-DD HH:mm:ss'), request.params.id])
    
    return response.status(204).json({
        data: parseInt(request.params.id)
    })
})


module.exports = route