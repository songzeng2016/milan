//app.js
import { domain } from 'utils/domain';
import { mapUtil } from 'utils/mapUtil'
import { validater } from 'utils/validater'
import { GPS } from 'utils/gps'
import { formatDate,formatHour,formatWeek,hourCompare ,getDateName} from 'utils/util'
import {Touches} from './utils/Touches.js'
App({
  onLaunch: function (e) {
    this.globalData.shareTicket = e.shareTicket;
    this.getLoginInfo();
  },
  formatWeek : formatWeek,
  formatHour : formatHour,
  formatDate : formatDate,
  hourCompare: hourCompare,
  getDateName : getDateName,
  mapUtil: mapUtil,
  validater: validater,
  GPS: GPS,
  globalData:{
    position: {
      latitude: null,
      longitude: null
    },
    openGId:'',
    shareTicket: ''
  },
  //2017/5/23增加
  Touches: new Touches(),
  getLoginInfo:function(cb){
    var that = this;
    var loginKey = wx.getStorageSync('login_key');
    if(!!loginKey){
      var userId = wx.getStorageSync('login_key').split("_")[2] || 0;
      that.collectPhoneInfo(userId);
      that.shareTicket(userId);
       wx.request({
         url: domain + '/login/check',
          data: {key:loginKey},
          method: 'GET', 
          success: function(res){
            if(res.data.status != 1){//登陆校验失败
              that.login();
            }
          },
          fail: function() {
            wx.showToast({
              title: '登录验证失败!',
              mask:true,
              icon: 'loading',
              duration: 1000
            });
            return false; 
          }
        });
    }else{
      that.login();
    }
  },
  login:function(){
    wx.login({
      success: function(res){
        // success
        wx.request({
          url: domain + '/login',
          data: {code:res.code},
          method: 'GET', 
          success: function(res){
            // success
            if(res.data.status==1){
              //保存缓存
              var loginKey = res.data.value;
              wx.setStorageSync('login_key', loginKey)
              var userId = loginKey.split("_")[2] || 0;
              that.collectPhoneInfo(userId);
              that.shareTicket(userId);
            }else{
               wx.showToast({ //返回状态码不是1，后台报错或者判断问题
                  title: '登录失败!',
                  mask:true,
                  icon: 'loading',
                  duration: 1000
                });
                return false;
            }
          },
          fail: function () {   // 后台登录失败
             wx.showToast({
                title: '登陆出错，请重启后尝试!',
                mask:true,
                icon: 'loading',
                duration: 1000
            });
            return false;
          }
        })
      },
      fail: function() {//调用微信登录失败，一般跟网络有关
        // fail
        wx.showToast({
            title: '微信登陆失败，请重启后尝试!',
            mask:true,
            icon: 'loading',
            duration: 1000
        });
        return false;
      }
    });//用户登录结束
  },
  shareTicket(id){
    var that = this;
    var shareTicket = that.globalData.shareTicket;
    if (!shareTicket) {
      return;
    }
    wx.getShareInfo({
      shareTicket: shareTicket,
      complete(res) {
        if (res.errMsg.indexOf("fail") > -1) {
          return;
        }
        var { encryptedData, iv } = res;
        wx.request({
          url: domain + '/users/' + id + '/decryptedgroup',
          data: { encryptedData: encryptedData, iv: iv },
          success(res) {
            if (!!res.data.decryptedData) {
                that.globalData.openGId = res.data.decryptedData.openGId || '';
            }
          },
          fail(res) {
            console.log("失败了");
          }
        });
      }
    });
  },
  collectPhoneInfo:function(id){//统计用户机型
    wx.getSystemInfo({
      success: function(res) {
        res.userId = id;
        wx.request({
          url: domain + '/phoneinfos',
          data: res,
          method: 'PUT', 
          success: function(res){
            if(res.data.status==1){
              console.log("update phoneinfo success");
            }
          }
        })
      }
    })
  }
});

