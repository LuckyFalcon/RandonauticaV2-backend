const sql       = require('mssql');
const path      = require('path');
const config    = require(path.join(process.cwd(), 'DBConfig'));

const dbConfig = {
    user: config.USER,
    password: config.PASSWORD,
    server: config.SERVER,
    database: config.DB_NAME,
    options: {
        encrypt: true
    }
}

async function UpdateTrip(user, GID) {
    return new Promise(resolve => {
        var insertQuery = `UPDATE ${config.TRIP_REPORTS} `;
        insertQuery += "SET "

        insertQuery += `is_saved=1`;

        insertQuery += ` WHERE newtonlib_gid = '${GID}' AND user_Id = `;
     
        insertQuery += `(SELECT id FROM ${config.USERS_TABLE} WHERE uuid = `;
        insertQuery += `'${user}'`;
        insertQuery += `)`;

        console.log(insertQuery)

        sql.connect(dbConfig).then((pool) => {
            resolve(pool.query(insertQuery))
        })
    })
}

module.exports = {
    UpdateTrip
};