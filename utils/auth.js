import { domain } from '/domain';
var app = getApp();
function authorize() {
  var callback = null;
  var userInfo = null;
  var location = null;
  for (var key in arguments){
    if (arguments[key] == 'userInfo' && !wx.getStorageSync("user_info")){
      userInfo = true;
    }
    if (arguments[key] == 'userLocation' && (!app.globalData.position.latitude || !app.globalData.position.longitude)) {
      location = true;
    }
    if (typeof (arguments[key]) === "function") {
      callback = arguments[key];
    }
  }
  if (userInfo){
    getUserInfo(function(){
      if (location) {
        getLocation(callback, 'navigate');
        //用户位置信息结束
      } else {
        if (!!callback) {
          callback();
        }
      }
    },'navigate')
  }else{
    if (location) {
      getLocation(callback,'navigate');
      //用户位置信息结束
    } else {
      if (!!callback) {
        callback();
      }
    }
  }
}
function authPageStay() {
  getUserInfo(null, null);
  getLocation(null, null);
  //用户位置信息结束
}

module.exports = {
  auth: authorize,
  auth2: authPageStay
}
function getLocation(callback,navigate){
  wx.getLocation({
    success: function (res) {
      var position = {};
      position.latitude = res.latitude;
      position.longitude = res.longitude;
      app.globalData.position = position;
      console.log("更新用户位置")
      if (!!callback) {
        callback();
      }
    },
    fail: (res) => {
      if (!!navigate){
        wx.navigateTo({
          url: '/pages/accredit/accredit',
        })
      }
    }
  })
}

function getUserInfo(callback, navigate){
  wx.getUserInfo({
    success: (res) => {
      if (!wx.getStorageSync("userInfo")) {
        var userInfo = JSON.parse(res.rawData);
        userInfo.id = wx.getStorageSync("login_key").split("_")[2] || 0;
        //保存用户信息到缓存中
        wx.setStorageSync('user_info', userInfo);
        var encryptedData = res.encryptedData;
        var iv = res.iv;
        var user = {};
        user.id = userInfo.id;
        user.encryptedData = encryptedData;
        user.iv = iv;
        updateUser(user);
        console.log("用户信息");
        //用户信息获取结束
        if (!!callback){
          callback();
        }
      }
    },
    fail: (res) => {
      if (!!navigate) {
        wx.navigateTo({
          url: '/pages/accredit/accredit',
        })
      }
     }
  })
}
function updateUser(user) {
  wx.request({
    url: domain + '/users/' + user.id + '/decrypteddata',
    data: {encryptedData: user.encryptedData, iv: user.iv },
    method: 'PUT',
    success: function (res) {
      // success
      console.log("update user logo and name success");
    }
  })
}