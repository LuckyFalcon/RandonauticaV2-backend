module.exports = function highattractor(attractors, selected, context){
  return new Promise(resolve => {

  var json = JSON.parse(attractors)
  if(json.points.length > 0){
    if(selected == "Attractor"){
      let position = getMaxAttractor(json);
      request('https://api.onwater.io/api/v1/results/' + json.points[position].Center.Point.Latitude+','+json.points[position].Center.Point.Longitude + '?access_token='+tokenOnWater, { json: true }, (err, res, body) => {
      if (err) { return attractors }
        json.points[position].water = body.water;
        console.log(json.points[position])

        resolve(json.points[position])

      });
    }else if(selected == "Void"){
      let position = getMaxVoid(json);
      request('https://api.onwater.io/api/v1/results/' + json.points[position].Center.Point.Latitude+','+json.points[position].Center.Point.Longitude + '?access_token='+tokenOnWater, { json: true }, (err, res, body) => {
      if (err) { return attractors }
        json.points[position].water = body.water;
        //Check water points
        resolve(json.points[position])

      });
    } else if(selected == "Anomalie"){
      let position = getMaxAnomaly(json);
      request('https://api.onwater.io/api/v1/results/' + json.points[position].Center.Point.Latitude+','+json.points[position].Center.Point.Longitude + '?access_token='+tokenOnWater, { json: true }, (err, res, body) => {
      if (err) { return attractors }
        json.points[position].water = body.water;
        //Check water points
        resolve(json.points[position])

      });
    }
  } else {
    resolve(attractors)
  }

});
}

module.exports = function getMaxAttractor(attractors) {
  let max = 0;
  let position = -1;
  for (let i = 0; i < attractors.points.length; i++) {
    if (attractors.points[i].Power > max && attractors.points[i].Type == 1) {
      max = attractors.points[i].Power;
      position = i;
    }
  }
  return position;
}

module.exports = function getMaxVoid(attractors) {
  let result = 0;
  let position = -1;

  for (let i = 0; i < attractors.points.length; i++) {
    if (attractors.points[i].Z_score < 0 && attractors.points[i].Type == 2) {
      if (result == 0 || attractors.points[i].Z_score < result) {
        result = attractors.points[i].Z_score;
        position = i;
      }
    }
  }
  return position;
}

module.exports = function getMaxAnomaly(attractors){

  let positionvoid = getMaxVoid(attractors);
  let positionattractor = getMaxAttractor(attractors);

  if(positionvoid == -1){
    return positionattractor;
  }
  else if(positionattractor == -1){
    return positionvoid;
  }
  let minusZscore = attractors.points[positionvoid].Z_score;
  let maxPower = attractors.points[positionattractor].Power;

  if(Math.abs(minusZscore) > maxPower){
    return positionvoid;
  } else {
    return positionattractor;
  }

}