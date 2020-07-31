const sql = require('mssql');
const path = require('path');
const config = require(path.join(process.cwd(), 'DBConfig'));

//SQL database configuration
const dbConfig = {
    user: config.USER,
    password: config.PASSWORD,
    server: config.SERVER,
    database: config.DB_NAME,
    options: {
        encrypt: true
    }
}

async function SelectTripReports(user) {

    return new Promise(resolve => {
        var insertQuery = `SELECT * FROM ${config.TRIP_REPORTS_TABLE} `;
        insertQuery += `WHERE user_id = '${user}'`

        console.log(insertQuery);

        sql.connect(dbConfig).then((pool) => {
            resolve(pool.query(insertQuery))
        })
    })
}

module.exports = {
    SelectTripReports,
};