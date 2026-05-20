const cloudinary = require('cloudinary').v2;

let isCloudinaryConfigured = false;

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  isCloudinaryConfigured = true;
  console.log('Cloudinary: Configured and active.');
} else {
  console.warn(
    'Cloudinary: Environment variables missing. Using local Base64 string fallback for image storage.'
  );
}

/**
 * Uploads a file buffer to Cloudinary or falls back to Base64 data URL
 * @param {Buffer} fileBuffer 
 * @param {string} fileName 
 * @returns {Promise<string>} Image URL or Base64 string
 */
const uploadToCloudinary = async (fileBuffer, fileName) => {
  if (!isCloudinaryConfigured) {
    // Return base64 representation if Cloudinary is not configured
    const mimeType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
    const base64 = fileBuffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'ai-nutrition-tracker',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          // Safe fallback to base64 even if Cloudinary fails at runtime
          const mimeType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';
          return resolve(`data:${mimeType};base64,${fileBuffer.toString('base64')}`);
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

module.exports = { uploadToCloudinary, isCloudinaryConfigured };
