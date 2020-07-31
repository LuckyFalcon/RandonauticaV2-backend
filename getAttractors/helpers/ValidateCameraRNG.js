module.exports = function validateCameraRNG(cameraRng, cameraRnglength){
  return new Promise(resolve => {
      if(cameraRng.length != cameraRnglength){
        console.log('valid')

        resolve('Camera RNG size does not match size');

      }

      //Verify whether the string is hex
      var regexp = /^[0-9a-fA-F]+$/;

      if (regexp.test(cameraRng)){
        //The string is HEX
        console.log('valid555')
        resolve(cameraRng);
      } else {
        //The string is not HEX
        resolve('Camera RNG error');
      }
      
  });
}