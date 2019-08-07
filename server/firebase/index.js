const admin = require('firebase-admin');
require('dotenv').config();

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.credentials)),
  storageBucket: process.env.storageBucket,
})

module.exports = admin;