const express = require('express');
const cookie = require('cookie-parser');
const { join } = require('path');
const admin = require('./firebase/index');
const generateUrls = require('./helpers/generateUrl');
const fileUpload = require('express-fileupload');
const axios = require('axios');

const app = express();

app.use(express.json());

app.use(cookie());

app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));

app.set('port', process.env.PORT || 4300);

app.post('/api/v1/image', async (req, res) => {
  try {
    const file = req.files.file;
    const fileName = file.name;
    const userId = 1;
    const options = {
      action: 'write',
      expires: Date.now() + 60 * 60 * 1000,
      version: 'v4'
    }
    
    // Gerneral Write signed Url

    const bucket = admin.storage().bucket();
    const imgeUrlRef = bucket.file(`/images/${userId}/${fileName}`);
    const [imageUrl] = await imgeUrlRef.getSignedUrl(options);

    // Send Request To upload Image From the BackEnd
    await axios.put(imageUrl, file.data);

    // Get SignedUrl for the Image
    const [imageSRC] = await imgeUrlRef.getSignedUrl({ action: 'read', expires: Date.now() + 60 * 60 * 1000, version: 'v4' });

    // Send the URL
    res.send({ imageUrl: imageSRC });
  } catch (error) {
    console.log(error);
  }
});

app.get('/api/v1/image', async (req, res) => {
  try {
    const userId = 1;
    // for filtering the files//
    const options = {
      prefix: `images/${userId}`,
      // there is another property: delimiter: '/'
    }

    const bucket = admin.storage().bucket()

    //to get all files//
    const [imageUrlRefs] = await bucket.getFiles(options);
    const urls = await Promise.all(imageUrlRefs.map(file => {
      return generateUrls(file.name, file.name);
    }))
    res.send(urls);

  } catch (error) {
    console.log(error)
  }
});

app.delete('/api/v1/image', async (req, res) => {
  try {
    const userId = 1;
    const imageName = req.body.imageName;
    const bucket = admin.storage().bucket()

    //delete a file
    await bucket.file(`/images/${userId}/${imageName}`).delete();
    res.send({ id: imageName })
  } catch (error) {
    console.log(error)
  }
});

//new feature, downloading the photo; still in progress
app.post('/api/v1/download', async (req, res) => {
  try {
    const splitPath = req.body.imageName.split('/');
    const imageName = splitPath[splitPath.length - 1];
    const bucket = admin.storage().bucket()
    const options = {
      // The path to which the file should be downloaded, e.g. "./file.txt"
      destination: `/${imageName}`,
    };

    // Downloads the file
    await bucket
      .file(req.body.imageName)
      .download(options);
  } catch (error) {
    console.log(error);
  }
})

app.use(express.static(join(__dirname, '..', 'client', 'build')));

app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, '..', 'client', 'build', 'index.html'));
});

module.exports = app;
