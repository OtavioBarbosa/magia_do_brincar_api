const { mysql } = require("./mysql")
const fs = require("fs")
const fs_promises = require("fs").promises
require("dotenv/config")
const {
    createHmac
} = require("crypto")

const upload_image = async (name, extension, path, image) => {
    
    let cryptography_name = `${createHmac('sha256', process.env.SECRET_FILE).update(name).digest('hex')}.${extension.replace(/[^a-zA-Z]+/g, '')}`

    let create_path = `./app/images/${path}/`
    let save_path = `images/${path}/`

    if (!fs.existsSync(create_path)){
        fs.mkdirSync(create_path, { recursive: true })
    }

    let save_image = new Buffer.from(image, 'base64')

    try{
        await fs_promises.writeFile(`${create_path}${cryptography_name}`, save_image)
        return `${save_path}${cryptography_name}`
    }
    catch{
        return false
    }
    
}

module.exports = upload_image