import { formatDate, timeDiff2, formatTime, showTimeByDate } from '../../utils/util';
import { formatCent } from '../../utils/moneyUtil';
import { formatBigNum } from '../../utils/stringUtil';
import { domain } from '../../utils/domain';
var app = getApp();
Page({
  data: {
    //到底了
    isOver: false,
    orig: {},
    isLoading: false,
    //采购 页码初始化为 1
    supplyPageNo: 1,
    supplyList: [],
    supplyQuery: {},
    isSupImgTxt: true,  //是图文显示
  },
  //已经到底部了
  toLowerFn: function (e) {
    var _this = this;
    _this.setData({
      isToLower: true
    });
    setTimeout(function () {
      _this.setData({
        isToLower: false
      });
    }, 1000);
  },
  loadNextsupplyPage(e) {
    this.setData({ isLoading: true });
    getsupplyPage(this, this.data.orig);
  },
  onLoad: function (options) {
    var _this = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        var orig = { latitude: latitude, longitude: longitude };
        _this.setData({
          orig: orig
        });
        getsupplyPage(_this, orig);
      }
    })
  }
});

///获取采购列表分页
function getsupplyPage(page, orig) {
  var { supplyPageNo, supplyList } = page.data;
  if (!supplyPageNo) {
    return false;
  }
  wx.request({
    url: domain + '/supplies/nearby',
    data: { currentPage: supplyPageNo, pageSize: 10, latitude: orig.latitude, longitude: orig.longitude, status: 1 },
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
      list.map((item) => {
        item.imgUrl = !!(domain + '/image/supply/' + item.id + '_120_120') ? (domain + '/image/supply/' + item.id + '_120_120') : '../../image/noPhoto.jpg';
        item.minPrice = formatCent(item.minPrice);
        item.viewCount = formatBigNum(item.viewCount);
        item.viewCount = Number(item.viewCount);
        return item;
      });
      page.setData({ supplyPageNo: supplyPageNo + 1 });
      page.setData({ supplyList: supplyList.concat(list) });
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






