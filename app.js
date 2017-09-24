//app.js
import wc from '/utils/util.js'

App({
  onLaunch: function () {
    const that = this
    // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
    
    // 登录 获取 openId
    wx.login({
      success: (res) => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        let data = {
          Action: 'GetWeiXinOpenID',
          loginCode: res.code
        }

        that.wc.get(data, (json) => {
          wx.setStorageSync('openId', json.result)
          // that.openId = json.result
        })
      }
    })

    // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              let userInfo = res.userInfo
              let getData = {
                Action: 'CheckUser',
                openid: wx.getStorageSync('openId'),
                nickName: userInfo.nickName,
                avatarUrl: userInfo.avatarUrl,
                gender: userInfo.gender, //性别 0：未知、1：男、2：女
                province: userInfo.province,
                city: userInfo.city,
                country: userInfo.country
              }

              that.wc.get(getData, (json) => {

              })

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
    //     }
    //   }
    // })
  },
  globalData: {
    userInfo: null
  },
  wc: new wc(),
  openId: 1
})