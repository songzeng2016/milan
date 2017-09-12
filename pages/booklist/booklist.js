import { domain } from '../../utils/domain';
var app = getApp();
var formatDate = app.formatDate;
var formatHour = app.formatHour;
Page({
  data:{
    pageId:1,
    bookList:[],
    roomId:"",
    name:"",
    noList:false
  },
  onLoad:function(options){
    var _this = this;
    var roomId = options.id;
    var name = options.name
    _this.setData({roomId:roomId,name:name});
    wx.setNavigationBarTitle({      
      title: (name || '会议室') + '预订列表'
    })
    wx.request({
      url: domain + '/bookedmeeting/all?roomId='+roomId,
      data: {},
      method: 'GET',
      success: function(res){
        var result = res.data.data 
        var dataList = [];
        if(res.data.status==1){ 
          if(result.length==0){
            _this.setData({noList:true});
          }
           for(var index in result){
             var dateStr = formatDate(new Date(result[index].orderDate));
             if(dataList.length==0 ||dataList[dataList.length-1].date != dateStr){
               //第一组数据自动放入，没有日期的也放入
               var one = {};
               one.date = dateStr;
               var list = [];
               result[index].start = formatHour(new Date(result[index].startTime));
               result[index].end = formatHour(new Date(result[index].endTime));
               list.push(result[index]);
               one.list = list;
               dataList.push(one);
             }else{//数组有数据则进行比较
               //同一天则往list中添加一条
                var list = dataList[dataList.length-1].list;
                result[index].start = formatHour(new Date(result[index].startTime));
                result[index].end = formatHour(new Date(result[index].endTime));
                list.push(result[index]);
             }
           }
           _this.setData({bookList : dataList});
           console.log(111)
           console.log(dataList);
        }else{
          wx.showModal({
            title: '提示',
            content: '获取会议室列表失败',
            showCancel: false
          });
        }
      }
    });
  }
})