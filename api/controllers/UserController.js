/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  create: function(req, res) {
    Uploader.saveAvatar(req.file('avatar'), function(err, result) {
      if (err) res.send(err);

      // console.log(result);

      if (!result) return res.serverError('Upload failed.');
      if (result.files.length == 0) req.body.avatar = null;
      else req.body.avatar = result.files[0].fd;

      // return res.ok(req.body);

      User.create(req.body)
      .exec(function(err, user) {
        console.log(req.body);
        if (err) res.send(err);
        req.logIn(user, function(err) {
          if (err) res.send(err);

          // req.isAuthenticated() -> true
          // req.user -> user -> When new LocalStrategy, Callback user Object
          req.session.authenticated = req.isAuthenticated();
          return res.redirect("/chat");
        });
      });
    });

  },

  current: function(req, res) {
    User.findOne(req.session.passport.user).exec(function(err, user){
      if (err) res.json({error: "don't find current user"});
      res.json(user);
    });
  }
};

