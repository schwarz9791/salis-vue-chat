var assert = require('assert');
var User = require('../../../api/models/User');

describe('User', function() {
  var joe;
  before(function(done) {
    // テストが始まる前の処理
    done();
  });
  describe('#beforeCreate', function() {
    it('パスワードを渡すと暗号化されること', function (done) {
      var beforePass = 'fuga';
      User.beforeCreate({
        password: beforePass
      }, function(err, user) {
        // assert.notEqual(user, undefined);
        joe = { password: user.password };
        expect(user.password).not.to.equal(beforePass);
        done();
      });
    });
  });
  describe('#beforeUpdate', function() {
    it('パスワードを渡すと暗号化されること', function(done) {
      var beforePass = 'fuga';
      User.beforeUpdate({
        password: beforePass
      }, function(err, user) {
        expect(user.password).not.to.equal(beforePass);
        done();
      });
    });
  });
  describe('#checkPassword', function() {
    it('パスワードが有効であればerrorが空であること', function(done) {
      User.checkPassword('fuga', joe, function(err) {
        expect(err).to.equal();
        done();
      });
    });
  });
});