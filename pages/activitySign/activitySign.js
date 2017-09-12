// activitySign.js
import { mapUtil } from '../../utils/mapUtil';

import { jionTimeByDate2 } from '../../utils/util';
import { auth } from '../../utils/auth';
import { wk } from '../../utils/wk';
var app = getApp();
var validater = app.validater
Page({

  /**
   * 页面的初始数据
   */
  data: {
  activityId:0,
  activity:{}
  },
  //确认发布
  goDetail: function (e) {

    setTimeout(() => {
      var titValue = e.detail.value.inputName
      var subValue = e.detail.value.inputTel
      var signValue = e.detail.value.inputCompany
      if (titValue == null || titValue == "") {
        this.setData(
          { popErrorMsg: "请填写参加者姓名" }
        );
        this.ohShitfadeOut();
        return false;
      } else if (subValue == null || subValue == "") {
        this.setData(
          { popErrorMsg: "请填写参加者手机号" }
        );
        this.ohShitfadeOut();
        return false;
      } else if (!validater.isTel(subValue)) {
        this.setData(
          { popErrorMsg: "手机号格式错误，请重新填写" }
        );
        this.ohShitfadeOut();
        return false;
      } 
      else if (signValue == null || signValue == "") {
        this.setData(
          { popErrorMsg: "请填写贵公司名称" }
        );
        this.ohShitfadeOut();
        return false;
      } else {
        var userId = wx.getStorageSync("login_key").split("_")[2]||0; 
        var formData = {
          name: titValue,
          phone: subValue,
          corporation: signValue,
          activityId: this.data.activityId,
          userId: userId
        }
        if(wx.showLoading){
          wx.showLoading({
            title: '提交中',
          })
        }
        wk.post({
          url:  '/activitysigns',
          data: formData,
          success:(res)=>{
            if(res.data.status ==1){
              wx.navigateTo({
                url: '/pages/activitySignHint/activitySignHint?activityId=' + formData.activityId + "&status=1",
              })
            }
          },
          complete: (res) => {
            if (wx.hideLoading) {
              wx.hideLoading();
            }
          }
        })
      }
     
    }, 100)

  },
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
    var { activityId, type } = options;
    if (!activityId) {
      wx.redirectTo({ url: '/pages/goBack/goBack?type=activity' });
      return;
    }
    this.setData({ activityId: activityId, type: type });
  },
  onShow: function(){
    //授权验证
    auth("userLocation",()=>{
      var { activityId, type } = this.data
      // console.log(this.type)
      var position = app.globalData.position;
      var userId = wx.getStorageSync("login_key").split("_")[2] || 0;
      // if (type == 'show') {
      //   wk.get({
      //     url: '/activitysigns/query',
      //     data: { activityId: activityId, userId: userId },
      //     method: 'GET',
      //     success: (res) => {
      //       console.log(res)
      //       var {msg, query, list, status } = res.data;
      //       if (status == 1 && !!list) {
      //         this.setData({
      //           name: list.name,
      //           phone: list.phone,
      //           corporation: list.corporation
      //         });
      //       }
      //     }
      //   });
      //   return false;
      // }


  
        wk.get({
          url: '/activitysigns/query',
          data: { activityId: activityId, userId: userId },
          method: 'GET',
          success: (res) => {
            // console.log(res)
            var {msg, query, list, status } = res.data;
            if (status == 1 && !!list) {
              var lists = list.pop()
              this.setData({
                name: lists.name,
                phone: lists.phone,
                corporation: lists.corporation
              });
            }
          }
        });
      
      
      wk.get({
        url: '/activities/'+activityId,
        data: { type: "show" },
        method: 'GET',
        success: (res) => {
          // console.log(res)
          if (res.data.status == 1) {
            var {activity, now, imgList} = res.data;
            // imgList.map((v, k) => {
            //   if (parseInt(v.isMain) == 1) {
            //     var random = ~~(Math.random() * 5);
            //     if (random == 0) random = '';
            //     activity.mainPic = 'http://img' + random + '.99114.com' + v.imgUrl;
            //   }
            // })

         
            var urlList = [];
            for (var i in activity.imgList) {
              urlList.push({ imgUrl: 'http://img.99114.com' + activity.imgList[i].imgUrl }); //往空数组push便利的图片
            }

            console.log(urlList[0])

            activity.imgList = urlList[0];  
            // console.log(urlList)


            activity.start = jionTimeByDate2(new Date(activity.startTime));
            activity.end = jionTimeByDate2(new Date(activity.endTime));
            this.setData({
              activity: activity
            });
            wk.get({
              url:  '/activitysigns/query',
              data: { activityId: activityId, userId: userId },
              method: 'GET',
              success: (res) => {
                if (res.data.status == 1) {
                  //不在签到时间段内
                  if (new Date(activity.startTime) > new Date(now) || new Date(activity.endTime) < new Date(now)) {
                    wx.redirectTo({
                      url: '/pages/activitySignHint/activitySignHint?activityId=' + activityId + "&status=3",
                    })
                  }
                  //距离不对
                  var distance = mapUtil.getPurlDistance(position.latitude, position.longitude, activity.latitude, activity.longitude);
                  if (distance > 5000) {
                    wx.redirectTo({
                      url: '/pages/activitySignHint/activitySignHint?activityId=' + activityId + "&status=4",
                    })
                  }
                  if (res.data.isSign) {
                    //已经签到了
                    wx.redirectTo({
                      url: '/pages/activitySignHint/activitySignHint?activityId=' + activityId + "&status=2",
                    })
                  }
                }
              }
            })
          }
        }
      })
    })
  },
  nameTxtFn: function(e){
    this.setData({
      name:e.detail.value
    });
  },
  phoneTxtFn: function (e) {
    this.setData({
      phone: e.detail.value
    });
  },
  corporationTxtFn: function (e) {
    this.setData({
      corporation: e.detail.value
    });
  },
  clearName: function(e){
    this.setData({
      name : ""
    });
  },
  clearPhone: function (e) {
    this.setData({
      phone: ""
    });
  },
  clearCorporation: function (e) {
    this.setData({
      corporation: ""
    });
  }
})