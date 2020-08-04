const request   = require('request');
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

async function SelectTrip(gid) {
    return new Promise(resolve => {

        var insertQuery = `SELECT * FROM ${config.TRIP_REPORTS} WHERE newtonlib_gid = '${gid}'`;
        console.log(insertQuery);
        sql.connect(dbConfig).then((pool) => {
            resolve(pool.query(insertQuery))
        })
    })
}

async function InsertTripReportHashtags(blob_id, gid) {
    return new Promise(resolve => {
        var insertQuery = `INSERT INTO ${config.TRIP_REPOT_HASHTAGS} (`;
        insertQuery += "trip_report_id,";
        insertQuery += "hashtag_id";
        insertQuery += ") VALUES (";

        //Fetch uniqueidentifier from users table
        insertQuery += `(SELECT id FROM ${config.TRIP_REPORTS} WHERE newtonlib_gid = `;
        insertQuery += `'${gid}'`;
        insertQuery += `),`;

        // insertQuery += `'NULL',`;
        insertQuery += `'0',`;
        insertQuery += `'${blob_id}'`; //Blob_id
        insertQuery += ")";

        sql.connect(dbConfig).then((pool) => {
            resolve(pool.query(insertQuery))
        })
    })
}

async function InsertMedia(blob_id, gid) {
    return new Promise(resolve => {
        console.log('test'+blob_id)
        var insertQuery = `INSERT INTO ${config.REPORT_MEDIA} (`;
         insertQuery += "trip_report_id,";
        insertQuery += "type,";
        insertQuery += "blob_id";
      //  insertQuery += "created,";
       // insertQuery += "updated";  
        insertQuery += ") VALUES (";

        // //Fetch uniqueidentifier from users table
        insertQuery += `(SELECT id FROM ${config.TRIP_REPORTS} WHERE newtonlib_gid = `;
        insertQuery += `'${gid}'`;
        insertQuery += `),`;

        // insertQuery += `'NULL',`;
        insertQuery += `'0',`;
        insertQuery += `'${blob_id}'`;      //Blob_id
      //  insertQuery += `'0',`;
     //   insertQuery += `'0'`;
   
   
        insertQuery += ")";
        sql.connect(dbConfig).then((pool) => {
            resolve(pool.query(insertQuery))
        })
    })
}

async function InsertHashtags(tags) {
    return new Promise(resolve => {
        var insertQuery = `INSERT INTO ${config.HASHTAGS} `;
        insertQuery += "(hashtag)";
        insertQuery += " VALUES ";

        if(tags.length > 1){
            for(var i = 0; i < tags.length-1; i++){
                // //Fetch uniqueidentifier from users table
                insertQuery += `('${tags[i]}'), `;
            }
            insertQuery += `('${tags[tags.length-1]}}') `;
        } else {
            insertQuery += `('${tags[0]}}') `;
        }



        sql.connect(dbConfig).then((pool) => {
            resolve(pool.query(insertQuery, tags))
        })
    })
}

async function UpdateTrip(user, object) {
    return new Promise(resolve => {
        var insertQuery = `UPDATE ${config.TRIP_REPORTS} `;
        insertQuery += "SET "

        insertQuery += `is_visited=0,`;
        insertQuery += `is_logged=0,`;
        insertQuery += `is_favorite=0,`;
        insertQuery += `rng_type=0,`;
        insertQuery += `point_type=0,`;
        insertQuery += `title='${object.title}',`;
        insertQuery += `report='${object.report}'`;
  
        insertQuery += ` OUTPUT Inserted.user_id `;

        insertQuery += ` WHERE newtonlib_gid = '${object.GID}' AND user_Id = `;
     
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
    SelectTrip,
    InsertMedia,
    InsertHashtags,
    UpdateTrip
};