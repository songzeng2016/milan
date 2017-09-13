// apply-detail.js
var app = getApp()
var util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coverUrl: '../../images/zhaopian.png',
    coverUrlRes: '',
    videoUrl: '',
    videoUrlRes: '',
    voiceUrl: '',
    voiceUrlRes: '',
    skillDesc: '这家伙很懒，什么都没有留下…',
    userId: '',
    frameAnimation: "../../images/mic_1.png",//帧动画初始图片  
    isSpeaking: false,//是否正在说话
    gameAccount: '',
    link: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
   * 获取视频按钮事件
   */
  getVideoEvent: function () {
    var that = this
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 20,
      camera: ['front', 'back'],
      success: function (res) {
        console.log(res.tempFilePath)
        that.setData({
          videoUrl: res.tempFilePath
        })
        wx.uploadFile({
          url: app.globalData.https_url+"/Handler/Handler.ashx?Action=UploadAttachment",
          filePath: that.data.videoUrl,
          name: "videoUrl",
          success: function (res) {
            var jsonStr = JSON.parse(res.data);
            that.setData({
              videoUrlRes: jsonStr.result
            })
          },
          fail: function () {
            console.log("视频上传失败")
          },
          complete: function () {
          }
        })
      }
    })
  },

  /**
   * 获取技能图片事件
   */
  getCoverUrl: function () {
    var that = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        that.setData({
          coverUrl: res.tempFilePaths[0]
        })
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var filePath = res.tempFilePaths
        wx.uploadFile({
          url: app.globalData.https_url +"/Handler/Handler.ashx?Action=UploadAttachment",
          filePath: that.data.coverUrl,
          name: "coverUrl",
          success: function (res) {
            var jsonStr = JSON.parse(res.data);
            that.setData({
              coverUrlRes: jsonStr.result
            })
          },
          fail: function () {
            console.log ("图片上传失败")
          },
          complete: function () {
          }
        })

        // var tempFilePaths = res.tempFilePaths
      }
    })
  },

  /**
   * 提交申请
   */
  submit: function () {
    var that = this
    var cov = that.data.coverUrlRes
    var vid = that.data.videoUrlRes
    var voi = that.data.voiceUrlRes
    var desc = that.data.skillDesc
    var ga = that.data.gameAccount
    var link = that.data.link
    app.http.request({
      url: app.globalData.https_url + "/Handler/Handler.ashx?Action=AppalyGameUser&openid=" + app.globalData.openid + "&CoverUrl=" + cov + "&VideoUrl=" + vid + "&VoiceUrl=" + voi + "&SkillDesc=" + desc + "&link=" + link + "&GameAccount=" + ga,
      data: {},
      method: 'get',
      success: function (res) {
        console.log(res)
        var respons = res.data
        that.setData({
          playerList: respons.Data
        })
        if (respons.IsSuccess == "true") {
          
            wx.showToast({
              title: '提交申请成功'
            })
         
    setTimeout(function () {
          wx.navigateBack({
            delta: 1
          })
    }, 2000)
        }
      }
    })
  },

  touchdown: function () {
    var that = this
    console.log("手指按下了")
    that.speaking();
    //开始录音  
    wx.startRecord({
      success: function (res) {
        //临时路径,下次进入小程序时无法正常使用  
        var tempFilePath = res.tempFilePath
        console.log("tempFilePath: " + tempFilePath)
        wx.uploadFile({
          url: app.globalData.https_url +"/Handler/Handler.ashx?Action=UploadAttachment",
          filePath: tempFilePath,
          name: "voiceUrl",
          success: function (res) {
            var jsonStr = JSON.parse(res.data);
            if (jsonStr.IsSuccess == "true") {
              console.log(jsonStr)
              that.setData({
                //voiceUrlRes: jsonStr.result
                voiceUrlRes: tempFilePath
              })
              wx.showToast({
                title: '录音已上传',
              })
            }
          },
          fail: function () {
            console.log("录音失败上传失败")
          },
          complete: function () {
          }
        })
      }
    })
  },

  gameAccountInput: function (e) {
    this.setData({
      gameAccount: e.detail.value
    })
    console.log(this.data.gameAccount)
  },

  linkInput: function (e) {
    this.setData({
      link: e.detail.value
    })
    console.log(this.data.link)
  },

  //手指抬起  
  touchup: function () {
    console.log("手指抬起了...")
    clearInterval(this.timer)
    this.setData({
      frameAnimation: "../../images/mic_1.png"
    })
    wx.stopRecord()
  },

  //麦克风帧动画  
  speaking: function () {  
    var that = this;  
    //话筒帧动画  
    var i = 2;  
    this.timer = setInterval(function () {
      i++;
      i = i % 3;
      that.setData({
        frameAnimation: "../../images/mic_" + i + ".png"
      })
    }, 200);  
  } 
})