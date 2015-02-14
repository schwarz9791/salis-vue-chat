/**
 * AvatarController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var blobAdapter = require(sails.config.connections.s3Adapter.adapter)({
  key: sails.config.connections.s3Adapter.key,
  secret: sails.config.connections.s3Adapter.secret,
  bucket: sails.config.connections.s3Adapter.bucket
});

module.exports = {

  get: function (req, res) {
    var fd = req.params.fd;
    blobAdapter.read(fd, function(err, blob) {
      if (err) return res.notFound();
      var type = fd.split('.')[fd.split('.').length - 1];
      res.set('Content-Type', 'image/' + type);
      return res.send(blob);
    });
  }

};
