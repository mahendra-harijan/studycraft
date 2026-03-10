const dotenv = require('dotenv');

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';

const requiredKeys = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

requiredKeys.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

if (process.env.JWT_ACCESS_SECRET.length < 48 || process.env.JWT_REFRESH_SECRET.length < 48) {
  throw new Error('JWT secrets must be at least 48 characters long.');
}

if (nodeEnv === 'production') {
  if (!process.env.SECRET_KEY) {
    throw new Error('Missing required environment variable in production: SECRET_KEY');
  }
  if (process.env.SECRET_KEY.length < 32) {
    throw new Error('SECRET_KEY must be at least 32 characters long in production.');
  }
}

module.exports = {
  nodeEnv,
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGO_URI,
  sessionSecret: process.env.SECRET_KEY || 'development-secret-key-32-chars-minimum',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ,
  cookieSecure: String(process.env.COOKIE_SECURE || 'false') === 'true',

  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB),
  vapidSubject: process.env.VAPID_SUBJECT ,
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY ,
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY ,
 
 
  contactToEmail: process.env.CONTACT_TO_EMAIL ,
  emailjsPublicKey: process.env.EMAILJS_PUBLIC_KEY ,
  emailjsServiceId: process.env.EMAILJS_SERVICE_ID ,
  emailjsTemplateId: process.env.EMAILJS_TEMPLATE_ID ,
  emailjsRecipientEmail: process.env.EMAILJS_RECIPIENT_EMAIL
};