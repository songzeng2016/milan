// pages/informDetail/informDetail.js
import { domain } from '../../utils/domain';
//import { hideNickName } from '../../utils/stringUtil';
import { showTimeByDate } from '../../utils/util';
import { auth } from '../../utils/auth';
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    informSer: '',
    informCreateYear: '',
    informTitle: '',
    informContent: '',
    informSigner: '',
    informCreateTime: '',
    informId: '',
    informCount:0,

    historys: [],
    isToEnd: false,
    //默认是从列表进入的  不显示发布按钮  如果从分享进入的则  type=1；
    informType: 0,
    isInformBtnShow: false,

  },
  //下拉返回
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
  onShareAppMessage: function () {
    var userInfo = wx.getStorageSync('user_info');
    return {
      title: userInfo.nickName + '发布了群通知',
      path: '/pages/informDetail/informDetail?informId=' + this.data.informId + '&informType=1',
      success: (res) => {
        console.log(res);
        var shareTicket = res.shareTickets[0];
        this.setData({ str: shareTicket });
        wx.getShareInfo({
          shareTicket: shareTicket,
          complete(res) {
            console.log(res);
            var { encryptedData, iv } = res;
            wx.request({
              url: domain + '/decrypt',
              data: { encryptedData, iv, userId: userInfo.id },
              success(res) {
                console.log(res.data);
              }
            });
          }
        });
        wx.request({
          url: '',
        })
      },
      fail: function (res) {
        // 分享失败
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获得转发信息
    // wx.getShareInfo({
    //   shareTicket:'',
    //   success:function(res){},
    //   fail:function(res){},
    //   complete:function(){}
    // });
    //auth(app,null);
    wx.showShareMenu({
      withShareTicket: true
    })

    var informType = options.informType;
    if (informType == 1) {
      this.setData({
        isInformBtnShow: true
      });
    } 
  
    this.setData({ isToEnd: getCurrentPages().length >= 5 ? true : false });
    this.data.informId = options.informId
  },
  onShow: function(){
    //授权验证
    auth("userInfo",()=>{
    var openGId = app.globalData.openGId;

    var param = {};
    param.userId = wx.getStorageSync('login_key').split("_")[2];
    param.informId = this.data.informId;

    if (!param.userId) {
      param.userId = 0;
    }
    param.flockId = openGId;

    var _this = this;
    wx.request({
      url: domain + '/inform/check',
      data: param,
      method: 'GET',
      success: function (res) {
        if (res.data.statusCode != 200) {
          return false;
        }
        let {serialize: informSer, createTime, title: informTitle, content: informContent, signer: informSigner, id: informId, historys, num: informCount} = res.data.data;
        _this.setData({
          informSer: informSer,
          informCreateYear: formateYear(createTime),
          informTitle: informTitle,
          informContent: informContent,
          informSigner: informSigner,
          informCreateTime: formateInfirmDate(createTime),
          informId: informId,
          historys: formateHistorys(historys),
          informCount: informCount
        });
      }
    });
    })
    
  }
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
//格式化 微信群 
function formateHistorys(obj) {
 
    obj.map(item => {
      //格式化 昵称 
      //list.nickName = hideNickName(list.nickName);
      //格式化 时间
      item.createTime = showTimeByDate(new Date(item.createTime))
      //格式化 文本内容
      item.message = (!!item.message) ? item.message : '';
      return item;
    });
  return obj;
}