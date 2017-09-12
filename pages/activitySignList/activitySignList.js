// activitySignList.js
import { Switch } from '../../components/switch/switch.js';
import { domain } from '../../utils/domain';
import { jionTimeByDate } from '../../utils/util';
import { wk } from '../../utils/wk';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    switch_selNum: 0,
    switch_selTypes: ["报名表", "签到表"],
    jionList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var switchs = new Switch(this);
    switchs.bindEvents();

    var that = this;
    var activityId = options.activityId;
    //根据type显示type页
    var switch_selNum = options.type || 0;
    this.setData({ switch_selNum: switch_selNum });
    //报名表人数统计
    wk.get({
      url: '/activityjoins/count',
      data: { activityId: activityId },
      method: 'GET',
      success: function (res) {
        console.log(res)
        var jonNums = res.data;
        var newNumber = jonNums.count - wx.getStorageSync('jonNumsed' + activityId) //获取缓存
        // console.log(newNumber)
        wx.setStorageSync('jonNumsed' + activityId, jonNums.count);//设置缓存

        if (jonNums.count) {
          activityId        
        }

        jonNums.joinCount = jonNums.count;

        that.setData({ newNumber: newNumber, jonNums: jonNums })
      }
    })
    //签到表人数统计
    wk.get({
      url: '/activitysigns/count',
      data: { activityId: activityId },
      method: 'GET',
      success: function (res) {
        var signNums = res.data;
        signNums.joinCount = signNums.join;
        signNums.signCount = signNums.sign;
        signNums.bothCount = signNums.both;

        that.setData({ signNums: signNums })


      }
    })

    // 报名列表
    wk.get({
      url: '/activityjoins/query',
      data: { activityId: activityId },
      method: 'GET',
      success: function (res) {
        var data = res.data.list
            

        if (!!data && data.length > 0) {
          var joinMap = {};
          var lengths = data.length;//数据总长度
        
          //先按添加日期排序，再格式化日期，最后按日期分组
          data.sort((a, b) => {
            return b.createTime - a.createTime;
          }).map(item => {
           
            item.createTime = jionTimeByDate(new Date(item.createTime));
            item.nums = lengths--;  //倒叙显示序号
            return item;
          }).forEach(item => {
            if (!joinMap[item.createTime]) {
              joinMap[item.createTime] = [];
            }
            joinMap[item.createTime].push(item);
          });
          that.setData({ joinMap: data });//传值
        }
      },
      complete: (res) => {
        that.setData({ isLoading1: false });
      }
    })
    //签到列表
    wk.get({
      url: '/activitysigns/query',
      data: { activityId: activityId },
      method: 'GET',
      success: function (res) {
        var data = res.data.list
        data.map((v, k) => {
          v.createTime = jionTimeByDate(new Date(v.createTime))
        })

        that.setData({ signMap: data });
      },
      complete: (res) => {
        that.setData({ isLoading2: false });
      }
    })
  }
})