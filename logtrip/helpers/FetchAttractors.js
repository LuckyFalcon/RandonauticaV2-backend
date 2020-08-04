const request = require('request');

module.exports = async function getAttractors(buffer, radius, x, y) {
  return new Promise(resolve => {
  var options = {
    url: 'https://gonewtonlib.azurewebsites.net/api/attractors?radius='+radius+'&latitude='+x+'&longitude='+y+'&gid=3333',
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    body: buffer
  };    
  request.post(options, function(err, response, body) {
    if (err) {
      resolve(err);
    }
    if (response) {
     resolve(response);
    }
  });
});
}