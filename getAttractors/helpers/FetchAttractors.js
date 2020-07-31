const request = require('request');

module.exports = async function getAttractors(buffer, radius, x, y) {
  return new Promise(resolve => {
    var baseUrl = 'https://gonewtonlib.azurewebsites.net';
    var randomNumber = getRandomInt(6);

    if (randomNumber == 1) {
      baseUrl = 'https://gonewtonlib-useast2.azurewebsites.net';
    }
    if (randomNumber == 2) {
      baseUrl = 'https://gonewtonlib-cus.azurewebsites.net';
    }
    if (randomNumber == 3) {
      baseUrl = 'https://gonewtonlib-scus.azurewebsites.net';
    }
    if (randomNumber == 4) {
      baseUrl = 'https://gonewtonlib-uswest.azurewebsites.net';
    }
    if (randomNumber == 5) {
      baseUrl = 'https://gonewtonlib-uswest2.azurewebsites.net';
    }

    var options = {
      url: baseUrl + '/api/attractors?radius=' + radius + '&latitude=' + x + '&longitude=' + y + '&gid=3333',
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',

      },
      body: buffer
    };
    request.post(options, function (err, response, body) {
      if (err) {
        resolve(err);
      }
      if (response) {
        resolve(response);
      }
    });
  });
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
