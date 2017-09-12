import { formatTime, showTimeByDate, timeDiff3, formatWeek } from '../../utils/util';
import { formatBigNum } from '../../utils/stringUtil';
import { mapUtil } from '../../utils/mapUtil';
import { formatCent } from '../../utils/moneyUtil';
import { hideNickName } from '../../utils/stringUtil';
import { auth } from '../../utils/auth';
// import { domain } from '../../utils/domain';
import { Banner } from '../../components/deBanner/deBanner';    //轮播图组件
import { Comment } from '../../components/deComItem/deComItem';
import { Share } from '../../components/deShare/deShare';
import { ShareImg } from '../../components/deShareImg/deShareImg';
import { wk } from '../../utils/wk';

var app = getApp();
var validater = app.validater;
Page({
  data: {
    bannerImgs: [],
    activity: {},
    activityImg:[],
    imgList: [],
    commentCount: 0,
    commentLists: [],
    query: {},
    commentTxtCount: 256,
    commentLoading: false,
    activityList: [],
    activityQuery: {},
    isToLower: false,
    comment: {
      type: 4
    },
    showMore: false,
    showJoin: false,
    showShare: false,
    shareCloseSeconds: 3,
    isJoined: false,
    errorMsg: '',
    form: {},
    isPopOpen: false,
    isToLower: false,
    isShareOpen: false,//分享弹窗是否显示 组件中的参数
  },
  bindFormData(e) {
    var key = e.target.dataset.key;
    var value = e.detail.value;
    var form = this.data.form;
    form[key] = value;
    this.setData({ form: form });
  },
  //author sw
  ohShitfadeOut() {
    var fadeOutTimeout = setTimeout(() => {
      this.setData({ errorMsg: '' });
      clearTimeout(fadeOutTimeout);
    }, 3000);
  },
  //预览图片
  previewImgList(e) {
    var bannerImgs = this.data.bannerImgs;
    if (!bannerImgs || bannerImgs.length <= 0) {
      return false;
    }
    var urls = bannerImgs.map(item => { return item.imgUrl });
    wk.previewImage({
      urls: urls
    });
  },
  //切换显示更多
  switchShowMore: function (event) {
    var showMore = this.data.showMore;
    this.setData({ showMore: !showMore });
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
  joinActivity() {
    var { activity, isJoined, isSign } = this.data;
    console.log(this.data)
    if (activity.timeStatus == 1) { //活动预热
      console.log(" //活动预热")
      wk.navigateTo({
        url: '../activityEnroll/activityEnroll?activityId=' + activity.id,
      });
      return;
    }
    if (activity.timeStatus == 2 && isSign){ //活动进行中已签到
    console.log("进行")
      wk.navigateTo({
        url: '../activitySign/activitySign?type=show&activityId=' + activity.id,
      });
      return;
    } else if (isJoined) { //活动进行中未签到已报名
      wk.navigateTo({
        url: '../activityEnroll/activityEnroll?activityId=' + activity.id,
      });
      return;
    }
    if (activity.timeStatus == 3 && isSign) { //活动结束已签到
      wk.navigateTo({
        url: '../activitySign/activitySign?type=show&activityId=' + activity.id,
      })
      return;
    } else if (isJoined) {  //活动结束未签到已报名
      wk.navigateTo({
        url: '../activityEnroll/activityEnroll?activityId=' + activity.id,
      });
    }
    return;
  },
  onShow() {
    var orig = app.globalData.position;
    var comment = this.data.comment;
    var activityId = this.data.activity.id;
    // var activityId = 2302;
    console.log(this.data)
    // var id = 2302;
    // var fkId = 2601;
    // var userId = 2402;
    var userInfo = this.data.userInfo;
    //获取活动详情
    wk.get({
   
      url:  '/activities/'+activityId,
      data: { type: "show" },
      method: 'GET',
      success: (res) => {
        var { activity, imgList: now, user, status, msg } = res.data;
        // console.log(res.data)
        if (msg != 'success' || !activity) {
          wk.redirectTo({ url: '../goBack/goBack?type=activity' });
          return;
        }
        
        activity.startTimeStr = formatTime(new Date(activity.startTime)).substring(0, 16)
          .replace(' ', ' ' + formatWeek(new Date(activity.startTime)) + ' ');
        activity.endTimeStr = formatTime(new Date(activity.endTime)).substring(0, 16)
          .replace(' ', ' ' + formatWeek(new Date(activity.endTime)) + ' ');
        activity.timeDiff = timeDiff3(new Date(activity.startTime), new Date());
        activity.isOver = timeDiff3(new Date(activity.endTime), new Date()) == 0;
        activity.viewCount = formatBigNum(activity.viewCount);
        var orig = app.globalData.position;
        activity.distance = mapUtil.getDistance(activity.latitude, activity.longitude, orig.latitude, orig.longitude);
        // activity.joinCount = count;
        activity.sponsors = !!activity.sponsors ? activity.sponsors.split(',') : [];
        activity.undertakers = !!activity.undertakers ? activity.undertakers.split(',') : [];

     
        var urlList=[];
        for (var i in activity.imgList) {
          urlList.push({ imgUrl: 'http://img.99114.com' + activity.imgList[i].imgUrl }); //往空数组push便利的图片
        }
      
        activity.imgList = urlList;  

        //初始化评论
        var comment = this.data.comment;
        comment.userId = wx.getStorageSync('login_key').split("_")[2] || 0;
        comment.nickName = userInfo.nickName;
        comment.avatarUrl = userInfo.avatarUrl;
        comment.fkId = activity.id;
        this.setData({
          activity: activity, user: user, now: now + 1000
        });
        this.countDown();
      },
      fail: function () {
        // fail
      }
    });
    //获取评论信息
    wk.get({
      url:   '/userComments/page',
      data: { pageSize: 5, type: 4, fkId: activityId, status: 1 },
      method: 'GET',
      success: (res) => {
        var { msg, list, query } = res.data;
        // console.log(res)
        list.forEach((item) => {
          item.nickName = hideNickName(item.nickName);
          item.createTime = showTimeByDate(new Date(item.createTime));
        });
        if (msg == 'success') {
          // console.log(query.count)
          this.setData({
            commentLists: list,
            commentCount: query.count
          });
        }
      }
    });
    //获取报名人数
    wk.get({
      url: '/activityjoins/count' ,
      data: { activityId: activityId} ,
      method:'GET',
      success:(res) => {
        console.log(222)
        var {msg, query, count, status} = res.data;
        if (msg != 'success') {
          return false;
        }
        // console.log(count)
        this.setData({ joinCount: count})
      }

    });
    //底部报名
    wk.get({
      url:   '/activityjoins/query',
      data: { activityId: activityId, userId: wx.getStorageSync("login_key").split("_")[2] || 0 },
      method: 'GET',
      success: (res) => {
        // var { status, msg, join } = res.data;
        var { list, msg, query, status } = res.data;
        console.log(list.length)
        // this.setData({ isJoined: !!join && !!join.id });
        this.setData({ isJoined: list.length > 0 });
        this.setData({ joinCount: list.length });
      }
    });
    //底部签到
    wk.get({
      url:   '/activitysigns/query',
      data: { activityId: activityId, userId: wx.getStorageSync("login_key").split("_")[2] || 0  },
      method: 'GET',
      success: (res) => {
        var { status, msg, isSign } = res.data;
        this.setData({ isSign: isSign });
      }
    });
  },
  onLoad: function (options) {
    var that = this;
    var activityId = options.activityId;
   
    var type = options.type;
    if (!activityId) {
      wk.redirectTo({ url: '../goBack/goBack?type=activity' });
      return;
    }
   
    var userInfo = wx.getStorageSync('user_info');
    this.setData({ userInfo: userInfo, activity: { id: activityId } });

    var userId = wx.getStorageSync("login_key").split("_")[2] || 0;
    this.setData({ userId: userId });
    // console.log(activityId)

    // ===========组件调用
    //轮播组件
    var banner = new Banner(this);
    banner.bindEvents();
    var share = new Share(this);
    share.bindEvents();
    var comment = new Comment(this);
    comment.bindEvents();
    var shareImg = new ShareImg(this);
    shareImg.bindEvents(); 
  },
  //详情倒计时
  countDown() {
    var that = this;
    var { activity } = this.data;
    if (activity.timeDiff != 0) {
      var interval = setInterval(function () {
        var now = that.data.now;
        var timeDiff = timeDiff3(new Date(activity.startTime), new Date(now));
        activity.timeDiff = timeDiff;
        activity.endTime = activity.endTime - 1000;
        that.setData({ activity: activity });
        if (timeDiff <= 0) { //到时间了
          clearInterval(interval);
        }
      }, 1000);
    }
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
    comment.content = content;
    this.data.comment = comment;

    var commentTxtLen = 256 - content.length;
    this.setData({
      commentTxtCount: commentTxtLen
    });
  },
  //关闭评论编辑框
  popClose: function () {
    var comment = this.data.comment;
    comment.content = '';
    this.setData({
      isPopOpen: false,
      comment: comment
    });
  },
  //点击屏幕外区域隐藏输入框
  popCancle: function () {
    var comment = this.data.comment;
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
    var that = this;
    setTimeout(function () {
      var comment = that.data.comment;
      if (!comment || !comment.content) {
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
        method: 'post',
        success: function (res) {
          var { msg, status, data } = res.data;
          if (msg == 'success') {
            wx.showToast({
              title: '发布评论成功',
              icon: 'success',
              image: '../../image/icon_ok.png',
              mask: true,
              duration: 1000
            });
            // console.log(res)
            comment.createTime = showTimeByDate(new Date());
            var commentCount = that.data.commentCount;
            comment.id = data;
            comment.nickName = hideNickName(comment.nickName);
            var _comment = {};
            _comment.content = comment.content;
            _comment.userId = comment.userId;
            _comment.id = comment.id;
            _comment.nickName = comment.nickName;
            _comment.avatarUrl = comment.avatarUrl;
            _comment.createTime = comment.createTime;
            _comment.fkId = comment.id;
            _comment.self = "self";
            that.data.commentLists.unshift(_comment);
            comment.content = '';
            // console.log(comment)
            that.setData({
              comment: comment,
              commentCount: commentCount + 1,
              commentLists: that.data.commentLists,
              isPopOpen: false
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
        }, complete: function () {
          if (wx.hideLoading) {
            wx.hideLoading();
          }
          that.setData({ commentLoading: false });
        }
      });
    }, 10);

  },
  //删除评论
  // commentDelFn: function (e) {
  //   var _this = this;
  //   var id = e.target.dataset.id;
  //   var commentLists = this.data.commentLists;

  //   wk.showModal({
  //     title: '提示',
  //     content: '是否确定删除该评论？',
  //     success: function (res) {
  //       if (res.confirm) {
  //         wk.request({
  //           url: domain + '/usercomment/delete',
  //           data: { id: id },
  //           method: 'GET',
  //           success: function (res) {
  //             var { msg, data, status } = res.data;
  //             if (msg == 'success') {
  //               commentLists = commentLists.filter((item) => {
  //                 return item.id != id;
  //               });
  //               var commentCount = _this.data.commentCount;
  //               _this.setData({
  //                 commentLists: commentLists,
  //                 commentCount: commentCount - 1
  //               });
  //               wk.showToast({
  //                 title: '评论已删除',
  //                 icon: 'success',
  //                 image: '../../image/icon_del.png',
  //                 mask: true,
  //                 duration: 1000
  //               });
  //             } else {
  //               wk.showToast({
  //                 title: '删除评论失败',
  //                 icon: 'loading',
  //                 image: '../../image/icon_fail.png',
  //                 mask: true,
  //                 duration: 1000
  //               });
  //             }
  //           },
  //           fail: function (res) {
  //             wk.showToast({
  //               title: '删除评论失败',
  //               icon: 'loading',
  //               image: '../../image/icon_fail.png',
  //               mask: true,
  //               duration: 1000
  //             });
  //           }
  //         });
  //       }
  //     }
  //   });
  // },
  //判断是否到底
  scrollToLowerFn: function (e) {
    // console.log(e)
    var _this = this;
    this.setData({
      isToLower: true
    });
  },
  // showShareInterval: null,
  // showShareImg() {
  //   var that = this;
  //   this.setData({ showShare: true });
  //   this.showShareInterval = setInterval(function () {
  //     var shareCloseSeconds = that.data.shareCloseSeconds;
  //     if (shareCloseSeconds > 0) {
  //       that.setData({ shareCloseSeconds: shareCloseSeconds - 1 });
  //     } else {
  //       that.previewShareImg();
  //       clearInterval(that.showShareInterval);
  //     }
  //   }, 1000);
  // },
  // previewShareImg() {
  //   this.closeShareImg();
  //   var activity = this.data.activity;
  //   var url = domain + '/activity/shareimg?id=' + activity.id + "&t=" + new Date().getTime();
  //   wk.previewImage({
  //     urls: [url]
  //   });
  // },
  // closeShareImg() {
  //   clearInterval(this.showShareInterval);
  //   this.setData({
  //     showShare: false,
  //     shareCloseSeconds: 3
  //   });
  // },
  genShareImg() {
    var activityId = this.data.activity.id;
    if (!activityId) {
      return false;
    }
    var shareImgUrl =  + '/activity/shareimg.png?id=' + activityId + "&t=" + new Date().getTime();
    this.setData({ showShareImg: true, shareImgUrl: shareImgUrl });
  },
  toMapLocation: function () {
    var activity = this.data.activity;
    var latitude = activity.latitude;
    var longitude = activity.longitude;
    wk.openLocation({
      latitude: latitude,
      longitude: longitude,
      scale: 28, // 缩放比例
      name: activity.address || '', // 位置名
      address: activity.title // 地址的详细说明
    })
  },
  onShareAppMessage: function () {
    var activity = this.data.activity;
    return {
      title: activity.title
    }
  }
});
