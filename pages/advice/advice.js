import { auth } from '../../utils/auth';
import { domain } from '../../utils/domain';
import { wk } from '../../utils/wk';
//index.js
//获取应用实例
var app = getApp();
var textLines = [];
var adviceData = [];
var pageNum = 1;
var noData = false;
Page({
  data: {
    userId: 0,
    //data记录发送的内容
    sendTxt: "",
    sendDistance: "0米",
    sendTime: "0分前",
    adviceUserInit: {},
    //记录留言弹窗是否显示
    isPopOpen: false
  },
  //event唤起弹窗
  wakeUpPopFn: function () {
    auth("userInfo", "userLocation",()=>{
      this.setData({ isPopOpen: true });
    })
  },
  //关闭弹窗
  ad_popClose: function () {
    this.setData({
      isPopOpen: false,
      sendTxt: ''
    });
  },
  checkauth: function(){
  },
  //event获得发送的内容
  sendTxtFn: function (e) {
    this.data.sendTxt = e.detail.value;
    // this.setData({ sendTxt: e.detail.value });
    // e.detail.value = "";
  },
  //event点击发送按钮事件
  sendMsgFn: function (e) {

    var content = e.detail.value.content;
    var _this = this;
    _this.setData({
      sendTxt: content
    });
    //设置text参数
    var position = app.globalData.position;
    var userId = wx.getStorageSync('login_key').split("_")[2];
    var latitude = 0;
    var longitude = 0;
    latitude = position.latitude;
    longitude = position.longitude;

    if (!_this.data.adviceUserInit.imgurl) {
      var user_info = wx.getStorageSync("user_info");
      _this.data.adviceUserInit.imgurl = user_info.avatarUrl;
      _this.data.adviceUserInit.name = user_info.nickName;
    }
    _this.addAdvice(_this.data.adviceUserInit.imgurl, _this.data.adviceUserInit.name, userId);
    //设置distance
    //设置 time

  },
  addAdvice: function (nickName, avatarUrl, userId) {
    var _this = this;
    var position = app.globalData.position;
    var latitude = position.latitude;
    var longitude = position.longitude;
    var reg = /[\s]+/;
    if (!_this.data.sendTxt || reg.test(_this.data.sendTxt)) {
      return false;
    }
    wk.post({
      url:   '/advices',
      data: { comment: _this.data.sendTxt, latitude: latitude, longitude: longitude, userId: userId },
      method: 'post',
      success: function (res) {
        if (res.data.status == 1) {
          var newMsg = [];
          //要添加的数据
          var newMsg = [{
            userId: _this.data.userId,
            imgurl: _this.data.adviceUserInit.imgurl,
            name: _this.data.adviceUserInit.name,
            time: _this.data.sendTime,
            distance: _this.data.sendDistance,
            text: _this.data.sendTxt
          }];
          //使用concat()来把两个数组合拼起来
          _this.data.adviceUserMsg = newMsg.concat(_this.data.adviceUserMsg);
          _this.setData({
            adviceUserMsg: _this.data.adviceUserMsg,
            sendTxt: "",
            isPopOpen: false
          });
          console.log(_this.data.adviceUserMsg);
        } else {
          wx.showModal({
            title: '提示',
            content: '留言发布失败!',
            showCancel: false
          });
          return false;
        }
      },
      fail: function () {
        wx.showModal({
          title: '提示',
          content: '留言发布失败!',
          showCancel: false
        });
      }
    });
  },
  onShow: function () {
    var _this = this;
    pageNum = 1;
    noData = false;
    adviceData = [];
    setTimeout(function () { _this.getAdviceList(1) }, 500);
    //    this.getAdviceList(1);
  },
  onLoad: function () {
    var userId = wx.getStorageSync("login_key").split("_")[2] || 0;
    this.setData({ userId: userId });
    var _this = this;
    var userInfo = wx.getStorageSync('user_info');
    _this.setData({
      adviceUserInit: {
        imgurl: userInfo.avatarUrl,
        name: userInfo.nickName
      }
    });
    var position = app.globalData.position;
    var latitude = 0;
    var longitude = 0;
    if (!!position) {
      latitude = position.latitude;
      longitude = position.longitude;
    } else {
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          latitude = res.latitude;
          longitude = res.longitude;
          var position = {};
          position.latitude = res.latitude;
          position.longitude = res.longitude;
          appInstance.globalData.position = position;
          _this.getAdviceList(1);
        },
        fail: function () {
        },
      })
    }
  },
  getAdviceList: function (no) {
    var position = app.globalData.position;
    var _this = this;
    var query = {};
    query.page = no;
    query.pageCount = 10;
    if (!!position.latitude) {
      query.latitude = position.latitude;
    }
    if (!!position.longitude) {
      query.longitude = position.longitude;
    }
    wx.request({
      url: domain + '/advice/advicelist',
      data: query,
      method: 'GET',
      success: function (res) {
        var data = res.data;
        if (data.status == 1) {
          for (var i = 0; i < data.result.length; i++) {
            var item = {};
            item.userId = data.result[i].userId;
            item.imgurl = data.result[i].avatarUrl;
            item.name = data.result[i].nickName;
            item.time = data.result[i].pubTimeStr;
            item.distance = data.result[i].mapDistance;
            item.text = data.result[i].comment;
            adviceData.push(item);
          }
          _this.setData({ adviceUserMsg: adviceData });
        }
      },
      fail: function () {
      }
    })

  },
  onPullDownRefresh: function () {
    if (noData) {
      console.log("no data anymore");
      wx.showToast({
        title: '到底了，亲',
        mask: true,
        icon: 'success',
        duration: 1000
      });
      return false;
    }
    wx.showToast({
      title: '数据加载中',
      mask: true,
      icon: 'loading',
      duration: 1000
    });
    console.log("refresh to get data");
    var _this = this;
    pageNum++;
    var position = app.globalData.position;
    var query = {};
    query.page = pageNum;
    query.pageCount = 10;
    if (!!position.latitude){
      query.latitude = position.latitude;
    }
    if (!!position.longitude) {
      query.longitude = position.longitude;
    }
    wx.request({
      url: domain + '/advice/advicelist',
      data: query,
      method: 'GET',
      success: function (res) {
        var data = res.data;
        if (data.status == 1) {
          if (data.result.length == 0) {
            noData = true;
            return false;
          }
          for (var i = 0; i < data.result.length; i++) {
            var item = {};
            item.userId = data.result[i].userId;
            item.imgurl = data.result[i].avatarUrl;
            item.name = data.result[i].nickName;
            item.time = data.result[i].pubTimeStr;
            item.distance = data.result[i].mapDistance;
            item.text = data.result[i].comment;
            adviceData.push(item);
          }
          wx.hideToast();
          _this.setData({ adviceUserMsg: adviceData });
        }
      },
      fail: function () {
        wx.showToast({
          title: '获取留言列表失败，请稍后重试',
          mask: true,
          icon: 'loading',
          duration: 1000
        });
      }
    });
  }

});