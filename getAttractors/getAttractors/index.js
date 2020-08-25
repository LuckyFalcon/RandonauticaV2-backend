'use strict';
const anuQrng = require('../api/anuapi.js');
const request = require('request');
const querystring = require('querystring');
const Auth = require('../helpers/Auth');
const getAttractors = require('../helpers/FetchAttractors');
const sortAttractors = require('../helpers/AttractorsSort');
const sqlQueries = require('../helpers/SqlQueries');
const validateCameraRNG = require('../helpers/ValidateCameraRNG');
const { check, validationResult } = require('express-validator');
const createHandler = require("azure-function-express").createHandler;
const express = require("express");
const crypto = require('crypto');
const rateLimit = require("express-rate-limit");

//Windows
//const addon = require('../build/Release/libAttractFunctions');

//Linux
const addon = require('../build/Release/AttractFunctions');

//Rate limiter
const limiter = rateLimit({
  windowMs: 1 * 10 * 1000, // 10 seconds
  max: 1 // limit each IP to 1 requests per windowMs
});

// Create express app
const app = express();

//Firebase Authentication middleware
app.use(Auth);
 
//Apply limiter to all requests
app.use(limiter);

/*  
Random point = 1 token
Quantum random point = 2 token
Amplification bias = 5 token
*/

const RandomPointCost = 1;
const QuantumPointCost = 2;
const AmplificationBiasPointCost = 5;

app.get("/getattractors", [
  check('selected')
    .isInt()
    .not().isEmpty(),
  check('source')
    .isInt()
    .not().isEmpty(),
  check('checkwater')
    .isBoolean()
    .not().isEmpty(),

], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {

    //Check if account has enough points here
    var user = await sqlQueries.SelectUserDetails(req.user);

    //Get Entropy Source
    var entropySource = req.query.source;

    //Check the point the user has selected
    var selected = req.query.selected;
    
    //Initialize Point Cost
    var pointCost;

    //Verifiy if the point selected is the following and whether the user has enough points
    //Infnite point users are noted as having -333 points
    switch (entropySource) {
      case '1':
        if (user.recordset[0].points < RandomPointCost && user.recordset[0].points != -333) {
          return res.status(400).json({ error: 'Not enough points' })
        }
        pointCost = RandomPointCost;
        break;
      case '2':
        if (user.recordset[0].points < QuantumPointCost && user.recordset[0].points != -333) {
          return res.status(400).json({ error: 'Not enough points' })
        }
        pointCost = QuantumPointCost;
        break;
      case '3':
        if (user.recordset[0].points < AmplificationBiasPointCost && user.recordset[0].points != -333) {
          return res.status(400).json({ error: 'Not enough points' })
        }
        pointCost = AmplificationBiasPointCost;
        break;
      default:
        //No Attractor/Void/Anomaly selected given
        return res.status(400).json({ error: 'No point source found' })
    }

    //Check whether the user wishes to check for water points
    var checkWater = req.query.checkwater;

    //Checkwater from query and convert to boolean
    if (checkWater == 'true') {
      //Check wheter user has access to skipping water points
      if (user.recordset[0].is_iap_skip_water_points == 1) {
        checkWater = true;
      } else { 
        //User doesn't have access to skipping water points
        checkWater = false;
      }
    } else {
      checkWater = false;
    }

    //User selected Radius
    var radius = parseFloat(req.query.radius);

    //Coordinates
    var x = req.query.x;
    var y = req.query.y;

    //Call Newton Lib to get needed size
    var th = await addon.getOptimizedDots(radius);
    var hexSize = await addon.requiredEnthropyHex(th);

    //Initizialize Entropy
    var entropy;

    //Generate Entropy based on the selected source given
    switch (entropySource) {
      case '1':
        entropy = await genHexString(hexSize);
        break;
      case '2':
        entropy = await genHexString(hexSize);
        break;
      case '3':
        entropy = await genHexString(hexSize);
        break;
      default:
        entropy = await genHexString(hexSize);
      }

    //Create buffer from entropy string
    var buffer = Buffer.from(entropy, 'hex');
    var gid = crypto.createHash('sha256').update(entropy).digest('hex');
    var GoNewtonLibResult = await getAttractors(buffer, radius, x, y);

    await sortAttractors(GoNewtonLibResult.body, selected, false)
      .then(async (highestAttractorPoint) => {
        if (highestAttractorPoint == 500 || highestAttractorPoint == undefined) {
          return res.status(500).json({ error: 'no points found' })
        } else {
          highestAttractorPoint.GID = gid;
          return highestAttractorPoint;
        }
      })
      .then(async (highestAttractorPoint) => { //Insert trip in DB
        await sqlQueries.insertTrip(req.user, highestAttractorPoint)
        return highestAttractorPoint
      })
      .then(async (highestAttractorPoint) => { //Update point balance in DB
        //Check for infinite point users
        if(user.recordset[0].points != -333) {
          await sqlQueries.updatePointsBalance(req.user, pointCost)
        }
        return highestAttractorPoint
      })
      .then((highestAttractorPoint) => res.status(200).json(highestAttractorPoint))
      .catch((error) => {
        return res.status(500).json({ error: 'Something went wrong' })
      })
  } catch (error) {
    //An error occurred in the logic above
    return res.status(500).json({ error: 'Something went wrong' })
  }
});

//Generate Pseudo Randomness in Hex
function genHexString(len) {
  return new Promise(resolve => {
    let output = '';
    for (let i = 0; i < len; ++i) {
      output += (Math.floor(Math.random() * 16)).toString(16);
    }
    resolve(output);
  })
}

module.exports = createHandler(app);
