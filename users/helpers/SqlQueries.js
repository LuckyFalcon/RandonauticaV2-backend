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

async function InsertUser(user) {

    return new Promise(resolve => {

        var insertQuery = `INSERT INTO ${config.USERS_TABLE} (`;
        
        insertQuery += "uuid";
        insertQuery += ") VALUES (";
        insertQuery += `'${user}'`;

        insertQuery += ")";

        sql.connect(dbConfig).then((pool) => {
            resolve(pool.query(insertQuery))
        })
    })
}

async function InsertUserDetails(user, platform) {

    //Starting points as a constant
    const starting_points = 20;

    return new Promise(resolve => {
        var insertQuery = `INSERT INTO ${config.USER_DETAILS_TABLE} (`;
        insertQuery += "user_id,";
        insertQuery += "platform,";
        insertQuery += "points,";
        insertQuery += "is_iap_skip_water_points,";
        insertQuery += "is_iap_extend_radius,";
        insertQuery += "is_iap_location_search,";
        insertQuery += "is_iap_inapp_google_preview,";
        insertQuery += "is_shared_with_friends,";
        insertQuery += "is_agreement_accepted,";
        insertQuery += "current_signedin_streak";


        insertQuery += ") VALUES (";

        //Fetch uniqueidentifier from users table
        insertQuery += `(SELECT id FROM ${config.USERS_TABLE} WHERE uuid = `;
        insertQuery += `'${user}'`;
        insertQuery += `),`;


        insertQuery += `'${platform}',`;
        insertQuery += `'${starting_points}',`;
        insertQuery += `'0',`;
        insertQuery += `'0',`;
        insertQuery += `'0',`;
        insertQuery += `'0',`;
        insertQuery += `'0',`;
        insertQuery += `'0',`;
        insertQuery += `'1'`;
        insertQuery += ")";
        sql.connect(dbConfig).then((pool) => {
            resolve(pool.query(insertQuery))
        })
    })
}

async function SelectUserDetails(user) {

    return new Promise(resolve => {
        var insertQuery = `SELECT * FROM ${config.USER_DETAILS_TABLE} WHERE user_id = `;

        //Fetch uniqueidentifier from users table
        insertQuery += `(SELECT id FROM ${config.USERS_TABLE} WHERE uuid = `;
        insertQuery += `'${user}'`;
        insertQuery += `)`;

        sql.connect(dbConfig).then((pool) => {
            resolve(pool.query(insertQuery))
        })
    })
}

async function SetStreak(user, date) {

    return new Promise(resolve => {
        var insertQuery = `UPDATE ${config.USER_DETAILS_TABLE} `;
        insertQuery += `SET started_signedin_streak_datetime = '${date}', current_signedin_streak = current_signedin_streak + 1`


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

async function SetAgreementAccepted(user) {

    return new Promise(resolve => {
        var insertQuery = `UPDATE ${config.USER_DETAILS_TABLE} `;
        insertQuery += `SET is_agreement_accepted = 1`
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
    SelectUserDetails,
    SetStreak,
    SetShareWithFriends,
    SetAgreementAccepted
};