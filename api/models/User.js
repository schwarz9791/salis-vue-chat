/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var bcrypt = require('bcrypt');

var hashedPassword = function(pass, cb) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(pass, salt, function(err, hash) {
      if (err) return cb(err);
      return cb(null, hash);
    });
  });
}

module.exports = {  
    attributes: {
      toJSON: function() {
        // console.log("toJson");
        var obj = this.toObject();
        delete obj.password;
        return obj;
      },
      username: {
        type: 'string',
        required: true,
        unique: true
      },
      password: {
        type: 'string',
        required: true
      }
    },

    beforeCreate: function(user, cb) {
      delete user._csrf;
      delete user.confirm;

      hashedPassword(user.password, function(err, hash) {
        if (err) return cb(err);
        user.password = hash;
        return cb(null, user);
      });
    },

    beforeUpdate: function(user, cb) {
      var pass = user.password;
      if (user.new_password) pass = user.new_password;

      delete user._csrf;
      delete user.confirm;
      delete user.new_password;

      if (pass) {
          hashedPassword(pass, function(err, hash) {
          if (err) return cb(err);
          console.log('Password updated')
          user.password = hash;
          return cb(null, user);
        });
      } else {
        return cb(null, user);
      }
    },

    checkPassword: function(pass, user, cb) {
      bcrypt.compare(pass, user.password, function (err, res) {
        if (!res) return cb({error: 'Invalid password'});
        return cb();
      });
    }
};
