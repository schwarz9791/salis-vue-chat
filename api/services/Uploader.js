// Uploader utilities and helper methods
// designed to be relatively generic.

var gm = require('gm'),
    imageMagick = gm.subClass({ imageMagick: true });
var Writable = require('stream').Writable;
var mongo = require('mongodb'),
    MongoClient = require('mongodb').MongoClient;
var Grid = require('gridfs-stream');

// Let's create a custom receiver
// var blobAdapter = require(sails.config.connections.mongoFileDb.adapter)({
//   uri: sails.config.connections.mongoFileDb.uri + '.avatar'
// });
// var outputReceiver = blobAdapter.receive();
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

    imageMagick(file)
    .autoOrient()
    .resize('200', '200', '^')
    .gravity('Center')
    .crop('200', '200')
    .stream('png', function (err, stdout) {
      if (err) return next(err);
      stdout.pipe(output);
      cb();
    });

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
