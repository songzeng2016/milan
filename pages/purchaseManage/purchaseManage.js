import { formatDate, timeDiff2, formatTime } from '../../utils/util';
import { mapUtil } from '../../utils/mapUtil';
import { domain } from '../../utils/domain';
import { wk } from '../../utils/wk';
//  组件的引入
import { Switch } from '../../components/switch/switch.js';  //顶部切换组件

var app = getApp();
Page({
  data: {
    switch_selNum: 0,
    switch_selTypes: ["采购中", "未通过", "待审核", "待上架"],
    swicth_selTitles:[],

    page0No: 1,
    page1No: 1,
    page2No: 1,
    page3No: 1,
    //采购中列表
    buy_list_1: [],
    //待上架
    buy_list_2: [],
    //待审核采购列表
    buy_list_0: [],
    //未通过
    buy_list_3: [],
    //正在刷新
    isLoading: false,
    isOver0: false,
    isOver1: false,
    isOver2: false,
    isOver3: false,

    //各个页面加载中状态
    loading0:true,
    loading1:true,
    loading2:true,
    loading3:true


  },
  //关闭
  updatePurchaseDown: function (e) {
    var that = this;
    that.setData({
      isOver0: false,
      isOver1: false,
      isOver2: false,
      isOver3: false
    });
    var id = e.target.dataset.id;
    var status = e.target.dataset.status;
    wk.put({
      url:'/buys/'+id,
      data: { id: id, status: status },
      loadingTitle:'提交中',
      success: function (res) {
        that.onShow();
      },
      
     
    });
  },
  //上架
  updatePurchaseShow: function (e) {
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

    wk.get({
      url: '/buys/publishcount',
      data: { userId: userId },
      success: function (res) {
        var { status, msg, showCount, waitCount } = res.data;
        if (status != 1) {
          return false;
        }
        if (showCount >= 5) {
          wx.showModal({
            title: '提示',
            content: '已有5条上架信息，需下架一条采购信息后，才可上架其他信息',
            showCancel: false,
            confirmText: '我知道了'
          });
        } else {
          wk.put({
            url: '/buys/'+id,
            data: { id: id, status: status },
            loadingTitle: '提交中',
            success: function (res) {
              that.onShow();
            }
           
          });
        }
      }
    });
  },
  //删除
  deletePurchase: function (e) {
    var id = e.target.dataset.id;
    var that = this;
    that.setData({
      isOver0:false,
      isOver1:false,
      isOver2:false,
      isOver3:false
    });
    wx.showModal({
      title: '提示',
      content: '是否确定删除该采购单？',
      success: function (res) {
        if (res.confirm) {
          wk.put({
            url:'/buys/'+id,
            data: { id: id, status: 5 },
            loadingTitle: '提交中',
            success: function (res) {
              that.onShow();
            }
          });
        }
      }
    });
  },
  //跳转到发布供应
  publishPurchase(e) {
    //由于跳转页面是底部tab页，无法传参，所以通过缓存参数实现
    wx.setStorageSync('publishType', 'purchase');
    wx.switchTab({ url: '../publish/publish' });
  },
  republish(e) {
    var id = e.target.dataset.id;
    var userId = this.data.userId;
    if(!!id){
      wk.get({
        url: '/buys/publishcount',
        data: { userId: userId },
        success(res) {
          var { status, msg, count } = res.data;
          if(status != 1){
            return false;
          }
          if(count >= 20){
            wx.showModal({
              title: '提示',
              content: '已有20条上架信息，需下架一条采购信息后，才可上架其他信息',
              showCancel: false,
              confirmText: '我知道了'
            });
          }else{
            wx.navigateTo({
              url: '../purchaseUpdate/purchaseUpdate?id=' + id,
            });
          }
        }
      });
    }
  },
  loadNextBuyPage(e) {
    var status = e.target.dataset.status;
    
    if(status == 0 && (this.data.isOver0 || this.data.isLoading)) {
      return false;
    }
    if(status == 1 && (this.data.isOver1 || this.data.isLoading)) {
      return false;
    }
    if(status == 2 && (this.data.isOver2 || this.data.isLoading)) {
      return false;
    }
    if(status == 3 && (this.data.isOver3 || this.data.isLoading)) {
      return false;
    }
    this.setData({ isLoading: true });
    this.getBuyPage(status);
  },
  onLoad: function (options) {
    //顶部的切换组件
    var switchs = new Switch(this);
    switchs.bindEvents();

    
    this.setData({ sup_SelNum: options.index || 0 });

    var orig = app.globalData.position;
    this.setData({ orig: orig });

    var selectIndex = options.type || 0;
    this.setData({ selectIndex: selectIndex });

    var userId = wx.getStorageSync("login_key").split("_")[2] || 0;
    this.setData({ userId: userId });

    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        var winW = res.windowWidth;
        var winH = res.windowHeight;
        // that.setData({ swiperH: winH - 44 });
      }
    });
  },
  onShow() {
    this.referencePage(0);
    this.referencePage(1);
    this.referencePage(2);
    this.referencePage(3);
    this.setData({
      page0No: 2,
      page1No: 2,
      page2No: 2,
      page3No: 2,
      isOver0: false,
      isOver1: false,
      isOver2: false,
      isOver3: false
    });
  },
  //采购分页
  getBuyPage(status) {
    var that = this;
    var { userId, page0No, page1No, page2No, page3No, buy_list_1, buy_list_0, buy_list_2, buy_list_3, orig } = this.data;
    var pageNo = "";
    if (status == 1) {
      pageNo = page1No;
    } else if (status == 2) {
      pageNo = page2No;
    } else if (status == 3) {
      pageNo = page3No;
    } else if (status == 0) {
      pageNo = page0No;
    }
    if (!pageNo) {
      return false;
    }

    wk.get({
      url: '/buys/page',
      data: { currentPage: pageNo, pageSize: 10, status: status, userId: userId, sort: 100 },
      success: function (res) {
        var { msg, list } = res.data;
        if (msg != 'success') {
          return false;
        }
        if ((!list || list.length <= 0)) {
          if(status ==1){
            that.setData({ isOver1: true });
          }else if(status ==2){
            that.setData({ isOver2: true });
          }else if(status==3){
            that.setData({ isOver3: true });
          }else if(status ==0){
            that.setData({ isOver0: true });
          }
          return false;
        }
        if (status == 1) {
          that.setData({ page1No: pageNo + 1 });
          that.setData({ buy_list_1: buy_list_1.concat(formatBuyList(list, orig)) });
        } else if (status == 2) {
          that.setData({ page2No: pageNo + 1 });
          that.setData({ buy_list_2: buy_list_2.concat(formatBuyList(list, orig)) });
        } else if (status == 3) {
          that.setData({ page3No: pageNo + 1 });
          that.setData({ buy_list_3: buy_list_3.concat(formatBuyList(list, orig)) });
        } else if (status == 0) {
          that.setData({ page0No: pageNo + 1 });
          that.setData({ buy_list_0: buy_list_0.concat(formatBuyList(list, orig)) });
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
        that.setData({ isLoading: false });
      }
    });
  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
  //刷新
  referencePage(status) {
    var that = this;
    var pageNo = 1;
    var { userId, page0No, page1No, page2No, page3No, orig } = this.data;
    wk.get({
      url: '/buys/page',
      data: { currentPage: pageNo, pageSize: 10, status: status, userId: userId,  sort: 100 },
      success: function (res) {
        var { msg, list } = res.data;
        if (msg != 'success') {
          return false;
        }

        if (status == 1) {
          that.setData({ 
            buy_list_1: formatBuyList(list, orig),
            loading1:false
          });
        } else if (status == 2) {
          that.setData({ 
            buy_list_2: formatBuyList(list, orig),
            loading2:false 
          });
        } else if (status == 3) {
          that.setData({ 
            buy_list_3: formatBuyList(list, orig),
            loading3:false
          });
        } else if (status == 0) {
          that.setData({ 
            buy_list_0: formatBuyList(list, orig),
            loading0:false
          });
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
        that.setData({ isLoading: false });
      }
    });
  }
});

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