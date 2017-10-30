// pages/talk/talk.js
const app = getApp()
const { wc } = app
let { openId } = app
const { host, data, isSuccess, success } = wc

let { talk } = require('../../utils/mock.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // talk,
    emoji: true,
    media: true,
    record: true,
    recordMessgae: '按住 录音'
  },

  // 播放视频
  playVideo: function (e) {
    let index = e.currentTarget.dataset.index
    let video = wx.createVideoContext('myVideo' + index)
    video.play()
    video.requestFullScreen()
  },

  // 预览图片
  previewImg: function (e) {
    let src = e.currentTarget.dataset.src
    wx.previewImage({
      urls: [src],
    })
  },

  // 发送文件消息
  uploadFile: function (tempFilePath, fileType) {
    const that = this
    let id = that.data.id

    wx.uploadFile({
      url: host + '?Action=UploadAttachment',
      filePath: tempFilePath,
      name: 'coverUrl',
      success: function (res) {
        var data = JSON.parse(res.data);

        wx.sendSocketMessage({
          data: '2|' + openId + '|' + id + '|' + fileType + '|' + data.result
        })

      },
      fail: function () {
        console.log("上传失败")
      },
      complete: function () {
      }
    })
  },

  // 开始录音
  startRecord: function () {
    const that = this
    let id = that.data.id

    this.setData({
      recordMessgae: '松开 结束'
    })

    wx.startRecord({
      success: function (res) {
        var tempFilePath = res.tempFilePath

        that.uploadFile(tempFilePath, 3)

        // 播放录音
        // wx.playVoice({
        //   filePath: tempFilePath,
        //   complete: function () {
        //   }
        // })

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
    // 目前只支持单个表情选择
    // let data = e.currentTarget.dataset
    // let emojiMessage = this.data.emojiMessage || ''
    // let selectedEmoji = this.data.selectedEmoji || []
    // selectedEmoji.push(data)
    // emojiMessage += data.name

    // this.setData({
    //   selectedEmoji,
    //   emojiMessage
    // })

    const that = this
    let id = that.data.id
    let data = e.currentTarget.dataset

    console.log('2|' + openId + '|' + id + '|5|' + data.name)

    wx.sendSocketMessage({
      data: '2|' + openId + '|' + id + '|5|' + data.name
    })

  },

  // 输入内容
  inputMessgae: function (e) {
    let message = e.detail.value
    // let emojiMessage = this.data.emojiMessage || ''

    // if (!!emojiMessage) {
    //   this.setData({
    //     emojiMessage: ''
    //   })
    //   message = ''
    // }
    this.setData({
      message
    })
  },

  // 选择图片
  choicePicture: function () {
    const that = this
    let id = that.data.id

    wx.chooseImage({
      count: 9,
      success: function (res) {
        let tempFilePaths = res.tempFilePaths

        for (let i in tempFilePaths) {
          that.uploadFile(tempFilePaths[i], 2)
        }

      },
    })
  },

  // 选择视频
  choiceVideo: function () {
    const that = this
    let id = that.data.id

    wx.chooseVideo({
      success: function (res) {
        let tempFilePath = res.tempFilePath

        that.uploadFile(tempFilePath, 4)
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
    const that = this
    var query = wx.createSelectorQuery()
    query.select('.list-wrapper').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      res[0].top       // #the-id节点的上边界坐标
      res[1].scrollTop // 显示区域的竖直滚动位置
      console.log(res)
      // that.setData({
      //   scrollBottom: res[0].top
      // })
      // wx.pageScrollTo({
      //   scrollTop: res[0].top,
      // })
    })

    let emoji = this.data.emoji

    this.setData({
      emoji: !emoji,
      media: true,
      record: true,
      messageFocus: !emoji,
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
    // console.log(data)
    wc.navigateTo('/pages/personage/personage?openId=' + data.id)
  },

  // 发送消息
  sendMessage: function () {
    const that = this
    let id = that.data.id
    let message = that.data.message

    if (!message) return

    wx.sendSocketMessage({
      data: '2|' + openId + '|' + id + '|1|' + message
    })

    // 清空消息盒子
    that.setData({
      message: '',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    openId = wx.getStorageSync('openId')
    const that = this
    let id = options.id
    let roomType = options.type || false
    let roomName = options.name

    // 更新 title
    wx.setNavigationBarTitle({
      title: roomName,
    })

    let emojiList = []

    for (let i = 1; i < 25; i++) {
      i < 10 && (i = '0' + i)
      emojiList.push({
        src: 'smiley_0' + i + '.png'
      })
    }

    that.setData({
      id,
      emojiList,
      roomType,
    })

    // 加入聊天室
    let getData = {
      Action: 'JoinChatroom',
      ID: id,
      OpenID: openId
    }
    wc.get(getData, (json) => { })

    // 建立连接
    wx.connectSocket({
      url: "wss://sp.yangchengtech.com:8200",
    })

    //连接成功
    wx.onSocketOpen(function (res) {
      console.log('WebSocket连接已打开！')

      wx.sendSocketMessage({
        data: '1|' + openId + '|' + id + '|1|name已进入聊天室'
      })

      console.log('S:学生A已链接')

    })

    wx.onSocketError(function (res) {
      console.log('WebSocket连接打开失败，请检查！')
    })

    wx.onSocketMessage(function (res) {
      console.log('收到服务器内容：' + res.data)
      let json = JSON.parse(res.data)
      // console.log('收到服务器内容：' + json)

      that.getMessage(json)

      // wx.closeSocket()
    })
    wx.onSocketClose(function (res) {
      console.log('WebSocket 已关闭！')

      // 建立连接
      wx.connectSocket({
        url: "wss://sp.yangchengtech.com:8200",
      })
    })
  },
  // 处理接收的消息
  getMessage: function (json) {
    const that = this
    let talk = that.data.talk || []

    if (json.openid === openId) {
      json.isMe = true
    }

    talk.push(json)

    that.setData({ talk })
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