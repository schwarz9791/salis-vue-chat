app = new Vue({
  el: 'body',

  data: {
    username: '',
    password: '',
    confirm: '',
    has_error: false
  },

  computed: {
    has_error: function() {
      if (this.password == this.confirm && this.password != '') return false
        return true
    }
  }

});
