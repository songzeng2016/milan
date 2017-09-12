import { domain } from '../../utils/domain';
var app = getApp();
var formatDate = app.formatDate;
var formatHour = app.formatHour;
Page({
  data: {
    bookList: []
  },
  cancelBook(e){
    var that = this;
    var id = e.target.dataset.id;
    if(id > 0){
      wx.showModal({
        title: '提示',
        content: '是否确定取消此项预约',
        success: function(res){
          if(res.confirm) {
            wx.request({
              url: domain + '/bookedmeeting/deleteById',
              data: {id: id},
              method: 'GET',
              success: function(res){
                if(!!res.data && res.data.status == 1){
                  wx.showModal({
                    title: '提示',
                    content: '成功取消预约',
                    showCancel: false,
                    success: function(){
                      getBookList(that);
                    }
                  });
                }else{
                  wx.showModal({
                    title: '提示',
                    content: '取消预约失败',
                    showCancel: false
                  });
                }
              },
              fail: function() {
                wx.showModal({
                  title: '提示',
                  content: '取消预约失败',
                  showCancel: false
                });
              }
            });

          }
        }
      });
      
    }
  },
  onLoad: function(options){
    getBookList(this);
  }
});
//获取自己预订的会议室列表
function getBookList(that){
  var userId = wx.getStorageSync("login_key").split("_")[2] || 0;
  wx.request({
    url: domain + '/bookedmeeting/userlist',
    data: {userId: userId},
    method: 'GET',
    success: function(res){
      if(!!res.data && res.data.status == 1){
        var data = res.data.data;
        if(data.length <= 0){
          that.setData({ bookList: [] });
          return false;
        }
        var bookList = [];
        var perDay = {};
        for(var index in data){
          data[index].orderDate = formatDate(new Date(data[index].orderDate));
          data[index].startTime = formatHour(new Date(data[index].startTime));
          data[index].endTime = formatHour(new Date(data[index].endTime));
          if(index == 0 || data[index].orderDate != data[index - 1].orderDate){
            index > 0 && bookList.push(perDay);
            perDay = {date: data[index].orderDate, list:[]};
          }
          perDay.list.push(data[index]);
        }
        bookList.push(perDay);
        that.setData({ bookList: bookList });
      }
    },
    fail: function() {
      // fail
    }
  });
}