import { formatDate, timeDiff2, formatTime, showTimeByDate } from '../../utils/util';
import { formatBigNum } from '../../utils/stringUtil';
import { mapUtil } from '../../utils/mapUtil';
import { domain } from '../../utils/domain';
var app = getApp();

Page({
  data: {
    isOver: false,
    orig: {},
    isLoading: false,
    //到底了
    //isOver: false,
    //采购 页码初始化为 1
    buyPageNo: 1,
    buyList: [],
    buyQuery: {},
  },
  //已经到底部了
  toLowerFn: function (e) {
    var _this = this;
    _this.setData({
      isToLower: true
    });
    // tip :后台人可以  在这里写请求成功之前 改变  isToLower：false
    setTimeout(function () {
      _this.setData({
        isToLower: false
      });
    }, 1000);
  },
  loadNextBuyPage(e) {
    this.setData({ isLoading: true });
    getBuyPage(this);
  },
  onLoad: function (options) {
    var _this=this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        var orig = { latitude: latitude, longitude: longitude};
        _this.setData({ orig: orig });
        getBuyPage(_this);
      }
    })

  }
});

///获取采购列表分页
function getBuyPage(page) {
  var { buyPageNo, buyList, orig } = page.data;
  console.log(orig);
  if (!buyPageNo) {
    return false;
  }
  wx.request({
    url: domain + '/buys/nearby',
    data: { currentPage: buyPageNo, pageSize: 10, latitude: orig.latitude, longitude: orig.longitude, isValid: 1 },
    method: 'GET',
    success: function (res) {
      wx.hideToast();
      var { msg, status, list, query } = res.data;
      if (msg != 'success') {
        return false;
      }
      if (!list || list.length <= 0) {
        page.setData({ isOver: true });
        setTimeout(function () {
          page.setData({ isOver: false });
        }, 1000);
        return false;
      }
     
      //格式化 
      list.forEach(function (item, ind) {
        item.viewCount=item.viewCount || 0;
        item.viewCount = formatBigNum(item.viewCount);
        list[ind].distance = mapUtil.getDistance(list[ind].latitude, list[ind].longitude, orig.latitude, orig.longitude);
        try{
          list[ind].timeDiff = timeDiff2(new Date(item.deadLine), new Date());
        }catch(e){

        }
      });

      console.log(list);
      page.setData({ buyPageNo: buyPageNo + 1 });
      page.setData({ buyList: buyList.concat(list) });
    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        content: '获取采购列表失败，请稍后再试',
        showCancel: false
      });
    },
    complete: function () {
      page.setData({ isLoading: false });
    }
  });
}

//格式化 时间的方法
function formateTime(deadLine) {
  if (deadLine < 0) {
    return 0;
  }
  deadLine = parseInt(deadLine / 1000);
  var day = ~~((deadLine) / (1000 * 60 * 60 * 24));
  if (day > 1) {
    return day + '天';
  }
  var hour = ~~(deadLine / 1000 / 60 / 60);
  var minute = ~~(deadLine / 1000 / 60);
  var second = ~~(deadLine / 1000);
  return [hour, minute, second].map(formatNumber).join(':');
}




