import { formatDate, timeDiff2, formatTime, showTimeByDate } from '../../utils/util';
import { mapUtil } from '../../utils/mapUtil';
import { hideNickName, formatBigNum } from '../../utils/stringUtil';
import { auth } from '../../utils/auth';
import { domain } from '../../utils/domain';
import { wk } from '../../utils/wk';
import { ShareImg } from '../../components/deShareImg/deShareImg';

//  导入组件
import { Comment } from '../../components/deComItem/deComItem';   //评论组件
import { Banner } from '../../components/deBanner/deBanner';    //轮播图组件
import { Share } from '../../components/deShare/deShare';
var app = getApp();
Page({
  data: {
    buy: null,
    bannerImgs: [],
    userInfo:null,
    //评论 数目
    commentCount: 0,
    query:{},
     //评论 列表
    commentLists: [],
    comment: {
      type: 3
    },
    //用户评论  默认的评论 字符数
    commentTxtCount: 256,
    buyList: [],
    buyQuery: {},
    isToLower: false,
    showShare: false,
    commentLoading:false,
    shareImg: '',
    shareCloseSeconds: 3,

    //附近 解决只能跳转5次 已经到尽头了
    isNearToEnd: false,
    isShareOpen: false,// 分享弹窗是否显示
    type: 'show'

  },
  scrollToLowerFn: function () {
    var _this = this;
    this.setData({ isToLower: true });
    setTimeout(function () {
      _this.setData({ isToLower: false });
    }, 1000);
  },
  checkauth: function () {
    var comment = this.data.comment;
    var userInfo = wx.getStorageSync('user_info')
    comment.userId = wx.getStorageSync('login_key').split("_")[2] || 0;
    comment.nickName = userInfo.nickName;
    comment.avatarUrl = userInfo.avatarUrl;
    this.setData({
      comment: comment
    });
  },
  onLoad: function (options) {
    this.setData({ isNearToEnd: getCurrentPages().length >= 4 ? true : false });

    wx.setNavigationBarTitle({
      title: '求购详情'
    });
    var that = this;
    var buyId = options.buyId;
    if (!buyId) {
      wx.redirectTo({ url: '../goBack/goBack?type=buy' });
      return;
    }
    var type = options.type;
    this.setData({ type: type });

    setTimeout(function () {
      var orig = app.globalData.position;
      var userInfo = wx.getStorageSync('user_info');
      that.setData({ userInfo: userInfo });

      var comment = that.data.comment;
      wk.get({
        url: '/buys/' + buyId,
        data: { id: buyId },
        success: function (res) {
          var { buy, imgList:bannerImgs, user, msg, now } = res.data;
          if (msg != 'success' || !buy) {
            wx.redirectTo({ url: '../goBack/goBack?type=buy' });
            return;
          }

          console.log(res.data);
          //初始化评论
          comment.userId = wx.getStorageSync('login_key').split("_")[2] || 0;
          comment.nickName = userInfo.nickName;
          comment.avatarUrl = userInfo.avatarUrl;
          comment.fkId = buy.id;
          that.setData({ comment: comment });

          buy.createTimeStr = formatDate(new Date(buy.createTime));
          buy.deadLineStr = formatDate(new Date(buy.deadLine));
          buy.timeDiff = timeDiff2(new Date(buy.deadLine), new Date(now));
          buy.distance = mapUtil.getDistance(buy.latitude, buy.longitude, orig.latitude, orig.longitude);
          buy.amountStr = buy.amount / 100;
          
          var bannerImgs = buy.imgList.map((item) => {
            item.cutImgUrl = !!(domain + '/image/buy/' + item.id + '_120_120') ? (domain + '/image/buy/' + item.id + '_750_750') : '../../image/noPhoto.jpg';
            return item;
          });
          console.log(bannerImgs)
          that.setData({
            buy: buy, bannerImgs: bannerImgs, user: user, now: now + 1000
          });
          //获取附近采购
          wk.get({
            url: '/buys/nearby',
            data: { latitude: buy.latitude, longitude: buy.longitude, isValid: 1, currentPage: 1, pageSize: 5, excludeId: buyId },
          
            success: function (res) {
              var { status, list, query, imgMap } = res.data;
              if (status == 1) {
                list.map((item) => {
                  item.imgUrl = !!(domain + '/image/buy/' + item.id + '_120_120') ? (domain + '/image/buy/' + item.id + '_120_120') : '../../image/noPhoto.jpg';  
                  item.distance = mapUtil.getDistance(item.latitude, item.longitude, orig.latitude, orig.longitude);
                  return item;
                });

                that.setData({ buyList: list, buyQuery: query });
                that.countDownList();
              }
            }
          });
          that.countDown();
        },
        fail: function () {
          // fail
        }
      });
      //获取评论信息
      wk.get({
        url: '/userComments/page',
        data: { pageSize: 5, type: 3, fkId: buyId, status: 1 },
        success: function (res) {
          var { msg, list, query } = res.data;
          list.forEach((item) => {
            item.nickName = hideNickName(item.nickName);
            item.createTime = showTimeByDate(new Date(item.createTime));
          });
          if (msg == 'success') {
            that.setData({
              commentLists: list,
              commentCount: query.count
            });
          }
        }
      });
    }, 500);
    //组件的调用==============================
    //评论组件
    var comment = new Comment(this); 
    comment.bindEvents();    
    //轮播组件
    var  banner = new Banner(this);
    banner.bindEvents();  
    //分享组件
    var share = new Share(this);
    share.bindEvents();    //class中定义的方法
    var shareImg = new ShareImg(this);
    shareImg.bindEvents(); 
  },
  onShow: function () {
    // 页面显示

  },
  callBuyer(e) {
    var telephone = this.data.user.telephone;
    wx.makePhoneCall({
      phoneNumber: telephone
    });
  },
  //详情倒计时
  countDown() {
    var that = this;
    var { buy } = this.data;
    if (buy.timeDiff != 0) {
      var interval = setInterval(function () {
        var now = that.data.now;
        var timeDiff = timeDiff2(new Date(buy.deadLine), new Date(now));
        buy.timeDiff = timeDiff;
        buy.deadLine = buy.deadLine - 1000;
        that.setData({ buy: buy });
        if (timeDiff <= 0) { //到时间了
          clearInterval(interval);
        }
      }, 1000);
    }
  },
  //附近倒计时
  countDownList() {
    var that = this;
    var { buyList } = this.data;
    var intervalList = [];
    var now = this.data.now;
    buyList.forEach((buy) => {
      if (buy.timeDiff != 0) {
        intervalList[buy.id] = setInterval(function () {
          var timeDiff = timeDiff2(new Date(buy.deadLine), new Date(now));
          buy.timeDiff = timeDiff;
          buy.deadLine = buy.deadLine - 1000;
          that.setData({ buyList: buyList });
          if (timeDiff <= 0) { //到时间了
            clearInterval(intervalList[buy.id]);
          }
        }, 1000);
      }
    });
  },
  //预约看货
  callme: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.buy.telephone
    });
  },
  //弹出评论编辑框
  triggerComtFn: function () {
    auth("userInfo", () => {
      this.setData({ isPopOpen: true });
    });
  },
  //编写评论内容
  commentTxtFn: function (e) {
    var content = e.detail.value;
    var comment = this.data.comment;
    var commentTxtLen=256 - content.length;
    comment.content = content;
    this.data.comment = comment;
    this.setData({
      commentTxtCount:commentTxtLen
    });
  },
  //关闭评论编辑框
  popCancle: function () {
    var comment = this.data.comment;
    this.setData({ 
      isPopOpen: false,
      comment: comment
     });
  },
  //点击空白处
  popClose: function () {
    var comment = this.data.comment;
    comment.content = '';
    this.setData({ 
      isPopOpen: false,
      comment: comment
    });
  },
  //提交评论
  commentSendFn: function (e) {
    if (this.data.commentLoading) {
      return false;
    }
    this.data.commentLoading = true;
    var userId = wx.getStorageSync("login_key").split("_")[2] || 0;
    var content = e.detail.value.content;
    var that = this;
    var comment = that.data.comment;
    comment.content = content;
    comment.userId = userId;
    if (!content) {
      that.setData({
        isPopOpen: false
      });
      wx.showToast({
        title: '评论内容不能为空',
        icon: 'loading',
        image: '../../image/icon_warn.png',
        mask: true,
        duration: 1000
      });
      return false;
    }
    if (wx.showLoading) {
      wx.showLoading({ title: '发送中' })
    }
    wk.post({
      url: '/userComments',
      data: comment,
      success: function (res) {
        var { msg, status, data, comment: _comment } = res.data;
        if (msg == 'success') {
          console.log(res.data);
          wx.showToast({
            title: '发布评论成功',
            icon: 'success',
            image: '../../image/icon_ok.png',
            mask: true,
            duration: 1000
          });
          var commentCount = that.data.commentCount;
          _comment.createTime = showTimeByDate(new Date());
          
          that.data.commentLists.unshift(_comment);
          comment.content = '';
          that.setData({
            commentCount: commentCount + 1,
            commentLists: that.data.commentLists,
            isPopOpen: false,
            comment: comment
          });
        } else {
          wx.showToast({
            title: '发布评论失败',
            icon: 'loading',
            image: '../../image/icon_fail.png',
            mask: true,
            duration: 1000
          });
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '发布评论失败',
          icon: 'loading',
          image: '../../image/icon_fail.png',
          mask: true,
          duration: 1000
        });
      },
      complete:function(){
        if (wx.hideLoading) {
          wx.hideLoading();
        }
        that.setData({ commentLoading: false });
      }
    });
  },
  genShareImg() {
    var buyId = this.data.buy.id;
    if (!buyId) {
      return false;
    }
    var shareImgUrl = domain + '/supplies/' + buyId + '/shareimg.png'
    this.setData({ showShareImg: true, shareImgUrl: shareImgUrl });
  },
  toMapLocation: function(){
    var buy = this.data.buy;
    var latitude = buy.latitude;
    var longitude = buy.longitude;
    wx.openLocation({
      latitude: latitude, 
      longitude: longitude, 
      scale: 28, // 缩放比例
      name: buy.address || '', // 位置名
      address: buy.title, // 地址的详细说明
      success: function(res){
        // success
      },
      fail: function(res) {
        // fail
      },
      complete: function(res) {
        // complete
      }
    })
  },
  toComplain: function () {
    if(auth()){
      complainBuy();
    }
  },
  complainBuy:function(){
    var buy = this.data.buy;
    var user = this.data.user;
    var complain = wx.getStorageSync('complain');
    if (complain.length > 0) {
      var now = new Date();
      var storeDateStr = complain.split("_")[0];
      var storeYear = storeDateStr.split("-")[0];
      var storeMonth = storeDateStr.split("-")[1];
      var storeDay = storeDateStr.split("-")[2];
      if (storeYear == now.getFullYear() && storeMonth == (now.getMonth() + 1) && storeDay == now.getDate()) {
        var num = parseInt(complain.split("_")[1]);
        if (num >= 5) {
          wx.showModal({
            title: '提示',
            content: '您今日举报次数已达5次，为防止恶意投诉，请明天再试',
            confirmText: '我知道了',
            showCancel: false,
            duration: 3000,
            success: function () {
              setTimeout(function () {
                wx.navigateBack();
              }, 2000);
            }
          })
          return false;
        }
      }
    }
    wx.navigateTo({
      url: '../report/report?fkId=' + buy.id + '&type=2&userId=' + user.id
    })
  },
  onShareAppMessage: function () {
    var buy = this.data.buy;
    return {
      title: "求购："+buy.title
    }
  }
});