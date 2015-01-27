// Uploader utilities and helper methods
// designed to be relatively generic.

var imagemagick = require('imagemagick-native');
var Writable = require('stream').Writable;
var mongo = require('mongodb'),
MongoClient = require('mongodb').MongoClient;
var Grid = require('gridfs-stream');

// Let's create a custom receiver
var receiver = new Writable({ objectMode: true });
receiver._write = function onFile(file, enc, cb) {

  MongoClient.connect(sails.config.connections.mongoFileDb.uri, {native_parser: true}, function(err, db) {
    if (err) return cb(err);
    
    var gfs = Grid(db, mongo);
    var output = gfs.createWriteStream({
      filename: file.fd,
      root: 'avatar',
      metadata: {
        fd: file.fd,
        dirname: '.'
      } 
    });

    file.pipe(imagemagick.streams.convert({
      width: 200,
      height: 200,
      resizeStyle: 'aspectfill'
    }))
    .pipe(output);

    cb();

  });
};

module.exports = {

  saveAvatar: function(files, cb) {
    files.upload(receiver, function whenDone(err, uploadedFiles) {
      // console.log(uploadedFiles);
      if (err) cb(err);
      cb(null, { files: uploadedFiles });
    });
  }

}
