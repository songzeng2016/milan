import { domain } from '../../utils/domain';
var app = getApp();
var formatWeek = app.formatWeek;
var formatDate = app.formatDate;
var formatHour = app.formatHour;
var hourCompare = app.hourCompare;
var validater = app.validater;
Page({
  data:{
     //form表单 初始化的日期 
     bookDate: [],
     bookDateStr: [],
     initDateIndex: 0,
     initTime: "",
     // disabled 表示不可选  seleted 表示已经选择的 
     bookTimesIds: [],
     dateStr: "",
     startStr: "",
     endStr: "",
     form:{
       roomId: "",
       depart: "",
       name: "",
       userId: "",
       startTime: "",
       endTime: "",
       orderdate: ""
     },
     bookTimes:[
       {id:1,hour:"09",minutes:"30",start:"09:00",time:"9:00—9:30",disabled:true,selected:false},
       {id:2,hour:"10",minutes:"00",start:"09:30",time:"9:30—10:00",disabled:true,selected:false},
       {id:3,hour:"10",minutes:"30",start:"10:00",time:"10:00—10:30",disabled:true,selected:false},
       {id:4,hour:"11",minutes:"00",start:"10:30",time:"10:30—11:00",disabled:true,selected:false},
       {id:5,hour:"11",minutes:"30",start:"11:00",time:"11:00—11:30",disabled:true,selected:false},
       {id:6,hour:"12",minutes:"00",start:"11:30",time:"11:30—12:00",disabled:true,selected:false},
       {id:7,hour:"13",minutes:"30",start:"13:00",time:"13:00—13:30",disabled:true,selected:false},
       {id:8,hour:"14",minutes:"00",start:"13:30",time:"13:30—14:00",disabled:true,selected:false},
       {id:9,hour:"14",minutes:"30",start:"14:00",time:"14:00—14:30",disabled:true,selected:false},
       {id:10,hour:"15",minutes:"00",start:"14:30",time:"14:30—15:00",disabled:true,selected:false},
       {id:11,hour:"15",minutes:"30",start:"15:00",time:"15:00—15:30",disabled:true,selected:false},
       {id:12,hour:"16",minutes:"00",start:"15:30",time:"15:30—16:00",disabled:true,selected:false},
       {id:13,hour:"16",minutes:"30",start:"16:00",time:"16:00—16:30",disabled:true,selected:false},
       {id:14,hour:"17",minutes:"00",start:"16:30",time:"16:30—17:00",disabled:true,selected:false},
       {id:15,hour:"17",minutes:"30",start:"17:00",time:"17:00—17:30",disabled:true,selected:false},
       {id:16,hour:"18",minutes:"00",start:"17:30",time:"17:30—18:00",disabled:true,selected:false},
       {id:17,hour:"18",minutes:"30",start:"18:00",time:"18:00—18:30",disabled:true,selected:false},
       {id:18,hour:"19",minutes:"00",start:"18:30",time:"18:30—19:00",disabled:true,selected:false},
       {id:19,hour:"19",minutes:"30",start:"19:00",time:"19:00—19:30",disabled:true,selected:false},
       {id:20,hour:"20",minutes:"00",start:"19:30",time:"19:30—20:00",disabled:true,selected:false},
     ],
     //弹层是否开启
     isPopOpen: false

  },
  //event 点击时间 选择时间
  selTimeFn:function(e){
    this.initTimeData();
    var form = this.data.form;
    this.setData({ isPopOpen: true });
  },
  selectTime:function(e){
    var id = e.target.dataset.id.id;
    var bookTimes = this.data.bookTimes;
    var bookTimesIds = this.data.bookTimesIds;
    for(var i = 0; i < bookTimes.length; i++){
      if(parseInt(bookTimes[i].id) == parseInt(id)){
        if(bookTimes[i].selected){//被选中要从数组中去掉id，并设为为选中状态
          for(var j = 0; j < bookTimesIds.length; j++){
            if(bookTimesIds[j] == parseInt(id)){
              bookTimesIds.splice(j, 1);
              break;
            }
          }
          bookTimes[i].selected = false;
        }else{
          bookTimes[i].selected = true;
          bookTimesIds.push(parseInt(id));
          bookTimesIds.sort(sortnumber);
        }
      }
    }
    this.setData({bookTimesIds:bookTimesIds});
    this.setData({bookTimes:bookTimes});
  },
  //event 弹层的关闭
  popConfirmFn:function(e){
    var bookTimesIds = this.data.bookTimesIds;
    var bookTimes = this.data.bookTimes;
    for(var i = 0; i < bookTimesIds.length; i++){
      var current = bookTimesIds[i];
      if(i < bookTimesIds.length-1){
        var next = bookTimesIds[i+1]
        if(next - current > 1){
            wx.showModal({
              title: '提示',
              content: '预定时间必须是连续的',
              showCancel: false
            });
            return false;
        }
      }
    }
    var initTime = this.initTime;
    var startStr = "";
    var endStr = "";
    if(bookTimesIds.length > 0){
      var startIndex = bookTimesIds[0];
      startStr = bookTimes[startIndex-1].start;
      if(bookTimesIds.length >1){
        var endIndex = bookTimesIds[bookTimesIds.length - 1];
        initTime = bookTimes[startIndex-1].start + "--" + bookTimes[endIndex-1].hour + ":" +bookTimes[endIndex-1].minutes;
        endStr = bookTimes[endIndex-1].hour + ":" +bookTimes[endIndex-1].minutes;
      }else{
        initTime = bookTimes[startIndex-1].start + "--" + bookTimes[startIndex-1].hour + ":" +bookTimes[startIndex-1].minutes ;
        endStr =bookTimes[startIndex-1].hour + ":" +bookTimes[startIndex-1].minutes ;
      }
      this.setData({initTime:initTime});
    }
    
    this.setData({
        startStr: startStr,
        endStr: endStr,
        isPopOpen: false
    });

  },
  //event picker
  changeDate:function(e){
    var form = this.data.form;
    var dateStr = "";
    var bookDateStr = this.data.bookDateStr;
    dateStr = bookDateStr[parseInt(e.detail.value)];
    form.orderdate = bookDateStr[parseInt(e.detail.value)] + " 00:00:00";
    var bookTimes = this.data.bookTimes;
    for(var i = 0; i < bookTimes.length; i++){
      bookTimes[i].selected = false;
    }
    this.setData({
      startStr: "",
      endStr: "",
      initTime: "",
      bookTimesIds: [],
      bookTimes: bookTimes,
      form: form,
      dateStr: dateStr,
      initDateIndex: e.detail.value
    })
    this.initTimeData();
  },
  formSubmit:function(e){
    //formId用于发送模板消息
    var formId = e.detail.formId;
    var _this = this;
    var form = this.data.form;
    var depart = e.detail.value.depart;
    if(validater.isEmpty(depart)){
       wx.showModal({
        title: '提示',
        content: '部门是必填项啊',
        showCancel: false
      });
      return false;
    }
    if(!validater.maxLength(depart,20)){
       wx.showModal({
        title: '提示',
        content: '部门长度不能超过10个汉字或者20个字符',
        showCancel: false
      });
      return false;
     }
    form.depart = depart;
    var name = e.detail.value.name;
    if(validater.isEmpty(name)){
       wx.showModal({
        title: '提示',
        content: '预订人是必填项啊',
        showCancel: false
      });
      return false;
    }
    if(!validater.maxLength(name,12)){
      wx.showModal({
      title: '提示',
      content: '预订人长度不能超过6个汉字或者12个字符',
      showCancel: false
    });
    return false;
    }
    form.name = name;
    if(this.data.endStr==""||this.data.startStr==""){
       wx.showModal({
        title: '提示',
        content: '预约时间是必填项啊',
        showCancel: false
      });
      return false;
    }
    if(validater.isEmpty(this.data.dateStr)){
       wx.showModal({
        title: '提示',
        content: '预约日期是必填项啊',
        showCancel: false
      });
      return false;
    }
    form.startTime = this.data.dateStr + " " + this.data.startStr + ":00";
    form.endTime = this.data.dateStr + " " + this.data.endStr + ":00";
    wx.showModal({
        title: '提示',
        content: '是否确认提交预订',
        success:function(res){
          if(res.confirm) {
              wx.request({
                  url: domain + '/bookedmeeting/add',
                  data: {userId:form.userId,depart:form.depart,name:form.name,meetingRoomId:form.roomId,startTime:form.startTime,endTime:form.endTime,orderDate:form.orderdate},
                  method: 'GET',
                  success: function(res){
                    if(!!res.data){
                      if(res.data.status == 2){
                          wx.showModal({
                            title: '提示',
                            content: '预约时间冲突，请重新选择时间',
                            showCancel: false
                          });
                          var bookTimes = _this.data.bookTimes;
                          for(var i = 0; i < bookTimes.length; i++){
                            bookTimes[i].selected = false;
                          }
                          _this.setData({
                            bookTimes:bookTimes,
                            bookTimesIds:[]
                          });
                          _this.initTimeData();
                          return false;
                      }
                      if(res.data.status == 1){
                        wx.showModal({
                            title: '提示',
                            content: '预约成功',
                            showCancel: false,
                            success:function(){
                                wx.request({
                                  url: domain + '/reportform/booksuccess',
                                  data: {
                                    formId: formId,
                                    userId: _this.data.form.userId,
                                    roomId: _this.data.form.roomId,
                                    name: _this.data.form.name,
                                    date: _this.data.dateStr,
                                    time: _this.data.initTime
                                  },
                                  method: 'GET',
                                  success: function(res){
                                    console.log(res);
                                  },
                                  fail: function(res) {
                                    console.log(res);
                                  }
                                });
                                wx.navigateBack({});
                            }
                          });
                      }
                    }else{
                      wx.showModal({
                        title: '提示',
                        content: '预约失败',
                        showCancel: false
                      });
                    }
                  },
                  fail: function() {
                    wx.showModal({
                        title: '提示',
                        content: '预约异常',
                        showCancel: false
                      });
                  }
                });
          }
        }
      });

  },
  initTimeData:function(){
    var form = this.data.form;
    var dateStr = this.data.dateStr;
    var _this = this;
    var form = _this.data.form;
    wx.request({
     url: domain + '/bookedmeeting/queryByDay',
     data: {roomId:form.roomId,dateStr:dateStr},
     method: 'GET',
     success: function(res){
       if(res.data.status == 1){
         var data = res.data.data;
         var now = new Date();
         var compareDate = new Date();
         var bookTimes = _this.data.bookTimes;
         var selectDate = new Date(_this.data.dateStr);
        for(var i = 0; i < bookTimes.length; i++){
          compareDate.setHours(bookTimes[i].hour);
          compareDate.setMinutes(bookTimes[i].minutes);
          compareDate.setSeconds(0);
          if(selectDate > new Date()){
            bookTimes[i].disabled = false;
          }else{
            bookTimes[i].disabled = hourCompare(now,compareDate);
          }
        }

         for(var j = 0; j < data.length; j++){//循环数据库中已经预定的时间
          var start = new Date(data[j].startTime);
          var end = new Date(data[j].endTime);
          start.setMinutes(start.getMinutes()+30);
          for(var i = 0; i < bookTimes.length; i++){
              if(parseInt(bookTimes[i].hour) == start.getHours()&&parseInt(bookTimes[i].minutes) == start.getMinutes()){
              while(start <= end){//循环预定时间每30分钟去一段去比较
                var compareTime = new Date(data[j].startTime);
                compareTime.setHours(bookTimes[i].hour);
                compareTime.setMinutes(bookTimes[i].minutes);
                if(!!bookTimes[i]&&end >= compareTime){
                  bookTimes[i].disabled = true ;
                  i++;
                }
                start.setMinutes(start.getMinutes()+30);
                }//循环预定时间结束
              }     
          }     
        }//循环数据库中已经预定的时间结束
         _this.setData({bookTimes:bookTimes});
       }else{
          wx.showModal({
            title: '提示',
            content: '获取预订会议室失败',
            showCancel: false
          });
       }
     }
   });
  },
  onLoad:function(options){
    var form = this.data.form;
    form.roomId = options.roomId;
    console.log(wx.getStorageInfoSync("login_key"))
    form.userId = wx.getStorageSync("login_key").split("_")[2] || 0
    var name = options.name;
    wx.setNavigationBarTitle({      
      title: (name || '会议室') + '预订'
    })
    var _this = this;
    var date = new Date();
    var bookDate = [];
    var bookDateStr = [];
    bookDateStr.push(formatDate(date));
    bookDate.push(formatDate(date) + "(" + formatWeek(date) + ")");
    for(var i = 0; i < 6; i++){
        date.setDate(date.getDate()+1);
        bookDateStr.push(formatDate(date));
        bookDate.push(formatDate(date) + "(" + formatWeek(date) + ")");
    }
    form.orderdate = bookDateStr[0] + " 00:00:00";
    var dateStr = formatDate(new Date(bookDateStr[0]));
    _this.setData({form:form,dateStr:dateStr,bookDate:bookDate,bookDateStr:bookDateStr,initTime:formatHour(new Date())});
    this.initTimeData();
  }
});
function sortnumber(a,b){
  return a-b;
}