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

async function InsertPurchaseHistory(purchaseObject, user) {

    return new Promise(resolve => {

        var insertQuery = `INSERT INTO ${config.PURCHASE_HISTORY} (`;
        
        insertQuery += "product_id,";
        insertQuery += "user_id,";
        insertQuery += "purchase_id,";
        insertQuery += "local_verification_data,";
        insertQuery += "server_verification_data,";
        insertQuery += "source,";
        insertQuery += "transaction_data,";
        insertQuery += "status,";
       // insertQuery += "error_code,"; //0
       // insertQuery += "error_message,"; //0 
       // insertQuery += "error_details"; //0

        insertQuery += ") VALUES (";
        insertQuery += `'${purchaseObject.product_id}',`;
        insertQuery += `(SELECT id FROM ${config.USERS_TABLE} WHERE uuid = `;
        insertQuery += `'${user}'`;
        insertQuery += `),`;

        insertQuery += `'0',`;
        insertQuery += `'${platform}',`;
        insertQuery += `'${platform}',`;
        insertQuery += `'${platform}',`;
        insertQuery += `'${platform}',`;
        insertQuery += `'${platform}',`;

        insertQuery += ")";

        sql.connect(dbConfig).then((pool) => {
            resolve(pool.query(insertQuery))
        })
    })
}


async function addToPointsBalance(user, amountOfPoints) {

    return new Promise(resolve => {
        var insertQuery = `UPDATE ${config.USER_DETAILS_TABLE} `;
        insertQuery += `SET points = points + '${amountOfPoints}'`


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

async function SetWaterPointsActive(user) {

    return new Promise(resolve => {
        var insertQuery = `UPDATE ${config.USER_DETAILS_TABLE} `;
        insertQuery += `SET is_iap_skip_water_points = 1`


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

async function upgradeRadius(user, amountOfPoints) {

    return new Promise(resolve => {
        var insertQuery = `UPDATE ${config.USER_DETAILS_TABLE} `;
        insertQuery += `SET is_iap_extend_radius = is_iap_extend_radius + 1`


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
    InsertPurchaseHistory,
    addToPointsBalance,
    SetWaterPointsActive,
    upgradeRadius
};