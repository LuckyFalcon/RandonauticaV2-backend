const AppleAuth = require("apple-auth");
const jwt = require("jsonwebtoken");

module.exports = async function (context, req) {
    const auth = new AppleAuth(
        {
          // use the bundle ID as client ID for native apps, else use the service ID for web-auth flows
          // https://forums.developer.apple.com/thread/118135
          client_id:
            req.query.useBundleId === "true"
              ? process.env["BUNDLE_ID"]
              : process.env["SERVICE_ID"],
          team_id: process.env["TEAM_ID"],
          redirect_uri:
            "https://flutter-sign-in-with-apple-example.glitch.me/callbacks/sign_in_with_apple", // does not matter here, as this is already the callback that verifies the token after the redirection
          key_id: process.env["KEY_ID"]
        },
        process.env["KEY_CONTENTS"].replace(/\|/g, "\n"),
        "text"
      );
    
      console.log(req.query);
    
      const accessToken = await auth.accessToken(req.query.code);
    
      const idToken = jwt.decode(accessToken.id_token);
    
      const userID = idToken.sub;
    
      console.log(idToken);
    
      // `userEmail` and `userName` will only be provided for the initial authorization with your app
      const userEmail = idToken.email;
      const userName = `${req.query.firstName} ${req.query.lastName}`;
    
      // 👷🏻‍♀️ TODO: Use the values provided create a new session for the user in your system
      const sessionID = `NEW SESSION ID for ${userID} / ${userEmail} / ${userName}`;
    
      console.log(`sessionID = ${sessionID}`);
    
      context.res.json({ sessionId: sessionID });
}