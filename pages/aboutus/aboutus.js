// pages/aboutus/aboutus.js
Page({
  data:{
    telephone: '010-64429077-7778',
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },
  callus(e){
    var that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.telephone.slice(0, 12)
    })
  }
})