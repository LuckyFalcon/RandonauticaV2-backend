const config = require('../config.json');
const mongoose = require('mongoose');

mongoose.connect("mongodb://"+config.COSMOSDB_HOST+":"+config.COSMOSDB_PORT+"/"+config.COSMOSDB_DBNAME+"?ssl=true&replicaSet=globaldb", 
{auth: {
    user: config.COSMODDB_USER,
    password: config.COSMOSDB_PASSWORD
  },
 useCreateIndex: true, retrywrites: false, useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;

module.exports = {
    Point: require('../model/points-model.js')
};