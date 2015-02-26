/**
 * AvatarController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var aws = require('aws-sdk');
aws.config.update({
  accessKeyId: sails.config.connections.s3Adapter.key,
  secretAccessKey: sails.config.connections.s3Adapter.secret
});

var UUIDGenerator = require('sails/node_modules/node-uuid');

var blobAdapter = require(sails.config.connections.s3Adapter.adapter)({
  key: sails.config.connections.s3Adapter.key,
  secret: sails.config.connections.s3Adapter.secret,
  bucket: sails.config.connections.s3Adapter.bucket
});

module.exports = {

  get: function(req, res) {
    var fd = req.params.fd;
    blobAdapter.read(fd, function(err, blob) {
      if (err) return res.notFound();
      var type = fd.split('.')[fd.split('.').length - 1];
      res.set('Content-Type', 'image/' + type);
      return res.send(blob);
    });
  },

  sign_s3: function(req, res) {
    var s3 = new aws.S3();
    var s3_params = {
        Bucket: sails.config.connections.s3Adapter.bucket,
        Key: UUIDGenerator.v4() + '.png',
        Expires: 60,
        ContentType: req.query.s3_object_type,
        ACL: 'public-read'
    };
    
    s3.getSignedUrl('putObject', s3_params, function(err, data){
      if (err) {
        console.log(err);
      } else {
        var return_data = {
            signed_request: data,
            url: 'https://' + s3_params.Bucket + '.s3.amazonaws.com/' + s3_params.Key,
            fd: s3_params.Key
        };
        res.write(JSON.stringify(return_data));
        res.end();
      }
    });
  }

};
