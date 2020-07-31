const { check, validationResult } = require('express-validator');
const Auth = require('../helpers/Auth');
const createHandler = require("azure-function-express").createHandler;
const express = require("express");
const SqlQueries = require('../helpers/SqlQueries');

// Create express app
const app = express();

// Add FireBase authentication middleware
app.use(Auth);

app.get("/api/agreement", [
//Verifying parameters here

], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      //Parameter validation failed
    return res.status(422).json({ errors: errors.array() });
  }
  //Agreement logic -> Set agreement for user when this is called
  try {
    //Set agreement for user accepted
    await SqlQueries.SetAgreementAccepted(req.user).then((data) => {
      return res.status(200).json({ success: 'success' })
    })
    .catch(error => { 
      //Something went wrong with setting agreement for user
      return res.status(500).json({ error: 'Something went wrong' })
    });
  } catch (error) {
    //An error occurred in the logic above
    return res.status(500).json({ error: 'Something went wrong' })
  }
});

module.exports = createHandler(app);
