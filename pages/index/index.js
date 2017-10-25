// pages/find/find.js
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

  // 进入聊天室
  navToTalk: function (e) {
    let data = e.currentTarget.dataset
    wc.navigateTo('/pages/talk/talk?id=' + data.id + '&name=' + data.name)
  },

  // 删除聊天室
  deleteChatRoom: function (e) {
    const that = this
    let lists = this.data.lists
    let id = e.currentTarget.dataset.id
    let getData = {
      Action: 'DelUserChatroom',
      OpenID: openId,
      ID: id
    }

    wc.get(getData, (json) => {
      if (json[isSuccess] === success) {
        wc.showToast(['删除成功'])

        that.setData({
          lists: lists.filter((item) => {
            return item.id != id
          })
        })
      }
    }, true)
  },

  // 获取聊天室列表
  getLists: function () {
    const that = this
    let getData = {
      Action: 'GetUserChatroomList',
      OpenId: openId,
      pageSize: 20,
      pageIndex: 1
    }

    wc.get(getData, (json) => {
      if (json[isSuccess] === success) {
        that.setData({
          lists: json[data]
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    openId = wx.getStorageSync('openId')
    // this.getLists()
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
    this.getLists()
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