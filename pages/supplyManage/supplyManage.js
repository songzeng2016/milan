import { formatDate, timeDiff, formatTime } from '../../utils/util';
import { formatCent } from '../../utils/moneyUtil';
import { mapUtil } from '../../utils/mapUtil';
import { domain } from '../../utils/domain';


//  组件的引入
import { Switch } from '../../components/switch/switch.js';
var app = getApp();
Page({
  data: {
    switch_selNum: 0,
    switch_selTypes: ["销售中", "未通过", "待审核", "待上架"],
    isSupImgTxt: true,  //默认是图文显示
    supplyPageNo: 1,
    supplyPage2No: 1,
    supplyPage3No: 1,
    supplyPage0No: 1,
    //供应列表数据
    sup_lists0: [],
    sup_lists1: [],
    sup_lists2: [],
    sup_lists3: [],
    //正在加载下一页
    isRefresh: false,
    //正在刷新
    isLoading: false,
    //到底了
    isOver0: false,
    isOver1: false,
    isOver2: false,
    isOver3: false,

    loading0: true,
    loading1: true,
    loading2: true,
    loading3: true

  },

  //跳转到发布供应，由于跳转页面是底部tab页，无法传参，所以通过缓存参数实现
  publishSupply(e) {
    wx.setStorageSync('publishType', 'supply');
    wx.switchTab({ url: '../publish/publish' });
  },
  //销售中下拉
  loadNextSupplyPage(e) {
    var _this=this;
    var status = e.target.dataset.status;
    if (status == 0 && (this.data.isOver0 || this.data.isLoading)) {
      return false;
    }
    if (status == 1 && (this.data.isOver1 || this.data.isLoading)) {
      return false;
    }
    if (status == 2 && (this.data.isOver2 || this.data.isLoading)) {
      return false;
    }
    if (status == 3 && (this.data.isOver3 || this.data.isLoading)) {
      return false;
    }
    this.setData({ isLoading: true });
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        var orig = { latitude: latitude, longitude: longitude};
        _this.getSupplyPage(status, orig);
      }
    })
    
  },
  //下架
  updateProDown: function (e) {
    var that = this;
    that.setData({
      isOver0: false,
      isOver1: false,
      isOver2: false,
      isOver3: false
    });
    var id = e.target.dataset.id;
    var status = e.target.dataset.status;
    if (wx.showLoading) {
      wx.showLoading({
        title: '提交中'
      })
    }
    wx.request({
      url: domain + '/supply/update',
      data: { id: id, status: status },
      method: 'GET',
      success: function (res) {
        that.onShow();
      },
      complete: function () {
        if (wx.hideLoading) {
          wx.hideLoading();
        }
      }
    });
  },
  //上架
  updateProShow: function (e) {
    var that = this;
    that.setData({
      isOver0: false,
      isOver1: false,
      isOver2: false,
      isOver3: false
    });
    var id = e.target.dataset.id;
    var status = e.target.dataset.status;
    var userId = this.data.userId;
    wx.request({
      url: domain + '/supply/getPublishCount',
      data: { userId: userId },
      method: 'GET',
      success: function (res) {
        var { status, msg, showCount, waitCount } = res.data;
        if (status != 1) {
          return false;
        }
        if (showCount >= 5) {
          wx.showModal({
            title: '提示',
            content: '已有5条上架信息，需下架一条供应信息后，才可上架其他信息',
            showCancel: false,
            confirmText: '我知道了'
          });
        } else {
          if (wx.showLoading) {
            wx.showLoading({
              title: '提交中'
            })
          }
          wx.request({
            url: domain + '/supply/update',
            data: { id: id, status: status },
            method: 'GET',
            success: function (res) {
              that.onShow();
            },
            complete: function () {
              if (wx.hideLoading) {
                wx.hideLoading();
              }
            }
          });
        }
      }
    });

  },
  //删除
  deletePro: function (e) {
    var id = e.target.dataset.id;
    var that = this;
    that.setData({
      isOver0: false,
      isOver1: false,
      isOver2: false,
      isOver3: false
    });
    wx.showModal({
      title: '提示',
      content: '是否确定删除该商品？',
      success: function (res) {
        if (res.confirm) {
          if (wx.showLoading) {
            wx.showLoading({
              title: '提交中'
            })
          }
          wx.request({
            url: domain + '/supply/update',
            data: { id: id, status: 5 },
            method: 'GET',
            success: function (res) {
              that.onShow();
            },
            complete: function () {
              if (wx.hideLoading) {
                wx.hideLoading();
              }
            }
          });
        }
      }
    });
  },
  onLoad: function (options) {
    var switchs = new Switch(this);
    switchs.bindEvents();

    var that = this;
    this.setData({ switch_selNum: options.index || 0 });
    var userId = wx.getStorageSync("login_key").split("_")[2] || 0;
    this.setData({ userId: userId });
  },
  onShow() {
    var _this=this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        var orig = { latitude: latitude, longitude: longitude };
        _this.refreshSupply(1, orig);
        _this.refreshSupply(2, orig);
        _this.refreshSupply(3, orig);
        _this.refreshSupply(0, orig);
      }
    })

    this.setData({
      supplyPageNo: 2,
      supplyPage2No: 2,
      supplyPage3No: 2,
      supplyPage0No: 2,
      isOver0: false,
      isOver1: false,
      isOver2: false,
      isOver3: false
    });
  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
  //获取供应销售中列表分页
  getSupplyPage(status,orig) {
    var that = this;
    var { userId, supplyPageNo, supplyPage2No, supplyPage3No, supplyPage0No,sup_lists2, sup_lists1, sup_lists3, sup_lists0 } = this.data;

    var pageNo = "";
    if (status == 1) {
      pageNo = supplyPageNo;
    } else if (status == 2) {
      pageNo = supplyPage2No;
    } else if (status == 3) {
      pageNo = supplyPage3No;
    } else if (status == 0) {
      pageNo = supplyPage0No;
    }
    if (!pageNo) {
      return false;
    }
    wx.request({
      url: domain + '/supply/selectDistancePage',
      data: { currentPage: pageNo, pageSize: 10, latitude: orig.latitude, longitude: orig.longitude, userId: userId, status: status, sort: 102 },
      method: 'GET',
      success: function (res) {
        var { msg, list, imgMap } = res.data;
        if (msg != 'success') {
          return false;
        }
        if ((!list || list.length <= 0)) {
          if (status == 0) {
            that.setData({ isOver0: true });
          } else if (status == 1) {
            that.setData({ isOver1: true });
          } else if (status == 2) {
            that.setData({ isOver2: true });
          } else if (status == 3) {
            that.setData({ isOver3: true });
          }
          return false;
        }
        if (status == 1) {
          that.setData({ supplyPageNo: pageNo + 1 });
          that.setData({ sup_lists1: sup_lists1.concat(formatSupplyList(list, orig, imgMap)) });
        } else if (status == 2) {
          that.setData({ supplyPage2No: pageNo + 1 });
          that.setData({ sup_lists2: sup_lists2.concat(formatSupplyList(list, orig, imgMap)) });
        } else if (status == 3) {
          that.setData({ supplyPage3No: pageNo + 1 });
          that.setData({ sup_lists3: sup_lists3.concat(formatSupplyList(list, orig, imgMap)) });
        } else if (status == 0) {
          that.setData({ supplyPage0No: pageNo + 1 });
          that.setData({ sup_lists0: sup_lists0.concat(formatSupplyList(list, orig, imgMap)) });
        }
      },
      fail: function (res) {
        wx.showModal({
          title: '提示',
          content: '获取供应列表失败，请稍后再试',
          showCancel: false
        });
      },
      complete: function () {
        that.setData({ isLoading: false });
      }
    });
  },
  //获取供应销售中列表分页
  refreshSupply(status,orig) {
    var that = this;
    var { userId, supplyPageNo, supplyPage2No, supplyPage3No, supplyPage0No} = this.data;
    var pageNo = 1;
    wx.request({
      url: domain + '/supplies/page',
      data: { currentPage: pageNo, pageSize: 10, latitude: orig.latitude, longitude: orig.longitude, userId: userId, status: status, sort: 102 },
      method: 'GET',
      success: function (res) {
        var { msg, list } = res.data;
        if (msg != 'success') {
          return false;
        }
        if (status == 1) {
          that.setData({
            sup_lists1: formatSupplyList(list, orig),
            loading1: false
          });
        } else if (status == 2) {
          that.setData({
            sup_lists2: formatSupplyList(list, orig),
            loading2: false
          });
        } else if (status == 3) {
          that.setData({
            sup_lists3: formatSupplyList(list, orig),
            loading3: false
          });
        } else if (status == 0) {
          that.setData({
            sup_lists0: formatSupplyList(list, orig),
            loading0: false
          });
        }
        console.log(that.data.sup_lists2);
      },
      fail: function (res) {
        wx.showModal({
          title: '提示',
          content: '获取供应列表失败，请稍后再试',
          showCancel: false
        });
      },
      complete: function () {
        that.setData({ isLoading: false });
      }
    });
  }
});


//格式化供应数据
function formatSupplyList(list, orig) {
  var tempList = list.map(supply => {
    // supply.imgUrl = !!imgMap[supply.id]
    //   ? 'http://img.99114.com' + imgMap[supply.id].imgUrl
    //   : '../../image/noPhoto.jpg';
    supply.distance = mapUtil.getDistance(supply.latitude, supply.longitude, orig.latitude, orig.longitude);
    supply.minPrice = formatCent(supply.minPrice);
    supply.createTimeStr = formatDate(new Date(supply.createTime));
    return supply;
  });
  return tempList;
}