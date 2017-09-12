import { formatDate, timeDiff, timeDiff2, formatTime, formatDateWithWeek } from '../../utils/util';

import { showTimeByDate } from '../../utils/util';
import { mapUtil } from '../../utils/mapUtil';
import { formatCent } from '../../utils/moneyUtil';
// import { domain } from '../../utils/domain';
import { Switch } from '../../components/switch/switch.js';
import { wk } from '../../utils/wk';
var app = getApp();
Page({
  data: {
    switch_selNum: 0,
    switch_selTypes: ["预热中", "进行中", "已结束"],
    userInfo: {},
    activityList1: [],
    activityList2: [],
    activityList3: [],

    activityPageNo1: 1,
    activityPageNo2: 1,
    activityPageNo3: 1,

    isActivityLoading1: true,
    isActivityLoading2: true,
    isActivityLoading3: true,

    //当前二维码地址
    QRCodeImgUrl: "",
    isQRCodeOpen: false,

    //到底了
    isOver1: false,
    isOver2: false,
    isOver3: false,
    //正在加载下一页
    isRefresh: false,
    //正在刷新
    isLoading: false,

  },

  clearData() {
    this.setData({
      activityList1: [],
      activityList2: [],
      activityList3: [],
      activityPageNo1: 1,
      activityPageNo2: 1,
      activityPageNo3: 1
    });
  },
  // 预热中 1=====================================
  loadNextActivityPage1(e) {
    if (this.data.isLoading || this.data.isOver1) {
      return false;
    }
    var activityPageNo1 = this.data.activityPageNo1;
    this.setData({
      isLoading: true,
      activityPageNo1: activityPageNo1 + 1
    });
    getActivityPage1(this);
  },
  loadLastestActivity1() {
    this.setData({
      isOver1: false,
      isRefresh: true,
      activityPageNo1: 1
    });
    getLatestActivity1(this);
  },
  //进行中 2=====================================
  loadNextActivityPage2(e) {
    if (this.data.isLoading || this.data.isOver2) {
      return false;
    }
    var activityPageNo2 = this.data.activityPageNo2;
    this.setData({
      isLoading: true,
      activityPageNo2: activityPageNo2 + 1
    });
    getActivityPage2(this);
  },
  loadLastestActivity2() {
    this.setData({
      isOver2: false,
      isRefresh: true,
      activityPageNo2: 1
    });
    getLatestActivity2(this);
  },

  // 已结束 3=====================================

  loadNextActivityPage3(e) {
    if (this.data.isLoading || this.data.isOver3) {
      return false;
    }
    var activityPageNo3 = this.data.activityPageNo3;
    this.setData({
      isLoading: true,
      activityPageNo3: activityPageNo3 + 1
    });
    getActivityPage3(this);
  },
  loadLastestActivity3() {
    this.setData({
      isOver3: false,
      isRefresh: true,
      activityPageNo3: 1
    });
    getLatestActivity3(this);

  },

  //删除商品
  removeAct: function (e) {
    var _this = this;
    var { id, status } = e.target.dataset;
    wx.showModal({
      title: '确定删除该活动？',
      content: '删除后，报名表和签到表中的信息将一同被删除，此操作不可撤回。',
      success: function (res) {
        console.log(res)
        if (res.confirm) {
          wk.delete({
            url: '/activities/'+id,
            data: { status: status },
            method: 'GET',
            success: function (res) {
              var { msg, status } = res.data;
              // console.log(res.data);
              if (msg == 'success') {
                console.log("1111");
                _this.onShow();
              } else {
                wx.showToast({
                  title: '删除活动失败',
                  icon: 'loading',
                  image: '../../image/icon_fail.png',
                  mask: true,
                  duration: 1000
                });
              }
            },
            fail: function (res) {
              wx.showToast({
                title: '删除活动失败',
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
  },

  //点击操作按钮
  operateFn: function (e) {
    var { id, status, start, end } = e.target.dataset;
    var _this = this;


    wx.showActionSheet({
      itemList: ['修改', '提前结束'],
      success: function (res) {
        //修改 tapIndex  0  1 2;
        console.log(id)
        if (res.tapIndex == 0) {
          wx.navigateTo({
            url: '../activityUpdate/activityUpdate?activityId=' + id,
          })
        }
        //提前结束
        if (res.tapIndex == 1) {
          var content = "开始时间:" + start + "; 结束时间:" + end;
          wx.showModal({
            title: '确定提前结束活动？',
            content: content,
            success: function (res) {
              if (res.confirm) {
                wk.put({
                  url: '/activities/activities'+ id,
                  data: {status: status },
                  method: 'GET',
                  success: function (res) {
                    var { msg, status } = res.data;
                    // console.log(res.data);
                    if (msg == 'success') {
                      _this.onShow();
                    } else {
                      wx.showToast({
                        title: '删除活动失败',
                        icon: 'loading',
                        image: '../../image/icon_fail.png',
                        mask: true,
                        duration: 1000
                      });
                    }
                  },
                  fail: function (res) {
                    wx.showToast({
                      title: '删除活动失败',
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

        }
        // console.log(res.tapIndex)
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })

  },
  //签到二维码
  regQRCodeFn: function (e) {
    var activityId = e.target.dataset.id;
    if (!activityId) {
      return false;
    }
    //https:  //p.youpin114.com/activity/signqrcode?activityId=2202
    var QRCodeImgUrl = '/activity/signqrcode.jpg?activityId=' + activityId;
    // console.log(QRCodeImgUrl);
    this.setData({ isQRCodeOpen: true, QRCodeImgUrl: QRCodeImgUrl });

  },
  //关闭二维码弹窗
  QRCodeCloseFn: function () {
    this.setData({
      isQRCodeOpen: false
    });
  },
  //保存二维码至相册
  saveQRCodeImgFn: function () {
    var QRCodeImgUrl = this.data.QRCodeImgUrl;
    // console.log(QRCodeImgUrl);
    //微信版本有保存图片到相册的接口
    if (!!wx.saveImageToPhotosAlbum) {
      wx.downloadFile({
        url: QRCodeImgUrl,
        success: (res) => {
          var tempFilePath = res.tempFilePath;
          // console.log(tempFilePath);
          wx.saveImageToPhotosAlbum({
            filePath: tempFilePath,
            success: (res) => {
              wx.showToast({
                title: '保存签到二维码成功',
                icon: 'success',
                image: '../../image/icon_ok.png',
                mask: true,
                duration: 1000,
                success: (res) => {
                  this.setData({ isQRCodeOpen: false });
                }
              });
            },
            fail: (res) => {
              // console.log(res);
              var errMsg = res.errMsg;
              if (/^[\s\S]*fail auth deny$/.test(errMsg)) {
                wx.openSetting({});
              }
              wx.showToast({
                title: '保存签到二维码失败',
                icon: 'loading',
                image: '../../image/icon_fail.png',
                mask: true,
                duration: 1000
              });
            }
          });
        },
        fail: (res) => {
          wx.showToast({
            title: '下载签到二维码失败',
            icon: 'loading',
            image: '../../image/icon_fail.png',
            mask: true,
            duration: 1000
          });
        }
      });
    }
    //没有接口，预览图片，手动保存
    else {
      wx.previewImage({
        urls: [QRCodeImgUrl]
      });
    }

  },
  //=====================================

  onLoad: function (options) {
    // console.log(options)
    var orig = app.globalData.position;
    this.setData({ orig: orig });
    var switch_selNum = options.type || 0;
    this.setData({ switch_selNum: switch_selNum });
    var userInfo = wx.getStorageSync('user_info');
    this.setData({ userInfo: userInfo})

    var userId = wx.getStorageSync("login_key").split("_")[2] || 0;
    this.setData({ userId: userId });
  
    //  ====组件引入==
    var switchs = new Switch(this);
    switchs.bindEvents();

  },

  onShow: function (options) {
    this.clearData();
    //预热中 timeStatus==1
    //进行中 timeStatus==2
    //已结束 timeStatus==3
    getActivityPage1(this);
    getActivityPage2(this);
    getActivityPage3(this);

  },
  onPullDownRefresh() {
    var switch_selNum = this.data.switch_selNum;
    if (switch_selNum == 0) {
      this.loadLastestActivity1();
    } else if (switch_selNum == 1) {
      this.loadLastestActivity2();
    } else if (switch_selNum == 2) {
      this.loadLastestActivity3();
    }
  },
  onReachBottom() {
    var switch_selNum = this.data.switch_selNum;
    if (switch_selNum == 0) {
      this.loadNextActivityPage1();
    } else if (switch_selNum == 1) {
      this.loadNextActivityPage2();
    } else if (switch_selNum == 2) {
      this.loadNextActivityPage3();
    }

  }
});
//预热 1 &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&77

//获取活动列表分页
function getActivityPage1(page) {
  // console.log(page)
  var { activityPageNo1, activityList1, orig, imgMap, userInfo} = page.data;
  if (!activityPageNo1) {
    return false;
  }
 
  var query = {};
  query.currentPage = activityPageNo1;
  query.timeStatus = 1;
  query.pageSize = 10;
  query.userId = wx.getStorageSync("login_key").split("_")[2] || 0;
  //query.type=4;
  if (!!orig.latitude) {
    query.latitude = orig.latitude;
  }
  if (!!orig.longitude) {
    query.longitude = orig.longitude;
  }
  wk.get({
    url:'/activities/page',
    data: query,
    method: 'GET',
    success: function (res) {
      console.log(res)
   
      wx.hideToast();
      var { msg, list, status, query } = res.data;

      console.log(query);

      if (msg != 'success') {
        return false;
      }
      if ((!list || list.length <= 0) && activityPageNo1 > 1) {
        page.setData({ isOver1: true });
        return false;
      }
      if (activityPageNo1 == 1) {
        page.setData({
          activityList1: formateList(list, orig, imgMap),
          isActivityLoading1: false
        });
      } else {
        page.setData({ activityList1: activityList1.concat(formateList(list, orig,imgMap)) });
      }
      activityList1 = activityList1.concat(formateList(list, orig, imgMap))
      page.setData({ activityList1: activityList1 });
    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        content: '获取活动列表失败，请稍后再试',
        showCancel: false
      });
    },
    complete: function () {
      page.setData({ isLoading: false });
    }
  });
}


//最新活动列表
function getLatestActivity1(page) {
  var { activityPageNo1, activityList1, orig, imgMap, userInfo} = page.data;
  if (!activityPageNo1) {
    return false;
  }

  var query = {};
  query.currentPage = activityPageNo1;
  query.timeStatus = 1;
  query.pageSize = 10;
  query.userId = wx.getStorageSync("login_key").split("_")[2] || 0;
  //query.type=4;
  if (!!orig.latitude) {
    query.latitude = orig.latitude;
  }
  if (!!orig.longitude) {
    query.longitude = orig.longitude;
  }

  if (!activityPageNo1) {
    return false;
  }

  wx.request({
    url:  '/activities/page',
    data: query,
    method: 'GET',
    success: function (res) {
      wx.hideToast();
      var { msg, list,  imgMap } = res.data;
      if (msg != 'success') {
        return false;
      }
      activityList1 = formateList(list, orig,  imgMap);
      page.setData({ activityList1: activityList1 });
    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        content: '刷新活动列表失败，请稍后再试',
        showCancel: false
      });
    },
    complete: function () {
      page.setData({ isRefresh: false });
      wx.stopPullDownRefresh();
    }
  });
}


//进行中 2 &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&77

//获取活动列表分页
function getActivityPage2(page) {
  // console.log(page)
  var { activityPageNo2, activityList2, orig, imgMap, userInfo} = page.data;
  if (!activityPageNo2) {
    return false;
  }

  var query = {};
  query.currentPage = activityPageNo2;
  query.timeStatus = 2;
  query.pageSize = 10;
  query.userId = wx.getStorageSync("login_key").split("_")[2] || 0;
  //query.type=4;
  if (!!orig.latitude) {
    query.latitude = orig.latitude;
  }
  if (!!orig.longitude) {
    query.longitude = orig.longitude;
  }
  wk.get({
    url: '/activities/page',
    data: query,
    method: 'GET',
    success: function (res) {
      // console.log(res.data);
      wx.hideToast();
      var { msg, list,  imgMap } = res.data;
      if (msg != 'success') {
        return false;
      }
      if ((!list || list.length <= 0) && activityPageNo2 > 1) {
        page.setData({ isOver2: true });
        return false;
      }
      if (activityPageNo2 == 1) {
        page.setData({
          activityList2: formateList(list, orig,  imgMap),
          isActivityLoading2: false
        });
      } else {
        page.setData({ activityList2: activityList2.concat(formateList(list, orig, imgMap)) });
      }
      activityList2 = activityList2.concat(formateList(list, orig,  imgMap))
      page.setData({ activityList2: activityList2 });
    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        content: '获取活动列表失败，请稍后再试',
        showCancel: false
      });
    },
    complete: function () {
      page.setData({ isLoading: false });
    }
  });
}


//最新活动列表
function getLatestActivity2(page) {
  // console.log(page)
  var { activityPageNo2, activityList2, orig, imgMap, userInfo} = page.data;

  var query = {};
  query.currentPage = activityPageNo2;
  query.timeStatus = 2;
  query.pageSize = 10;
  query.userId = wx.getStorageSync("login_key").split("_")[2] || 0;
  //query.type=4;
  if (!!orig.latitude) {
    query.latitude = orig.latitude;
  }
  if (!!orig.longitude) {
    query.longitude = orig.longitude;
  }

  if (!activityPageNo2) {
    return false;
  }

  wx.request({
    url: '/activity/selectByQuery',
    data: query,
    method: 'GET',
    success: function (res) {
      wx.hideToast();
      var { msg, list,  imgMap } = res.data;
      if (msg != 'success') {
        return false;
      }
      activityList2 = formateList(list, orig, imgMap);
      page.setData({ activityList2: activityList2 });
    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        content: '刷新活动列表失败，请稍后再试',
        showCancel: false
      });
    },
    complete: function () {
      page.setData({ isRefresh: false });
      wx.stopPullDownRefresh();
    }
  });
}



//已经结3  &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&7
//获取活动列表分页
function getActivityPage3(page) {
  // console.log(page)
  var { activityPageNo3, activityList3, orig, imgMap, userInfo} = page.data;
  if (!activityPageNo3) {
    return false;
  }

  var query = {};
  query.currentPage = activityPageNo3;
  query.timeStatus = 3;
  query.pageSize = 10;
  query.userId = wx.getStorageSync("login_key").split("_")[2] || 0;
  //query.type=4;
  if (!!orig.latitude) {
    query.latitude = orig.latitude;
  }
  if (!!orig.longitude) {
    query.longitude = orig.longitude;
  }
  wk.get({
    url: '/activities/page',
    data: query,
    method: 'GET',
    success: function (res) {
      // console.log(res.data);
      wx.hideToast();
      var { msg, list, now, imgMap } = res.data;
      if (msg != 'success') {
        return false;
      }
      if ((!list || list.length <= 0) && activityPageNo3 > 1) {
        page.setData({ isOver3: true });
        return false;
      }
      if (activityPageNo3 == 1) {
        page.setData({
          activityList3: formateList(list, orig, now, imgMap),
          isActivityLoading3: false
        });
      } else {
        page.setData({ activityList3: activityList3.concat(formateList(list, orig, now, imgMap)) });
      }
      activityList3 = activityList3.concat(formateList(list, orig, now, imgMap))
      page.setData({ activityList3: activityList3 });
    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        content: '获取活动列表失败，请稍后再试',
        showCancel: false
      });
    },
    complete: function () {
      page.setData({ isLoading: false });
    }
  });
}


//最新活动列表
function getLatestActivity3(page) {
  var { activityPageNo3, activityList3, orig, imgMap, userInfo} = page.data;
  if (!activityPageNo3) {
    return false;
  }

  var query = {};
  query.currentPage = activityPageNo3;
  query.timeStatus = 3;
  query.pageSize = 10;
  query.userId = wx.getStorageSync("login_key").split("_")[2] || 0;
  //query.type=4;
  if (!!orig.latitude) {
    query.latitude = orig.latitude;
  }
  if (!!orig.longitude) {
    query.longitude = orig.longitude;
  }

  wx.request({
    url: '/activity/selectByQuery',
    data: query,
    method: 'GET',
    success: function (res) {
      wx.hideToast();
      var { msg, list, now, imgMap } = res.data;
      if (msg != 'success') {
        return false;
      }
      activityList3 = formateList(list, orig, now, imgMap);
      page.setData({ activityList3: activityList3 });
    },
    fail: function (res) {
      wx.showModal({
        title: '提示',
        content: '刷新活动列表失败，请稍后再试',
        showCancel: false
      });
    },
    complete: function () {
      page.setData({ isRefresh: false });
      wx.stopPullDownRefresh();
    }
  });
}


// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&7

//格式化活动数据
function formateList(list, orig, imgMap) {
  var tempList = list.map(activity => {
    // activity.imgUrl = !!imgMap[activity.id] ?
    //   'http://img.99114.com' + imgMap[activity.id].imgUrl : '../../image/noPhoto.jpg';

    // console.log(list)

    activity.imgUrl = activity.imgList
    activity.startTimeStr = formatDateWithWeek(new Date(activity.startTime));
    activity.endTimeStr = formatDateWithWeek(new Date(activity.endTime));
    //showTimeByDate()
    activity.createTimeStr = showTimeByDate(new Date(activity.createTime));
    activity.distance = mapUtil.getDistance(activity.latitude, activity.longitude, orig.latitude, orig.longitude);
    return activity;
  });
  return tempList;
}
