import { showTimeByDate } from '../../utils/util';
import { domain } from '../../utils/domain';
Page({
  data:{
    joinList: []
  },
  onLoad: function(options){
    var that = this;
    var activityId = options.activityId;
    wx.request({
      url: domain + '/activityjoin/selectByActivityId',
      data: { activityId: activityId },
      method: 'GET',
      success: function(res){
        var { status, msg, list } = res.data;
        if(!!list && list.length > 0){
          var joinMap = {};
          //先按添加日期排序，再格式化日期，最后按日期分组
          list.sort((a, b) => {
            return b.createTime - a.createTime;
          }).map(item => {
            item.createTime = showTimeByDate(new Date(item.createTime)).replace(/\s+\d{2}:\d{2}/, '');
            return item;
          }).forEach(item => {
            if(!joinMap[item.createTime]){
              joinMap[item.createTime] = [];
            }
            joinMap[item.createTime].push(item);
          });
          that.setData({ joinMap: joinMap });
        }
      }
    })
    
  },

})