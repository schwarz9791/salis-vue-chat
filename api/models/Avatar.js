/**
* Avatar.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var blobAdapter = require(sails.config.connections.s3Adapter.adapter)({
  key: sails.config.connections.s3Adapter.key,
  secret: sails.config.connections.s3Adapter.secret,
  bucket: sails.config.connections.s3Adapter.bucket
});

module.exports = {

  attributes: {

  },

  remove: function(fd, cb) {
    blobAdapter.rm(fd, function deleteCB(err) {
      if (err) return cb(err);
      return cb();
    });
  }

};

