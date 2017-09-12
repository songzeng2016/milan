// pages/bookgoods/bookgoods.js
import { mapUtil } from '../../utils/mapUtil';
import { showTimeByDate } from '../../utils/util';
import { hideNickName, formatBigNum } from '../../utils/stringUtil';
import { auth } from '../../utils/auth';
import { domain } from '../../utils/domain';
import { Banner } from '../../components/deBanner/deBanner';    //轮播图组件
import { Comment } from '../../components/deComItem/deComItem';   //评论组件
import { Share } from '../../components/deShare/deShare';
import { ShareImg } from '../../components/deShareImg/deShareImg';

var app = getApp();
Page({
  data: {  
    query: {},
    userInfo:null, 
    bannerImgs: [],
    exhibition: {},
    commentCount: 0,
    commentLists: [],
    commentLoading: false,
    comment: {
      type: 1
    },
    //用户评论  默认的评论 字符数
    commentTxtCount: 256,
    isToLower: false,
    showShare: false,
    shareCloseSeconds: 3,
    isShareOpen:false, //分享组件中的参数
  },
  scrollToLowerFn: function () {
    var _this = this;
    this.setData({ isToLower: true });
    setTimeout(function () {
      _this.setData({ isToLower: false });
    }, 200);
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
    var _this = this;
    var exhibitionId = options.id;
    if (!exhibitionId) {
      wx.redirectTo({ url: '../goBack/goBack?type=exhibition' });
      return;
    }

    var userInfo = wx.getStorageSync('user_info');
    this.setData({ userInfo: userInfo });

    setTimeout(function () {
      var orig = app.globalData.position;
      var comment = _this.data.comment;
      //获取展厅信息
      wx.request({
        url: domain + '/exhibition/selectById2',
        data: { id: exhibitionId },
        method: 'GET',
        success: function (res) {
          var bannerImgs = [];
          var { status, msg, exhibition, user } = res.data;
          if (msg != 'success' || !exhibition) {
            wx.redirectTo({ url: '../goBack/goBack?type=exhibition' });
            return;
          }
          exhibition.viewCount = formatBigNum(exhibition.viewCount + 1);
          exhibition.distance = mapUtil.getDistance(exhibition.latitude, exhibition.longitude, orig.latitude, orig.longitude);
          _this.setData({ exhibition: exhibition, user: user });
          //初始化评论
          comment.userId = wx.getStorageSync('login_key').split("_")[2] || 0;
          comment.nickName = userInfo.nickName;
          comment.avatarUrl = userInfo.avatarUrl;
          comment.fkId = exhibition.id;
          _this.setData({ comment: comment });
          //格式化配图的url
          if (!!exhibition.imgList) {
            bannerImgs = exhibition.imgList.map(item => {
              var random = ~~(Math.random() * 5);
              if (random == 0) random = '';
              item.imgUrl = 'http://img' + random + '.99114.com' + item.imgUrl;
              item.cutImgUrl = domain + '/image/exhibition/' + item.id + '_750_750';
              return item;
            });
            _this.setData({ bannerImgs: bannerImgs || [] });
          }
        }
      });
      //获取评论信息
      wx.request({
        url: domain + '/usercomment/list',
        data: { pageSize: 5, type: 1, fkId: exhibitionId, status: 1 },
        method: 'GET',
        success: function (res) {
          var { msg, list, query } = res.data;
          list.forEach((item) => {
            item.nickName = hideNickName(item.nickName);
            item.createTime = showTimeByDate(new Date(item.createTime));
          });
          if (msg == 'success') {
            _this.setData({
              commentLists: list,
              commentCount: query.count
            });
          }
        }
      });
      //更新浏览量
      wx.request({
        url: domain + '/exhibition/updateview',
        data: { id: exhibitionId },
        method: 'GET',
        success: function (res) {
          if (res.data.status == 1) {
            console.log("update view count ok");
          }
        },
        fail: function () {
        }
      });//更新浏览量结束

    }, 500);
 //===================组件的调用==============================
    //轮播组件
    var banner = new Banner(this);
    banner.bindEvents();  

    // 评论组件
    var comment = new Comment(this);
    comment.bindEvents();   
    //分享组件
    var share = new Share(this);
    share.bindEvents();    //class中定义的方法 
    var shareImg = new ShareImg(this);
    shareImg.bindEvents(); 
  },
  
  //预约看货
  callme: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.exhibition.telephone
    });
  },
  //弹出评论编辑框
  triggerComtFn: function () {
    auth("userInfo",()=>{
      this.setData({ isPopOpen: true });
    });
  },
  //编写评论内容
  commentTxtFn: function (e) {
    var content = e.detail.value;
    var commentTxtLen = 256 - content.length;
    var comment = this.data.comment;
    comment.content = content;
    this.setData({ comment: comment });
    this.setData({
      commentTxtCount: commentTxtLen
    });
  },
  //关闭评论编辑框
  popClose: function () {
    var comment = this.data.comment;
    this.setData({
      isPopOpen: false,
      comment: comment
    });
  },
  popCancle: function () {
    var comment = this.data.comment;
    comment.content = '';
    this.setData({
      isPopOpen: false,
      comment: comment
    });
  },
  //提交评论
  commentSendFn: function (e) {
    console.log(this.data.commentLoading);
    if (this.data.commentLoading) {
      return false;
    }
    this.data.commentLoading = true;
    var content = e.detail.value.content;
    var that = this;
    var comment = that.data.comment;
    comment.content = content;
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
    wx.request({
      url: domain + '/usercomment/insert',
      data: comment,
      method: 'GET',
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
          var commentCount = that.data.commentCount;
          comment.id = data;
          comment.createTime = showTimeByDate(new Date());
          comment.nickName = hideNickName(comment.nickName);
          var _comment = {};
          _comment.content = comment.content;
          _comment.userId = comment.userId;
          _comment.id = comment.id;
          _comment.nickName = comment.nickName;
          _comment.createTime = comment.createTime;
          _comment.avatarUrl = comment.avatarUrl;
          _comment.fkId = comment.id;
          _comment.self = "self";
          that.data.commentLists.unshift(_comment);
          comment.content = '';
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
      },
      complete: function(){
        if (wx.hideLoading) {
          wx.hideLoading();
        }
        that.setData({ commentLoading: false});
      }
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
  //   var exhibition = this.data.exhibition;
  //   var url = domain + '/exhibition/shareimg?id=' + exhibition.id + "&t=" + new Date().getTime();
  //   wx.previewImage({
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
    var exhibitionId = this.data.exhibition.id;
    if (!exhibitionId) {
      return false;
    }
    var shareImgUrl = domain + '/exhibition/shareimg.png?id=' + exhibitionId + "&t=" + new Date().getTime();
    this.setData({ showShareImg: true, shareImgUrl: shareImgUrl });
  },
  toMapLocation: function(){
    var exhibition = this.data.exhibition;
    var latitude = exhibition.latitude;
    var longitude = exhibition.longitude;
    wx.openLocation({
      latitude: latitude, 
      longitude: longitude, 
      scale: 28, // 缩放比例
      name: exhibition.address || '', // 位置名
      address: exhibition.name // 地址的详细说明
    })
  },
  onShareAppMessage: function () {
    var exhibition = this.data.exhibition;
    return {
      title: "网库-" + exhibition.name + "O2O线下看货厅"
    }
  }
})