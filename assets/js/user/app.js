app = new Vue({
  el: 'body',

  data: {
    id: '',
    username: '',
    password: '',
    new_password: '',
    confirm: '',
    avatar: '',
    has_error: false
  },

  computed: {
    has_error: function() {
      if (this.new_password == this.confirm && this.password != '') return false
        return true
    }
  },

  created: function() {
    var _this = this;
    io.socket.get('/user/current', function (res) {
      _this.id = res.id;
      _this.username = res.username;
      _this.avatar = res.avatar;
    });
  },

  methods: {
    hasAvatar: function(arg) {
      if (arg) return true;
      return false;
    }
  }

});
