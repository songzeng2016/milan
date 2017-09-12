// pages/noticeList/noticeList.js
import { wk } from '../../utils/wk';
const App = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    noticeLists: [],
    //默认是第一页
    noticePageNo: 1,
    noticePageTotal: 1,
    //正在加载下一页
    isRefresh: false,
    //正在刷新
    isLoading: false,
    //到底了
    isOver: false,
    //公告初始加载数据的状态
    loading:true
   
  },
  
  //获取最新的 notice
  loadLastestNotice(e) {
    this.setData({
      isRefresh: true,
      noticePageNo: 1
    });
    getLastestNotice(this);
  },
  loadNextNoticePage(e) {
    var noticePageNo = this.data.noticePageNo;
    this.setData({
      isLoading: true,
      noticePageNo: noticePageNo + 1
    });
    getNoticePage(this);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //已经写到 onShow里面了
    //getNoticePage(this);
  },
  onShow:function(){
    
    this.setData({
      noticePageNo: 1
    });
    getLastestNotice(this);
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadLastestNotice();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.loadNextNoticePage();
  }
})

//获取 notice 列表分页
function getNoticePage(page) {
  var userInfo = wx.getStorageSync('user_info')
 
  var userId = userInfo.id;
  //var userId = 1001;   //2017假数据
  var {noticePageNo, noticeLists, noticePageTotal} = page.data;
  if (!noticePageNo) {
    return false;
  }
  //超过页码数则返回
  if (noticePageNo > noticePageTotal) {
    page.setData({
      isLoading: false
    })
    return false;
  }
  var param = {};

  param.userId = userId;
  param.currentPage = noticePageNo;
  param.pageSize =10;

  wk.get({
    url: '/notices/page',
    data: param,
    success: function (res) {
      wx.hideToast();
      var {list, status,msg, query} = res.data;
      var noticePageNo = query.currentPage;
      var pageCount = query.pageCount
      if (status == 1) {
        if ((!list || list.length <= 0) && noticePageNo > 1) {
          page.setData({ isOver: true });
          setTimeout(function () {
            page.setData({
              isOver: false
            });
          }, 1000)
          return false;
        }
        if (noticePageNo == 1) {
          list.forEach(item => {
            item.createTime = showTimeByDate(new Date(item.createTime))
          });

          page.setData({ noticeLists: list, noticePageTotal: pageCount });
        } else {
          list.forEach(item => {
            item.createTime = showTimeByDate(new Date(item.createTime))
          });
          page.setData({ noticeLists: noticeLists.concat(list) });
        }
      }  
    },
    fail: function () {
      wx.showModal({
        title: '提示',
        content: '获取公告列表失败，请稍后再试',
        showCancel: false
      });
    },
    complete: function () {
      page.setData({ isLoading: false });
    }
  });
}

//获取最新的 notice
function getLastestNotice(page) {
  var {noticePageNo, noticeLists, noticePageTotal} = page.data;
  var userInfo = wx.getStorageSync('user_info')
  var userId = userInfo.id;
  var userId = 1001;   //2017userId假数据
  if (!noticePageNo) {
    return false;
  }
  var param = {};

  param.userId = userId;
  param.currentPage = noticePageNo;
  param.pageSize =10;

  wk.get({
    url: '/notices/page',
    data: param,
    success: function (res) {
      wx.hideToast();
      console.log(res.data);
      let {list, status,msg, query} = res.data;
      let noticePageNo = query.currentPage;
      let pageCount = query.pageCount
      if (status==1) {
        list.forEach(item => {
          item.createTime = showTimeByDate(new Date(item.createTime))
        });
        page.setData({ noticeLists: list });
      }
    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        content: '获取公告列表失败，请稍后再试',
        showCancel: false
      });
    },
    complete: function () {
      page.setData({ 
        isRefresh: false,
        loading:false 
      });
      wx.stopPullDownRefresh();
    }
  });
}

//重置 utlis中的日期显示方式
function showTimeByDate(date) {
  var year = date.getFullYear();
  var month = date.getMonth();
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();

  var now = new Date();
  var _year = now.getFullYear()
  var _month = now.getMonth()
  var _day = now.getDate()
  var _hour = date.getHours();
  var _minute = date.getMinutes();

  if (year < _year) {
    return [year, month + 1, day].map(formatNumber).join('-') ;
  } else {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);

    var interval = (now.getTime() - date.getTime()) / (3600 * 1000 * 24);
    // console.log("时间差="+interval);
    if (interval > 1) {
      return [month + 1, day].map(formatNumber).join('-');
    } else if (interval <= 1 && interval > 0) {
      return "昨天 ";
    } else {
      return "今天 ";
    }
  }
}
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}