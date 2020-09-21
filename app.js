//faqlist.status: 1.未回复; 2.已回复; 3.已关闭; 4.假删除
App({
  path: {
    api: 'https://www.tiedate.ltd:18889/weixin/',
    appid: 'wx0c3589bd6809e46e',
    secret: '',
    token: '',
    wxLoginStatus: true,
    wxLoginData: '',
    wxSettingStatus: true,
    wxSettingData: '',
    userInfo: '',
    openid: '',
    authority: []
  },
  onLaunch: function() {
    // 登录
    this.wxLogin((loginInfo) => {
      // console.log(loginInfo)
    });
    // 获取用户信息
    this.wxSetting((userInfo) => {
      // console.log(userInfo)
    });
  },
  // 登录
  wxLogin: function(callback) {
    if (this.path.wxLoginStatus) {
      wx.login({
        success: res => {
          wx.request({
            url: this.path.api + 'nologin/webchat?appid=' + this.path.appid + '&secret=' + this.path.secret + '&js_code=' + res.code + '&grant_type=authorization_code',
            method: 'GET',
            header: {
              'content-type': 'application/json'
            },
            success: (res) => {
              //防止重复请求
              this.path.wxLoginStatus = false;
              this.path.wxLoginData = res.data;
              this.path.openid = res.data.openid;
              if (callback) {
                callback(res.data);
              }
            }
          });
        }
      })
    } else {
      if (callback) {
        callback(this.path.wxLoginData);
      }
    }
  },  
  // 微信登录
  wxLoginBack: function(callback) {
    this.wxLogin((loginInfo) => {
      if (callback) {
        callback(loginInfo);
      }
    });
  },
  // 获取用户信息
  wxSetting: function(callback) {
    if (this.path.wxSettingStatus) {
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: res => {
                //防止重复请求
                this.path.wxSettingStatus = false;
                this.path.wxSettingData = res.userInfo;
                if (callback) {
                  callback(res.userInfo);
                }
              }
            })
          }
        }
      })
    } else {
      if (callback) {
        callback(this.path.wxSettingData);
      }
    }
  },
  admin: function (callback) {
    //管理员名单
    wx.request({
      url: this.path.api + 'nologin/wxid',
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        this.path.authority = res.data.replace('[', '').replace(']', '').replace(/\'/g, '').split(',');
        if (callback) {
          callback();
        }
      }
    });
  },
  wxGet: function(url, callback) {
    wx.getStorage({
      key: 'authorization',
      success(token) {
        wx.request({
          url: url,
          method: 'GET',
          header: {
            'content-type': 'application/json',
            'authorization': token.data
          },
          success: (res) => {
            if (callback) {
              callback(res);
            }
          }
        })
      },
      fail: (err) => {
        wx.request({
          url: url,
          method: 'GET',
          header: {
            'content-type': 'application/json'
          },
          success: (res) => {
            if (callback) {
              callback(res);
            }
          }
        })
      }
    })
  },
  wxPost: function(url, data, callback, errback) {
    wx.getStorage({
      key: 'authorization',
      success(token) {
        wx.request({
          url: url,
          method: 'POST',
          data: data,
          header: {
            'content-type': 'application/json',
            'authorization': token.data
          },
          success: (res) => {
            if (callback) {
              callback(res);
            }
          },
          fail: (err) => {
            errback(err);
          }
        })
      }
    })
  },
  addpic: function(num, callback) {
    wx.chooseImage({
      count: num, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: (res) => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        if (callback) {
          callback(res)
        }
      }
    })
  },
  formatTime: function(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()

    var time = [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
    return time;
  }
})
