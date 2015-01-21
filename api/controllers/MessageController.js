/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  chat: function (req, res) {
      // チャット画面表示
      return res.view();
  },

  find: function(req, res) {
    console.log("GET /message");
    if (!req.query.p) req.query.p = 1;

    Message.find()
    .sort({ createdAt: 'desc' })
    .paginate({page: req.query.p, limit: 10})
    .populate('owner')
    .exec(function(err, messages) {
      Message.watch(req);
      Message.subscribe(req.socket, messages);
      res.json(messages);
    });
  },

  create: function(req, res) {
    console.log("POST /message");
    console.log(req.body);

    var body = req.body.message.body;
    var current_user;

    User.findOne(req.session.passport.user)
    .exec(function(err, user) {
      current_user = user;

      if (!current_user) {
        res.json({error: "don't login"});
        return;
      }
      
      Message.create({body: body, owner: current_user})
      .exec(function(err, message) {
        if (err) {
          res.json(err);
          return;
        };
        message.owner = current_user;
        Message.publishCreate(message);
        res.json(message);
      });
    });
    
  },

  destroy: function(req, res) {
    console.log("DELETE /message/" + req.param('id'));

    Message.destroy(req.param('id'))
    .exec(function(err){
      if (err) console.log("Failed delete message");
      Message.publishDestroy(req.param('id'));
    });
  },

  count: function(req, res) {
    Message.count()
    .exec(function(err, count) {
      if (err) res.json(err);
      res.json(200, {count: count});
    });
  }

};
