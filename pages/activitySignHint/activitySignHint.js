// activitySignHint.js
import { domain } from '../../utils/domain';
import { jionTimeByDate2, formatWeek} from '../../utils/util';
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var activityId = options.activityId;
    var status = options.status
    this.setData({
      activityId: activityId,
      status: status
    });
    wx.request({
      url: domain + '/activities/' + activityId,
      data: { type: "show"  },
      method: 'GET',
      success: (res) => {
        if (res.data.status == 1) {
          var {activity, now} = res.data;
          activity.start = jionTimeByDate2(new Date(activity.startTime));
          activity.end = jionTimeByDate2(new Date(activity.endTime));
          activity.startWeek = formatWeek(new Date(activity.startTime))
          activity.endWeek = formatWeek(new Date(activity.endTime))
          this.setData({
            activity: activity
          })
        }
      }
    })
  },
  goDetail:function(){
    wx.navigateTo({
      url: '/pages/activityDetail/activityDetail?activityId=' + this.data.activityId,
    })
  },
})