
const { check, validationResult } = require('express-validator');
const Auth = require('../helpers/Auth');
const createHandler = require("azure-function-express").createHandler;
const express = require("express");
const UserInserts = require('../helpers/UserInserts');

//Amount of points recieved on sharing
const ShareWithFriendsPoints = 5;

// Create express app
const app = express();

// Add FireBase authentication middleware
app.use(Auth);

app.get("/api/shareWithFriends", [
  async (req, res, next) => {
    //Validate parameters
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    try {
      //Select curent user
      await UserInserts.SelectUserDetails(req.user, platform)
        .then(async (result) => {
          if (result.recordset[0].is_shared_with_friends != 0) {
            SetShareWithFriends(req.user, ShareWithFriendsPoints).then(() => {
              //Set the content type and status code and send user object
              return res.status(200).json('Successfully shared')
            })
          } else {
            //Already shared with friends
            return res.status(500).json({ error: 'Something went wrong' })
          }
        })
        .catch(async function (error) {
          //Couldn't decode the token
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
