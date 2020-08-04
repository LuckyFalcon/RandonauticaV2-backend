const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const config = require(path.join(process.cwd(), 'config'));

const AZURE_STORAGE_CONNECTION_STRING = config.AZURE_STORAGE_CONNECTION_STRING;


module.exports = async function image(imageData, uuid) {
    return new Promise(resolve => {
        //Create the BlobServiceClient object which will be used to create a container client
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

        //Create a unique name for the container
        const containerName = uuid.toLowerCase();

        // Get a reference to a container
        const containerClient = blobServiceClient.getContainerClient(containerName);
        containerClient.createIfNotExists(containerName);

        // Create a unique name for the blob
        const blobName = 'quickstart' + uuidv4() + '.jpeg';

        // Get a block blob client
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        console.log(imageData)
        // Upload data to the blob
        blockBlobClient.upload(imageData, imageData.byteLength);
        resolve(blobName)
    });


}