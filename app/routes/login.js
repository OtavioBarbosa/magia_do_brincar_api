const express = require("express");
const route = express.Router();
const { mysql } = require("../helpers/mysql");
require("dotenv/config");
const jwt = require("jsonwebtoken");

route.post("/", async (request, response) => {
  const { user, password } = request.body;

  let register = await mysql.queryAsync(
    `
        SELECT u.id, u.user, u.people_id FROM users AS u
        WHERE u.user = ? AND u.password = ? AND u.deleted_at IS NULL`,
    [user, password]
  );

  if (register.length > 0) {
    let permissions = await mysql.queryAsync(
      `
            SELECT p.permission FROM users_has_permissions AS up
            INNER JOIN permissions AS p ON p.id = up.permission_id
            WHERE up.user_id = ? AND p.deleted_at IS NULL AND up.deleted_at IS NULL`,
      [register[0].id]
    );

    let people = await mysql.queryAsync(
      `
            SELECT p.* FROM peoples AS p
            WHERE p.id = ? AND p.deleted_at IS NULL`,
      [register[0].people_id]
    );

    let phones = await mysql.queryAsync(
      `
        SELECT p.* FROM users_has_phones uhp 
        INNER JOIN phones p ON uhp.phone_id = p.id 
        WHERE uhp.user_id = ? 
        AND p.deleted_at IS NULL`,
      [register[0].people_id]
    );

    let addresses = await mysql.queryAsync(
      `
      SELECT a.*, uha.description 
      FROM users_has_addresses uha 
      INNER JOIN addresses a ON uha.address_id = a.id 
      WHERE uha.user_id = ? 
      AND a.deleted_at IS NULL;`,
      [register[0].people_id]
    );

    return response.status(200).json({
      data: {
        token: jwt.sign(register[0].id, process.env.SECRET),
        user: register[0],
        people: people[0],
        permissions: permissions,
        phones: phones,
        addresses: addresses,
      },
    });
  }

  return response.status(404).json({
    data: `Falha ao realizar login, verifique os dados de acesso ou o usuário foi desativado`,
  });
});

module.exports = route;
