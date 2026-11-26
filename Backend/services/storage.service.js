import ImageKit from '@imagekit/nodejs';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

async function uploadFile(buffer, originalName = "image.jpg", folder = "products"){
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("IMAGEKIT_PRIVATE_KEY must be set to upload files");
    }
    const client = new ImageKit({ privateKey });
    const extension = extname(originalName).toLowerCase();
    const safeExtension = /^\.[a-z0-9]{1,5}$/.test(extension) ? extension : ".jpg";
    const response = await client.files.upload({
        file: buffer.toString("base64"),
        fileName: `image-${randomUUID()}${safeExtension}`,
        folder
      });
      return response
}
export default uploadFile