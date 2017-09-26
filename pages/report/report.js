// pages/report/report.js
const app = getApp()
const { wc } = app
let { openId } = app
const { data, isSuccess, success } = wc

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: ['发布不恰当内容对我造成了骚扰', '存在欺诈骗钱行为', '此账号可能被盗用了', '存在侵权行为', '发布仿冒品信息'],
    index: 0
  },

  // 确定
  report: function () {
    const that = this
    let data = that.data
    let getData = {
      Action: 'AddReport',
      OpenID: openId,
      ToOpenID: data.toOpenId,
      ReportDesc: data.list[data.index]
    }

    wc.get(getData, (json) => {
      if (json[isSuccess] === success) {
        wc.showModal('举报成功')
      }
    })
  },

  // 选择原因
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    openId = wx.getStorageSync('openId')
    this.data.toOpenId = options.id
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