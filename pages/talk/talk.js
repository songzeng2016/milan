// pages/talk/talk.js
const app = getApp()
const { wc } = app
let { openId } = app
const { data, isSuccess, success } = wc

let { talk } = require('../../utils/mock.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    talk
  },

  // 跳转到详情页面
  navToChatRoom: function (e) {
    let data = e.currentTarget.dataset
    wc.navigateTo('/pages/chatRoom/chatRoom?id=' + data.id)
  },

  // 跳转到个人资料页面
  navToPersonage: function (e) {
    let data = e.currentTarget.dataset
    wc.navigateTo('/pages/personage/personage?openId=' + openId)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    openId = wx.getStorageSync('openId')
    const that = this
    let id = options.id

    that.setData({
      id
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})