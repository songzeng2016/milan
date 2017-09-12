import { formatDate, formatTime } from '../../utils/util';
import { domain } from '../../utils/domain';
var app = getApp();
var validater = app.validater;

Page({
  data: {
    purchase_Form: {
      id: 0,
      userId: wx.getStorageSync("login_key").split("_")[2] || 0,
      title: "",
      telephone: "",
      imgs: [],
      comment: "",
      deadLine: "",
      longitude: 0,
      latitude: 0
    },
    delImgs: [],
    isAttrPopOpen: false,  //选择属性的弹窗是否打开
    isAreaWakeUp: false,
    purchaseLocateError: false,
    showPurchaseComment: false,
    purchaseComment: "",
    purchaseCategoryList: [],
    //日期初始值为当前的日期
    date: "2017-11-08",
    //开始日期
    dateStart: "",
    purchaseLetterCount: 1000,
    supplyTitleTip: false,
    scrollTop: 100
  },
  bindPurchaseFormData(e) {
    var key = e.target.dataset.key;
    var value = e.detail.value;
    var form = this.data.purchase_Form;
    form[key] = value;
  },
  bindPurchaseFormDataAmount(e) {
    var value = e.detail.value;
    var key = e.target.dataset.key;
    var form = this.data.purchase_Form;
    if (!!value && !isNaN(value) && value.indexOf('.') != value.length - 1) {
      value = parseFloat(value);
      form.amount = parseInt(value * 100);
      form.amountStr = value;
    } else {
      form.amountStr = value;
    }
  },
  //日期发生变化
  bindDateChange: function (e) {
    var deadLine = e.detail.value;
    var purchase_Form = this.data.purchase_Form;
    purchase_Form.deadLine = deadLine + ' 00:00:00';
    purchase_Form.deadLineStr = deadLine;
    this.setData({ purchase_Form: purchase_Form });
  },
  bindCategoryChange(e) {
    var { purchase_Form, purchaseCategoryList } = this.data;
    var index = e.detail.value || 0;
    purchase_Form.categoryIndex = index;
    purchase_Form.categoryId = purchaseCategoryList[index].id;
    this.setData({ purchase_Form: purchase_Form });
  },
  changeMainImgFn2: function (e) {
    var index = e.target.dataset.index;
    var form = this.data.purchase_Form;
    form.imgs.map((item, i) => {
      item.isMain = i == index;
      return item;
    });
    this.setData({ purchase_Form: form });
  },
  //author sw
  ohShitfadeOut() {
    var fadeOutTimeout = setTimeout(() => {
      this.setData({ popErrorMsg: '' });
      clearTimeout(fadeOutTimeout);
    }, 3000);
  },
  //选择采购单图片
  choosePurchasePic(e) {
    var form = this.data.purchase_Form;
    var that = this;
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
        that.setData({ purchase_Form: form });
      }
    });
  },
  //删除采购单图片
  deletePurchasePic(e) {
    var index = e.target.dataset.index;
    var form = this.data.purchase_Form;
    var img = form.imgs[index];
    if(!!img.id){ //删除已保存图片
      var delImgs = this.data.delImgs;
      delImgs.push(img);
    }
    form.imgs.splice(index, 1); //删除图片
    if (img.isMain && form.imgs.length > 0) { //如果删除了主图，设置第一张为主图
      form.imgs[0].isMain = true;
    }
    this.setData({ purchase_Form: form });
  },
  //打开采购标题提示弹窗
  showPurchaseTitleTip() {
    this.setData({ purchaseTitleTip: true });
  },
  //关闭采购标题提示弹窗
  closePurchaseTitleTip() {
    this.setData({ purchaseTitleTip: false });
  },
  //清空手机号码
  resetPurchaseTelephone() {
    var form = this.data.purchase_Form;
    form.telephone = '';
    this.setData({ purchase_Form: form });
  },
  //编辑采购说明
  editPurchaseComment(e) {
    var { purchase_Form } = this.data;
    this.setData({
      purchaseComment: purchase_Form.comment,
      purchaseLetterCount: 1000 - (purchase_Form.comment.length || 0),
      showPurchaseComment: true
    });
  },
  closePurchaseComment(e) {
    this.setData({ showPurchaseComment: false });
  },
  confirmPurchaseComment(e) {
    //textarea的bug
    setTimeout(() => {
      var { purchase_Form, purchaseComment, purchaseLetterCount } = this.data;
      if (purchaseLetterCount < 0) {
        this.setData({ popErrorMsg: '采购说明不能超过1000个字' });
        this.ohShitfadeOut();
        return false;
      }
      purchase_Form.comment = purchaseComment;
      this.setData({
        purchase_Form: purchase_Form,
        showPurchaseComment: false
      });
    }, 100);
  },
  // blurPurchaseComment(e) {
  //   this.data.purchaseComment = e.detail.value;
  // },
  //简介字数控制 
  purchaseLetterCountFn(e) {
    var length = 1000 - (e.detail.value).length;
    this.data.purchaseComment = e.detail.value;
    this.setData({ purchaseLetterCount: length });
  },
  //定位
  purchaseLocate: function (e) {
    var that = this;
    var { purchase_Form, isLocating } = this.data;
    if (isLocating) {
      return false;
    }
    this.setData({ isLocating: true });
    wx.chooseLocation({
      success: function (res) {
        var { latitude, longitude } = res;
        purchase_Form.latitude = latitude;
        purchase_Form.longitude = longitude;
        that.setData({ purchase_Form: purchase_Form, purchaseLocateError: false });
      },
      cancel: function (res) {
        that.setData({ purchaseLocateError: false });
      },
      fail: function (res) {
        that.setData({ purchaseLocateError: true });
      },
      complete: function (res) {
        that.setData({ isLocating: false });
      }
    });
  },
  //验证采购表单
  validatePurchase() {
    var form = this.data.purchase_Form;
    if (validater.isEmpty(form.title)) {
      this.setData({ errorMsg: '请填写采购标题' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.hasTel(form.title)) {
      this.setData({ errorMsg: '内容中不能包含手机号，请重新修改' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.maxLength(form.title, 96)) {
      this.setData({ errorMsg: '采购标题最多输入48个字' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.categoryId)) {
      this.setData({ errorMsg: '请选择采购类型' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.amountStr)) {
      this.setData({ errorMsg: '请填写采购数量' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.isPrice(form.amountStr)) {
      this.setData({ errorMsg: '采购数量格式不正确' });
      this.ohShitfadeOut();
      return false;
    } else if (form.amountStr.toString().length > 14) {
      this.setData({ errorMsg: '最多输入12位数字(含小数点)' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.unit)) {
      this.setData({ errorMsg: '请填写计量单位' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.latitude) || validater.isEmpty(form.longitude)) {
      this.setData({ errorMsg: '请点击定位' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.address)) {
      this.setData({ errorMsg: '请填写详细地址' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.maxLength(form.address, 128)) {
      this.setData({ errorMsg: '详细地址最多输入64个字' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.telephone)) {
      this.setData({ errorMsg: '请填写手机号码' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.isTel(form.telephone)) {
      this.setData({ errorMsg: '手机号码格式不正确' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.isEmpty(form.comment) && !validater.maxLength(form.comment, 2000)) {
      return false;
    } else {
      this.setData({ errorMsg: '' });
      return true;
    }
  },
  //提交表单
  purchaseSubmit(e) {
    var that = this;
    if (!this.validatePurchase()) {
      return false;
    }
    wx.showToast({
      title: '修改提交中',
      mask: true,
      icon: 'loading',
      duration: 100000
    });
    setTimeout(() => {
      var form = this.data.purchase_Form;
      var imgFiles = this.data.purchase_Form.imgs;
      //未通过的修改后变成待审核
      if (form.status == 3) {
        form.status = 0;
      }
      //保存采购单
      wx.request({
        url: domain + '/buy/update',
        data: form,
        method: 'POST',
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        }, // 设置请求的 header
        success: function (res) {
          if (res.data.status == -2) {
            that.setData({ errorMsg: '相同标题已存在，请重新修改' });
            return false;
          }
          if (res.data.msg == "success") {
            //保存图片
            var buyId = res.data.buyId;
            if (buyId > 0) {
              //保存图片
              that.uploadPurchaseImg(buyId);
              //删除图片
              var delImgs = that.data.delImgs;
              for (var index in delImgs) {
                var id = delImgs[index].id;
                if(!id){ continue; }
                wx.request({
                  url: domain + '/buy/delimg',
                  data: { id: id },
                  method: 'GET',
                  complete: function(res) {
                    // console.log(res);
                  }
                });
              }
            }
            wx.showModal({
              title: '提示',
              content: '提交成功 ，感谢支持！',
              showCancel: false,
              success: function () {
                wx.navigateBack({
                  url: '../supplyManage/supplyManage'
                });
              }
            });
          } else {
            wx.showModal({
              title: '提示',
              content: '提交失败，请稍后再试',
              showCancel: false
            });
          }

        },
        fail: function () {
          wx.hideToast();
          wx.showModal({
            title: '提示',
            content: '提交失败，请稍后再试',
            showCancel: false
          });
        },
        complete: function () {
          wx.hideToast();
        }

      });
      //修改用户，保存手机号
      var userId = wx.getStorageSync('login_key').split("_")[2];
      if (!!userId) {
        wx.request({
          url: domain + '/user/updateuser',
          data: { id: userId, telephone: form.telephone },
          method: 'GET'
        });
      }
    }, 100);
  },
  //递归上传采购图片，因为部分安卓机型不支持并行。。
  uploadPurchaseImg(buyId, index) {
    var that = this;
    index = index || 0;
    var imgFiles = this.data.purchase_Form.imgs;
    if(!imgFiles || imgFiles.length <= 0 || index >= imgFiles.length){
      var purchase_Form = this.data.purchase_Form;
      purchase_Form.imgs = []; //清空图片
      this.setData({ purchase_Form: purchase_Form });
      return false;
    }
    var next = index + 1;

    var img = imgFiles[index];
    var imgUrl = img.imgUrl;
    var isMain = img.isMain == 1 ? 1 : parseInt(index) + 2;
    var isNew = img.isNew;
    if(isNew){ //保存新增图片
      wx.uploadFile({
      url: domain + '/buy/upload',
        filePath: imgFiles[index].imgUrl,
        name: 'file',
        header: { 'content-type': 'multipart/form-data' },
        formData: { buyId: buyId, isMain: isMain },
        success: function (res) {
          // console.log(res);
        },
        fail: function (res) {
          // console.log(res);
        },
        complete: function(res){
          that.uploadPurchaseImg(buyId, next);
        }
      });
    }else{ //保存修改图片
      wx.request({
        url: domain + '/buy/updateimg',
        data: { id: img.id, isMain: isMain },
        method: 'GET',
        success: function (res) {
          // console.log(res);
        },
        fail: function (res) {
          // console.log(res);
        },
        complete: function(res){
          that.uploadPurchaseImg(buyId, next);
        }
      });
    }
  },
  onLoad: function (options) {
    var that = this;
    var id = options.id;
    var userId = wx.getStorageSync('login_key').split("_")[2];

    var orig = app.globalData.position;
    this.setData({ orig: orig });

    wx.request({
      url: domain + '/buy/selectById',
      data: { id: id },
      method: 'GET',
      success: function (res) {
        var { msg, buy, imgList, user } = res.data;
        imgList = imgList.map(item => {
          var random = ~~(Math.random() * 5);
          if (random == 0) random = '';
          item.imgUrl = 'http://img' + random + '.99114.com' + item.imgUrl;
          item.isMain = item.isMain == 1;
          return item;
        });
        var form = that.data.purchase_Form;
        form.imgs = imgList;
        form.comment = buy.comment;
        form.title = buy.title;
        form.deadLine = formatTime(new Date(buy.deadLine)).replace(/\//g, '-');
        form.deadLineStr = formatDate(new Date(buy.deadLine));
        form.id = buy.id;
        form.longitude = buy.longitude;
        form.latitude = buy.latitude;
        form.address = buy.address;
        form.userId = buy.userId;
        form.status = buy.status;
        form.telephone = buy.telephone;
        form.categoryId = buy.buyCategory.id;
        form.amount = buy.amount;
        form.amountStr = buy.amount / 100;
        form.unit = buy.unit;
        that.setData({ purchase_Form: form });
      },
      fail: function () {
        // fail
      },
    });

    wx.request({
      url: domain + '/buy/selectAllCategory',
      data: {},
      method: 'GET',
      success: (res) => {
        var { status, msg, list } = res.data;
        var form = this.data.purchase_Form;
        if (msg == 'success') {
          list.forEach((item, index) => {
            if(item.id == form.categoryId){
              form.categoryIndex = index;
            }
          });
          this.setData({ purchaseCategoryList: list, purchase_Form: form });
        }
      }
    });

    this.setData({
      dateStart: formatDate(new Date())
    });
  },
  onShow: function () {
  }

});