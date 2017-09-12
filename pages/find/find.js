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
    lists: [
      { id: "001", imgurl: "../../image/1.jpg", state: 1, name: '土耳其咖啡馆', msg: '宁娟：@张小炽 羡慕羡慕', num: "100", time: '23:15' },
      { id: "002", imgurl: "../../image/1.jpg", state: 2, name: '一季花开、一季花落', msg: '的思维习惯和行为习惯，从而在自相矛盾的大道理中无法前行。', num: "160", time: '23:15' },
      { id: "003", imgurl: "../../image/1.jpg", state: 1, name: '一季花开、一季花落', msg: '爱尔兰雪、土耳其蓝、莫斯科眼泪。我都收藏在小小的太阳里、还有晴天和微笑。', num: '66', time: '23:15' },
      { id: "004", imgurl: "../../image/1.jpg", state: 1, name: '一季花开、一季花落', msg: '的思维习惯和行为习惯，从而在自相矛盾的大道理中无法前行。', num: "170", time: '23:15' },
      { id: "005", imgurl: "../../image/1.jpg", state: 2, name: '一季花开、一季花落', msg: '爱你、给你我生命所有的美好、然后退场、让万花筒灿烂你的眼瞳。', num: "180", time: '23:15' },
      { id: "006", imgurl: "../../image/1.jpg", state: 1, name: '一季花开、一季花落', msg: '的思维习惯和行为习惯，从而在自相矛盾的大道理中无法前行。', num: "100", time: '23:15' }
    ],
  },

  // 获取聊天室列表
  getLists: function () {
    const that = this
    let getData = {
      Action: 'GetChatroomList',
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