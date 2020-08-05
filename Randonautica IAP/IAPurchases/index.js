var iap = require('in-app-purchase');
var Verifier = require('google-play-billing-validator');
const { check, validationResult } = require('express-validator');
const Auth = require('../helpers/Auth');
const createHandler = require("azure-function-express").createHandler;
const express = require("express");
const config = require('../config.json');
const SqlQueries = require('../helpers/SqlQueries');

// Create express app
const app = express();

// Add FireBase authentication middleware
app.use(Auth);

//In App purchase configuration
iap.config({

  /* Configurations for Apple */
  appleExcludeOldTransactions: true, // if you want to exclude old transaction, set this to true. Default is false
  applePassword: config.applePassword, // this comes from iTunes Connect (You need this to valiate subscriptions)

  /* Configurations for Google Service Account validation: You can validate with just packageName, productId, and purchaseToken */
  googleServiceAccount: {
    clientEmail: config.clientEmail,
    privateKey: config.privateKey
  }
});


var options = {
  "email": config.clientEmail,
  "key": config.privateKey,
};

app.post("/api/IAPurchases", [
  check('receipt')
    .isString()
    .optional(),
  check('packageName')
    .isString()
    .not().isEmpty(),
  check('productId')
    .isString()
    .not().isEmpty(),
  check('purchaseToken')
    .isString()
    .not().isEmpty(),
  check('subscription')
    .isString()
    .not().isEmpty(),

], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    
    //Receipt object
    let receipt;

    //Check platform
    if (req.query.platform == 1) { //Apple
      if(req.body.receipt == undefined){
        return res.status(500).json({ error: 'Something went wrong' })
      } else {
        receipt = req.body.receipt; 
      }
    } else if (req.query.platform == 2) { //Google
      if(req.body == undefined || req.body.purchaseToken == undefined || req.body.packageName == undefined || req.body.productId == undefined || req.body.subscription == undefined){
        return res.status(500).json({ error: 'Something went wrong' })
      } else {
        receipt = {
          packageName: req.body.packageName,
          productId: req.body.productId,
          purchaseToken: req.body.purchaseToken,
          subscription: req.body.subscription // if the receipt is a subscription, then true
        }
      }
    }
    
    //Check if receipt is empty
    if(!receipt){
      return res.status(500).json({ error: 'Something went wrong' })
    }

    //Start IAP validation
    iap.setup()
      .then(() => {
        // iap.validate(...) automatically detects what type of receipt you are trying to validate
        iap.validate(receipt)
          .then((response) => {
            if (iap.isValidated(response)) {
              // valid receipt
              upgradeUser(req.user, response).then((validatedData) =>{
                return res.status(200).json(validatedData)
              })
            }
          })
          .then((validatedData) => {
            return res.status(200).json(validatedData)
          })
          .catch(error => { //Not valid receipt
            console.log(error)
            return res.status(500).json({ error: 'Something went wrong' })
          });
      })
      .catch(error => { //Something went wrong
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' })
      });

  } catch (error) {
    console.log('error' + error)

    //An error occurred in the logic above
    return res.status(500).json({ error: 'Something went wrong' })
  }
});

async function upgradeUser(user, validatedData, context) {
  // validatedData: the actual content of the validated receipt
  // validatedData also contains the original receipt
  var options = {
    ignoreCanceled: true, // Apple ONLY (for now...): purchaseData will NOT contain cancceled items
    ignoreExpired: true // purchaseData will NOT contain exipired subscription items
  };

  // validatedData contains sandbox: true/false for Apple and Amazon
  var purchaseData = iap.getPurchaseData(validatedData, options);

  //prints purchasedata
  console.log(purchaseData);

  //Insert purchase in db
  await SqlQueries.InsertPurchaseHistory(purchaseData, user);

  //Based on product id
  switch (purchaseData[0].productId) {
    case "20_owl_tokens":
      if (purchaseData[0].service == "google") {
        await SqlQueries.addToPointsBalance(user, 20).catch(error => { //Something went wrong
          console.log(error)
          return res.status(500).json({ error: 'Something went wrong' })
        });
      } 
      break;
    case "60_owl_tokens":
      if (purchaseData[0].service == "google") {
        await SqlQueries.addToPointsBalance(user, 60).catch(error => { //Something went wrong
          console.log(error)
          return res.status(500).json({ error: 'Something went wrong' })
        });
      }   
      break;
      case "150_owl_tokens":
        await SqlQueries.addToPointsBalance(user, 150).catch(error => { //Something went wrong
          console.log(error)
          return res.status(500).json({ error: 'Something went wrong' })
        });
        break;
    case "500_owl_tokens":
      await SqlQueries.addToPointsBalance(user, 500).catch(error => { //Something went wrong
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' })
      });
      break;
    case "1500_owl_tokens":
      await SqlQueries.addToPointsBalance(user, 1500).catch(error => { //Something went wrong
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' })
      });
      break;
    case "extend_radius":
      await SqlQueries.upgradeRadius(user).catch(error => { //Something went wrong
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' })
      });
      break;
    case "skip_water_points":
      await SqlQueries.SetWaterPointsActive(user).catch(error => { //Something went wrong
        console.log(error)
        return res.status(500).json({ error: 'Something went wrong' })
      });
      break;
  }
  
  return validatedData;

}


module.exports = createHandler(app);