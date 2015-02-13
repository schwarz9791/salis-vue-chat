/**
* Avatar.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var blobAdapter = require(sails.config.connections.mongoFileDb.adapter)({
  uri: sails.config.connections.mongoFileDb.uri
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

