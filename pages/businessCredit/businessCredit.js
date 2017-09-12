// pages/businessCredit/businessCredit.js
import { formatDate,timeDiff2 } from '../../utils/util';
import { formatCent } from '../../utils/moneyUtil';
import { showTimeByDate,showTimeByDate2 } from '../../utils/util';
import { mapUtil } from '../../utils/mapUtil';
import { domain } from '../../utils/domain';
var app = getApp();
Page({
  data: {
    // 页面初始化 options为页面跳转所带来的参数
    bus_SelNum: 0,
    //判断 是否已经到底部
    isComplainToLower: false,
    isPublishToLower: false,
    //判断 是否滚动到 swiper切换点处
    isToTab: false,
    user:{},
    isRefresh:false,
    page:{
      pageSize:15,
      currentPage:1
    },
    complainList:[],
    complainTotal:0,

    publishTotal:0,
    pubPage:{
      pageSize:15,
      currentPage:1
    },
    //活动  列表数据
    publishList: [],
  },

  //fn //顶部的选择 sel
  bus_swichFn: function (e) {
    var index = e.target.dataset.current;
    this.setData({
      bus_SelNum: index
    });
  },
  bus_swichtConFn: function (e) {
    var ind = e.detail.current
    this.setData({
      bus_SelNum: e.detail.current
    });
  },
  scrollFn: function (e) {
    //滚动超过 148px 隐藏顶部的信息 
    var _this = this;
    var scroT = e.detail.scrollTop;
    var swiperH=0;
    var leftH=0;
    var rightH=0;
    leftH=120+(55+60*100)

    if (scroT >= 148) {
      this.setData({
        isToTab: true
      });
    } else {
      this.setData({
        isToTab: false
      });
    }
  },
  onLoad: function (options) {
    var _this = this;
    var id = options.id
    this.setData({
      id:id
    });
    //获取商家信息
    wx.request({
      url: domain + '/user/selectByIdWithOutPrivacy',
      data: {id : id},
      method: 'GET', 
      success: function(res){
        // success
        if(res.data.status==1){
            var user = res.data.user;
            user.province = res.data.province;
            user.city = res.data.city;
            if(user.createTime!=null)
              user.createTime = formatDate(new Date(user.createTime));
            _this.setData({
              user:user
            });
        }
      },
      fail: function() {
        // fail
      }
    })//获取商家信息结束
  },
  onShow: function () {
      var _this = this;
      var id = _this.data.id
      var page = _this.data.page;
      page.fkUserId = id;
      page.currentPage =1;
      this.complainPage(page,_this);

      var pubPage = _this.data.pubPage;
      pubPage.userId = id;
      pubPage.currentPage =1;
      this.publishPage(pubPage,_this);
  },
  complainScrollPage:function(){
      var page = this.data.page;
      page.currentPage = page.currentPage + 1;
      var isRefresh = this.data.isRefresh;
      if(!isRefresh){
        this.setData({
          isRefresh:true
        });
      this.complainPage(page,this);
      }
  },
  complainPage:function(page,_this){
    var position = app.globalData.position;
    wx.request({
      url: domain + '/usercomplain/count',
      data: {pageSize:page.pageSize,currentPage:page.currentPage,status:1,fkUserId:page.fkUserId},
      method: 'GET',
      success: function(res){
        // success
        var oricomplain = _this.data.complainList;
        var complain = res.data.listComplain;
        if(!complain || complain.length<=0 && page.currentPage != 1){
          _this.setData({
            isComplainToLower:true
          });
          return false;
        }
        var now = res.data.now;
        if(!!complain)
        for(var i=0;i<complain.length;i++){
            var random = ~~(Math.random() * 5);
            if(random == 0) random = '';
            for(var j=0;j<complain[i].list.length;j++){
              complain[i].list[j].createTime = showTimeByDate2(new Date(complain[i].list[j].createTime));
              if(!!complain[i].list[j].telephone){
                complain[i].list[j].telephone = complain[i].list[j].telephone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
              }
            }
          if(!!complain[i].supply){
            if(!!complain[i].supply.mainImgUrl){
              complain[i].supply.mainImgUrl = 'http://img' + random + '.99114.com' + complain[i].supply.mainImgUrl ||'';
            }else{
              complain[i].supply.mainImgUrl = '../../image/noPhoto.jpg';
            }  
            complain[i].supply.minPrice = formatCent(complain[i].supply.minPrice);
            complain[i].supply.createTime = showTimeByDate2(new Date(complain[i].supply.createTime));
            complain[i].supply.telephone = complain[i].supply.telephone;
            complain[i].supply.distance = mapUtil.getDistance(complain[i].supply.latitude,complain[i].supply.longitude,position.latitude,position.longitude);
          }else if(!!complain[i].buy){
            if(!!complain[i].buy.mainImgUrl){
              complain[i].buy.mainImgUrl = 'http://img' + random + '.99114.com' + complain[i].buy.mainImgUrl ||'';
            }else{
              complain[i].buy.mainImgUrl = '../../image/noPhoto.jpg';
            }
              complain[i].buy.createTime = showTimeByDate2(new Date(complain[i].buy.createTime));
              complain[i].buy.distance = mapUtil.getDistance(complain[i].buy.latitude,complain[i].buy.longitude,position.latitude,position.longitude);
              complain[i].buy.deadLine = timeDiff2(new Date(complain[i].buy.deadLine),new Date(now));
         //   console.log(complain[i]);
          }
        }
 
        if(!!complain)
        for(var i=0;i<complain.length;i++){
          var current = complain[i];
          var flag = false;
          for(var j=0;j<oricomplain.length;j++){
            if(current.type==oricomplain[j].type&&current.id==oricomplain[j].id){
              oricomplain[j].list.concat(current.list);
              flag = true;
              break;
            }
          }
          if(!flag){
            oricomplain.push(current);
          }
        }
     //  console.log(oricomplain);
        _this.setData({
          complainList:oricomplain,
          page:page,
          complainTotal:res.data.total
        });
      },
      fail: function(res) {
        // fail
         wx.showModal({
          title: '提示',
          content: '获取最被举报信息失败',
          showCancel: false
        });
      },
      complete: function(){
        _this.setData({
          isRefresh:false});
      }
    })
  },
  publishScrollPage:function(){
      var pubPage = this.data.pubPage;
      pubPage.currentPage = pubPage.currentPage + 1;
      this.setData({
        isRefresh:true
      });
      this.publishPage(pubPage,this);
  },
  publishPage: function(pubPage,_this){
    wx.request({
      url: domain + '/supply/latest',
      data: {pageSize:pubPage.pageSize,currentPage:pubPage.currentPage,userId:pubPage.userId},
      method: 'GET', 
      success: function(res){
        // success
        var now = res.data.now;
        if(res.data.status==1){
          var publishList = _this.data.publishList;
          var list = res.data.list;
          if(!list || list.length<=0){
             _this.setData({
                isPublishToLower:true
              });
            return false;
          }
          var position = app.globalData.position;
          if(!!list)
          for(var i = 0;i<list.length;i++){
            var item = {};
            item.id = list[i].id;
            var random = ~~(Math.random() * 5);
            if(random == 0) random = '';
            if(!!list[i].imgUrl)
            item.imgurl = 'http://img' + random + '.99114.com' + list[i].imgUrl ||'';
            item.title = list[i].title;
            item.address = list[i].province+list[i].city;
            item.price = list[i].price;
            item.pvCount = list[i].viewCount||0; 
            item.price = formatCent(list[i].price);
            item.deadline = timeDiff2(new Date(list[i].deadLine),new Date(now));
            item.distance = mapUtil.getDistance(list[i].latitude,list[i].longitude,position.latitude,position.longitude);
            if(list[i].type == "supply"){
              item.isSupplyData = true;
            }
            publishList.push(item);
          }
    //      console.log(publishList);
           _this.setData({
            publishList:publishList,
            publishTotal:res.data.count,
            pubPage:pubPage
          });
        }
      },
      fail: function() {
        // fail
        wx.showModal({
          title: '提示',
          content: '获取最新发布信息失败',
          showCancel: false
        });
      },
      complete: function(){
        _this.setData({isRefresh:false});
      }
    })
  }
})