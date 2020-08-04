var iap = require('in-app-purchase');
var Verifier = require('google-play-billing-validator');
const { check, validationResult } = require('express-validator');
const Auth = require('../helpers/Auth');
const createHandler = require("azure-function-express").createHandler;
const express = require("express");
const config = require('../config.json');
const UserInserts = require('../helpers/UserInserts');
const GetImages = require('../helpers/image');
const { check, validationResult } = require('express-validator');

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
    var tripReports = [];

    var user_id;

    var sqlTripReports = await UserInserts.SelectTripReports('Yqk1vhUgS3ORkb5jqOhCMB00Rmw1');

      if(sqlTripReports.recordsets[0].length > 0) {
        user_id = sqlTripReports.recordsets[0][0].user_id;
        console.log(user_id);
        console.log(sqlTripReports.recordsets[0])
        for(let i = 0; i < sqlTripReports.recordsets.length; i++){
          tripReports.push(sqlTripReports.recordsets[i])
        }
      } else {
        return res.status(404).json({ success: 'No Trips' });
      }

      var media = await UserInserts.SelectTripReportsMedia(tripReports)
      var blobs = [];

      if(media.recordsets[0].length > 0) {
        for(let i = 0; i < media.recordsets.length; i++){
            console.log(media.recordsets[0])
            var blobObject = {
              trip_id: media.recordsets[i][0].trip_report_id,
              blob_id: media.recordsets[i][0].blob_id
            }
            blobs.push(blobObject)
        }
      }

      console.log(blobs);

      var images= await GetImages(blobs, user_id)

      return res.status(200).json({ trips: tripReports, images: images });

  } catch (error) {
    console.log(error)
    //An error occurred in the logic above
    return res.status(500).json({ error: 'Something went wrong' })
  }
});

module.exports = createHandler(app);
