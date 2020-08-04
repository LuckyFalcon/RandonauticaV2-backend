'use strict';
const addon = require('../build/Release/libAttractFunctions');
const anuQrng = require('../api/anuapi.js');
const UploadImage = require('../helpers/image.js');
const Insert = require('../helpers/InsertReport.js');

const request = require('request');
const querystring = require('querystring');
const Auth = require('../helpers/Auth');
const getAttractors = require('../helpers/FetchAttractors');
const validateCameraRNG = require('../helpers/validateCameraRNG');
const createHandler = require("azure-function-express").createHandler;
const express = require("express");
var fileupload = require("express-fileupload");
const sharp = require('sharp');
const tf = require('@tensorflow/tfjs-node')
const nsfw = require('nsfwjs')
// Create express app as usual
const app = express();
const jpeg = require('jpeg-js')

//app.use(Auth);

let _model

const convert = async (img) => {
  return new Promise(resolve => {
    // Decoded image in UInt8 Byte array
    const image = jpeg.decode(img, true)

    const numChannels = 3
    const numPixels = image.width * image.height
    const values = new Int32Array(numPixels * numChannels)

    for (let i = 0; i < numPixels; i++)
      for (let c = 0; c < numChannels; ++c)
        values[i * numChannels + c] = image.data[i * 4 + c]

    resolve(tf.tensor3d(values, [image.height, image.width, numChannels], 'int32'))
  })
}
const load_model = async () => {
  _model = await nsfw.load()
}

// Keep the model in memory, make sure it's loaded only once
load_model().then(() => app.listen(8080))

app.post("/logmytrip", async (req, res) => {
  try {

  //console.log(req.body);
  var object = {
      GID: req.body.GID,
      favorite: req.body.favorite,
      title: req.body.title,
      report: req.body.report,
      image: req.body.image,
      tag1: req.body.tag1,
      tag2: req.body.tag2
  }

  for(let i = 0; i < 14; i ++){
    
  }
  var tags = req.body.tags;

  //console.log(object)
  await Insert.UpdateTrip(req.user, object).then(async(value) => {
    console.log(value)

    var b64string = object.image;

    const base64ValidationMatches = b64string.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
   
    console.log(base64ValidationMatches);
    

      var buf = Buffer.from(b64string,"base64");

     // const uri = b64string.split(';base64,').pop()
     // var buf = Buffer.from(uri, 'base64'); // Ta-da
      var imagebuffer = await sharp(buf)
        .toFormat('jpeg')
        .jpeg()
        .toBuffer();

        console.log('reached')
      await convert(imagebuffer).then(async (value) => {
     //   console.log(value)
        const predictions = await _model.classify(value)
        value.dispose();
        console.log(predictions);
        return imagebuffer
      }).then(async (imagebuffer) => {
        return await UploadImage(imagebuffer)
      }).then(async (value) => {
        return await Insert.InsertMedia(value, object.GID);
      }).then(async (value) => {
        return await Insert.InsertHashtags(tags);
      // }).then(async (value) => {
      //   return await Insert.InsertTripReportHashtags(tags);
      }).then((value) => {
        console.log(value)
        return res.status(200).json({ success: value })
      })
  
  });
  } catch (error) {
    console.log(error)
    req.context.res = {
      status: 400,
      body: error,
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
});




module.exports = createHandler(app)



