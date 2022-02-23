const { mysql } = require("../helpers/mysql")

module.exports = {
    validation: async (id) => {
        let user = await mysql.queryAsync(`SELECT u.id, u.user FROM users AS u WHERE u.id = ? AND u.deleted_at IS NULL`, [id])
        
        return user.length > 0 ? true : false
    }
}