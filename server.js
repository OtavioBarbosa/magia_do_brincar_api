const express = require('express')
const app = express()
const cors = require('cors')
require("dotenv/config")
const jwt = require('jsonwebtoken')
const routes_without_token = require('./app/helpers/routes_without_token')
const validation_user = require('./app/helpers/validation_user')

app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*')
    response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    response.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    
    validationToken(request, response, next)
})

app.use(cors())
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

app.set('port', process.env.API_PORT || 3131)

const validationRoute = (request) => {
    if(request.method === 'OPTIONS') return false
    
    var routes = routes_without_token.filter(r => r.route.indexOf('/*') > -1)
    var routes_accessed = routes.find((r, i) => {
        var split_request = request.originalUrl.split('/')
        var split_routes = r.route.split('/')
        var index_all = split_routes.indexOf('*')
        return request.originalUrl.indexOf(r.route.replace('/*', '')) > -1 && split_routes[index_all - 1] == split_request[index_all - 1]
    })

    if(!routes_accessed){
        return !routes_without_token.find((r) => { return r.route === request.originalUrl && r.method === request.method })
    }
    else{
        return false 
    }
}

const validationToken = (request, response, next) => {

    var token = request.headers['authorization']

    if(validationRoute(request)){
        if(!token){
            response.statusCode = 401
            return response.json({data: 'Token inexistente'}) 
        }
        jwt.verify(token, process.env.SECRET, async (erro, decodificar) => {
            if(erro){
                response.statusCode = 401
                return response.json({data: 'Token inválido'}) 
            } 

            if(!(await validation_user.validation(decodificar))){
                response.statusCode = 401
                return response.json({data: 'Usuário desativado'}) 
            }
            
            request.user = decodificar

            next()
        })
    }
    else{
        next()
    }

    
}

/**
 * @description Arquivos
 */
const addresses = require('./app/routes/addresses')
const emails = require('./app/routes/emails')
const login = require('./app/routes/login')
const payment_methods = require('./app/routes/payment_methods')
const permissions = require('./app/routes/permissions')
const phones = require('./app/routes/phones')
const users_has_permissions = require('./app/routes/users_has_permissions')
const users = require('./app/routes/users')


/**
 * @description routes
 */
app.get(`/`, (request, response) => {
    return response.status(200).json({
        data: 'Bem vindo a API da aplicação A Magia do Brincar.'
    })
})

app.use(`/addresses`, addresses)
app.use(`/emails`, emails)
app.use(`/login`, login)
app.use(`/payment_methods`, payment_methods)
app.use(`/permissions`, permissions)
app.use(`/phones`, phones)
app.use(`/users/permissions`, users_has_permissions)
app.use(`/users`, users)


/**
 * @description Inicialização API
 */
app.listen(app.get('port'), () => {
    console.log(`Port ${app.get('port')} has been initialized`)
})
