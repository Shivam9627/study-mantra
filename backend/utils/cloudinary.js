// utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

export const configCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

// Configure immediately if envs are present
if (process.env.CLOUDINARY_API_KEY && (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME)) {
  configCloudinary();
}

export { cloudinary };
export default cloudinary;
