// creation.js
const app = getApp()
const { wc } = app
let { openId } = app
const { data, isSuccess, success } = wc

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  // 选择位置
  openLocation: function () {
    const that = this
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          location: res
        })
      },
    })
  },

  // 输入聊天室名称
  inputName: function (e) {
    this.setData({
      chatroom_name: e.detail.value
    })
  },

  // 创建聊天室
  addChatRoom: function () {
    const that = this

    if (!that.data.chatroom_name) {
      wc.showModal('名称不能为空')
      return
    }
    if (!that.data.location) {
      wc.showModal('位置不能为空')
      return
    }

    let data = wc.extend(that.data, {
      Action: 'AddChatroom',
      OpenID: openId,
      chatroom_name: that.data.chatroom_name,
      chatroom_latitude: that.data.location.latitude,
      chatroom_longitude: that.data.location.longitude
    })

    wc.get(data, (json) => {
      if (json[isSuccess] === success) {
        wc.showToast(['创建成功'])
        setTimeout(() => {
          wc.navigateBack()
        }, 2000)
      }
    }, true)
  },

  // 取消
  navigateBack: function () {
    wc.navigateBack()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    openId = wx.getStorageSync('openId')
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