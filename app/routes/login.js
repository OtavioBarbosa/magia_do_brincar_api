const express = require("express")
const route = express.Router()
const { mysql } = require("../helpers/mysql")
require("dotenv/config")
const jwt = require('jsonwebtoken')

route.post('/', async (request, response) => {

    const {user, password} = request.body

    let user = await mysql.queryAsync(`
        SELECT u.id, u.user FROM users AS u
        WHERE u.user = ? AND u.password = ? AND u.deleted_at IS NULL`, [user, password]
    )
    
    if(user.length > 0){

        let permissions = await mysql.queryAsync(`
            SELECT p.permission FROM users_has_permissions AS up
            INNER JOIN permissions AS p ON p.id = up.permission_id
            WHERE up.user_id = ? AND p.deleted_at IS NULL AND up.deleted_at IS NULL`, [user[0].id]
        )

        return response.status(200).json({
            data: {
                token: jwt.sign(user[0].id, process.env.SECRET), 
                user: user, 
                permissions: permissions
            }
        })
        
    }

    return response.status(404).json({
        data: `Falha ao realizar login, verifique os dados de acesso ou o usuário foi desativado`
    })

})


module.exports = route