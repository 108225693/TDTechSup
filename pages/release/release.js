//发布问题
const app = getApp();
const util = require('../../utils/util.js');

Page({
  data: {
    faqtitle: '',
    faqcontent: '',
    pic: [],
    picid: '',
    pictemp: '',
    picount: [],
    dissubmit: false,
    mechanismArray: [],
    mechanismIndex: 0,
    mechanismValue: '',
    productypeArray: [],
    productypeIndex: 0,
    productypeValue: ''
  },
  onLoad: function() {
    //机构选择下拉数据
    app.wxGet(app.path.api + 'org/query', (res) => {
      this.setData({
        mechanismArray: res.data.data,
        mechanismValue: res.data.data[0].id
      })
    });
    //产品类型下拉数据
    app.wxGet(app.path.api + 'project/query', (res) => {
      this.setData({
        productypeArray: res.data.data,
        productypeValue: res.data.data[0].id
      })
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
  //选择图片
  addpiclist: function() {
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
        pic: res.tempFiles
      });
      console.log(res)
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
          console.log( JSON.parse(data.data))
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
  faqPost: function(e) {
    this.setData({
      dissubmit: true,
    });
    if (e.detail.value.title == '') {
      wx.showToast({
        title: '标题不能为空',
        icon: 'none',
        duration: 1000,
        mask: true
      });
      this.setData({
        dissubmit: false,
      });
      return false;
    }
    this.setData({
      pictemp: this.data.pictemp.replace(',', '')
    });
    app.wxSetting((userInfo) => {
      wx.request({
        url: app.path.api + 'faqlist/add',
        method: 'POST',
        data: {
          "name": userInfo.nickName,
          "title": e.detail.value.title,
          "content": e.detail.value.content,
          "avatar": userInfo.avatarUrl,
          "imageIds": this.data.pictemp,
          "orgId": this.data.mechanismValue,
          "projectId": this.data.productypeValue
        },
        header: {
          'content-type': 'application/json',
          'authorization': app.path.token
        },
        success: (res) => {
          if (!res.data.code) {
            wx.showToast({
              title: '提交成功',
              icon: 'success',
              duration: 1000,
              mask: true
            });
            setTimeout(() => {
              wx.navigateTo({
                url: '../list/list'
              });
            }, 1000);
          }else{
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 1000,
              mask: true
            });
          }
        }
      })
    });
  },
  //删除图片，暂时不用
  delpic: function() {
    wx.showModal({
      title: '提示',
      content: '你要删除当前图片吗',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            pic: ''
          });
        }
      }
    })
  }
})