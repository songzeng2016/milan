import { domain } from '../../utils/domain';
import { ShareImg } from '../../components/deShareImg/deShareImg';
import { wk } from '../../utils/wk';
var app = getApp();
var validater = app.validater;
Page({
  data: {
    form: {
      userId: '',
      activityId: '',
      userName: '',
      telephone: '',
      corporation: ''
    },
    errorMsg: '',
    isJoined: false,
    focusItem: '',
    shareImgUrl: ''
  },
  onLoad: function (options) {
    var activityId = options.activityId;
    if (!activityId) {
      return false;
    }
    var userId = wx.getStorageSync("login_key").split("_")[2] || 0;
    this.setData({ activityId: activityId, userId: userId });
    var form = this.data.form;
    wk.get({
      url: '/activityjoins/query',
      data: { activityId: activityId, userId: userId },
      method: 'GET',
      success: (res) => {
        console.log(res)
        var { list, msg, query, status } = res.data;
        var lists = list.pop()
        if (!!lists){
          console.log(lists)
          this.setData({ form: lists, isJoined: true });
        }
      }
    });
    var shareImg = new ShareImg(this);
    shareImg.bindEvents(); 
  },
  bindFormData(e) {
    var key = e.target.dataset.key;
    var value = e.detail.value;
    this.data.form[key] = value;
  },
  focusInput(e) {
    var key = e.target.dataset.key;
    this.setData({ focusItem: key });
  },
  //校验数据
  validate() {
    var form = this.data.form;
    if (validater.isEmpty(form.userName)) {
      this.setData({ errorMsg: '请填写姓名' });
      this.ohShitfadeOut();
      return false;
    }else if (validater.isEmpty(form.telephone)) {
      this.setData({ errorMsg: '请填写联系电话' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.isTel(form.telephone)) {
      this.setData({ errorMsg: '手机号格式不正确' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.corporation)) {
      this.setData({ errorMsg: '请填写公司名称' });
      this.ohShitfadeOut();
      return false;
    } else {
      this.setData({ errorMsg: '' });
      return true;
    }
  },
  //确认发布
  submit(e) {
    var { isJoined, form, userId, activityId } = this.data;
    if(isJoined){
      return false;
    }
    var isOk = this.validate();
    if(!isOk){
      return false;
    }
    form.userId = userId;
    form.activityId = activityId;
    var formId = e.detail.formId;
    wk.post({
      url:  '/activityjoins',
      data: form,
      method: 'post',
      success: (res) => {
        var { status, msg } = res.data;
        console.log(res)
        if (msg == 'success') {
          this.setData({ isJoined: true, join: form });
          wx.showToast({
            title: '报名成功',
            icon: 'success',
            image: '../../image/icon_ok.png',
            mask: true,
            duration: 1000,
            success: (res) => {
              this.genShareImg();
              wk.get({
                url:'/reportform/joinsuccess',
                data: { 
                  formId: formId,
                  activityId: form.activityId,
                  userId: form.userId
                },
                method: 'GET',
                success: function (res) {
                  console.log(res);
                },
                fail: function (res) {
                  console.log(res);
                }
              });
            }
          });
        } else {
          wx.showToast({
            title: '报名失败请重试',
            icon: 'success',
            image: '../../image/icon_fail.png',
            mask: true,
            duration: 1000
          });
        }
      },
      fail: (res) => {
        wx.showToast({
          title: '报名失败请重试',
          icon: 'success',
          image: '../../image/icon_fail.png',
          mask: true,
          duration: 1000
        });
      }
    })
  },
  genShareImg() {
    var { activityId, userId } = this.data;
    console.log(this.data)
    if (!activityId || !userId){
      return false;
    }
    var shareImgUrl = domain +'/activities/' + activityId +'/shareimg.png'; 
    this.setData({ showShareImg: true, shareImgUrl: shareImgUrl });
  },
  ohShitfadeOut() {
    var fadeOutTimeout = setTimeout(() => {
      this.setData({ errorMsg: '' });
      clearTimeout(fadeOutTimeout);
    }, 3000);
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
});