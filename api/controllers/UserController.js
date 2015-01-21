/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  create: function(req, res) {
    User.create(req.body)
    .exec(function(err, user){
      if (err) res.send(err);
      req.logIn(user, function(err) {
        if (err) res.send(err);

        // req.isAuthenticated() -> true
        // req.user -> user -> When new LocalStrategy, Callback user Object
        req.session.authenticated = req.isAuthenticated();
        return res.redirect("/chat");
      });
    });
  }
};

