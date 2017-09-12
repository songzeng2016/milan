// pages/noticeDetail/noticeDetail.js
import { domain } from '../../utils/domain';
import { wk } from '../../utils/wk';

const App = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    noticeSer: '',
    noticeCreateYear: '',
    noticeTitle: '',
    noticeContent: '',
    noticeCreateTime: '',
    noticeId: '',

  },
  onShareAppMessage: function () {
    var userInfo = wx.getStorageSync('user_info');
    return {
      title: userInfo.nickName + '发布了群公告',
      path: '/pages/noticeDetail/noticeDetail?noticeId=' + this.data.noticeId,
      success: (res) => {
        console.log(res);
        var shareTicket = res.shareTickets[0];
        this.setData({ str: shareTicket });
        // wx.getShareInfo({
        //   shareTicket: shareTicket,
        //   complete(res) {
        //     console.log(res);
        //     var { encryptedData, iv } = res;
        //     wx.request({
        //       url: domain + '/decrypt',
        //       data: { encryptedData, iv, userId: userInfo.id },
        //       success(res) {
        //         console.log(res.data);
        //       }
        //     });
        //   }
        // });
      },
      fail: function (res) {
        // 分享失败
      }
    }
  },
  
  //下拉返回
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showShareMenu({
      withShareTicket: true
    })
    
    var userInfo = wx.getStorageSync('user_info');
    var userId = userInfo.id;
    //var userId=1001;  //2017假数据
    var param = {};
    var  requestUrl = '/notices/' + options.noticeId;
    param.userId = userId;
    var _this = this;

    setTimeout(function () {
      wk.get({
        url: requestUrl,
        data: param,
        success: function (res) {
          let {msg,status,notice} = res.data;
          console.log(res.data);
          if (status==1) {
            let { id: noticeId, title: noticeTitle, content: noticeContent, index: noticeSer, createTime,} = res.data.notice;
            _this.setData({
              noticeSer: noticeSer,
              noticeCreateYear: formateYear(createTime),
              noticeTitle: noticeTitle,
              noticeContent: noticeContent,

              noticeCreateTime: formateInfirmDate(createTime),
              noticeId: noticeId,

            });
          }
        },
        fail: function () {
          // fail
        }
      });

    }, 500);

  },
})

//格式化年
function formateYear(val) {
  var date = new Date(val);
  var year = date.getFullYear();
  return year;
}

//格式化年 月 日
function formateInfirmDate(val) {
  var date = new Date(val);
  console.log(date);
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var res = year + "年" + month + "月" + day + "日";
  return res;
}
