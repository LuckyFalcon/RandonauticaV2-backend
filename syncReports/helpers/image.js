var azure = require('azure-storage');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const config = require(path.join(process.cwd(), 'config'));
var blobService = azure.createBlobService(config.AZURE_STORAGE_CONNECTION_STRING);
var {Base64Encode} = require('base64-stream');

const AZURE_STORAGE_CONNECTION_STRING = config.AZURE_STORAGE_CONNECTION_STRING;


module.exports = async function FetchImages(blobs, user_id) {
    return new Promise(async (resolve) => {
        //Create a unique name for the container
        const containerName = user_id.toLowerCase();

        var images = blobs;
        for(var i = 0; i < blobs.length; i++){
        
            images[i].image =  await getImageFromBlob(containerName, blobs[i].blob_id);
        }
        resolve(images)      

    });


}

async function getImageFromBlob(containerName, blob){
    return new Promise(async (resolve) => {
        blobService.createReadStream(containerName, blob).on('data', (data) => {
            resolve(data.toString('base64'))
        });
    });

}

// A helper function used to read a Node.js readable stream into a string
async function streamToString(readableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on("data", (data) => {
        chunks.push(data.toString());
      });
      readableStream.on("end", () => {
        resolve(chunks.join(""));
      });
      readableStream.on("error", reject);
    });
  }