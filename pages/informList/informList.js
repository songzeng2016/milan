// pages/informList/informList.js
import { domain } from '../../utils/domain';
import { auth } from '../../utils/auth';
const App = getApp()
//var getDateName = App.getDateName;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    informLists: [],
    //默认是第一页
    informPageNo: 1,
    informPageTotal:1,
    //正在加载下一页
    isRefresh: false,
    //正在刷新
    isLoading: false,
    //到底了
    isOver: false,

    initLoading: true

  },
  inform_removeFn: function (e) {
    var _this = this;
    var curId = e.target.dataset.id;
    var informLists = this.data.informLists;
    var userInfo = wx.getStorageSync('user_info')
    var userId = userInfo.id;

    wx.showModal({
      title: '提示',
      content: '是否确定删除该通知？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: domain + '/inform/delete',
            data: { informId: curId, userId: userId},
            method: 'GET',
            success: function (res) {
              console.log(res.data);
              var { statusCode } = res.data;
              if (statusCode == 200) {
                informLists = informLists.filter((item) => {
                  return item.id != curId;
                });
               
                _this.setData({
                  informLists: informLists
                });
                wx.showToast({
                  title: '群通知已删除',
                  icon: 'success',
                  image: '../../image/icon_del.png',
                  mask: true,
                  duration: 1000
                });
              } else {
                wx.showToast({
                  title: '群通知失败',
                  icon: 'loading',
                  image: '../../image/icon_fail.png',
                  mask: true,
                  duration: 1000
                });
              }
            },
            fail: function (res) {
              wx.showToast({
                title: '删除群通知失败',
                icon: 'loading',
                image: '../../image/icon_fail.png',
                mask: true,
                duration: 1000
              });
            }
          });
        }
      }
    });

    this.setData({
      informLists: newLists
    });
  },
  //移动事件
  touchS: function (e) {  // touchstart
    let startX = App.Touches.getClientX(e)
    startX && this.setData({ startX });


  },
  touchM: function (e) {  // touchmove
    let informLists = App.Touches.touchM(e, this.data.informLists, this.data.startX)
    informLists && this.setData({ informLists })

  },
  touchE: function (e) {  // touchend
    const width = 205  // 定义操作列表宽度
    let informLists = App.Touches.touchE(e, this.data.informLists, this.data.startX, width)
    informLists && this.setData({ informLists })
  },
  //获取最新的供应 
  loadLastestInform(e) {
    this.setData({
      isRefresh: true,
      informPageNo: 1
    });
    getLastestInform(this);
  },
  loadNextInformPage(e) {
    var informPageNo = this.data.informPageNo;
    this.setData({
      isLoading: true,
      informPageNo: informPageNo + 1
    });
    getInformPage(this);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //写到onShow中
    //getInformPage(this);
  },
  onShow:function(){
    this.setData({
      informPageNo: 1
    });
    getLastestInform(this);
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadLastestInform();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.loadNextInformPage();
  },
  publishConfirm:function(){
    auth("userInfo", toPublishPage)
  }
})
//跳转页面
function toPublishPage() {
  wx.navigateTo({
    url: '../informPublish/informPublish',
  })
}
//获取 inform 列表分页
function getInformPage(page) {
  var userInfo = wx.getStorageSync('user_info')
  var userId = userInfo.id;
  var {informPageNo, informLists, informPageTatal}=page.data;
  if (!informPageNo) {
    return false;
  }
  //超过页码数则返回
  if (informPageNo > informPageTatal) {
    page.setData({
      isLoading: false
    })
    return false;
  }
  var param = {};

  param.userId = userId;
  param.page = informPageNo;
  param.pageSize = 10;
 
  wx.request({
    url: domain + '/inform/list',
    data: param,
    method: 'POST',
    header: {
      "Content-Type": "application/x-www-form-urlencoded"
    }, // 设置请求的 header
    success: function (res) {
      wx.hideToast();
      let {data: list, statusCode, page: informPageNo,pageCount}=res.data;
      if (statusCode !=200){
        return false;
      }
      if ((!list || list.length <= 0) && informPageNo>1 ){
        page.setData({ isOver: true });
        setTimeout(function () {
          page.setData({
            isOver: false
          });
        }, 1000)
        return false;
      }
      
      if (informPageNo == 1) {
        list.forEach(item=>{
          item.createTime = showTimeByDate(new Date(item.createTime))
        });
        
        page.setData({ informLists: list, informPageTatal: pageCount });
      } else {
        list.forEach(item => {
          item.createTime = showTimeByDate(new Date(item.createTime))
        });
        page.setData({ informLists: informLists.concat(list) });
      }

      console.log(res.data);
    },
    fail: function () {
      wx.showModal({
        title: '提示',
        content: '获取群通知列表失败，请稍后再试',
        showCancel: false
      });
    },
    complete: function () {
      page.setData({ isLoading: false });
    }
  });
}

//获取最新的inform
function getLastestInform(page) {
  var {informPageNo, informLists, informPageTatal} = page.data; 
  var userInfo = wx.getStorageSync('user_info')
  var userId = userInfo.id;

  if (!informPageNo) {
    return false;
  }
  var param = {};
  
  param.userId = userId;
  param.page = informPageNo;
  param.pageSize = 10;

  wx.request({
    url: domain + '/inform/list',
    data: param,
    method: 'GET',
    success: function (res) {
      wx.hideToast();
      let {data: list, statusCode, page: informPageNo, pageCount} = res.data;
      if (statusCode != 200) {
        return false;
      }
      list.forEach(item => {
        item.createTime = showTimeByDate(new Date(item.createTime))
      });
      page.setData({ informLists: list});

    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        content: '获取群通知列表失败，请稍后再试',
        showCancel: false
      });
    },
    complete: function () {
      page.setData({ 
        isRefresh: false,
        initLoading: false
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
    return [year, month + 1, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':');
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
      return [month + 1, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':');
    } else if (interval <= 1 && interval > 0) {
      return "昨天 " ;
    } else {
      return "今天 ";
    }
  }
}
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}