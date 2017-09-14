//index.js
const app = getApp()
const { wc } = app
let { openId } = app
const { data, isSuccess, success } = wc

Page({
  data: {

  },

  // 跳转到个人设置页面
  navToPersonalSetting: function (e) {
    let id = e.currentTarget.dataset.id
    wc.navigateTo('/pages/personalSetting/personalSetting?id=' + id)
  },

  onLoad: function () {
    openId = wx.getStorageSync('openId')
  },
  onShow: function () {
    const that = this
    let getData = {
      Action: 'GetUsersDetail',
      OpenID: openId
    }

    wc.get(getData, (json) => {
      if (json[isSuccess] === success) {
        that.setData({
          userInfo: json[data]
        })
      }
    })
  },
})
