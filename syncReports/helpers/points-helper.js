const db = require('./db');
const Point = db.Point;

async function getAll() {
    //Find all users
    return await Point.find().select('-hash');
}

async function getById(object) {
    //Find Points by purchaseToken
    let PointsObjectFromDatabase = await Point.findOne({ purchaseToken: object.purchaseToken },{_id:0, __v:0, id:0}).select()
    if(PointsObjectFromDatabase === null){
        let newPoints = 60;
            if(object.productId == 'get_more_points'){
                newPoints = 60
            }
            else if(object.productId == 'get_points'){
                newPoints = 20
            }
        let newPointsObject = {
            purchaseToken: object.purchaseToken,
            purchaseTime: object.purchaseTimeMillis,
            anomalypoints: newPoints,
            attractorpoints: newPoints,
            voidpoints: newPoints
          };

          //Create new Points
         const Points = new Point(newPointsObject);
          return await Points.save()
    } else {
        return PointsObjectFromDatabase
    }

}

async function create(object, callback) {
    // Validate username
    if (await Point.findOne({ purchaseToken: object.purchaseToken })) {
        throw 'Already exists';
    }

    //Create new Points
    const Points = new Point(object);

    // Save Points
    (await Points.save());
}

async function update(PurchaseToken, object) {
    let Points = await Point.findOne({ purchaseToken: PurchaseToken });

    Points.anomalypoints = Points.anomalypoints - parseInt(object.anomalypoints);
    Points.attractorpoints = Points.attractorpoints - parseInt(object.attractorpoints);
    Points.voidpoints = Points.voidpoints - parseInt(object.voidpoints);

    await Points.save();
}

module.exports = {
    getById,
    create,
    update
};