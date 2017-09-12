import { formatDate, timeDiff, timeDiff2, formatTime, formatDateWithWeek } from '../../utils/util';
import { mapUtil } from '../../utils/mapUtil';
import { formatCent } from '../../utils/moneyUtil';
import { domain } from '../../utils/domain';

//组件的引入
import { Switch } from '../../components/switch/switch.js';
var app = getApp();
Page({
  data: {
    switch_selNum: 0,
    switch_selTypes: ["供应列表", "求购列表", "活动列表"],
    swicth_selTitles: ['批发平台', '求购平台','活动平台'],
    supplyList: [],
    buyList: [],
    activityList: [],
    supplyPageNo: 1,
    buyPageNo: 1,
    activityPageNo: 1,
    //正在加载下一页
    isRefresh: false,
    //正在刷新
    isLoading: false,
    //到底了
    isOver1: false,
    isOver2: false,
    isOver3: false,

    //加载中的状态
    supplyLoading:true,
    buyLoading: true,
    activityLoading: true,
    
    supSortSelect: "按照距离排序",
    // 供应列表 记录选中元素的 id
    supSortSelectId: 100,
    //供应列表 判断的排序 模拟下拉 是否显示
    isSupSortOpen: false,
    //供应列表 筛选条件 默认选中 第一个
    supSortData: [
      { id: 100, name: '按照距离排序', checked: 'true' },
      { id: 101, name: '按浏览量排序' },
      { id: 102, name: '按发布时间排序' },
      { id: 103, name: '按价格排序' }
    ],
    isPurSortOpen: false,
    purSortSelect: "按照发布时间排序",
    // 供应列表 记录选中元素的 id
    purSortSelectId: 100,
    //供应列表 筛选条件 默认选中 第一个
    purSortData: [
      { id: 100, name: '按照发布时间排序', checked: 'true' },
      { id: 101, name: '按浏览量排序' },
      { id: 102, name: '按距离排序' },
      { id: 103, name: '按倒计时排序' }
    ],
    //供应 列表 是否图文显示 默认 图文显示 true
    isSupImgTxt: true,
  },
  // 供应 筛选条件  change value
  supSortChangeFn: function (e) {
    let val = e.detail.value;
    this.setData({
      supSortSelect: val
    });
    //console.log('radio发生change事件，携带value值为：', e.detail.value)
  },
  // 供应  筛选条件 展开收起
  supSortTapFn: function (e) {
    this.setData({
      isSupSortOpen: !this.data.isSupSortOpen
    });
  },

  // 供应  筛选条件 change item
  supSortChangeItemFn: function (e) {
    //必须 用currentTarget 
    var curItem = e.currentTarget.dataset.item;
    //console.log(curItem);
    this.setData({
      supSortSelectId: curItem.id,
      supplyPageNo:1,
      isOver1: false
    });
    getSupplyPage(this);
  },
  // 供应  点击 右侧切换显示方式 图文 非图文
  supShowModeFn: function () {
    var isSupImgTxt = !this.data.isSupImgTxt;
    this.setData({
      isSupImgTxt: isSupImgTxt
    });
  },
  // 采购  筛选条件 展开收起
  purSortTapFn: function (e) {
    this.setData({
      isPurSortOpen: !this.data.isPurSortOpen
    });
  },
  // 采购 筛选条件  change value
  purSortChangeFn: function (e) {
    let val = e.detail.value;
    this.setData({
      purSortSelect: val
    });
    //console.log('radio发生change事件，携带value值为：', e.detail.value)
  },
  // 采购  筛选条件 change item
  purSortChangeItemFn: function (e) {
    //必须 用currentTarget 
    var curItem = e.currentTarget.dataset.item;
    //console.log(curItem);
    this.setData({
      purSortSelectId: curItem.id,
      buyPageNo:1,
      isOver2: false
    });
    getBuyPage(this);
  },
  loadNextSupplyPage(e) {
    if (this.data.isLoading || this.data.isOver1) {
      return false;
    }
    var supplyPageNo = this.data.supplyPageNo;
    this.setData({ 
      isLoading: true,
      supplyPageNo: supplyPageNo + 1
    });
    getSupplyPage(this);
  },
  loadNextBuyPage(e) {
    if (this.data.isLoading || this.data.isOver2) {
      return false;
    }
    var buyPageNo = this.data.buyPageNo;
    this.setData({ 
      isLoading: true,
      buyPageNo: buyPageNo + 1
     });
    getBuyPage(this);
  },
  loadNextActivityPage(e) {
    if (this.data.isLoading || this.data.isOver3){
      return false;
    }
    var activityPageNo = this.data.activityPageNo;
    this.setData({ 
      isLoading: true,
      activityPageNo : activityPageNo +1
    });
    getActivityPage(this);
  },
  //获取最新的供应 暂时没用
  loadLastestSupply(e) {
    this.setData({
      isOver1:false,
      isRefresh: true,
      supplyPageNo: 1
    });
    getLastestSupply(this);
  },
  loadLastestBuy(e) {
    this.setData({
      isOver2:false,
      isRefresh: true,
      buyPageNo: 1
    });
    getLastestBuy(this);
  },
  loadLastestActivity(e) {
    this.setData({
      isOver3:false,
      isRefresh: true,
      activityPageNo: 1
    });
    getLatestActivity(this);
  },
  clearKeyword(e) {
   
  },
  onLoad: function (options) {
    var _this=this;
    var switch_selNum = options.type || 0;
    this.setData({ switch_selNum: switch_selNum });
    //switch组件的调用
    var switchs = new Switch(this);
    switchs.bindEvents();
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        var orig = { latitude: latitude, longitude: longitude};
        _this.setData({ orig: orig });
        getBuyPage(_this);
        getActivityPage(_this);
        getSupplyPage(_this);
      }
    })
    
  },
  onShareAppMessage: function () {
    var switch_selNum = this.data.switch_selNum || 0;
    var tabList = this.data.tabList;
    var title = tabList[switch_selNum];
    return {
      title: title,
      path: '/page/queryList/queryList?type=' + switch_selNum
    }
  },
  onPullDownRefresh() {
    var switch_selNum = this.data.switch_selNum;
    if (switch_selNum == 0) {
      this.loadLastestSupply();
    } else if (switch_selNum == 1) {
      this.loadLastestBuy();
    } else if (switch_selNum == 2) {
      this.loadLastestActivity();
    }
  },
  onReachBottom() {
    var switch_selNum = this.data.switch_selNum;
    if (switch_selNum == 0){
      this.loadNextSupplyPage();
    } else if (switch_selNum == 1){
      this.loadNextBuyPage();
    } else if (switch_selNum == 2){
      this.loadNextActivityPage();
    }
  }
});
//获取供应列表分页
function getSupplyPage(page) {
  var { supplyPageNo, supplyList, orig } = page.data;
  if (!supplyPageNo) {
    return false;
  }
  var param = {};
  param.currentPage = supplyPageNo;
  param.pageSize = 10;
  if (!!orig.latitude) {
    param.latitude = orig.latitude;
  }
  if (!!orig.longitude) {
    param.longitude = orig.longitude;
  }
  param.status = 1;
  param.sort = page.data.supSortSelectId;
  wx.request({
    url: domain + '/supplies/page',
    data: param,
    method: 'GET',
    success: function (res) {
      wx.hideToast();
      var { msg, list, status } = res.data;
      if (msg != 'success') {
        return false;
      }
      if ((!list || list.length <= 0) && supplyPageNo > 1) {
        page.setData({ isOver1: true });
        return false;
      }
      if(supplyPageNo ==1){
        page.setData({ supplyList: formatSupplyList(list, orig) });
      }else{
        page.setData({ supplyList: supplyList.concat(formatSupplyList(list, orig)) });
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
      page.setData({ 
        isLoading: false,
        supplyLoading:false
      });
    }
  });
}
//获取采购列表分页
function getBuyPage(page) {
  var { buyPageNo, buyList,orig } = page.data;
  if (!buyPageNo) {
    return false;
  }
  var query = {};
  query.currentPage = buyPageNo;
  query.isValid = 1;
  query.pageSize = 10;
  query.sort = page.data.purSortSelectId;
  if (!!orig.latitude){
    query.latitude = orig.latitude;
  }
  if (!!orig.longitude){
    query.longitude = orig.longitude;
  }
  wx.request({
    url: domain + '/buys/page',
    data: query,
    method: 'GET',
    success: function (res) {
      wx.hideToast();
      var { msg, list } = res.data;
      if (msg != 'success') {
        return false;
      }
      if ((!list || list.length <= 0) && buyPageNo > 1 ) {
        page.setData({ isOver2: true });
        return false;
      }
      if(buyPageNo ==1){
        page.setData({ buyList: formatBuyList(list, orig) });
      }else{
        page.setData({ buyList: buyList.concat(formatBuyList(list, orig)) });
      }
      
    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        content: '获取采购列表失败，请稍后再试',
        showCancel: false
      });
    },
    complete: function () {
      page.setData({ 
        isLoading: false,
        buyLoading: false 
      });
    }
  });
}
//获取活动列表分页
function getActivityPage(page) {
  var { activityPageNo, activityList, orig, imgMap} = page.data;
  if (!activityPageNo) {
    return false;
  }

  var query = {};
  query.currentPage = activityPageNo;
  //query.status = 1;
  query.pageSize = 10;
  if (!!orig.latitude) {
    query.latitude = orig.latitude;
  }
  if (!!orig.longitude) {
    query.longitude = orig.longitude;
  }
  wx.request({
    url: domain + '/activities/page',
    data: query,
    method: 'GET',
    success: function (res) {
      wx.hideToast();
      var { msg, list, status } = res.data;
      if (msg != 'success') {
        return false;
      }
      if ((!list || list.length <= 0) && activityPageNo > 1) {
        page.setData({ isOver3: true });
        return false;
      }
      if (activityPageNo == 1) {
        page.setData({ activityList: formatActivityList(list, orig) });
      } else {
        page.setData({ activityList: activityList.concat(formatActivityList(list, orig)) });
      }
      activityList = activityList.concat(formatActivityList(list, orig))
      page.setData({ activityList: activityList });
    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        content: '获取活动列表失败，请稍后再试',
        showCancel: false
      });
    },
    complete: function () {
      page.setData({ 
        isLoading: false,
        activityLoading: false
      });
    }
  });
}
//获取最新的供应
function getLastestSupply(page) {
  var { supplyPageNo, supplyList, orig } = page.data;
  if (!supplyPageNo) {
    return false;
  }
  var param = {};
  param.currentPage = supplyPageNo;
  param.pageSize = 10;
  if (!!orig.latitude) {
    param.latitude = orig.latitude;
  }
  if (!!orig.longitude) {
    param.longitude = orig.longitude;
  }
  param.status = 1;
  param.sort = page.data.supSortSelectId;
  wx.request({
    url: domain + '/supply/selectDistancePage',
    data: param,
    method: 'GET',
    success: function (res) {
      wx.hideToast();
      var { msg, list, status } = res.data;
      if (msg != 'success') {
        return false;
      }
      page.setData({ supplyList:formatSupplyList(list, orig) });
    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        content: '获取供应列表失败，请稍后再试',
        showCancel: false
      });
    },
    complete: function () {
      page.setData({ isRefresh: false });
      wx.stopPullDownRefresh();
    }
  });
}
//获取最新的采购单
function getLastestBuy(page) {
  var { buyPageNo, buyList, orig } = page.data;
  if (!buyPageNo) {
    return false;
  }
  wx.request({
    url: domain + '/buy/selectByQuery',
    data: { currentPage: buyPageNo, isValid: 1, sort: page.data.purSortSelectId,pageSize: 10 ,latitude: orig.latitude, longitude: orig.longitude},
    method: 'GET',
    success: function (res) {
      wx.hideToast();
      var { msg, list } = res.data;
      if (msg != 'success') {
        return false;
      }
      page.setData({ buyList: formatBuyList(list, orig) });
    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        content: '获取最新采购列表失败，请稍后再试',
        showCancel: false
      });
    },
    complete: function () {
      page.setData({ isRefresh: false });
      wx.stopPullDownRefresh();
    }
  });
}
//最新活动列表
function getLatestActivity(page) {
  var { activityPageNo, activityList, orig, imgMap} = page.data;
  if (!activityPageNo) {
    return false;
  }
  wx.request({
    url: domain + '/activity/selectByQuery',
    data: { currentPage: activityPageNo, pageSize: 10, latitude: orig.latitude, longitude: orig.longitude},
    method: 'GET',
    success: function (res) {
      wx.hideToast();
      var { msg, list } = res.data;
      if (msg != 'success') {
        return false;
      }
      activityList = formatActivityList(list, orig);
      page.setData({ activityList: activityList });
    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        content: '刷新活动列表失败，请稍后再试',
        showCancel: false
      });
    },
    complete: function () {
      page.setData({ isRefresh: false });
      wx.stopPullDownRefresh();
    }
  });
}

