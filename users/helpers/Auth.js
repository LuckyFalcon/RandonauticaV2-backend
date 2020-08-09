const { firebase, admin } = require('../FireBaseConfig');
const { v4: uuidv4 } = require('uuid');

module.exports = (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer', '').trim()
        if (token) {
            admin.auth().verifyIdToken(token)
                .then(function (decodedToken) {
                    req.user = decodedToken.uid
                    return next()
                })
                .catch(function (error) {
                    //Couldn't decode the token
                    return res.status(500).json({ error: 'Something went wrong' })
                });
        } else {
            //Couldn't find the token
            return res.status(500).json({ error: 'Something went wrong' })
        }
    } catch (error) {
        //Something went wrong during getting the token and decoding
        return res.status(500).json({ error: 'Something went wrong' })
    }
};