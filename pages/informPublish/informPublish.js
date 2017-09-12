// pages/informPublish/informPublish.js
import { domain } from '../../utils/domain';
import { auth } from '../../utils/auth';
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    commentTxtCount: 1000,
    titleTxt: 24,
    signTxt: 16,
    inputValue: "",
    isToEnd:false,
    titValue:"",
    subValue:"",
  },

  //通知标题字数控制
  titleTxtFn: function (e) {
    var _len = 24 - (e.detail.value).length;
    if (_len <= 5) {
      this.setData({
        titleTips: true
      });
    } else {
      this.setData({
        titleTips: false
      });
    }
    this.setData({
      titleTxt: _len
    });
  },

  //通知内容字数控制
  commentTxtFn: function (e) {
    var _len = 1000 - (e.detail.value).length;
    if (_len <= 10) {
      this.setData({
        commentTips: true
      });
    } else {
      this.setData({
        commentTips: false
      });
    }
    this.setData({
      commentTxtCount: _len
    });
  },
  //署名字数控制
  signTxtFn: function (e) {
    var _len = 16 - (e.detail.value).length;
    if (_len <= 5) {
      this.setData({
        sigmTips: true
      });
    } else {
      this.setData({
        sigmTips: false
      });
    }
    this.setData({
      signTxt: _len
    });
  },
  // 清空内容
  doReset: function (e) {
    var date = ""
    this.setData({
      inputValue: ""
    })
  },
  //下拉返回
  onPullDownRefresh: function () {
    console.log(123);
    wx.stopPullDownRefresh()
    console.log(456);
  },

  
  //确认发布
  formSubmit: function (e) {
    
    auth("userInfo",()=>{
      var _this = this;
      var formId = e.detail.formId;
      var titValue = e.detail.value.input
      var subValue = e.detail.value.textarea
      var signValue = e.detail.value.inputs
      if (titValue == null || titValue == "") {
        this.setData(
          { popErrorMsg: "标题不能为空" }
        );
        this.ohShitfadeOut();
        return false;
      } else if (subValue == null || subValue == "") {
        this.setData(
          { popErrorMsg: "通知内容不能为空" }
        );
        this.ohShitfadeOut();
        return false;
      } else if (signValue == null || signValue == "") {
        this.setData(
          { popErrorMsg: "署名不能为空" }
        );
        this.ohShitfadeOut();
        return false;
      } else {
        var userId = wx.getStorageSync('login_key').split("_")[2];
        var formData = {
          title: titValue,
          content: subValue,
          signer: signValue,
          userId: userId,
          formId: formId,
        }
        wx.request({
          url: domain + '/inform/save',
          data: formData,
          success: function (res) {
            _this.setData({
              commentTxtCount: 1000,
              titleTxt: 24,
              signTxt: 16,
              inputValue: "",
              titValue: "",
              subValue: "",
              inputValue: wx.getStorageSync('user_info').nickName
            });
            wx.showToast({
              title: '发布成功',
              icon: 'success',
              image: '../../image/icon_ok.png',
              mask: true,
              duration: 1000
            });
            wx.navigateTo({
              url: '../informDetail/informDetail?informId=' + res.data.informId
            })

          },
          fail: function (res) {
            wx.showToast({
              title: '发布失败',
              icon: 'loading',
              image: '../../image/icon_fail.png',
              mask: true,
              duration: 1000
            });
          }
        })
      }
    })



  },

  ohShitfadeOut() {
    var fadeOutTimeout = setTimeout(() => {
      this.setData({ popErrorMsg: '' });
      clearTimeout(fadeOutTimeout);
    }, 3000);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ isToEnd: getCurrentPages().length >= 5 ? true : false });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({ inputValue: wx.getStorageSync('user_info').nickName });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    

  },



  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },


})