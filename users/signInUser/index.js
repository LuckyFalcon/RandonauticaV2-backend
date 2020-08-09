
const { check, validationResult } = require('express-validator');
const Auth = require('../helpers/Auth');
const createHandler = require("azure-function-express").createHandler;
const express = require("express");
const SqlQueries = require('../helpers/SqlQueries');

// Create express app
const app = express();

// Add FireBase authentication middleware
app.use(Auth);

app.get("/api/signInUser", [
  check('platform')
    .isInt()
    .not().isEmpty(),

  async (req, res, next) => {
    //Validate parameters
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    //Start function
    try {

      //Get platform from query
      let platform = 0;

      if (req.query.platform == 1) { //APPLE
        platform = 1;
      }
      else if (req.query.platform == 2) { //GOOGLE
        platform = 2;
      }

      //Insert user
      await SqlQueries.InsertUser(req.user)
      .then(async() => {
        //Insert user details
        await SqlQueries.InsertUserDetails(req.user, platform)
          .then(async() => {
            //Select curent user
            await SqlQueries.SelectUserDetails(req.user, platform).then(async(result) => {
              
              //Create corresponding user object
              let UserObject = {
                platform: result.recordset[0].platform,
                points: result.recordset[0].points,
                is_iap_skip_water_points:  result.recordset[0].is_iap_skip_water_points,
                is_iap_extend_radius:  result.recordset[0].is_iap_extend_radius,
                is_iap_location_search:  result.recordset[0].is_iap_location_search,
                is_iap_inapp_google_preview:  result.recordset[0].is_iap_inapp_google_preview,
                is_shared_with_friends:  result.recordset[0].is_shared_with_friends,
                is_agreement_accepted:  result.recordset[0].is_agreement_accepted,
                started_signedin_streak_datetime: result.recordset[0].started_signedin_streak_datetime,
                current_signedin_streak: result.recordset[0].current_signedin_streak
              }

             //Set the content type and status code and send user object
             return res.status(200).json(UserObject)
            })
          })
        .catch(function (error) {
          //Some error occurred. This shouldn't ever go wrong after the previous insert.
          return res.status(500).json({ error: 'Something went wrong' })
      })
      })     
      .catch(async function (error) {
        //Duplicate column, the user already exists
        if (error.number == 2627) {

          //Select curent user
          await SqlQueries.SelectUserDetails(req.user, platform).then(async(result) => {

            //Create corresponding user object
            let UserObject = {
              platform: result.recordset[0].platform,
              points: result.recordset[0].points,
              is_iap_skip_water_points:  result.recordset[0].is_iap_skip_water_points,
              is_iap_extend_radius:  result.recordset[0].is_iap_extend_radius,
              is_iap_location_search:  result.recordset[0].is_iap_location_search,
              is_iap_inapp_google_preview:  result.recordset[0].is_iap_inapp_google_preview,
              is_shared_with_friends:  result.recordset[0].is_shared_with_friends,
              is_agreement_accepted:  result.recordset[0].is_agreement_accepted,
              started_signedin_streak_datetime: result.recordset[0].started_signedin_streak_datetime,
              current_signedin_streak: result.recordset[0].current_signedin_streak
            }

            //Set the content type and status code and send user object
           return res.status(409).json(UserObject)
          })
        } else {
          //Couldn't decode the token
          return res.status(500).json({ error: 'Something went wrong' })
        }
      })
    } catch (err) {
      //Something went wrong executing the logic above
      return res.status(500).json({ error: 'Something went wrong' })
    }
  }
]
)

module.exports = createHandler(app);
