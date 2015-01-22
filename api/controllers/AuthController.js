/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var passport = require('passport');

module.exports = {
    /**
    * `AuthController.login()`
    */
    login: function (req, res) {
        if (req.session.authenticated) { return res.redirect('/chat') }
        // ログイン画面表示
        return res.view();
    },

    /**
    * `AuthController.process()`
    */
    //ログイン認証処理
    process: function (req, res) {
        passport.authenticate('local', function(err, user, info) {
            console.log(info);

            if ((err) || (!user)) {
                return res.send({
                    message: 'login failed'
                });
            }
            // req.isAuthenticated() -> false
            // req.user -> undefined

            req.logIn(user, function(err) {
                if (err) res.send(err);

                // req.isAuthenticated() -> true
                // req.user -> user -> When new LocalStrategy, Callback user Object
                req.session.authenticated = req.isAuthenticated();
                return res.redirect("/chat");
            });
        })(req, res);

    },

    /**
    * `AuthController.logout()`
    */
    logout: function (req, res) {
        // ログイン状態解
        req.logout();
        req.session.destroy();
        res.redirect('/');
    },

    /**
    * `AuthController.signup()`
    */
    signup: function (req, res) {
        return res.view();
    }
};
