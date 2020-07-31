const request = require('request');
const sql = require('mssql');
const path = require('path');
const config = require(path.join(process.cwd(), 'DBConfig'));

//Starting points as a constant
const starting_points = 20;

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

async function SelectUserDetails(user) {

    return new Promise(resolve => {
        var insertQuery = `SELECT * FROM ${config.USER_DETAILS_TABLE} WHERE user_id = `;

        //Fetch uniqueidentifier from users table
        insertQuery += `(SELECT id FROM ${config.USERS_TABLE} WHERE uuid = `;
        insertQuery += `'${user}'`;
        insertQuery += `)`;

        console.log(insertQuery)
        sql.connect(dbConfig).then((pool) => {
            resolve(pool.query(insertQuery))
        })
    })
}

async function SetShareWithFriends(user, amountOfPoints) {

    return new Promise(resolve => {
        var insertQuery = `UPDATE ${config.USER_DETAILS_TABLE} `;
        insertQuery += `SET is_shared_with_friends = 1, points = points + '${amountOfPoints}'`


        insertQuery += `WHERE user_id = `
        //Fetch uniqueidentifier from users table
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
    InsertUser,
    InsertUserDetails,
    SelectUserDetails
};