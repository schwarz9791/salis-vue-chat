/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var bcrypt = require('bcrypt');

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
      
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, function(err, hash) {
          if (err) {
            console.log(err);
            cb(err);
          } else {
            user.password = hash;
            cb(null, user);
          }
        });
      });
    }
};
