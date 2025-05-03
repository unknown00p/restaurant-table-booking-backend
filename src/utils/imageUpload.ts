import ImageKit from "imagekit";
import fs from "fs/promises";

const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVET_KEY,
  urlEndpoint: process.env.IMAGEKIT_PUBLIC_URL,
});

export const uploadToImageKit = async (files) => {
  try {
    const uploadResponses = [];

    for (const file of files) {
      const fileBuffer = await fs.readFile(file.path);
      const res = await imageKit.upload({
        file: fileBuffer,
        fileName: file.originalname,
      });

      uploadResponses.push(res);
      await fs.unlink(file.path);
    }

    return uploadResponses;
  } catch (error) {
    console.error("Upload Error:", error);
    throw error;
  }
};
