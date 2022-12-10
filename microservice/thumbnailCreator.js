'use strict';

const jimp = require('jimp');
const path = require('path');
const { Responder } = require('cote');

const thumbnailCreator = async (fileName, destination) => {
  const defaultOrigin = path.join(__dirname, '..', 'public');
  const completeFileName = defaultOrigin + fileName;
  const fileNamePurged = path.basename(fileName);

  try {
    const fileOpen = await jimp.read(completeFileName);
    fileOpen.resize(100, 100);
    fileOpen.write(
      path.join(defaultOrigin, destination, 'thumbnail-' + fileNamePurged)
    );
  } catch (err) {
    return new Error(err.message);
  }
  return destination;
};

const responser = new Responder({ name: 'thumbnail creator responder' });

responser.on('thumbnailer', async (req, done) => {
  const { fileName, destination } = req;
  console.log('Doing thumbnail from ', fileName);
  try {
    const result = await thumbnailCreator(fileName, destination);
    done(`Thumbnail done and saved in ${result}`);
  } catch {
    done(`An error has happend: ${result})`);
  }
});
