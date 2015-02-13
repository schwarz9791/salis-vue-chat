/**
 * AvatarController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var blobAdapter = require(sails.config.connections.mongoFileDb.adapter)({
  uri: sails.config.connections.mongoFileDb.uri
});

module.exports = {

  get: function (req, res) {
    var fd = req.params.fd;
    blobAdapter.read(fd, function(err, blob) {
      if (err) return res.badRequest();
      var type = fd.split('.')[fd.split('.').length - 1];
      res.set('Content-Type', 'image/' + type);
      return res.send(blob);
    });
  }

};
