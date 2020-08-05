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
        insertQuery += `WHERE user_id = `
        
        //Fetch uniqueidentifier from users table
        insertQuery += `(SELECT id FROM ${config.USERS_TABLE} WHERE uuid = `;
        insertQuery += `'${user}'`;
        insertQuery += `)`;

        sql.connect(dbConfig).then((pool) => {
            resolve(pool.query(insertQuery))
        })
    })
}


async function SelectTripReportsMedia(tripreports) {

    return new Promise(resolve => {
        var insertQuery = `SELECT * FROM ${config.TRIP_REPORTS_MEDIA_TABLE} `;
        insertQuery += `WHERE (trip_report_id) IN ( `
        

        if(tripreports[0].length > 1){
            for(var i = 0; i < tripreports[0].length-1; i++){
                insertQuery += `  ('${tripreports[0][i].id}'), `
            }
            insertQuery += `  ('${tripreports[0][tripreports[0].length-1].id}') `
        } else {
            insertQuery += `  ('${tripreports[0][0].id}') `
        }
        
        insertQuery += `)`;

        sql.connect(dbConfig).then((pool) => {
            resolve(pool.query(insertQuery))
        })
    })
}

module.exports = {
    SelectTripReports,
    SelectTripReportsMedia
};