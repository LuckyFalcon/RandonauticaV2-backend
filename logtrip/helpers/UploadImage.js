module.exports = async function UploadImage(UUID, imageData){
    return new Promise(resolve => {
        const base64ValidationMatches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
        if(base64ValidationMatches != null){
    
        //Create the BlobServiceClient object which will be used to create a container client
        const blobServiceClient = await BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    
        //Create a unique name for the container
        const containerName = 'quidart';
    
        // Get a reference to a container
        const containerClient = await blobServiceClient.getContainerClient(containerName);
        //Check if container exists
        if(!await containerClient.exists()){
             await containerClient.create()
        }
    
        // Create a unique name for the blob
        const blobName = uuidv1() + '.png';
    
        // Get a block blob client
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
        // Upload data to the blob
        const buffer = new Buffer.from(base64ValidationMatches[2], 'base64');
        resolve(uploadBlobResponse = await blockBlobClient.upload(buffer, buffer.byteLength));
    
        }
    })
}