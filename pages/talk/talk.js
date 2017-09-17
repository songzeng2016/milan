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
    talk,
    emoji: true,
    media: true,
    record: true,
    recordMessgae: '按住 录音'
  },

  // 开始录音
  startRecord: function () {
    this.setData({
      recordMessgae: '松开 结束'
    })

    wx.startRecord({
      success: function (res) {
        var tempFilePath = res.tempFilePath

        // 播放录音
        wx.playVoice({
          filePath: tempFilePath,
          complete: function () {
          }
        })
      }
    })
  },
  // 停止录音
  stopRecord: function () {
    wx.stopRecord()
    this.setData({
      recordMessgae: '按住 录音'
    })
  },

  // 选择表情
  choiceEmoji: function (e) {
    let data = e.currentTarget.dataset
    let message = this.data.message || ''
    let selectedEmoji = this.data.selectedEmoji || []
    selectedEmoji.push(data)
    message += data.name

    this.setData({
      selectedEmoji,
      message
    })
  },

  // 输入内容
  inputMessgae: function (e) {
    // let message = e.detail.value
    // this.setData({
    //   message
    // })
  },

  // 选择图片
  choicePicture: function () {
    wx.chooseImage({
      count: 1,
      success: function (res) {

      },
    })
  },

  // 选择视频
  choiceVideo: function () {
    wx.chooseVideo({
      success: function (res) {

      }
    })
  },

  // 录音
  showRecord: function () {
    let record = this.data.record

    this.setData({
      record: !record,
      emoji: true,
      media: true,
      messageFocus: !record
    })
  },

  // 展示表情
  showEmoji: function () {
    let emoji = this.data.emoji

    this.setData({
      emoji: !emoji,
      media: true,
      record: true,
      messageFocus: !emoji
    })
  },

  // 选择多媒体
  showMedia: function () {
    this.setData({
      emoji: true,
      media: false,
      record: true,
    })
  },

  // 关闭选择
  closeChoice: function () {
    this.setData({
      emoji: true,
      media: true
    })
  },

  // @ 某人
  atMessage: function (e) {
    let data = e.currentTarget.dataset

    this.setData({
      message: '@' + data.name,
      messageFocus: true
    })
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

    let emojiList = []

    for (let i = 1; i < 25; i++) {
      i < 10 && (i = '0' + i)
      emojiList.push({
        src: 'smiley_0' + i + '.png'
      })
    }

    that.setData({
      id,
      emojiList
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