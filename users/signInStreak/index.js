
const { check, validationResult } = require('express-validator');
const Auth = require('../helpers/Auth');
const createHandler = require("azure-function-express").createHandler;
const express = require("express");
const SqlQueries = require('../helpers/SqlQueries');
var moment = require('moment');

// Create express app
const app = express();

// Add FireBase authentication middleware
app.use(Auth);

app.get("/api/signInStreak", [
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

      //Verify platform
      if (req.query.platform == 1) { //APPLE
        platform = 1;
      }
      else if (req.query.platform == 2) { //GOOGLE
        platform = 2;
      }

      //Select curent user
      await SqlQueries.SelectUserDetails(req.user, platform).then(async(result) => {
          
          //Check difference in days between user signed streak date
          let days = moment().diff(moment(result.recordset[0].started_signedin_streak_datetime), 'days');

          //If Days is bigger than 1 increase the streak of the user
          if(days >= 1){

            //Current date from moment in the format of SQL DatetTime2
            var currentDate =  moment().format("YYYY-MM-DD HH:mm:ss.SSS");
            
            //Select curent user
            await SqlQueries.SetStreak(req.user, currentDate).then(async(result) => {
            
              //Some error occurred. This shouldn't ever go wrong after the previous insert.
              return res.status(200).json({ success: 'Success' })
            }).catch(function (error) {

              //Some error occurred with updating in SQL
              return res.status(500).json({ error: 'Something went wrong' })
            })
          } else {
            //No Streak upate
            return res.status(500).json({ error: 'Something went wrong' })
          }
        })
        .catch(function (error) {
          //Some error occurred. This shouldn't ever go wrong after the previous insert.
          return res.status(500).json({ error: 'Something went wrong' })
      })        
    } catch (err) {
      //Something went wrong executing the logic above
      return res.status(500).json({ error: 'Something went wrong' })
    }
  }
]
)

module.exports = createHandler(app);
