var loading = false;
var app = new Vue({
  el: 'body',

  data: {
    messages: [],
    current_user: [],
    page: 1,
    is_last: false,
    count: io.socket.get('/message/count', function (res) {
      app.count = res.count;
    })
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
    io.socket.get('/auth/current', function (res) {
      _this.current_user = res;
    });

    // io.socket.on でモデルの変更イベントを監視できる
    io.socket.on('message', function (event) {
      console.log(event.verb);

      // event.verb が変更の種類を表す
      switch (event.verb) {
        case 'created': // created: モデルに新たなデータが追加された
          // console.log(JSON.stringify(event.data));
          _this.count++;
          _this.newMessage.body = '';
          _this.messages.unshift(event.data);
          _this.$emit('message:created', event.data);
          break;
        case 'destroyed':
          _this.count--;
          _this.$emit('message:destroyed', event.data);
          break;
        default: 
          // io.socket.get('/message', function (res) {
          //   _this.messages = res;
          // });
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

        // _this.$emit('message:created', res);
      });
    },

    remove: function(message) {
      // event.preventDefault(); // submit 時のページ遷移を無効にする

      var _this = this;
      _this.messages.splice(message.$index, 1)[0];

      // サーバに DELETE /message/:id としてリクエストする
      io.socket.delete('/message/'+ message.id, function (res) {
        if (res.error) {
          return console.error(res.error);
        }
        // _this.$emit('message:deleted', res);
      });
    },

    isOwner: function(id) {
      return this.current_user.id === id;
    },

    more: function(p) {
      var _this = this;
      var additional = 0;

      if (_this.messages.length >= p * 10) additional = 1;

      io.socket.get('/message?p=' + (p + additional), function (res) {
        _this.page = p + additional;
        for (var i in res) {
          _this.messages.push(res[i]);
        }
        // console.log("view:" + _this.messages.length + " server:" + _this.count);
        if (_this.messages.length == _this.count) _this.is_last = true;
        loading = false;
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
