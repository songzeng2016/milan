import { domain } from '../../utils/domain';
Page({
  data:{
    
  },
  onTap: function(e){
    wx.navigateTo({          
        url: "../activityRelease/activityRelease"
    });
  },
  onShow: function(){
    wx.request({
      url: domain + '/activity/selectCountByUserId',
      data: { userId: wx.getStorageSync('login_key').split("_")[2] },
      success: (res) => {
        var { count, status } = res.data;
        if(status == 1 && count > 0){
          wx.redirectTo({
            url: '../activityList/activityList',
          })
        }
      }
    });
  }
})