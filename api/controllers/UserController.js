/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  create: function(req, res) {
    User.create(req.body)
    .exec(function(err, user) {
      if (err) return res.negotiate(err);

      console.log('Created user.\n' + JSON.stringify(user));
      req.logIn(user, function(err) {
        if (err) return res.negotiate(err);

        // req.isAuthenticated() -> true
        // req.user -> user -> When new LocalStrategy, Callback user Object
        req.session.authenticated = req.isAuthenticated();
        // if (req.wantsJSON) return res.json({ flash: 'Successful in creating a new user.', user: user });
        return res.redirect('/chat');
      });
    });
  },

  update: function(req, res) {
    User.findOne(req.params.id).exec(function(err, user) {
      User.checkPassword(req.body.password, user, function(err) {
        if (err) return res.send(422, err);

        User.update(req.params.id, req.body)
        .exec(function(err, user) {
          if (err) return res.negotiate(err);
          console.log('Updated user.\n' + JSON.stringify(user));
          if (req.wantsJSON) return res.json({ flash: 'Updated your data.', user: user });
          // return res.redirect('/user/edit');
        });
      });
    });
  },

  set_avatar: function(req, res) {
    User.findOne(req.session.passport.user).exec(function(err, user){
      if (err) res.json({ error: "Required login to setting the avatar." });

      req.file('avatar').upload({
        adapter: require(sails.config.connections.s3Adapter.adapter),
        key: sails.config.connections.s3Adapter.key,
        secret: sails.config.connections.s3Adapter.secret,
        bucket: sails.config.connections.s3Adapter.bucket
      }, function whenDone(err, uploadedFiles) {
        if (err) return res.negotiate(err);

        if (uploadedFiles.length === 0) {
          req.body.avatar = user.avatar;
        } else {
          req.body.avatar = uploadedFiles[0].fd;
          if (user.avatar) {
            Avatar.remove(user.avatar, function(err) {
              console.log('The record has been deleted');
            });
          }
        }

        User.update(req.params.id, req.body)
        .exec(function(err, user) {
          if (err) return res.negotiate(err);
          console.log('Updated avatar.\n' + JSON.stringify(user));
          if (req.wantsJSON) return res.ok();
        });
      });
    });
  },

  edit: function(req, res) {
    return res.view();
  },

  current: function(req, res) {
    if (req.session.passport.user) {
      User.findOne(req.session.passport.user).exec(function(err, user) {
        if (err) return res.json({ error: "Don't find current user" });
        return res.json(user);
      });
    }
  }
};
