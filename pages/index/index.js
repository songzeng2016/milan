import { domain } from '../../utils/domain';
import { wk } from '../../utils/wk';
import { auth, auth2 } from '../../utils/auth';
var app = getApp();
var GPS = app.GPS;

Page({
  data: {
    onloading: true,
    searchTypes: ["展厅", "供应", "求购", "活动"],
    searchTypeIndex: 0,
    //data 地图控件
    centerLongitude: 117.0445,
    centerLatitude: 39.41499,
    scale: 9,
    controls: [],
    markers: []
  },
  onLoad: function () {
  },
  onReady: function () {
    this.setData({
      onloading: !this.data.onloading
    });
    this.mapCtx = wx.createMapContext('map');
    setTimeout(function () {
      console.log("moveToLocation onready");
      wx.createMapContext('map').moveToLocation();
    }, 500);
  },
  onShow: function () {
    //授权验证 2017-07先注释
    auth2('userInfo', 'userLocation');
    var that = this;
    setTimeout(function () {
      showIcon(that);
    }, 500);

    setTimeout(function () {
      console.log("moveToLocation onready");
      wx.createMapContext('map').moveToLocation();
    }, 100);
    var index = this.data.searchTypeIndex;
    switch (index) {
      case 0: selectAllExhibition(that); break;
      case 1: selectAllSupply(that); break;
      case 2: selectAllBuy(that); break;
      case 3: selectAllAdvice(that); break;
      default: break;
    }
  },
  switchSeachType(e) {
    var that = this;
    var index = e.target.dataset.current;
    if (index == this.data.searchTypeIndex) {
      return false;
    }
    this.setData({ searchTypeIndex: index });
    switch (index) {
      case 0: selectAllExhibition(that); break;
      case 1: selectAllSupply(that); break;
      case 2: selectAllBuy(that); break;
      case 3: selectAllAdvice(that); break;
      default: break;
    }
  },
  markertap(e) {
    console.log(e.markerId);
    var markerId = e.markerId;
    var marker = this.data.markers.filter(item => item.id == e.markerId)[0];
    var cate = marker.cate;
    //点击展厅的marker
    if (cate == "exhibition") {
      wk.navigateTo({
        url: '../bookgoods/bookgoods?id=' + markerId
      });
    }
    else if (cate == "supply") {
      wk.navigateTo({
        url: '../supplyDetail/supplyDetail?supplyId=' + markerId
      });
    }
    else if (cate == "buy") {
      wk.navigateTo({
        url: '../purchaseDetail/purchaseDetail?buyId=' + markerId
      });
    }
    //点击留言的marker
    else if (cate == "advice") {
      wk.navigateTo({
        url: '../activityDetail/activityDetail?activityId=' + markerId
      });
    }

  },
  controltap(e) {
    var that = this;
    var id = e.controlId;
    switch (id) {
      case "refresh":
        //刷新页面
        var index = that.data.searchTypeIndex;
        switch (index) {
          case 0: selectAllExhibition(that); break;
          case 1: selectAllSupply(that); break;
          case 2: selectAllBuy(that); break;
          case 3: selectAllAdvice(that); break;
          default: break;
        }
        break;
      case "here":
        this.mapCtx.moveToLocation();
        this.setData({ scale: -1 });
        this.setData({ scale: 9 });
        break;
      case "all":
        //黑魔法，手动缩放地图，map的scale值并不会跟着改变，所以点击全国按钮只有第一次生效，手动修改scale可以解决这个问题。
        this.setData({ scale: -1 });
        this.setData({ scale: 2 });
        break;
    }
  },
});
//计算地图控件位置和大小
function mapControlPosition(left, top) {
  return {
    left: left, top: top, width: 40, height: 40
  }
}
//显示地图控件
function showIcon(page) {
  wx.getSystemInfo({
    success: function (res) {
      var winW = res.windowWidth;
      var winH = res.windowHeight;
      var newControls = [
        {
          id: "refresh",
          iconPath: '/image/ind_side1.png',
          position: mapControlPosition(10, winH - 230 - 44),
          clickable: true
        },
        {
          id: "here",
          iconPath: '/image/ind_side2.png',
          position: mapControlPosition(10, winH - 180 - 44),
          clickable: true
        },
        {
          id: "all",
          iconPath: '/image/ind_side3.png',
          position: mapControlPosition(10, winH - 130 - 44),
          clickable: true
        },
      ];
      page.setData({
        controls: newControls
      });
    }
  });
}
//获取展厅信息
function selectAllExhibition(page) {
  wx.request({
    url: domain + '/exhibitions/',
    method: 'GET',
    success: function (res) {
      console.log(res.data);
      var markers = [];
      if (!!res.data) {
        let list = res.data.list;
        for (var i in list) {
          var item = list[i];
          console.log("latitude:"+item.latitude+" ,longitude:"+item.longitude);
          var position = GPS.gcj_encrypt(item.latitude, item.longitude);
          markers.unshift({
            cate: 'exhibition',
            id: item.id,
            name: item.title,
            address: item.address,
            telephone: item.telephone,
            latitude: position.lat,
            longitude: position.lon,
            iconPath: '/image/ind_maPosZ' + (item.status + 1) + '.png',
            width: 38,
            height: 44
          });
        }
        console.log("markers:======================");
        
        page.setData({
          markers: markers
        });
        console.log(page.data.markers);
      }
    },
    complete: function () {

    }
  });
}
//获取供应信息
function selectAllSupply(page) {
  wx.request({
    url: domain + '/supplies/page',
    method: "GET",
    data:{status:1},
    success: function (res) {
      console.log(res);
      var markers = [];
      if (!!res.data) {
        for (var i in res.data) {
          var item = res.data[i];
          var position = GPS.gcj_encrypt(item.latitude, item.longitude);
          markers.push({
            cate: 'supply',
            id: item.id,
            name: item.title,
            latitude: position.lat,
            longitude: position.lon,
            iconPath: '/image/ind_maPosG2.png',
            width: 38,
            height: 44
          });
        }
        page.setData({
          markers: markers
        });
      }
    },
    fail: function () {
      wk.showModal({
        title: '提示',
        content: '获取供应信息失败，请稍后再试',
        showCancel: false
      });
    }
  });
}
//获取采购信息
function selectAllBuy(page) {
  wx.request({
    url: domain + '/buys/page',
    method: 'GET',
    data: { isValid: 1 },
    success: function (res) {
      console.log(res);
      var markers = [];
      if (!!res.data) {
        for (var i in res.data) {
          var item = res.data[i];
          var position = GPS.gcj_encrypt(item.latitude, item.longitude);
          markers.push({
            cate: 'buy',
            id: item.id,
            name: item.title,
            latitude: position.lat,
            longitude: position.lon,
            iconPath: '/image/ind_maPosC2.png',
            width: 38,
            height: 44
          });
        }
        page.setData({
          markers: markers
        });
      }
    },
    fail: function () {
      wx.showModal({
        title: '提示',
        content: '获取采购信息失败，请稍后再试',
        showCancel: false
      });
    }
  });
}
//获取留言信息
function selectAllAdvice(page) {
  wx.request({
    url: domain + '/activities',
    method: 'GET',
    success: function (res) {
      console.log(res);
      var list = res.data.list;
      var markers = [];
      if (!!list) {
        for (var i in list) {
          var item = list[i];
          var type = 1
          var position = GPS.gcj_encrypt(item.latitude, item.longitude);
          markers.push({
            cate: 'advice',
            id: item.id,
            type: type,
            comment: item.comment,
            latitude: position.lat,
            longitude: position.lon,
            iconPath: '/image/ind_maPosH1.png',
            width: 38,
            height: 44
          });
        }
        page.setData({
          markers: markers
        })
      }
    },
    fail: function () { }
  });
}
