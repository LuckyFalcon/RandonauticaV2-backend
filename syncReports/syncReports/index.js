var iap = require('in-app-purchase');
var Verifier = require('google-play-billing-validator');
const { check, validationResult } = require('express-validator');
const Auth = require('../helpers/Auth');
const createHandler = require("azure-function-express").createHandler;
const express = require("express");
const config = require('../config.json');
const UserInserts = require('../helpers/UserInserts');

// Create express app
const app = express();

// Add FireBase authentication middleware
//app.use(Auth);

app.get("/api/syncReports", [
//Verifying parameters here

], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    await UserInserts.SelectTripReports("bd810489-93d1-ea11-8b03-281878476d6c").then((data) => {

      var unloggedTripReports = [];

      for(let i = 0; i < data.recordsets.length; i++){
        if(data.recordsets[i][0].is_logged == 0){
          unloggedTripReports.push(data.recordsets[i])
        }
      }

      return res.status(200).json(unloggedTripReports)
    })
    .catch(error => { 
      //Something went wrong with setting agreement for user
      console.log(error)
      return res.status(500).json({ error: 'Something went wrong' })
    });

  } catch (error) {
    console.log(error)
    //An error occurred in the logic above
    return res.status(500).json({ error: 'Something went wrong' })
  }
});

module.exports = createHandler(app);
