const admin = require('../firebase/index');

module.exports = (name, id) => new Promise(async (resolve, reject) => {
  const bucket = admin.storage().bucket();
  const options = {
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000,
    version: 'v4'
  }
  const imgeUrlRef = await bucket.file(name);
  const [imageUrl] = await imgeUrlRef.getSignedUrl(options);
  resolve({ imageUrl, id });
});