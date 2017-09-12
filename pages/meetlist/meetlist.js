import { domain } from '../../utils/domain';
var app = getApp();
Page({
  data:{
    //会议室列表
    meetingRooms: []
  },
  onLoad:function(options){
    var that = this;
    wx.request({
      url: domain + '/meetingroom/list',
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: function(res){
        if(!!res.data && res.data.status == 1){
          that.setData({
            meetingRooms: res.data.data
          })
        }
      },
      fail: function() {
        // fail
      }
    })
  }
})