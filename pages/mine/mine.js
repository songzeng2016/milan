import { domain } from '../../utils/domain';
import { formatDate } from '../../utils/util';
var app = getApp();
Page({
  data:{
    user:[],
    province: '',
    city:'',
   
  },
  onLoad: function(options){
    var that = this;
    var userId = wx.getStorageSync('login_key').split("_")[2];
    if(!!userId){
      wx.request({
        url: domain + '/users/' + userId,
        data: {  },
        method: 'GET',
        success: function(res){
          
          console.log(res.data);
          var { msg, user, province, city} = res.data;
          if (msg == "success") {
            that.setData({
              province: province,
              city: city
            })
          }
          if(msg == "success" && !!user){
            var createTime = parseInt(user.createTime);
            user.createTime = formatDate(new Date(createTime));
            that.setData({ user: user });
          }
        }
      });
    }
  },
  toActivity(){
    var user = this.data.user;
    var userId = wx.getStorageSync("login_key").split("_")[2] || 0;
    // if(!user){
    //   return false;
    // }
    wx.request({
      url: domain + '/activities/count',
      data: { userId: userId },
      method: 'GET',
      success: function(res){
        var { msg, count } = res.data;
        if(msg == "success" && count > 0){
          wx.navigateTo({ url: '../activityList/activityList' });
        }else{
          wx.navigateTo({ url: '../activityPublish/activityPublish' });
        }
      },
      fail: function(res){
        //wx.navigateTo({ url: '../activityRelease/activityRelease' });
        wx.showToast({
          title: '未响应,请重试',
          icon: 'loading',
          image: '../../image/icon_warn.png',
          mask: true,
          duration: 1000
        });
         
      }
    })
  }
})