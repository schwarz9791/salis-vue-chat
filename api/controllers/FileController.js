/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var blobAdapter = require(sails.config.connections.mongoFileDb.adapter)({
  uri: sails.config.connections.mongoFileDb.uri + '.avatar'
});

module.exports = {

  get: function (req, res) {
    blobAdapter.read(req.params.id, function(err, blob) {
      if (err) return res.badRequest();
      res.send(blob);
    });
  }

};