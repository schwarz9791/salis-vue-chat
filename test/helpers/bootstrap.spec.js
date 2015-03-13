// Bootstrap.spec.js

var Sails = require('sails'),
sails;

before(function(done) {
  Sails.lift({
    // configuration for testing purposes
    session: {
      adapter: 'memory'
    },
    sockets: {
      adapter: 'memory'
    },
    connections: {
      localDiskDb: {
        adapter: 'sails-disk'
      }
    }
  }, function(err, server) {
    sails = server;
    if (err) return done(err);
    // here you can load fixtures, etc.
    done(err, sails);
  });
});

after(function(done) {
  // here you can clear fixtures, etc.
  sails.lower(done);
});