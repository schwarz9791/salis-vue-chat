if ($('#account').length) {
  var account = new Vue({
    el: '#account',

    data: {
      id: '',
      username: '',
      avatar: '',
      has_error: false,
      flash: [],
      upload_progress: 0
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
      // create: function(e) {
      //   e.preventDefault();

      //   var _this = this;

      //   io.socket.post('/user/create', {
      //     _csrf: this.csrf,
      //     username: this.username,
      //     password: this.password
      //   }, function (res) {
      //     if (res.error) return _this.flash.push({ notice: res.error, status: 'alert-danger' });
      //   });
      // },

      update: function(e) {
        e.preventDefault();

        var _this = this;

        io.socket.post('/user/update/' + this.id, {
          _csrf: this.csrf,
          username: this.username,
          password: this.password,
          new_password: this.new_password
        }, function (res) {
          if (res.error) return _this.flash.push({ notice: res.error, status: 'alert-danger' });
          if (res) _this.flash.push({ notice: res.flash, status: 'alert-success' });
        });
      },

      updateAvatar: function(e) {
        var file = e.target.files[0];
        var _this = this;
        
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

              avatar.onload = function() {
                var base64 = avatar.src;
                // Base64からバイナリへ変換
                var bin = atob(base64.replace(/^.*,/, ''));
                var buffer = new Uint8Array(bin.length);
                for (var i = 0; i < bin.length; i++) {
                    buffer[i] = bin.charCodeAt(i);
                }
                // Blobを作成
                var blob = new Blob([buffer.buffer], { type: 'image/png' });

                // FormData生成
                // var fd = new FormData();
                // fd.append('_csrf', _this.csrf);
                // fd.append('avatar', blob, 'avatar.png');

                // var status_elem = document.getElementById("status");
                // var url_elem = document.getElementById("avatar_url");
                // var preview_elem = document.getElementById("avatar");
                var s3upload = new S3Upload({
                    blob: blob,
                    s3_sign_put_url: '/sign_s3',
                    onProgress: function(percent, message) {
                      // status_elem.innerHTML = 'Upload progress: ' + percent + '% ' + message;
                      _this.upload_progress = percent;
                    },
                    onFinishS3Put: function(public_url, fd) {
                      setTimeout(function() { _this.upload_progress = 0; }, 1000);
                      
                      // status_elem.innerHTML = 'Upload completed. Uploaded to: '+ public_url;
                      // url_elem.value = public_url;
                      // preview_elem.innerHTML = '<img src="'+public_url+'" style="width:300px;" />';
                      io.socket.post('/user/set_avatar/' + _this.id, {
                        _csrf: _this.csrf,
                        avatar: fd
                      }, function (res) {
                        if (res.status === 'error' ) return _this.flash.push({ notice: res.flash, status: 'alert-danger' });
                        _this.flash.push({ notice: res.flash, status: 'alert-success' });
                      });
                    },
                    onError: function(status) {
                      // status_elem.innerHTML = 'Upload error: ' + status;
                      _this.flash.push({ notice: 'Upload error: ' + status, status: 'alert-danger' });
                    }
                });

                // xhrでFormDataを送信
                // var xhr = new XMLHttpRequest();
                // xhr.open('POST', '/user/set_avatar/' + _this.id, true);
                // xhr.withCredentials = true;
                // xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
                // xhr.onload = function(evt) {
                //   if (xhr.status == 200) {
                //     if (xhr.responseJSON) _this.flash.push({ notice: xhr.responseJSON.flash, status: 'alert-success' });
                //   } else {
                //     _this.flash.push({ notice: xhr.responseJSON ? xhr.responseJSON.error : xhr.statusText, status: 'alert-danger' });
                //   }
                // };
                // xhr.send(fd);
              }
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
