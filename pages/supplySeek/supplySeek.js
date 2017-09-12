import { validater } from '../../utils/validater';
import { mapUtil } from '../../utils/mapUtil';
import { formatCent } from '../../utils/moneyUtil';
import { domain } from '../../utils/domain';
var app = getApp();
Page({
  data: {
    //判断 是否在刷新
    isrefresh: false,
    //判断 是否已经到底部
    isToLower: false,
    //判断 是否显示 排序方式
    isSortWay: true,
    //供应 列表 是否图文显示 默认 图文显示 true
    isSupImgTxt: true,
    searchHistory: [],
    showHistory: true,
    sup_lists: [],
    //显示取消按钮
    showCancle: false,
    //供应列表 筛选条件 默认 默认选中第一个
    supSortSelTxt: "",
    // 供应列表 记录选中元素的 id
    supSortSelId: "",
    supplyPageNo: 1,
    //供应列表 筛选条件 默认 一个也不选中
    supSortData: [
      { id: 100, name: '距离' },
      { id: 101, name: '浏览量' },
      { id: 102, name: '发布时间' },
      { id: 103, name: '价格' }
    ],
  },
  //点击取消
  cancelBtn(e) {
    wx.navigateBack({});
  },
  showHistory: function () {
    this.setData({ showHistory: true });
  },
  hideHistory: function () {
    this.setData({ showHistory: false });
  },
  //下拉  刷新效果
  refreshFn: function () {
    var _this = this;
    this.setData({ isrefresh: true });
    var page = {};
    page.pageSize = 5;
    page.currentPage = 1;
    page.status = 1;
    page.key = this.data.keyword;
    var orig = this.data.orig;;
    if (!!orig.latitude) {
      page.latitude = orig.latitude;
    }
    if (!!orig.longitude) {
      page.longitude = orig.longitude;
    }
    page.sort = this.data.supSortSelId;
    loadLatest(page, this);
  },
  //上拉  判断是否到 页面底部了
  toLowerFn: function (e) {
    var page = {};
    page.pageSize = 5;
    page.currentPage = this.data.supplyPageNo + 1;
    page.status = 1;
    page.key = this.data.keyword;
    var orig = this.data.orig;
    if (!!orig.latitude) {
      page.latitude = orig.latitude;
    }
    if (!!orig.longitude) {
      page.longitude = orig.longitude;
    }
    page.sort = this.data.supSortSelId;
    loadNext(page, this);
  },
  selectHistoryValue: function (e) {
    var _this = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
//successBegin        
        var latitude = res.latitude;
        var longitude = res.longitude;
        var orig = { latitude: latitude, longitude: longitude};
        _this.setData({
          orig: orig
        })
        setTimeout(function () {
          _this.setData({
            supSortSelTxt: e.target.dataset.history,
            keyword: e.target.dataset.history,
            showCancle: true
          });
          var query = {};
          query.key = e.target.dataset.history;
          query.status = 1;
          query.latitude = orig.latitude;
          query.longitude = orig.longitude;
          query.currentPage = 1;
          query.pageSize = 5;
          query.sort = 100;
          _this.setData({
            supSortSelId: query.sort,
            supplyPageNo: 1
          });
          searchSupplyList(query, _this);
        }, 200);

//success End
      }
    })

   
    
  },
  //供应列表 搜索==================================
  // 供应  点击 右侧切换显示方式 图文 非图文
  supShowModeFn: function () {
    var isSupImgTxt = !this.data.isSupImgTxt;
    this.setData({ isSupImgTxt: isSupImgTxt });
  },
  // 供应 筛选条件  change value
  supSortSelFn: function (e) {
    var item = e.currentTarget.dataset.item;
    this.setData({
      supSortSelId: item.id,
      supplyPageNo: 1
    });
    var query = {};
    query.key = this.data.keyword;
    query.status = 1;
   
    var select = item.id;
    query.sort = select;
    query.currentPage = 1;
    query.pageSize = 5;
    searchSupplyList(query, this);
  },
  clearSearch: function () {
    this.setData({
      supSortSelTxt: '',
      showCancle: false
    });
  },
  showCancleFlag: function () {
    this.setData({ showCancle: true });
  },
  searchSupply(e) {
    var keyword = e.detail.value || e.target.dataset.keyword;
    if (!keyword) {
      return false;
    }
    if (!validater.maxLength(keyword, 40)) {
      wx.showToast({
        title: '搜索词长度不能超过20个字符',
        mask: true,
        icon: 'success',
        duration: 1000
      });
      return false;
    }
    var searchHistory = this.data.searchHistory || [];
    removeElement(searchHistory, keyword);
    searchHistory.unshift(keyword);
    searchHistory = searchHistory.slice(0, 5);
    this.setData({
      searchHistory: searchHistory,
      keyword: keyword,
      showCancle: true
    });
    wx.setStorage({
      key: 'supplySearchHistory',
      data: searchHistory.slice(0, 5)
    });
    var query = {};
    query.key = keyword;
    query.status = 1;
    if (!!orig.latitude) {
      query.latitude = orig.latitude;
    }
    if (!!orig.longitude) {
      query.longitude = orig.longitude;
    }
    var select = this.data.supSortSelId;
    query.currentPage = 1;
    query.pageSize = 5;
    query.sort = 100;
    this.setData({
      supSortSelId: query.sort,
      supplyPageNo: 1
    });
    searchSupplyList(query, this);
  },
  onLoad: function (options) {
    var that = this;
    wx.getStorage({
      key: 'supplySearchHistory',
      success: function (res) {
        if (res.data) {
          that.setData({ searchHistory: res.data });
        }
      }
    });
  },
  backToList: function () {
    wx.switchTab({
      url: '../queryList/queryList'
    })
  },
  onPullDownRefresh() {
    var showHistory = this.data.showHistory;
    if (showHistory) {
      wx.stopPullDownRefresh();
      return false;
    }
    this.refreshFn();
  },
  onReachBottom() {
    var showHistory = this.data.showHistory;
    if (showHistory) {
      wx.stopPullDownRefresh();
      return false;
    }
    this.toLowerFn();
  }
});
//清除重复元素
function removeElement(arr, ele) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == ele) {
      arr.splice(i, 1);
      break;
    }
  }
}
function searchSupplyList(page, that) {
  that.setData({ loading:true});
  wx.getLocation({
    type: 'wgs84',
    success: function (res) {
      var latitude = res.latitude
      var longitude = res.longitude
      var speed = res.speed
      var orig = { latitude: latitude, longitude: longitude};
      that.setData({
        orig: orig
      });  
      wx.request({
        url: domain + '/supplies/search',
        data: page,
        method: 'GET',
        success: function (res) {
          if (res.data.status == 1) {
            var { list } = res.data;
            var sup_lists = that.data.sup_lists;
            if (!list || list.length == 0) {
              that.setData({
                isSortWay: false
              });
            } else {
              that.setData({
                isSortWay: true
              });
            }
            if (page.currentPage == 1) {
              that.setData({ sup_lists: formatSupplyList(list, orig) });
            } else {
              that.setData({ sup_lists: formatSupplyList(sup_lists.concat(list), orig) });
            }
          }
        },
        complete: function () {
          that.setData({
            showHistory: false,
            loading: false
          });
        }
      });

      //request End

    }
  })

 
}
function loadNext(page, that) {
  wx.getLocation({
    type: 'wgs84',
    success: function (res) {
      var latitude = res.latitude
      var longitude = res.longitude
      var speed = res.speed
      var orig = { latitude: latitude, longitude: longitude };
      wx.request({
        url: domain + '/supplies/search',
        data: page,
        method: 'GET',
        success: function (res) {
          if (res.data.status == 1) {
            var { list } = res.data;
            if (!!list && list.length > 0) {
              var sup_lists = that.data.sup_lists;
              that.setData({
                sup_lists: formatSupplyList(sup_lists.concat(list), orig),
                supplyPageNo: page.currentPage + 1
              });
            } else {
              that.setData({ isToLower: true });
            }
          }
        },
        fail: function (res) {
          // fail
        },
        complete: function (res) {
          that.setData({ isrefresh: false });
        }
      });

    }
  });
 


}
function loadLatest(page, that) {
  wx.getLocation({
    type: 'wgs84',
    success: function (res) {
      var latitude = res.latitude
      var longitude = res.longitude
      var speed = res.speed
      var orig = { latitude: latitude, longitude: longitude };
      wx.request({
        url: domain + '/supplies/search',
        data: page,
        method: 'GET',
        success: function (res) {
          if (res.data.status == 1) {
            var { list} = res.data;
            var sup_lists = that.data.sup_lists;
            that.setData({
              sup_lists: formatSupplyList(list, orig),
              supplyPageNo: 1
            });
          }
        },
        fail: function (res) {
          // fail
        },
        complete: function (res) {
          that.setData({ isrefresh: false });
          wx.stopPullDownRefresh();
        }
      });
    }
  });
  
}
//格式化供应数据
function formatSupplyList(list, orig) {
  var tempList = list.map(supply => {
    supply.imgUrl = !!(domain + '/image/supply/' + supply.id + '_120_120') ? (domain + '/image/supply/' + supply.id + '_120_120') : '../../image/noPhoto.jpg';
    supply.distance = mapUtil.getDistance(supply.latitude, supply.longitude, orig.latitude, orig.longitude);
    supply.minPriceStr = formatCent(supply.minPrice);
    return supply;
  });
  return tempList;
}