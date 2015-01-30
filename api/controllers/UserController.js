/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var blobAdapter = require(sails.config.connections.mongoFileDb.adapter)({
  uri: sails.config.connections.mongoFileDb.uri + '.avatar'
});
var receiver = blobAdapter.receive();

module.exports = {
  create: function(req, res) {
    req.file('avatar').upload(receiver, function whenDone(err, uploadedFiles) {
      if (err) return res.negotiate(err);

      if (uploadedFiles.length == 0) req.body.avatar = null;
      else req.body.avatar = uploadedFiles[0].fd;

      // return res.ok(req.body);

      User.create(req.body)
      .exec(function(err, user) {
        if (err) return res.negotiate(err);
        console.log(user);
        req.logIn(user, function(err) {
          if (err) return res.negotiate(err);

          // req.isAuthenticated() -> true
          // req.user -> user -> When new LocalStrategy, Callback user Object
          req.session.authenticated = req.isAuthenticated();
          return res.redirect("/chat");
        });
      });
    });
  },

  update: function(req, res) {
    User.findOne(req.params.id).exec(function(err, user) {
      User.checkPassword(req.body.password, user, function(err) {
        if (err) return res.send(err);

        req.file('avatar').upload(receiver, function whenDone(err, uploadedFiles) {
          if (err) return res.negotiate(err);
          if (uploadedFiles.length == 0) {
            req.body.avatar = user.avatar;
          } else {
            req.body.avatar = uploadedFiles[0].fd;
            if (user.avatar) {
              File.remove(user.avatar, function(err) {
                console.log('The record has been deleted');
              });
            }
          }

          User.update(req.params.id, req.body)
          .exec(function(err, user) {
            return res.redirect('/user/edit');
          });
        });
      });
    });
  },

  edit: function(req, res) {
    return res.view();
  },

  current: function(req, res) {
    User.findOne(req.session.passport.user).exec(function(err, user) {
      if (err) res.json({error: "don't find current user"});
      res.json(user);
    });
  }
};

