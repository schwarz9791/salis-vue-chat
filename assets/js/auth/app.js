app = new Vue({
  el: 'body',

  data: {
    username: '',
    password: '',
    confirm: '',
    hasError: false
  },

  computed: {
    hasError: function() {
      if (this.password == this.confirm && this.password != '') return false
        return true
    }
  }

});
