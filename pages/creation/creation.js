// creation.js
const app = getApp()
const { wc, openId } = app
const { data, isSuccess, success } = wc

Page({

  /**
   * 页面的初始数据
   */
  data: {

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
    let data = wc.extend(that.data, {
      Action: 'AddChatroom',
      OpenID: openId
    })

    wc.get(data, (json) => {
      if (json[isSuccess] === success) {
        wc.showToast(['创建成功'])
      }
    }, true)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this
    // 获取 GPS 位置
    wx.getLocation({
      success: function (res) {
        that.setData({
          chatroom_latitude: res.latitude,
          chatroom_longitude: res.longitude
        })
      },
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