import ImageKit from '@imagekit/nodejs';

async function uploadFile(buffer){
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("IMAGEKIT_PRIVATE_KEY must be set to upload files");
    }
    const client = new ImageKit({ privateKey });
    const response = await client.files.upload({
        file: buffer.toString("base64"),
        fileName: 'image'+Date.now()+".jpg",
        folder: "products"
      });
      return response
}
export default uploadFile