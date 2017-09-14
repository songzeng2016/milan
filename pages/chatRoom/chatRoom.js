// pages/chatRoom/chatRoom.js
const app = getApp()
const { wc } = app
let { openId } = app
const { data, isSuccess, success } = wc
let chatRoomId

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  // 退出聊天室
  signOutRoom: function (e) {
    let getData = {
      Action: 'SignOutChatroom',
      OpenID: openId,
      ID: e.currentTarget.dataset.id
    }

    wc.get(getData, (json) => {
      if (json[isSuccess] === success) {
        wc.showToast(['退出成功'])
        setTimeout(() => {
          wc.switchTab('/pages/index/index')
        }, 2000)
      }
    }, true)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    openId = wx.getStorageSync('openId')
    let id = options.id
    chatRoomId = id
    const that = this

    let getUserData = {
      Action: 'GetChatroomUsers',
      ID: id
    }
    wc.get(getUserData, (json) => {
      if (json[isSuccess] === success) {
        that.setData({
          userList: json[data]
        })
      }
    })

  },

  getChatRoomInfo: function (id) {
    const that = this
    let getData = {
      Action: 'GetChatroomDetail',
      ID: id
    }

    wc.get(getData, (json) => {
      if (json[isSuccess] === success) {
        that.setData({
          roomInfo: json[data]
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
    this.getChatRoomInfo(chatRoomId)
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
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: this.data.roomInfo.chatroom_name,
      path: '/pages/talk/talk?id=' + this.data.roomInfo.chatroom_id,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})