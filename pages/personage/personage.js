// pages/personage/personage.js
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

  // 跳转到聊天页面
  navToTalk: function (e) {
    const that = this

    wx.getLocation({
      success: function(res) {
        let latitude = res.latitude
        let longitude = res.longitude

        let data = {
          Action: 'AddChatroom',
          OpenID: openId,
          chatroom_name: that.data.userInfo.nickname + '和我的聊天室',
          chatroom_latitude: latitude,
          chatroom_longitude: longitude,
          chatroom_type: 1
        }

        wc.get(data, (json) => {
          if (json[isSuccess] === success) {
            wc.navigateTo('/pages/talk/talk?id=' + json.result + '&type=1')
          }
        })

      },
    })

  },

  // 跳转到举报页面
  navToReport: function (e) {
    wc.navigateTo('/pages/report/report?id=' + this.data.userInfo.openid)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    openId = wx.getStorageSync('openId')
    const that = this
    let userId = options.openId

    let getData = {
      Action: 'GetUsersDetail',
      OpenID: userId
    }

    wc.get(getData, (json) => {
      if (json[isSuccess] === success) {
        that.setData({
          userInfo: json[data]
        })
      }
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