import { formatDate, formatHour } from '../../utils/util';
import { domain } from '../../utils/domain';
var app = getApp();
var validater = app.validater;
Page({
  data: {
    form: {
      id: "",
      userId: wx.getStorageSync("login_key").split("_")[2] || 0,
      imgs: [],
      type: '',
      title: '',
      startTime: '',
      endTime: '',
      latitude: null,
      longitude: null,
      address: '',
      telephone: '',
      description: '',
      email: '',
      sponsors: '',
      sponsorList: [''],
      undertakers: '',
      undertakerList: ['']
    },
    delImgs: [],
    activityTypes: [],
    activityTypeList: [],
    //正在定位，防止连点
    isLocating: false,
    //表单验证通过
    isOk: true,
    letterCount: 1000

  },
  //选择活动类型
  bindPickerChange: function (e) {
    var { form, activityTypeList } = this.data;
    var index = e.detail.value || 0;
    form.typeIndex = index;
    form.type = activityTypeList[index].id;
    this.setData({ form: form });
  },
  //定位
  locate: function(e){
    var that = this;
    var { form, isLocating } = this.data;
    if(isLocating){
      return false;
    }
    this.setData({ isLocating: true });
    wx.chooseLocation({
      success: function(res){
        var { latitude, longitude } = res;
        form.latitude = latitude;
        form.longitude = longitude; 
        that.setData({ form: form });
      },
      fail: function(res) {
      },
      complete: function(res) {
        that.setData({ isLocating: false });
      }
    })
  },
  bindFormData(e) {
    var key = e.target.dataset.key;
    var value = e.detail.value;
    var form = this.data.form;
    form[key] = value;
    this.setData({ form: form });

     if (key=='description') {
      var _len = 1000 - (e.detail.value).length;
      if (_len <= 10) {
        this.setData({
          tips: true
        });
      } else {
        this.setData({
          tips: false
        });
      }
      this.setData({
        letterCount: _len
      });

    }
  },
  //日期发生变化
  bindDateChange: function (e) {
    var key = e.target.dataset.key;
    var value = e.detail.value;
    var form = this.data.form;
    form[key] = value;
    this.setData({ 
      form: form,
      startSufRange: formatDate(new Date()) == form.startPre ? formatHour(new Date()) : '00:00',
      endPreRange: form.startPre,
      endSufRange: form.startPre == form.endPre ? form.startSuf : '00:00'
    });
  },
  //点击 设置主图
  changeMainImgFn: function (e) {
    var index = e.target.dataset.index;
    var form = this.data.form;
    form.imgs.map((item, i) => {
      item.isMain = i == index;
      return item;
    });
    this.setData({ form: form });
  },
  //添加活动图片
  chooseActivityPic(e) {
    var that = this;
    var form = this.data.form;
    var isInit = false;
    if (form.imgs.length >= 9) { //最多9张
      return false;
    }
    if (form.imgs.length <= 0) { //默认第一张为主图
      isInit = true;
    }
    wx.chooseImage({
      count: 9 - form.imgs.length,
      success: function (res) {
        form.imgs = form.imgs.concat(res.tempFilePaths.map((item, index) => {
          return { imgUrl: item, isMain: isInit && (index == 0), isNew: true };
        }));
        that.setData({ form: form });
      }
    });
  },
  //删除供应单图片
  deleteActivityPic(e) {
    var index = e.target.dataset.index;
    var form = this.data.form;
    var img = form.imgs[index];
    if(!!img.id){ //删除已保存图片
      var delImgs = this.data.delImgs;
      delImgs.push(img);
    }
    form.imgs.splice(index, 1); //删除图片
    if(img.isMain && form.imgs.length > 0){ //如果删除了主图，设置第一张为主图
      form.imgs[0].isMain = true;
    }
    this.setData({ form: form });
  },
  //添加主办方
  addSponsor(e) {
    var form = this.data.form;
    form.sponsorList.push('');
    this.setData({ form: form });
  },
  //删除主办方
  delSponsor(e) {
    var index = e.target.dataset.index;
    var form = this.data.form;
    form.sponsorList.splice(index, 1);
    this.setData({ form: form });
  },
  //编辑主办方
  editSponsor(e) {
    var index = e.target.dataset.index;
    var value = e.detail.value;
    var form = this.data.form;
    form.sponsorList[index] = value;
    this.setData({ form: form });
  },
  //添加承办方
  addUndertaker(e) {
    var form = this.data.form;
    form.undertakerList.push('');
    this.setData({ form: form });
  },
  //删除承办方
  delUndertaker(e) {
    var index = e.target.dataset.index;
    var form = this.data.form;
    form.undertakerList.splice(index, 1);
    this.setData({ form: form });
  },
  //编辑承办方
  editUndertaker(e) {
    var index = e.target.dataset.index;
    var value = e.detail.value;
    var form = this.data.form;
    form.undertakerList[index] = value;
    this.setData({ form: form });
  },
  onLoad: function (options) {
    var activityId = options.activityId;
    if(!activityId){
      wx.redirectTo({ url: '../goBack/goBack?type=activity' });
      return;
    }
    var that = this;
    var user = wx.getStorageSync('user_info');

    var now = new Date();
    var startPreRange = formatDate(now);
    var startSufRange = formatHour(now);
    this.setData({
      startPreRange: startPreRange,
      startSufRange: startSufRange,
      endPreRange: startPreRange,
      endSufRange: startSufRange
    });

    wx.request({
      url: domain + '/activity/selectById',
      data: { id: activityId },
      method: 'GET',
      success: function(res){
        var { status, msg, activity, imgList, now } = res.data;
        if(msg == 'success'){
          imgList = imgList.map(item => {
            var random = ~~(Math.random() * 5);
            if (random == 0) random = '';
            item.imgUrl = 'http://img' + random + '.99114.com' + item.imgUrl;
            return item;
          });
          var form = that.data.form;
          console.log(form)
          form.id = activity.id;
          form.title = activity.title;
          form.type = activity.type;
          form.latitude = activity.latitude;
          form.longitude = activity.longitude;
          form.address = activity.address;
          form.telephone = activity.telephone;
          form.description = activity.description;
          form.email = activity.email;
          form.imgs = imgList;
          form.sponsorList = form.sponsors.split(',') || [''];
          form.undertakerList = form.undertakers.split(',') || [''];
          form.startTime = activity.startTime;
          form.endTime = activity.endTime;
          form.startPre = formatDate(new Date(form.startTime));
          form.startSuf = formatHour(new Date(form.startTime));
          form.endPre = formatDate(new Date(form.endTime));
          form.endSuf = formatHour(new Date(form.endTime));
          form.exhibitionId = activity.exhibitionId;
          form.exhibitionName = activity.exhibitionName;
          console.log(form)
          that.setData({ form: form });
        }else{
          wx.redirectTo({ url: '../goBack/goBack?type=activity' });
          return;
        }
      },
      fail: function(res) {
        // fail
      },
      complete: function(res) {
        //活动分类
        wx.request({
          url: domain + '/activitytype/selectAllValid',
          method: 'GET',
          success: function(res){
            var list = res.data.list;
            var form = that.data.form;
            if(!!list){
              var activityTypes = list.map((item, index) => {
                if(item.id == form.type){
                  form.typeIndex = index;
                }
                return item.name;
              });
              that.setData({
                activityTypes: activityTypes,
                activityTypeList : list,
                form: form
              });
            }
          }
        });
      }
    });
  },
  onShow() {
    var chooseExhibition = app.globalData.chooseExhibition;
    if (!!chooseExhibition) {
      var form = this.data.form;
      form.exhibitionId = chooseExhibition.id;
      form.exhibitionName = chooseExhibition.name;
      this.setData({ form: form });
    }
  },
  ohShitfadeOut() {
    var fadeOutTimeout = setTimeout(() => {
      this.setData({ errorMsg: '' });
      clearTimeout(fadeOutTimeout);
    }, 3000);
  },
  //校验表单
  validateForm(){
    var form = this.data.form;
    if (validater.isEmpty(form.type)) {
      this.setData({ errorMsg: '请选择活动类型' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.exhibitionId)) {
      this.setData({ errorMsg: '请选择活动归属' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.title)) {
      this.setData({ errorMsg: '请填写活动标题' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.maxLength(form.title, 96)) {
      this.setData({ errorMsg: '活动标题不能大于48个字' });
      this.ohShitfadeOut();
      return false;
    } else if (form.imgs.length <= 0) {
      this.setData({ errorMsg: '请上传活动图片' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.startPre) || validater.isEmpty(form.startSuf) ||
      validater.isEmpty(form.endPre) || validater.isEmpty(form.endSuf)) {
      this.setData({ errorMsg: '请填写开始时间和结束时间' });
      this.ohShitfadeOut();
      return false;
    } else if ((form.startPre + form.startSuf) > (form.endPre + form.endSuf)) {
      this.setData({ errorMsg: '开始时间不能大于结束时间' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.latitude) || validater.isEmpty(form.longitude)) {
      this.setData({ errorMsg: '请获取活动定位' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.address)) {
      this.setData({ errorMsg: '请填写活动地址' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.maxLength(form.address, 334)) {
      this.setData({ errorMsg: '活动地址不能大于168个字' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.telephone)) {
      this.setData({ errorMsg: '请填写联系方式' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.isTel(form.telephone) && !validater.isPhone(form.telephone)) {
      this.setData({ errorMsg: '联系方式格式不正确' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.description)) {
      this.setData({ errorMsg: '请填写活动详情' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.maxLength(form.description, 2000)) {
      this.setData({ errorMsg: '活动详情不能大于1000个字' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.isEmpty(form.email) && !validater.isEmail(form.email)) {
      this.setData({ errorMsg: '邮箱格式不正确' });
      this.ohShitfadeOut();
      return false;
    } else {
      this.setData({ errorMsg: '' });
      return true;
    }
  },
  //提交表单
  submit: function(e){
    var that = this;
    var isOk = this.validateForm();
    if (!isOk) {
      return false;
    }
    var form = this.data.form;
    form.sponsors = form.sponsorList.join(',');
    form.undertakers = form.undertakerList.join(',');
    form.startTime = form.startPre + ' ' + form.startSuf + ":00";
    form.endTime = form.endPre + ' ' + form.endSuf + ":00";
    wx.showToast({
      title: '正在提交修改',
      icon: 'loading',
      mask: true,
      duration: 5000
    });
    if(wx.showLoading){
      wx.showLoading({
        title: '提交中'
      })
    }
    wx.request({
      url: domain + '/activity/update',
      data: form,
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res){
        var { msg, status, activity } = res.data;
        if(msg == "success"){
          var activityId = activity.id;
          if (activityId > 0) {
            //保存图片
            that.uploadActivityImg(activityId);
            //删除图片
            var delImgs = that.data.delImgs;
            for (var index in delImgs) {
              var id = delImgs[index].id;
              if(!id){ continue; }
              wx.request({
                url: domain + '/activity/delimg',
                data: { id: id },
                method: 'GET',
                complete: function(res) {
                  // console.log(res);
                }
              });
            }
          }
        }else{
          wx.hideToast();
          wx.showToast({
            title: '修改活动失败',
            icon: 'loading',
            image: '../../image/icon_fail.png',
            mask: true,
            duration: 1000
          });
        }
      },
      fail: function(res) {
        wx.hideToast();
        wx.showToast({
          title: '修改活动失败',
          icon: 'loading',
          image: '../../image/icon_fail.png',
          mask: true,
          duration: 1000
        });
      },
      complete: function(){
        if(wx.hideLoading){
          wx.hideLoading();
        }
      }
    });
  },
  //递归上传采购图片，因为部分安卓机型不支持并行。。
  uploadActivityImg(activityId, index) {
    var that = this;
    index = index || 0;
    var imgFiles = this.data.form.imgs;
    if(!imgFiles || imgFiles.length <= 0 || index >= imgFiles.length){
      wx.hideToast();
      wx.redirectTo({ url: '../activityDetail/activityDetail?activityId=' + activityId });
      return false;
    }
    var next = index + 1;

    var img = imgFiles[index];
    var imgUrl = img.imgUrl;
    var isMain = img.isMain == 1 ? 1 : parseInt(index) + 2;
    var isNew = img.isNew;
    if(isNew){ //保存新增图片
      wx.uploadFile({
      url: domain + '/activity/upload',
        filePath: imgFiles[index].imgUrl,
        name: 'file',
        header: { 'content-type': 'multipart/form-data' },
        formData: { activityId: activityId, isMain: isMain },
        success: function (res) {
          // console.log(res);
        },
        fail: function (res) {
          // console.log(res);
        },
        complete: function(res){
          that.uploadActivityImg(activityId, next);
        }
      });
    }else{ //保存修改图片
      wx.request({
        url: domain + '/activity/updateimg',
        data: { id: img.id, isMain: isMain },
        method: 'GET',
        success: function (res) {
          // console.log(res);
        },
        fail: function (res) {
          // console.log(res);
        },
        complete: function(res){
          that.uploadActivityImg(activityId, next);
        }
      });
    }
  },
});