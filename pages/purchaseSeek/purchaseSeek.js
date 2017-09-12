import { validater } from '../../utils/validater';
import { formatDate, timeDiff2 } from '../../utils/util';
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
    pruSearchHistory: [],
    showHistory: true,
    //显示取消按钮
    showCancle: false,
    //采购 列表数据
    pur_lists: [],
    //供应列表 筛选条件 默认 默认选中第一个
    purSortSelTxt: "",
    // 供应列表 记录选中元素的 id
    purSortSelId: "",
    purPageNo: 1,
    //供应列表 筛选条件 默认 一个也不选中
    purSortData: [
      { id: 100, name: '发布时间'},
      { id: 101, name: '浏览量' },
      { id: 102, name: '距离' },
      { id: 103, name: '倒计时' }
    ],
  },
  //点击取消
  cancelBtn(e) {
    wx.navigateBack({});
  },
  showHistory: function(){
    this.setData({ showHistory: true });
  },
  hideHistory: function(){
    this.setData({ showHistory: false });
  },
  //点击 返回到上一个层级
  goBackBtn: function () {
    wx.navigateBack({}); //默认返回一层
  },
  //下拉  刷新效果
  refreshFn: function () {
    var _this = this;
    _this.setData({
      isrefresh: true
    });
    // tip :后台人可以  在这里写请求成功之前 改变  isrefresh：false
    var page = {};
    page.pageSize = 5;
    page.currentPage = 1;
    page.isValid = 1;
    page.key = this.data.keyword;
    var orig = app.globalData.position;
    if (!!orig.latitude) {
      page.latitude = orig.latitude;
    }
    if (!!orig.longitude) {
      page.longitude = orig.longitude;
    }
    page.sort = this.data.purSortSelId;
    loadLatest(page, this);
  },
  //上拉  判断是否到 页面底部了
  toLowerFn: function (e) {
    var page = {};
    page.pageSize = 5;
    console.log(this.data);
    page.currentPage = this.data.purPageNo + 1;
    page.isValid = 1;
    page.key = this.data.keyword;
    var orig = app.globalData.position;
    if (!!orig.latitude) {
      page.latitude = orig.latitude;
    }
    if (!!orig.longitude) {
      page.longitude = orig.longitude;
    }
    page.sort = this.data.purSortSelId;
    loadNext(page, this);
  },
  showCancleFlag:function(){
    this.setData({ showCancle: true });
  },
  selectHistoryValue: function(e){
    var _this = this;
    setTimeout(function(){
      _this.setData({
        purSortSelTxt :e.target.dataset.history,
        keyword: e.target.dataset.history,
        showCancle: true
      });  
      var query = {};
      query.key = e.target.dataset.history;
      query.isValid = 1;
      var orig = app.globalData.position;
      if (!!orig.latitude) {
        query.latitude = orig.latitude;
      }
      if (!!orig.longitude) {
        query.longitude = orig.longitude;
      }
      query.currentPage = 1;
      query.pageSize = 5;
      query.sort = 100;
      _this.setData({
        purSortSelId:query.sort,
        purPageNo:1
      });
      searchPurchaseList(query,_this);
    },200);
  },
  //供应列表 搜索==================================
  // 供应 筛选条件  change value
  purSortSelFn: function (e) {
    var item = e.currentTarget.dataset.item;
    this.setData({
      purSortSelId: item.id,
      purPageNo:1
    });
    var query = {};
    query.key = this.data.keyword;
    query.isValid = 1;
    var orig = app.globalData.position;
    if (!!orig.latitude) {
      query.latitude = orig.latitude;
    }
    if (!!orig.longitude) {
      query.longitude = orig.longitude;
    }
    var select = item.id;
    query.sort = select;
    query.currentPage = 1;
    query.pageSize = 5;
    searchPurchaseList(query,this);
  },
  clearSearch: function(){
    this.setData({
      purSortSelTxt:'',
      showCancle:false
    });
  },
  searchPurchase(e) {
    var keyword = e.detail.value || e.target.dataset.keyword;
    if(!keyword){
      return false;
    }
    if(!validater.maxLength(keyword, 40)){
      wx.showToast({
        title: '搜索词长度不能超过20个字符',
        mask: true,
        icon: 'success',
        duration: 1000
      });
      return false;
    }
    var purchaseSearchHistory = this.data.purchaseSearchHistory || [];
    removeElement(purchaseSearchHistory, keyword);
    purchaseSearchHistory.unshift(keyword);
    purchaseSearchHistory = purchaseSearchHistory.slice(0,5);
    this.setData({ 
      purchaseSearchHistory: purchaseSearchHistory,
      keyword: keyword,
      showCancle:true
    });
    wx.setStorage({
      key: 'purchaseSearchHistory',
      data: purchaseSearchHistory.slice(0,5)
    });
    var query = {};
    query.key = keyword;
    query.isValid = 1;
    var orig = app.globalData.position;
    if (!!orig.latitude) {
      query.latitude = orig.latitude;
    }
    if (!!orig.longitude) {
      query.longitude = orig.longitude;
    }
    var select = this.data.purSortSelId;
    query.currentPage = 1;
    query.pageSize = 5;
    query.sort = 100;
    this.setData({
      purSortSelId:query.sort,
      purPageNo:1
    });
    searchPurchaseList(query,this);
  },
  onLoad:function(options){
    var that = this;
    wx.getStorage({
      key: 'purchaseSearchHistory',
      success: function(res){
        if(res.data){
          that.setData({ purchaseSearchHistory: res.data });
        }
      }
    });
  },
  backToList: function(){
    wx.switchTab({
      url: '../queryList/queryList'
    });
  },
  onPullDownRefresh() {
    var showHistory = this.data.showHistory;
    if (showHistory){
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
function removeElement(arr, ele){
  for(var i = 0; i < arr.length; i++){
    if(arr[i] == ele){
      arr.splice(i,1);
      break;
    }
  }

}
function searchPurchaseList(page,that){
  that.setData({
    isLoading:true
  });
    wx.request({
      url: domain + '/buys/search',
      data: page,
      method: 'GET', 
      success: function(res){
        if(res.data.status ==1){
          var { list, orig } = res.data;
          var orig = app.globalData.position;
          var pur_lists = that.data.pur_lists; 
          if (!list || list.length == 0) {
            that.setData({ isSortWay: false });
          }else{
            that.setData({ isSortWay: true });
          }
          if(page.currentPage ==1){
            that.setData({ pur_lists : formatPurchaseList(list,orig) });
          }else{
            that.setData({ pur_lists : formatPurchaseList(sup_lists.concat(list),orig) });
          }
        }
      },
      fail: function(res) {
        // fail
      },
      complete: function(){
        that.setData({ 
          showHistory: false,
          isLoading:false
        });
      }
    });
}
function loadNext(page,that){
  wx.request({
    url: domain + '/buys/search',
    data: page,
    method: 'GET',
    success: function(res){
       if(res.data.status ==1){
          var { list, orig } = res.data;
          var orig = app.globalData.position;
          if(!!list &&list.length > 0){
            var pur_lists = that.data.pur_lists;
            
            that.setData({ 
              pur_lists: formatPurchaseList(pur_lists.concat(list),orig) ,
              purPageNo: page.currentPage +1
            });
          }else{
            that.setData({isToLower:true});
          }
        }
    },
    fail: function(res) {
      // fail
    },
    complete: function(res) {
      that.setData({ isrefresh:false });
    }
  });
}
function loadLatest(page,that){
  wx.request({
    url: domain + '/buys/search',
    data: page,
    method: 'GET', 
    success: function(res){
       if(res.data.status ==1){
          var { list, orig } = res.data;
          var orig = app.globalData.position;
          var pur_lists = that.data.pur_lists;
          that.setData({ 
            pur_lists : formatPurchaseList(list,orig) ,
            purPageNo : 1
          });
        }
    },
    fail: function(res) {
      // fail
    },
    complete: function(res) {
      that.setData({ isrefresh:false });
      wx.stopPullDownRefresh();
    }
  });
}
//格式化供应数据
function formatPurchaseList(list, orig) {
  var tempList = list.map(buy => {
  
    buy.createTimeStr = formatDate(new Date(buy.createTime));
    buy.timeDiff = timeDiff2(new Date(buy.deadLine), new Date());
    buy.deadLineStr = formatDate(new Date(buy.deadLine));
    buy.distance = mapUtil.getDistance(buy.latitude, buy.longitude, orig.latitude, orig.longitude);
    return buy;
  });
  return tempList;
}