//格式化供应数据
function formatSupplyList(list, orig) {
  var tempList = list.map(supply => {
    supply.imgUrl = !!(domain + '/image/supply/' + supply.id + '_120_120') ? (domain + '/image/supply/' + supply.id + '_120_120') : '../../image/noPhoto.jpg';
    supply.distance = mapUtil.getDistance(supply.latitude, supply.longitude, orig.latitude, orig.longitude);
    supply.minPrice = formatCent(supply.minPrice);
    return supply;
  });
  return tempList;
}
//格式化采购数据
function formatBuyList(list, orig) {
  var tempList = list.map(buy => {
    buy.createTimeStr = formatDate(new Date(buy.createTime));
    buy.timeDiff = timeDiff2(new Date(buy.deadLine), new Date());
    buy.deadLineStr = formatDate(new Date(buy.deadLine));
    buy.distance = mapUtil.getDistance(buy.latitude, buy.longitude, orig.latitude, orig.longitude);
    return buy;
  });
  return tempList;
}
//格式化活动数据
function formatActivityList(list, orig) {
  var tempList = list.map(activity => {
    activity.imgUrl = !!(domain + '/image/activity/' + activity.id + '_120_120') ? (domain + '/image/activity/' + activity.id + '_120_120') : '../../image/noPhoto.jpg';

    activity.startTimeStr = formatDateWithWeek(new Date(activity.startTime));
    activity.distance = mapUtil.getDistance(activity.latitude, activity.longitude, orig.latitude, orig.longitude);
    return activity;
  });
  return tempList;
}