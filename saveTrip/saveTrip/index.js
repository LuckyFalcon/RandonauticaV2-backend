'use strict';
const Auth = require('../helpers/Auth');
const { check, validationResult } = require('express-validator');
const SQLQueries = require('../helpers/InsertReport.js');
const createHandler = require("azure-function-express").createHandler;
const express = require("express");

// Create express app as usual
const app = express();

app.use(Auth);

app.get("/saveTrip", [
  check('GID')
    .isString()
    .not().isEmpty(),

], async (req, res) => {

  //Error found in validation of parameters
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    
    //Store unique GID of repot
    var GID = req.query.GID;

    //Update trip report
    await SQLQueries.UpdateTrip(req.user, GID);

    //Send response back to client
    return res.status(200).json({ success: 'success' })

  } catch (error) {

    //Send error response back to client
    return res.status(500).json({ error: 'Error' })

  }
});




module.exports = createHandler(app)



