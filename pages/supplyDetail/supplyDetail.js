import { formatDate, timeDiff, formatTime, showTimeByDate } from '../../utils/util';
import { formatBigNum, hideNickName } from '../../utils/stringUtil';
import { mapUtil } from '../../utils/mapUtil';
import { formatCent } from '../../utils/moneyUtil';
import { auth } from '../../utils/auth';
import { domain } from '../../utils/domain';
import { wk } from '../../utils/wk';
import { Share } from '../../components/deShare/deShare';
import { ShareImg } from '../../components/deShareImg/deShareImg';

// 导入组件
import { Comment } from '../../components/deComItem/deComItem';   //评论组件
import { Banner } from '../../components/deBanner/deBanner';    //轮播图组件

var app = getApp();
Page({
  data: {
    supply: null,
    isSupImgTxt: true,  //附近是图文显示
    bannerImgs: [],
    commentLists: [],
    query: {},
    //评论 数目
    commentCount: 0,
    //用户评论  默认的评论 字符数
    commentTxtCount: 256,
    supplyList: [],
    commentLoading: false,
    supplyQuery: {
      currentPage: 1,
      pageSize: 5
    },
    isAttrOpen: false,
    isToLower: false,
    //解决跳转5次以后 不能跳转的问题 默认是没有到尽头
    isNearToEnd: false,
    showShare: false,
    shareImg: '',
    shareCloseSeconds: 3,
    comment: {
      type: 2
    },
    isShareOpen: false,// 分享弹窗是否显示
    type: 'show'
  },
  checkauth: function () {

    var comment = this.data.comment;
    var userInfo = wx.getStorageSync('user_info')
    comment.userId = wx.getStorageSync('login_key').split("_")[2] || 0;
    comment.nickName = userInfo.nickName;
    comment.avatarUrl = userInfo.avatarUrl;
    this.setData({ comment: comment });
  },
  onLoad: function (options) {
    this.setData({ isNearToEnd: getCurrentPages().length >= 4 ? true : false });

    wx.setNavigationBarTitle({
      title: '供应详情'
    });
    var { supplyId, type = 'show' } = options;
    this.setData({
      supplyId: supplyId,
      type: type
    });
    var shareImg = new ShareImg(this);
    shareImg.bindEvents();
  },
  onShow: function () {
    //组件的调用==============================
    //评论组件
    var comment = new Comment(this);
    comment.bindEvents();
    //轮播组件
    var banner = new Banner(this);
    banner.bindEvents();
    //分享组件
    var share = new Share(this);
    share.bindEvents();    //class中定义的方法
    //=====================================
    var that = this;
    var type = this.data.type;
    setTimeout(function () {
      var supplyId = that.data.supplyId;
      if (!supplyId) {
        wx.redirectTo({ url: '../goBack/goBack?type=supply' });
        return;
      }

      var orig = app.globalData.position;
      var userInfo = wx.getStorageSync('user_info');
      that.setData({ userInfo: userInfo, supplyId: supplyId });
      //获取商品详情
      wx.request({
        url: domain + '/supplies/' + supplyId,
        data: { id: supplyId },
        method: 'GET',
        success: function (res) {
          var { supply, user, msg } = res.data;
          console.log("商品详情：");
          console.log(res.data);
          if (msg != 'success' || !supply) {
            wx.redirectTo({ url: '../goBack/goBack?type=supply' });
            return;
          }
          supply.createTimeStr = formatDate(new Date(supply.createTime));
          supply.viewCount = formatBigNum(supply.viewCount);
          supply.distance = mapUtil.getDistance(supply.latitude, supply.longitude, orig.latitude, orig.longitude);
          supply.minPriceStr = formatCent(supply.minPrice);
          var bannerImgs = supply.imgList.map((item)=>{
            item.cutImgUrl = !!(domain + '/image/supply/' + item.id  + '_120_120') ? (domain + '/image/supply/' + item.id + '_750_750') : '../../image/noPhoto.jpg';
            return item;
          });
          console.log(bannerImgs )
          try {
            supply.attrLists = JSON.parse(supply.properties);
            if (JSON.parse(supply.properties).length > 3) {
              supply.shotattrLists = JSON.parse(supply.properties).slice(0, 3);
            } else {
              supply.shotattrLists = JSON.parse(supply.properties);
            }
          } catch (e) {
            supply.attrLists = [];
          }
          //supply.viewCount = supply.viewCount + 1;
          //初始化评论
          var comment = that.data.comment;
          var userInfo = wx.getStorageSync('user_info')
          comment.userId = wx.getStorageSync('login_key').split("_")[2] || 0;
          comment.nickName = userInfo.nickName;
          comment.avatarUrl = userInfo.avatarUrl;
          comment.fkId = supply.id;
          comment.self = "self";
          
          that.setData({
            supply: supply, bannerImgs: bannerImgs , user: user
          });
          that.nearBypage(that);
        },
        fail: function () {
        }
      });//获取商品详情结束
      //获取用户评论信息
      wx.request({
        url: domain + '/userComments/page',
        data: { currentPage: 1, pageSize: 5, type: 2, fkId: supplyId },
        method: 'GET',
        success: function (res) {
          var data = res.data;
          var commentLists = data.list;
          var userId = wx.getStorageSync('login_key').split("_")[2] || 0;
          for (var i = 0; i < commentLists.length; i++) {
            commentLists[i].createTime = showTimeByDate(new Date(commentLists[i].createTime));
            commentLists[i].nickName = hideNickName(commentLists[i].nickName);
            if (userId == commentLists[i].userId) {
              commentLists[i].self = "self";
            }
          }
          that.setData({
            commentLists: commentLists,
            query: data.query
          });
        },
        fail: function () {
        }
      });//获取用户评论结束
      //获取附近供应信息列表
    }, 500);
  },
  callSeller(e) {
    var telephone = this.data.user.telephone;
    wx.makePhoneCall({
      phoneNumber: telephone
    });
  },
  onShareAppMessage: function () {
    var supply = this.data.supply;
    return {
      title: "供应：" + supply.title
    }
  },
  //属性弹窗 --开启
  wakeUpAttrFn: function (e) {
    this.setData({
      isAttrOpen: true
    })
  },
  //属性弹窗 --关闭
  closeAttrFn: function (e) {
    this.setData({
      isAttrOpen: false
    })
  },
  scrollToLowerFn: function () {
    var _this = this;
    this.setData({ isToLower: true });
    setTimeout(function () {
      _this.setData({ isToLower: false });
    }, 1000);
  },
  nearBypage: function (_this) {
    var supply = _this.data.supply;
    var supplyQuery = _this.data.supplyQuery;
    var supplyList = _this.data.supplyList;
    var supplyId = _this.data.supplyId;

    if (!!supply.latitude && !!supply.longitude) {
      wx.request({
        url: domain + '/supplies/nearby',
        data: { latitude: supply.latitude, longitude: supply.longitude, status: 1, currentPage: supplyQuery.currentPage, pageSize: supplyQuery.pageSize, excludeId: supplyId},
        method: 'GET',
        success: function (res) {
          var status = res.data.status;
          if (status == 1) {
            console.log(res.data);
            var list = res.data.list;
            var query = res.data.query;
            list.map((item)=>{
              item.imgUrl = !!(domain + '/image/supply/' + item.id + '_120_120') ? (domain + '/image/supply/' + item.id + '_120_120') : '../../image/noPhoto.jpg';
              item.minPrice = formatCent(item.minPrice);
              return item;
            });
          
            if (!list || list.length == 0) {
              _this.setData({
                isToLower: true
              });
              setTimeout(function () {
                _this.setData({
                  isToLower: false
                });
              }, 1000);
              return false;
            }
            supplyList = supplyList.concat(list);
            supplyQuery.count = query.count;
            supplyQuery.distance = query.distance;
            _this.setData({
              supplyList: supplyList,
              supplyQuery: supplyQuery
            });
          }
        },
        fail: function () {
          // fail
        }
      })
    }
  },

  triggerComtFn: function () {
    auth("userInfo", () => {
      this.setData({ isPopOpen: true });
    });
  },
  //编写评论内容
  commentTxtFn: function (e) {
    var content = e.detail.value;
    var comment = this.data.comment;
    var commentTxtLen = 256 - content.length;
    comment.content = content;
    this.data.comment = comment;

    this.setData({
      commentTxtCount: commentTxtLen
    });
  },
  //关闭窗口
  popClose: function () {
    var comment = this.data.comment;
    comment.content = ''
    this.setData({
      isPopOpen: false,
      comment: comment
    });
  },
  //取消，需要保存已经输入的文本
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
    wk.post({
      url:'/userComments',
      data: comment,
      success: function (res) {
        var { msg, status, data,comment: _comment } = res.data;
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
          var query = that.data.query;
          query.count = query.count + 1;
          that.setData({
            commentCount: commentCount + 1,
            commentLists: that.data.commentLists,
            isPopOpen: false,
            comment: comment,
            query: query
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
  },
  genShareImg() {
    var supplyId = this.data.supply.id;
    if (!supplyId) {
      return false;
    }
    var shareImgUrl = domain + '/supplies/' + supplyId +'/shareimg.png'

    this.setData({ showShareImg: true, shareImgUrl: shareImgUrl });
  },
  toMapLocation: function () {
    var supply = this.data.supply;
    var latitude = supply.latitude;
    var longitude = supply.longitude;
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      scale: 28, // 缩放比例
      name: supply.address || '', // 位置名
      address: supply.title, // 地址的详细说明
      success: function (res) {
        // success
      },
      fail: function (res) {
        // fail
      },
      complete: function (res) {
        // complete
      }
    });
  },
  toComplain: function () {
    //auth("userInfo", complainSupply);
    var supply = this.data.supply;
    var userId = wx.getStorageSync('login_key').split("_")[2] || 0;
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
      url: '../report/report?fkId=' + supply.id + '&type=1&userId=' + userId
    })
  }
})