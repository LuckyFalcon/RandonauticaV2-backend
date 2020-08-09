const AppleAuth = require("apple-auth");
const jwt = require("jsonwebtoken");

module.exports = async function (context, req) {
  context.log(    process.env["ANDROID_PACKAGE_IDENTIFIER"]  )
  const redirect = `intent://callback?${new URLSearchParams(
    req.body
  ).toString()}#Intent;package=com.randonautica.app;scheme=signinwithapple;end`;

  console.log(`Redirecting to ${redirect}`);

  context.res = {
    status: 302,
    headers: {
        'Location': redirect
    },
    body: 'Redirecting...'
};
context.done(null, context.res);
}