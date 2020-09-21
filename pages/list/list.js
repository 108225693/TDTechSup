//问题列表
const app = getApp();

Page({
  data: {
    faqlist: [],
    orgJson: [],
    projectJson: [],
    content: '',
    faqadmin: false,
    faqbutton: false,
    tempdata: false
  },
  onShow: function () {
    wx.showLoading({
      title: '加载中'
    });
    this.setData({
      faqlist: [],
      orgJson: [],
      projectJson: [],
      content: '',
      faqadmin: false,
      faqbutton: false
    });
    this.validate();
  },
  validate: function () {
    app.wxSetting((userInfo) => {
      wx.request({
        url: app.path.api + 'sys/login',
        method: 'POST',
        data: {
          "password": "tddx123456",
          "login": app.path.openid
        },
        header: {
          'content-type': 'application/json'
        },
        success: (res) => {
          if (!res.data.code) {
            app.path.userInfo = res.data.data[0];
            this.setAuthorization(res.header.Authorization);
            //管理员名单
            app.admin(() => {
              this.list();
            });
            this.setData({
              faqbutton: true
            });
          } else {
            this.register(userInfo, app.path.openid, (res) => {
              if (!res.data.code) {
                wx.showToast({
                  title: '注册成功！',
                  icon: 'success',
                  duration: 1000,
                  mask: true
                });
              } else {
                wx.showToast({
                  title: '注册失败！请刷新', 
                  icon: 'none',
                  duration: 1000,
                  mask: true
                });
              }
            });
          }
        },
        fail: (err) => {
          //接口服务未开启！
          wx.showToast({
            title: '接口服务未开启，请联系管理员',
            icon: 'none',
            duration: 2000,
            mask: true
          });
          wx.redirectTo({
            url: '../index/index'
          })
        }
      });
    });
  },
  list: function () {
    //管理员看到所有问题,个人只能看到自己的问题
    let listurl = '';
    for (let i in app.path.authority) {
      if (app.path.authority[i] == app.path.openid) {
        listurl = app.path.api + 'faqlist/query';
        this.setData({
          faqadmin: true
        });
        break;
      } else {
        listurl = app.path.api + 'faqlist/query?wxid=' + app.path.userInfo.id;
      }
    }
    //加载列表
    app.wxGet(listurl, (res) => {
      let resdata = res.data.data,
        nostatus = 0;
      if (resdata != '') {
        this.setData({
          tempdata: false,
          faqlist: resdata
        });
      } else {
        this.setData({
          tempdata: true
        });
      }
      //若列表中的问题都为删除状态，就显示暂无问题
      for (let i in resdata) {
        if (resdata[i].status == '4') {
          nostatus = nostatus + 1;
        }
      }
      if (nostatus == resdata.length) {
        this.setData({
          tempdata: true
        });
      }
      wx.hideLoading();
      this.typetext(resdata);
    });
  },
  typetext: function (resdata) {
    //机构选择下拉数据
    app.wxGet(app.path.api + 'org/query', (res) => {
      for (let i in resdata) {
        for (let j in res.data.data) {
          if (resdata[i].orgId == res.data.data[j].id) {
            this.setData({
              orgJson: this.data.orgJson.concat({
                id: res.data.data[j].id,
                name: res.data.data[j].name
              })
            })
            break;
          }
        }
      }
    });
    //产品类型下拉数据
    app.wxGet(app.path.api + 'project/query', (res) => {
      for (let i in resdata) {
        for (let j in res.data.data) {
          if (resdata[i].projectId == res.data.data[j].id) {
            this.setData({
              projectJson: this.data.projectJson.concat({
                id: res.data.data[j].id,
                name: res.data.data[j].name
              })
            })
            break;
          }
        }
      }
    });
  },
  register: function (userInfo, openid, callback) {
    wx.request({
      url: app.path.api + 'sys/register',
      method: 'POST',
      data: {
        "email": userInfo.nickName + "@tddx.com",
        "login": openid,
        "password": "tddx123456"
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        if (callback) {
          callback(res)
        }
      },
      fail: (err) => {
        console.log(err)
      }
    })
  },
  link: function () {
    wx.navigateTo({
      url: '../release/release'
    });
  },
  content: function (e) {
    wx.navigateTo({
      url: '../content/content?id=' + e.currentTarget.dataset.id
    });
  },
  //登录token
  setAuthorization: function (token) {
    wx.setStorage({
      key: "authorization",
      data: token
    });
    app.path.token = token;
  }
})