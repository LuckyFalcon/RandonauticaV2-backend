const azure = require('azure-storage');
const path = require('path');
const config = require(path.join(process.cwd(), 'config'));
const blobService = azure.createBlobService(config.AZURE_STORAGE_CONNECTION_STRING);

module.exports = async function FetchImages(blobs, user_id) {
    return new Promise(async (resolve) => {
        
        //Create a unique name for the container
        const containerName = user_id.toLowerCase();
        
        for(var i = 0; i < blobs.length; i++){
          blobs[i].image =  await getImageFromBlob(containerName, blobs[i].blob_id);
        }

        resolve(blobs)   

    });
}

async function getImageFromBlob(containerName, blob){
    return new Promise(async (resolve) => {
        blobService.createReadStream(containerName, blob).on('data', (data) => {
            resolve(data.toString('base64'))
        });
    });
}