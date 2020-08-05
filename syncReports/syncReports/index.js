const { check, validationResult } = require('express-validator');
const Auth = require('../helpers/Auth');
const createHandler = require("azure-function-express").createHandler;
const express = require("express");
const UserInserts = require('../helpers/UserInserts');
const FetchImages = require('../helpers/image');

// Create express app
const app = express();

// Add FireBase authentication middleware
app.use(Auth);

app.get("/api/syncReports", [
  //Verifying parameters here

], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    //Trip reports
    var tripReports = [];

    //Images from Azure Storage
    var imageBlobs = [];

    //User_id retrieved in trip reports
    var user_id;

    //Get Trip reports
    var sqlTripReports = await UserInserts.SelectTripReports(req.user);

    //Check for trip reports
    if (sqlTripReports.recordsets[0].length > 0) {
      user_id = sqlTripReports.recordsets[0][0].user_id;
      for (let i = 0; i < sqlTripReports.recordsets.length; i++) {
        delete sqlTripReports.recordsets[0][i]['user_id'];
        tripReports.push(sqlTripReports.recordsets[i])
      }
    } else {
      return res.status(404).json({ success: 'No Trips' });
    }

    //Get image data from database
    var tripReportsMedia = await UserInserts.SelectTripReportsMedia(tripReports)

    if (tripReportsMedia.recordsets[0].length > 0) {
      for (let i = 0; i < tripReportsMedia.recordsets[0].length; i++) {
        var blobObject = {
          trip_id: tripReportsMedia.recordsets[0][i].trip_report_id,
          blob_id: tripReportsMedia.recordsets[0][i].blob_id
        }
        imageBlobs.push(blobObject)
      }

      //Get images from Azure Storage
      imageBlobs = await FetchImages(imageBlobs, user_id)
    }

    //Return trip reports and images back to client
    return res.status(200).json({ trips: tripReports, images: imageBlobs });

  } catch (error) {
    //An error occurred in the logic above
    return res.status(500).json({ error: 'Something went wrong' })
  }
});

module.exports = createHandler(app);
