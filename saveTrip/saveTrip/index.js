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

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
      
    var GID = req.query.GID;

    await SQLQueries.UpdateTrip(req.user, GID);

    return res.status(200).json({ success: 'success' })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: 'Error' })
  }
});




module.exports = createHandler(app)



