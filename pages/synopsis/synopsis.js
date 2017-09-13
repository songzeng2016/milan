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

  // 输入内容
  commentTxtFn: function (e) {
    this.setData({
      commentText: e.detail.value
    })
  },

  // 发布简介
  issueIntroduce: function () {
    const that = this
    let updateId = this.data.updateId // 获取 updateId   
    if (!that.data.commentText) {
      wc.showModal('名称不能为空')
      return
    }

    let data = {
      Action: 'UpdateChatroomDesc',
      ID: updateId,
      chatroom_desc: that.data.commentText
    }

    wc.get(data, (json) => {
      if (json[isSuccess] === success) {
        wc.showToast(['发布成功'])
        setTimeout(() => {
          wc.navigateBack()
        }, 2000)
      }
    }, true)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let updateId = options.id;
    this.data.updateId = updateId  // 设置在page里都可以进行调用  
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