if ($('#account').length) {
  var account = new Vue({
    el: '#account',

    data: {
      id: '',
      username: '',
      avatar: '',
      has_error: false,
      flash: []
    },

    computed: {
      has_error: function() {
        if (typeof this.new_password === 'undefined') {
          if (this.password == this.confirm && this.password != '') return false;
          return true;
        } else {
          if (this.password != '') return false;
          return true;
        }
      },
      has_confirm_error: function() {
        if (typeof this.new_password !== 'undefined') {
          if (this.new_password == this.confirm && this.new_password != '') return false;
          return true;
        } else {
          if (this.password == this.confirm && this.password != '') return false;
          return true;
        }
      },
      has_avatar: function() {
        if (this.avatar) return true;
        return false;
      }
    },

    created: function() {
      var _this = this;
      io.socket.get('/user/current', function (res, JWR) {
        _this.id = res.id;
        _this.username = res.username;
        _this.avatar = res.avatar;
      });
    },

    methods: {
      create: function(e) {
        e.preventDefault();

        var fd = new FormData();

        if (typeof avatarFile.files[0] !== 'undefined') {
          var base64 = avatar.src;
          // Base64からバイナリへ変換
          var bin = atob(base64.replace(/^.*,/, ''));
          var buffer = new Uint8Array(bin.length);
          for (var i = 0; i < bin.length; i++) {
            buffer[i] = bin.charCodeAt(i);
          }
          // Blobを作成
          var blob = new Blob([buffer.buffer], { type: 'image/png' });
          fd.append('avatar', blob, 'avatar.png');
        }

        // フォームのavatar以外全ての入力値をFormDataに追加
        var formArray = $(e.target).serializeArray();
        $.each(formArray, function(i, field) {
          fd.append(field['name'], field['value']);
        });

        // サーバに POST /user/create としてリクエストする
        // io.socket 経由だとFormDataを送れないため、xhrで
        var xhr = new XMLHttpRequest();
        var _this = this;
        xhr.open('POST', '/user/create');
        xhr.onload = function(evt) {
          if (xhr.status == 200) {
            _this.flash.push({ notice: JSON.parse(xhr.response).flash, status: 'alert-success' });
            setTimeout(function(){
              window.location = '/chat';
            }, 500);
          } else {
            _this.flash.push({ notice: JSON.parse(xhr.response).error, status: 'alert-danger' });
            console.error(JSON.parse(xhr.response).error);
          }
        };
        xhr.send(fd);
        // io.socket.post('/user/create', fd , function (res) {
        //   if (res.error) return console.error(res.error);
        // });
        // io.socket.request({
        //   url: '/user/create',
        //   method: 'post',
        //   params: fd,
        //   headers: { 'Content-type': 'multipart/form-data' }
        // }, function (res) {
        //   if (res.error) return console.error(res.error);
        // });
      },

      update: function(e) {
        e.preventDefault();

        var fd = new FormData();
        
        // フォームのavatar以外全ての入力値をFormDataに追加
        var formArray = $(e.target).serializeArray();
        $.each(formArray, function(i, field) {
          fd.append(field['name'], field['value']);
        });

        if (typeof avatarFile.files[0] !== 'undefined') {
          var base64 = avatar.src;
          // Base64からバイナリへ変換
          var bin = atob(base64.replace(/^.*,/, ''));
          var buffer = new Uint8Array(bin.length);
          for (var i = 0; i < bin.length; i++) {
            buffer[i] = bin.charCodeAt(i);
          }
          // Blobを作成
          var blob = new Blob([buffer.buffer], { type: 'image/png' });
          fd.append('avatar', blob, 'avatar.png');
        }

        // サーバに POST /user/update としてリクエストする
        // io.socket 経由だとFormDataを送れないため、xhrで
        var xhr = new XMLHttpRequest();
        var _this = this;
        xhr.open('POST', '/user/update/' + this.id);
        xhr.onload = function(evt) {
          if (xhr.status == 200) {
            _this.flash.push({ notice: JSON.parse(xhr.response).flash, status: 'alert-success' });
          } else {
            _this.flash.push({ notice: JSON.parse(xhr.response).error, status: 'alert-danger' });
            console.error(JSON.parse(xhr.response).error);
          }
        };
        xhr.send(fd);
        // io.socket.post('/user/update/' + this.id, fd, function (res) {
        //   if (res.error) return console.error(res.error);
        // });
        // io.socket.request({
        //   url: '/user/update/' + this.id,
        //   method: 'post',
        //   params: fd,
        //   headers: { 'Content-type': 'multipart/form-data' }
        // }, function (res) {
        //   if (res.error) return console.error(res.error);
        // });
      },

      setAvatar: function(e) {
        var file = e.target.files[0];
        
        if (!file.type.match(/^image\/(png|jpeg|gif)$/)) return;
        avatar.classList.add('hidden');
        loadingIcon.classList.remove('hidden');

        var img = new Image();
        var fr = new FileReader();
        var ctx = tmpCanvas.getContext('2d');
        ctx.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);
        // File APIを使用し、ローカルファイルを読み込む
        fr.onload = function(evt) {
          // 画像がloadされた後に、canvasに描画する
          img.onload = function() {
            var max = 200;
            if (img.width > max && img.height > max) {
              var orig_w = img.width;
              var orig_h = img.height;
              var long_side = (orig_w >= orig_h) ? orig_w : orig_h;
              if (long_side < max) {
                w = orig_w;
                h = orig_h;
              } else {
                w = parseInt(parseFloat(max) / long_side * orig_w);
                h = parseInt(parseFloat(max) / long_side * orig_h);
              }
              var l = 0, t = 0;
              if (w < max) l = parseInt((max - w) / 2);
              if (h < max) t = parseInt((max - h) / 2);
            } else {
              var l = 0, t = 0, w = max, h = max;
            }
            setTimeout(function() {
              ctx.drawImage(img, l, t, w, h);
              avatar.src = ctx.canvas.toDataURL('image/png');
              loadingIcon.classList.add('hidden');
              avatar.classList.remove('hidden');
            }, 0);
          }
          // 画像のURLをソースに設定
          img.src = evt.target.result;
        }
        // ファイルを読み込み、データをBase64でエンコードされたデータURLにして返す
        fr.readAsDataURL(file);
      },

      alertDismiss: function(notice) {
        // console.log(notice);
        this.flash.splice(notice.$index, 1)[0];
      }
    }

  });
}
