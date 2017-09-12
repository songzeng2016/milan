// pages/informLeaveMsg/informLeaveMsg.js
import { formatDate, timeDiff2, formatTime, showTimeByDate } from '../../utils/util';
import { mapUtil } from '../../utils/mapUtil';
import { hideNickName, formatBigNum } from '../../utils/stringUtil';
import { domain } from '../../utils/domain';
import { auth } from '../../utils/auth';
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //解决跳转5次以后 不能跳转的问题 默认是没有到尽头
    isNearToEnd: false,
    showing:true,
    commentTxtCount: 256,
    commentLoading: false,
    commentCount: 0,
    commentList: [],
    comment:{ type:5},
    informId:''

  },
  //留言内容字数控制
  commentTxtFn: function (e) {
    var content = e.detail.value;
    var comment = this.data.comment;
    var commentTxtLen = 256 - content.length;
    comment.content = content;
    comment.fkId = this.data.historyId;
    this.data.comment = comment;
    this.setData({
      commentTxtCount: commentTxtLen
    });
  },
  checkauth: function () {
    var comment = this.data.comment;
    // console.log(this);
    var userInfo = wx.getStorageSync('user_info')
    // console.log(121);
    comment.userId = userInfo.id;
    console.log( comment.userId)
    comment.nickName = userInfo.nickName;
    comment.avatarUrl = userInfo.avatarUrl;
    this.setData({
      popErrorMsg:"",
      comment: comment
    });
  },
 
 //空警告提示
  ohShitfadeOut() {
    var fadeOutTimeout = setTimeout(() => {
      this.setData({ popErrorMsg: '' });
      clearTimeout(fadeOutTimeout);
    }, 3000);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.informId=options.informId
    this.data.historyId  = options.historyId
    console.log(options)
    this.setData({ isNearToEnd: getCurrentPages().length >= 4 ? true : false });
  
  },
//下拉返回
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
  //确认发布
  commentSendFn: function (e) {
    auth("userInfo",()=>{
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
          isPopOpen: false,
          popErrorMsg: "发布的留言内容不能为空"
        });
        this.ohShitfadeOut();
        return false;
      }
      if (wx.showLoading) {
        wx.showLoading({
          title: '发送中'
        })
      }
      var _this = this;
      wx.request({
        url: domain + '/usercomment/insert',
        data: comment,
        method: 'GET',
        success: function (res) {
          var { msg, status, data } = res.data;
          if (msg == 'success') {
            comment.createTime = showTimeByDate(new Date());
            wx.showToast({
              title: '发布评论成功',
              icon: 'success',
              image: '../../image/icon_ok.png',
              mask: true,
              duration: 1000
            });
            wx.navigateBack({});
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
          that.setData({ commentLoading: false });
          if (wx.hideLoading) {
            wx.hideLoading();
          }
        }
      });
    })
  },

})