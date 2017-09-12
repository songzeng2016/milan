// accredit.js
import { domain } from '../../utils/domain';
var app = getApp();
Page({

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
    var flag = true;
    wx.getSetting({
      success:(res)=>{
        var setting = res.authSetting;
        for (var key in setting) {
          console.log(setting["scope." + setting[key]]);
          if (!setting["scope." + setting[key]]) {
            flag = false;
          }
        }
        if(flag){
          wx.navigateBack({ delta: 1})
        }
      }
    })
  },
  goDetail: function(){
    
    var flag = true;
    wx.openSetting({
      success: (res) => {
        var setting = res.authSetting;
        for(var key in setting){
          var item = setting[key];
          if(!item){
            flag = false;
          }
          console.log()
          if (item && key.indexOf("scope.userInfo")>-1){
             //如果用户信息为空且获得了用户授权则更新用户信息
            wx.getUserInfo({
              success: function (res) {
                var userInfo = JSON.parse(res.rawData);
                userInfo.id = wx.getStorageSync("login_key").split("_")[2];
                //保存用户信息到缓存中
                wx.setStorageSync('user_info', userInfo);
                var encryptedData = res.encryptedData;
                var iv = res.iv;
                user.id = userInfo.id;
                user.encryptedData = encryptedData;
                user.iv = iv;
                updateUser(user);
                console.log("save user info success");
              }
            })
          }
          if (item && key.indexOf("scope.userLocation") > 0){
            //如果经纬度没有取到则重新获取经纬度
            wx.getLocation({
              success: function (res) {
                var position = {};
                position.latitude = res.latitude;
                position.longitude = res.longitude;
                app.globalData.position = position;
              },
            })
          }
        }
      },
      complete:()=>{
        if (flag) {
          setTimeout(() => {
            wx.navigateBack({ })
          }, 500)
        }
      }
    })
  }
})

function updateUser(user) {
  wx.request({
    url: domain + '/user/updateuser',
    data: user,
    method: 'POST',
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    }, // 设置请求的 header
    success: function (res) {
      // success
      console.log("update user logo and name success");
    }
  })
}