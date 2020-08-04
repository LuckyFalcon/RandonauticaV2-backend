const { firebase, admin } = require('../FireBaseConfig');

module.exports = (req, res, next) => {
    try {
       // console.log(req)
    const token = req.header('Authorization').replace('Bearer', '').trim()
    console.log(token)
    if (token) {
        admin.auth().verifyIdToken(token)

        .then(function (decodedToken) {
            //We can add some extra verification here
            //But I don't think thats needed?
            console.log('tokenvalidated')
                req.user = decodedToken.uid
                return next()
        }).catch(function (error) {
            //Handle error
            console.log(error)
        });
    } else {
        console.log("There is no current token.");
    }
} catch (error){
    console.log(error)
    req.context.res = {
        status: 400, /* Defaults to 200 */
        body: 'Error',
        headers: {
            'Content-Type': 'application/json'
        }
      };
      req.context.done();
}
};