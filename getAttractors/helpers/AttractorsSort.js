module.exports = async function highattractor(attractors, selected, checkwater) {
  return new Promise(resolve => {
console.log('sortattractor')
    var json = JSON.parse(attractors)
    console.log(json.points.length)
    if (json.points.length > 0) {

      if (selected == 1) {
        let position = getMaxAnomaly(json);
        if (checkwater) {
          request('https://api.onwater.io/api/v1/results/' + json.points[position].Center.Point.Latitude + ',' + json.points[position].Center.Point.Longitude + '?access_token=' + tokenOnWater, { json: true }, (err, res, body) => {
            if (err) { return attractors }
            json.points[position].water = body.water;
            //Check water points
            resolve(json.points[position])
          });
        } else {
          resolve(json.points[position])
        }
      } else if (selected == 2) {
        console.log('sortattractorse')

        let position = getMaxAttractor(json);
        if (checkwater) {
          request('https://api.onwater.io/api/v1/results/' + json.points[position].Center.Point.Latitude + ',' + json.points[position].Center.Point.Longitude + '?access_token=' + tokenOnWater, { json: true }, (err, res, body) => {
            if (err) { return attractors }
            json.points[position].water = body.water;
            console.log(json.points[position])

            resolve(json.points[position])

          });
        } else {
          console.log('resolvepoints')

          resolve(json.points[position])
        }
      } else if (selected == 3) {
        let position = getMaxVoid(json);
        if (checkwater) {
          request('https://api.onwater.io/api/v1/results/' + json.points[position].Center.Point.Latitude + ',' + json.points[position].Center.Point.Longitude + '?access_token=' + tokenOnWater, { json: true }, (err, res, body) => {
            if (err) { return attractors }
            json.points[position].water = body.water;
            //Check water points
            resolve(json.points[position])

          });
        } else {
          resolve(json.points[position])
        }
      } 
    } else {
      console.log('resolvempty')
      resolve(500) //Empty
    }
  });
}

function getMaxAttractor(attractors) {
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

function getMaxVoid(attractors) {
  let result = 0;
  let position = -1;

  for (let i = 0; i < attractors.points.length; i++) {
    if (attractors.points[i].Type == 2) {
        position = i;
      }
  }
  return position;
}


function getMaxAnomaly(attractors){

  let positionvoid = getMaxVoid(attractors);
  let positionattractor = getMaxAttractor(attractors);

  if(positionvoid == -1){
    return positionattractor;
  }
  else if(positionattractor == -1){
    return positionvoid;
  }
  let MaxPowerVoid = attractors.points[positionvoid].Power;
  let maxPowerAttractor = attractors.points[positionattractor].Power;

  if(Math.abs(MaxPowerVoid) > maxPowerAttractor){
    return positionvoid;
  } else {
    return positionattractor;
  }

}