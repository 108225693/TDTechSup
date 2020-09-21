//问题详情&回复&修改
const app = getApp();
const util = require('../../utils/util.js');

Page({
  data: {
    content: '',
    id: '',
    orgJson: {},
    projectJson: {},
    commentlist: [],
    listdata: '',
    modeltitle: '',
    modelcontent: '',
    modelpic: '',
    pictemp: [],
    piclist: [],
    picids: '',
    closebutton: false,
    replybutton: true,
    replystatus: false,
    editstatus: false,
    self: false,
    pic: [],
    picount: [],
    mechanismArray: [],
    mechanismIndex: 0,
    mechanismValue: '',
    productypeArray: [],
    productypeIndex: 0,
    productypeValue: ''
  },
  onLoad: function(option) {
    this.setData({
      id: option.id
    });
    //问题详情
    app.wxGet(app.path.api + 'faqlist/query/' + this.data.id, (res) => {
      console.log(res)
      let resdata = res.data.data;
      this.setData({
        listdata: resdata[0],
        content: resdata[0]
      });
      if (resdata[0].imageIds != '' && resdata[0].imageIds != undefined) {
        this.setData({
          pictemp: resdata[0].imageIds.split(',')
        });
        this.restore(res);
      }
      app.wxLogin((loginInfo) => {
        let user = true;
        //判断管理员
        for (let i in app.path.authority) {
          if (app.path.authority[i] == loginInfo.openid) {
            user = false;
            break;
          }
        }
        //被关闭的问题
        if (this.data.listdata.status == '3') {
          this.setData({
            closebutton: true,
            replybutton: false
          });
        } else {
          if (user) {
            //普通用户
            this.setData({
              replystatus: false
            });
            //自己发的问题，自己可以修改,删除,关闭
            if (loginInfo.openid.toUpperCase() == app.path.userInfo.login.toUpperCase()) {
              this.setData({
                replybutton: false,
                self: true
              });
            }
          } else {
            //管理员            
          }
        }
      });
      //机构选择下拉数据
      app.wxGet(app.path.api + 'org/query', (res) => {
        let resdata = res.data.data;
        this.setData({
          mechanismArray: resdata,
          mechanismValue: resdata[0].id
        });
        for (let i in resdata) {
          if (resdata[i].id == this.data.content.orgId) {
            this.setData({
              orgJson: {
                'id': resdata[i].id,
                'name': resdata[i].name
              },
              mechanismValue: resdata[i].id,
              mechanismIndex: i
            });
            break;
          }
        }
      });
      //产品类型下拉数据
      app.wxGet(app.path.api + 'project/query', (res) => {
        let resdata = res.data.data;
        this.setData({
          productypeArray: resdata,
          productypeValue: resdata[0].id
        });
        for (let i in resdata) {
          if (resdata[i].id == this.data.content.projectId) {
            this.setData({
              projectJson: {
                'id': resdata[i].id,
                'name': resdata[i].name
              },
              productypeValue: resdata[i].id,
              productypeIndex: i
            });
            break;
          }
        }
      });
    });
    this.loadComment();
  },
  restore: function() {
    if (!this.data.pictemp.length) {
      this.setData({
        piclist: this.data.picids.replace('|||||', '').split('|||||')
      })
    } else {
      app.wxGet(app.path.api + 'image/query/' + this.data.pictemp[0], (res) => {
        this.data.pictemp.splice(0, 1);
        this.setData({
          picids: this.data.picids + '|||||data:image/jpeg;base64,' + res.data.data[0].wxfile
        });
        this.restore();
      });
    }
  },
  loadComment: function() {
    //加载评论内容
    app.wxGet(app.path.api + 'comment/query?faqlistId=' + this.data.id, (res) => {
      if (res.data.data != '') {
        this.setData({
          commentlist: res.data.data
        });
      }
    });
  },
  //点击回复按钮
  reply: function() {
    this.setData({
      replystatus: true,
      replybutton: false
    });
  },
  //提交回复
  replyok: function(e) {
    console.log(e.detail.formId);

    if (e.detail.value.replycontent == '') {
      wx.showToast({
        title: '回复内容不能为空',
        icon: 'none',
        duration: 1000,
        mask: true
      });
    } else {
      app.wxSetting((userInfo) => {
        app.wxLogin((loginInfo) => {
          app.wxPost(app.path.api + 'comment/add', {
            "faqlistId": this.data.id,
            "status": "2",
            "name": userInfo.nickName,
            "id": app.path.userInfo.id,
            "avatar": userInfo.avatarUrl,
            "content": e.detail.value.replycontent
          }, (res) => {
            wx.showToast({
              title: '提交成功',
              icon: 'success',
              duration: 1000,
              mask: true
            });
            wx.redirectTo({
              url: '../content/content?id=' + this.data.id
            });
            this.loadComment();
            this.replycancal();
            //推送已回复给用户
            // this.sendMessage();
          });
        });
      });
    }
  },
  //取消回复
  replycancal: function() {
    this.setData({
      replystatus: false,
      replybutton: true
    });
  },
  sendMessage: function() {
    wx.request({
      url: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=ACCESS_TOKEN',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        'access_token': '', //需要服务端换取凭证
        'touser': 'o3iqu4uGlkCvgBNaIiR_OoF62_FM',
        'template_id': 'PzY0dca51LWucuSb1qNMSVBnTmuUzgrFszO2AkJnFPo',
        'form_id': 'dd165795622e44f4af1a5b38e93841e3'
      },
      success: (res) => {
        console.log(res)
      }
    });
  },
  //点击修改按钮
  faqedit: function() {
    this.setData({
      editstatus: true,
      modeltitle: this.data.content.title,
      modelcontent: this.data.content.content
    });
  },
  //提交修改
  editok: function(e) {
    app.wxPost(app.path.api + 'faqlist/update', {
      'id': this.data.listdata.id,
      "wxid": this.data.listdata.wxid,
      "name": this.data.listdata.name,
      "title": e.detail.value.edittitle,
      "content": e.detail.value.editcontent,
      "avatar": this.data.listdata.avatar,
      "imageIds": this.data.pictemp == '' ? this.data.listdata.imageIds : this.data.pictemp.replace(',', ''),
      "status": this.data.listdata.status,
      "orgId": this.data.mechanismValue,
      "projectId": this.data.productypeValue
    }, () => {
      wx.showToast({
        title: '修改成功',
        icon: 'success',
        duration: 1000,
        mask: true
      });
      wx.redirectTo({
        url: '../content/content?id=' + this.data.id
      });
      this.loadComment();
      this.editcancal();
    });
  },
  //取消修改
  editcancal: function() {
    this.setData({
      editstatus: false,
      self: true
    });
  },
  addpic: function() {
    app.addpic('9', (res) => {
      app.wxLogin((loginInfo) => {
        this.setData({
          picount: res.tempFilePaths
        });
        this.uploadFun(res, loginInfo);
      });
    });
  },
  //上传图片
  uploadFun: function(res, loginInfo) {
    if (!this.data.picount.length) {
      this.setData({
        pic: res.tempFilePaths
      });
    } else {
      wx.uploadFile({
        url: app.path.api + 'image/add',
        filePath: this.data.picount[0],
        name: 'file',
        header: {
          'content-type': 'application/json',
          'authorization': app.path.token
        },
        success: (data) => {
          this.data.picount.splice(0, 1);
          this.setData({
            pictemp: this.data.pictemp + ',' + JSON.parse(data.data).data[0].id
          });
          this.uploadFun(res, loginInfo);
        },
        fail: (err) => {
          console.log(err);
        }
      })
    }
  },
  delpic: function() {
    wx.showModal({
      title: '提示',
      content: '你要删除当前图片吗',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            modelpic: ''
          });
        }
      }
    });
  },
  //点击删除问题按钮
  faqdel: function() {
    wx.hideLoading();
    wx.showModal({
      title: '提示',
      content: '是否删除该条问题？',
      success: (res) => {
        if (res.confirm) {
          //逻辑删除
          app.wxPost(app.path.api + 'faqlist/update', {
            "id": this.data.id,
            "status": "4"
          }, (res) => {
            wx.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 1000,
              mask: true
            });
            wx.redirectTo({
              url: '../list/list'
            });
          });
        }
      }
    })
  },
  //点击关闭问题按钮
  faqclose: function() {
    wx.showModal({
      title: '提示',
      content: '是否关闭该条问题？',
      success: (res) => {
        if (res.confirm) {
          //逻辑删除
          app.wxPost(app.path.api + 'faqlist/update', {
            "id": this.data.id,
            "status": "3"
          }, (res) => {
            wx.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 1000,
              mask: true
            });
            wx.redirectTo({
              url: '../list/list'
            });
          });
        }
      }
    });
  },
  //机构选择
  mechanismChange: function(e) {
    this.setData({
      mechanismValue: this.data.mechanismArray[Number(e.detail.value)].id,
      mechanismIndex: e.detail.value
    });
  },
  //产品类型
  productypeChange: function(e) {
    this.setData({
      productypeValue: this.data.productypeArray[Number(e.detail.value)].id,
      productypeIndex: e.detail.value
    });
  },
})