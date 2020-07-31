const sql = require('mssql');
const path = require('path');
const config = require(path.join(process.cwd(), 'DBConfig'));

const dbConfig = {
    user: config.USER,
    password: config.PASSWORD,
    server: config.SERVER,
    database: config.DB_NAME,
    options: {
        encrypt: true
    }
}

async function insertTrip(user, object) {
    return new Promise(resolve => {
        var insertQuery = `INSERT INTO ${config.TRIP_REPORTS} (`;
        insertQuery += "user_id,";

        insertQuery += "is_visited,";
        insertQuery += "is_logged,";
        insertQuery += "is_favorite,";
        insertQuery += "rng_type,";
        insertQuery += "point_type,";
        insertQuery += "title,";
        insertQuery += "report,";
        insertQuery += "what_3_words_address,";
        insertQuery += "what_3_words_nearest_place,";
        insertQuery += "what_3_words_country,";

        insertQuery += "center,";
        insertQuery += "latitude,";
        insertQuery += "longitude,";

        insertQuery += "newtonlib_gid,";
        insertQuery += "newtonlib_tid,";
        insertQuery += "newtonlib_lid,";
        insertQuery += "newtonlib_type,";
        insertQuery += "newtonlib_x,";
        insertQuery += "newtonlib_y,";

        insertQuery += "newtonlib_distance,";
        insertQuery += "newtonlib_initial_bearing,";
        insertQuery += "newtonlib_final_bearing,";

        insertQuery += "newtonlib_side,";
        insertQuery += "newtonlib_distance_err,";
        insertQuery += "newtonlib_radiusM,";
        insertQuery += "newtonlib_number_points,";
        insertQuery += "newtonlib_mean,";
        insertQuery += "newtonlib_rarity,";
        insertQuery += "newtonlib_power_old,";
        insertQuery += "newtonlib_power,";
        insertQuery += "newtonlib_z_score,";
        insertQuery += "newtonlib_probability_single,";
        insertQuery += "newtonlib_integral_score,";
        insertQuery += "newtonlib_significance,";
        insertQuery += "newtonlib_probability";
        insertQuery += ") VALUES (";

        //Fetch uniqueidentifier from users table
        insertQuery += `(SELECT id FROM ${config.USERS_TABLE} WHERE uuid = `;
        insertQuery += `'${user}'`;
        insertQuery += `),`;

        insertQuery += `'0',`;
        insertQuery += `'0',`;
        insertQuery += `'0',`;
        insertQuery += `'0',`;
        insertQuery += `'0',`;
        insertQuery += `'0',`;
        insertQuery += `'0',`;
        insertQuery += `'0',`;
        insertQuery += `'0',`;
        insertQuery += `'0',`;

        insertQuery += `'null',`;
        insertQuery += `'${object.Center.Point.Latitude}',`;
        insertQuery += `'${object.Center.Point.Longitude}',`;

        insertQuery += `'${object.GID}',`;
        insertQuery += `'${object.TID}',`;
        insertQuery += `'${object.LID}',`;
        insertQuery += `'${object.Type}',`;
        insertQuery += `'${object.X}',`;
        insertQuery += `'${object.Y}',`;

        insertQuery += `'${object.Center.Bearing.Distance}',`;
        insertQuery += `'${object.Center.Bearing.InitialBearing}',`;
        insertQuery += `'${object.Center.Bearing.FinalBearing}',`;

        insertQuery += `'${object.Side}',`;
        insertQuery += `'${object.DistanceErr}',`;
        insertQuery += `'${object.RadiusM}',`;
        insertQuery += `'${object.N}',`;
        insertQuery += `'${object.Mean}',`;
        insertQuery += `'${object.Rarity}',`;
        insertQuery += `'${object.Power_old}',`;
        insertQuery += `'${object.Power}',`;
        insertQuery += `'${object.Z_score}',`;
        insertQuery += `'${object.Probability_single}',`;

        insertQuery += `'${object.Integral_score}',`;
        insertQuery += `'${object.Significance}',`;
        insertQuery += `'${object.Probability}'`;

        insertQuery += ")";
        sql.connect(dbConfig).then((pool) => {
            resolve(pool.query(insertQuery))
        })
    })
}

async function updatePointsBalance(user, amountOfPoints) {

    return new Promise(resolve => {
        var insertQuery = `UPDATE ${config.USER_DETAILS_TABLE} `;
        insertQuery += `SET points = points - '${amountOfPoints}'`


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

module.exports = {
    insertTrip,
    updatePointsBalance,
    SelectUserDetails
};


