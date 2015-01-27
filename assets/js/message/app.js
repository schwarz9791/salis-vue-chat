var loading = false;
var app = new Vue({
  el: 'body',

  data: {
    messages: [],
    current_user: [],
    page: 1,
    is_last: false,
    has_avatar: false,
    count: io.socket.get('/message/count', function (res) {
      app.count = res.count;
    })
  },

  computed: {
    is_last: function() {
      if (this.messages.length >= this.count) return true;
      loading = false;
      return false;
    }
  },

  filters: {
    fromNow: function(time) {
      return moment(time).fromNow();
    }
  },

  created: function () {
    var _this = this;
    var query = window.location.href.split('?')[1];

    // サーバに GET /message としてリクエストする
    io.socket.get('/message?p=' + this.page, function (res) {
      _this.messages = res;
      if (_this.messages.length == _this.count) _this.is_last = true;
    });
    io.socket.get('/user/current', function (res) {
      _this.current_user = res;
    });

    // io.socket.on でモデルの変更イベントを監視できる
    io.socket.on('message', function (event) {
      console.log(event.verb);

      // event.verb が変更の種類を表す
      switch (event.verb) {
        case 'created': // モデルに新たなデータが追加された
          _this.count++;
          _this.messages.unshift(event.data);
          break;
        case 'destroyed': // モデルからデータが削除された
            _this.count--;
          break;
        // default: 
      }
    });
  },

  methods: {
    create: function (event) {
      event.preventDefault(); // submit 時のページ遷移を無効にする

      var _this = this;

      // サーバに POST /message としてリクエストする
      io.socket.post('/message', { message: this.newMessage, _csrf: this.csrf }, function (res) {
        if (res.error) {
          return console.error(res.error);
        }
        _this.newMessage.body = '';

      });
    },

    remove: function(message) {

      var _this = this;
      _this.messages.splice(message.$index, 1)[0];

      // サーバに DELETE /message/:id としてリクエストする
      io.socket.delete('/message/'+ message.id, function (res) {
        if (res.error) {
          return console.error(res.error);
        }
      });
    },

    isOwner: function(id) {
      return this.current_user.id === id;
    },
    
    hasAvatar: function(arg) {
      if (arg) return true;
      return false;
    },

    more: function(p) {
      var _this = this;
      var additional = 0;

      if (_this.messages.length >= p * 10) additional = 1;

      io.socket.get('/message?p=' + (p + additional), function (res) {
        _this.page = p + additional;
        res.forEach(function(message) {
          _this.messages.push(message);
        });
      });
    }
  }
});

$(function() {
  $(window).scroll(function() {
    if ($('#more').length != 0) {
      var morePos = $('#more').offset().top - $(window).height();
      if ($(window).scrollTop() > morePos && !loading) {
        loading = true;
        app.more(app.page);
      }
    }
  });
});
