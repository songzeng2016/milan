import { formatDate } from '../../utils/util';
import { formatCent } from '../../utils/moneyUtil';
import { Touches } from '../../utils/Touches';
import { domain } from '../../utils/domain';
import { wk } from '../../utils/wk';
import { auth } from '../../utils/auth';

//  组件的引入
import { Switch } from '../../components/switch/switch.js';

var app = getApp();
var validater = app.validater;
var gps_longitude = 0;
var gps_latitude = 0;
Page({
  Touches: new Touches(),
  data: {
    supply_Form: {
      userId: 0,
      title: "",
      minPrice: "",
      telephone: "",
      description: "",
      longitude: null,
      latitude: null,
      address: "",
      imgs: [],
      attrs: [],
      unit: ""
    },
    purchase_Form: {
      id: 0,
      userId: 0,
      title: "",
      telephone: "",
      imgs: [],
      comment: "",
      deadLine: "",
      longitude: null,
      latitude: null,
      address: "",
      catrgoryIndex: null,
      catrgoryId: null,
      amount: "",
    },
    switch_selNum: 0,
    switch_selTypes: ["发布供应", "发布求购"],
    swicth_selTitles: ["发布供应", "发布求购"],
    isAttrPopOpen: false,  //选择属性的弹窗是否打开
    supplyLocateError: false,
    purchaseLocateError: false,
    showSupplyDesc: false,
    showPurchaseComment: false,
    supplyDesc: "",
    purchaseComment: "",
    //开始日期
    dateStart: "",
    //截止日期
    dateEnd: "",
    //默认规格属性的提示
    defaultAttrs: [
      { key: "例：品牌", value: "例：红富士" }, { key: "例：产地", value: "例：陕西安塞" }
    ],
    purchaseCategoryList: [],
    //临时属性
    attrs: [],
    shareCloseSeconds: 3,
    showShare1: false,
    showShare2: false,
    supplyLetterCount: 1000,
    purchaseLetterCount: 1000,
    supplyTitleTip: false,
    purchaseTitleTip: false,
    scrollTop: 100,
    //供应上架数量
    supplyShowCount: 0,
    //供应待上架数量
    supplyWaitCount: 0,
    //采购上架数量
    purchaseShowCount: 0,
    //采购待上架数量
    purchaseWaitCount: 0
  },
  sup_swichtConFn: function (e) {
    var index = e.detail.current
    this.setData({ switch_selNum: index });
  },
  //弹出属性编辑窗口
  editAttrs: function (e) {
    this.setData({ isAttrPopOpen: true });
    var attrs = this.data.supply_Form.attrs;
    var length = attrs.length;
    if (attrs.length < 2) { //补全到2条
      for (var i = 0; i < 2 - length; i++) {
        attrs.push({});
      }
    }
    this.setData({ attrs: attrs });
  },
  //添加属性
  addAttr(e) {
    var attrs = this.data.attrs;
    attrs.push({});
    //先加属性再滚动，同时设置无法正常滚动
    this.setData({ attrs: attrs });
    this.setData({
      scrollTop: this.data.scrollTop + 235
    });

  },
  //输入属性和属性值
  inputAttr(e) {
    var type = e.target.dataset.type;
    var index = e.target.dataset.index;
    var value = e.detail.value;
    var attrs = this.data.attrs;
    attrs[index][type] = value;
    this.setData({ attrs: attrs });
  },
  //删除属性
  removeAttr(e) {
    var index = e.target.dataset.index;
    var attrs = this.data.attrs;
    attrs.splice(index, 1);
    this.setData({ attrs: attrs });
  },
  //author sw
  ohShitfadeOut() {
    var fadeOutTimeout = setTimeout(() => {
      this.setData({ popErrorMsg: '', errorMsg1: '', errorMsg2: '' });
      clearTimeout(fadeOutTimeout);
    }, 3000);
  },
  //确认编辑过的属性
  confirmAttrEdit(e) {
    setTimeout(() => {
      var form = this.data.supply_Form;
      var attrs = this.data.attrs;
      var tempAttrs = attrs.filter(item => {
        return !!item.key || !!item.value;
      });
      if (!tempAttrs || tempAttrs.length < 2) {
        this.setData({ popErrorMsg: '至少填写2个产品属性' });
        this.ohShitfadeOut();
        return false;
      }
      for (var i = 0; i < attrs.length; i++) {
        if (!attrs[i].key || !attrs[i].value) {
          this.setData({ popErrorMsg: '产品属性不能为空，若没有可删除多余项' });
          this.ohShitfadeOut();
          return false;
        }
      }
      form.attrs = this.data.attrs;
      this.setData({ supply_Form: form });
      this.setData({ attrs: [] }); //清空临时属性
      this.setData({ isAttrPopOpen: false });
    }, 100);
  },
  //取消编辑过的属性
  cancelAttrEdit(e) {
    this.setData({ isAttrPopOpen: false });
  },
  //属性删除移动事件
  touchS(e) {
    if (e.target.dataset.index < 2) {
      return false;
    }
    let startX = this.Touches.getClientX(e);
    startX && this.setData({ startX });
  },
  touchM(e) {
    if (e.target.dataset.index < 2) {
      return false;
    }
    let attrs = this.Touches.touchM(e, this.data.attrs, this.data.startX);
    attrs && this.setData({ attrs });
  },
  touchE(e) {
    if (e.target.dataset.index < 2) {
      return false;
    }
    const width = 105;  // 定义操作列表宽度
    let attrs = this.Touches.touchE(e, this.data.attrs, this.data.startX, width);
    attrs && this.setData({ attrs });
  },
  bindFormData(e) {
    var key = e.target.dataset.key;
    var value = e.detail.value;
    this.data.supply_Form[key] = value;
  },
  bindFormDataPrice(e) {
    var value = e.detail.value;
    var key = e.target.dataset.key;
    var form = this.data.supply_Form;
    if (!!value && !isNaN(value) && value.indexOf('.') != value.length - 1) {
      value = parseFloat(value);
      form.minPrice = parseInt(value * 100);
      form.minPriceStr = value;
    } else {
      form.minPriceStr = value;
    }
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
  bindCategoryChange(e) {
    var { purchase_Form, purchaseCategoryList } = this.data;
    var index = e.detail.value || 0;
    purchase_Form.categoryIndex = index;
    purchase_Form.categoryId = purchaseCategoryList[index].id;
    this.setData({ purchase_Form: purchase_Form });
  },
  //tab切换
  switchTab: function (e) {
    var index = e.target.dataset.current || e.detail.current || 0;
    this.setData({ selectIndex: index });
    if (index == 0) {
      wx.setNavigationBarTitle({ title: '发布商品' });
    } else {
      wx.setNavigationBarTitle({ title: '发布采购单' });
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
  //点击 设置主图
  changeMainImgFn: function (e) {
    var index = e.target.dataset.index;
    var form = this.data.supply_Form;
    form.imgs.map((item, i) => {
      item.isMain = i == index;
      return item;
    });
    this.setData({ supply_Form: form });
  },
  //点击 设置主图
  changeMainImgFn2: function (e) {
    var index = e.target.dataset.index;
    var form = this.data.purchase_Form;
    form.imgs.map((item, i) => {
      item.isMain = i == index;
      return item;
    });
    this.setData({ purchase_Form: form });
  },
  //添加供应表单
  chooseSupplyPic(e) {
    var that = this;
    var form = this.data.supply_Form;
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
          return { imgUrl: item, isMain: isInit && (index == 0) };
        }));
        that.setData({ supply_Form: form });
      }
    });
  },
  //删除供应单图片
  deleteSupplyPic(e) {
    var index = e.target.dataset.index;
    var form = this.data.supply_Form;
    var isMain = form.imgs[index].isMain;
    form.imgs.splice(index, 1); //删除图片
    if (isMain && form.imgs.length > 0) { //如果删除了主图，设置第一张为主图
      form.imgs[0].isMain = true;
    }
    this.setData({ supply_Form: form });
  },
  //清空手机号码
  resetSupplyTelephone() {
    var form = this.data.supply_Form;
    form.telephone = '';
    this.setData({ supply_Form: form, telErrorMsg1: '' });
  },
  resetPurchaseTelephone() {
    var form = this.data.purchase_Form;
    form.telephone = '';
    this.setData({ purchase_Form: form });
  },
  //编辑商品详情
  editSupplyDesc(e) {
    var { supply_Form } = this.data;
    this.setData({
      supplyDesc: supply_Form.description,
      supplyLetterCount: 1000 - (supply_Form.description.length || 0),
      showSupplyDesc: true
    });
  },
  closeSupplyDesc(e) {
    this.setData({ showSupplyDesc: false });
  },
  confirmSupplyDesc(e) {
    //textarea的bug
    setTimeout(() => {
      var { supply_Form, supplyDesc, supplyLetterCount } = this.data;
      if (supplyLetterCount < 0) {
        this.setData({ popErrorMsg: '商品详情不能超过1000个字' });
        this.ohShitfadeOut();
        return false;
      }
      supply_Form.description = supplyDesc;
      this.setData({
        supply_Form: supply_Form,
        showSupplyDesc: false
      });
    }, 100);
  },
  // blurSupplyDesc(e) {
  //   this.data.supplyDesc = e.detail.value;
  // },
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
  supplyLetterCountFn(e) {
    var length = 1000 - (e.detail.value).length;
    this.data.supplyDesc = e.detail.value;
    this.setData({ supplyLetterCount: length });
  },
  purchaseLetterCountFn(e) {
    var length = 1000 - (e.detail.value).length;
    this.data.purchaseComment = e.detail.value;
    this.setData({ purchaseLetterCount: length });
  },
  //定位
  supplyLocate: function (e) {
    var that = this;
    var { supply_Form, isLocating } = this.data;
    if (isLocating) {
      return false;
    }
    this.setData({ isLocating: true });
    wx.chooseLocation({
      success: function (res) {
        var { latitude, longitude } = res;
        supply_Form.latitude = latitude;
        supply_Form.longitude = longitude;
        that.setData({ supply_Form: supply_Form, supplyLocateError: false });
      },
      cancel: function (res) {
        that.setData({ supplyLocateError: false });
      },
      fail: function (res) {
        that.setData({ supplyLocateError: true });
      },
      complete: function (res) {
        that.setData({ isLocating: false });
      }
    });
  },
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
  //验证供应表单
  validateSupply() {
    var form = this.data.supply_Form;
    var attrs = form.attrs.filter(item => {
      return !!item.key || !!item.value;
    });
    if (validater.isEmpty(form.title)) {
      this.setData({ errorMsg1: '请填写商品标题' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.hasTel(form.title)) {
      this.setData({ errorMsg1: '内容中不能包含手机号，请重新修改' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.maxLength(form.title, 96)) {
      this.setData({ errorMsg1: '商品标题最多输入48个字' });
      this.ohShitfadeOut();
      return false;
    } else if (form.imgs.length <= 0) {
      this.setData({ errorMsg1: '请上传商品图片' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.minPriceStr)) {
      this.setData({ errorMsg1: '请填写商品单价' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.isPrice(form.minPriceStr)) {
      this.setData({ errorMsg1: '最多输入两位小数' });
      this.ohShitfadeOut();
      return false;
    } else if (form.minPriceStr.toString().length > 14) {
      this.setData({ errorMsg1: '最多输入12位数字(含小数点)' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.unit)) {
      this.setData({ errorMsg1: '请填写商品单位' });
      this.ohShitfadeOut();
      return false;
    } else if (!attrs || attrs.length <= 0) {
      this.setData({ errorMsg1: '请选择属性规格' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.latitude) || validater.isEmpty(form.longitude)) {
      this.setData({ errorMsg1: '请点击定位' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.address)) {
      this.setData({ errorMsg1: '请填写详细地址' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.maxLength(form.address, 128)) {
      this.setData({ errorMsg1: '详细地址最多输入64个字' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.telephone)) {
      this.setData({ errorMsg1: '请填写手机号码' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.isTel(form.telephone)) {
      this.setData({ errorMsg1: '手机号码格式不正确' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.isEmpty(form.description) && !validater.maxLength(form.description, 2000)) {
      return false;
    } else {
      this.setData({ errorMsg1: '' });
      return true;
    }
  },
  //验证采购表单
  validatePurchase() {
    var form = this.data.purchase_Form;
    if (validater.isEmpty(form.title)) {
      this.setData({ errorMsg2: '请填写采购标题' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.hasTel(form.title)){
      this.setData({ errorMsg2: '内容中不能包含手机号，请重新修改' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.maxLength(form.title, 96)) {
      this.setData({ errorMsg2: '采购标题最多输入48个字' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.categoryId)) {
      this.setData({ errorMsg2: '请选择采购类型' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.amountStr)) {
      this.setData({ errorMsg2: '请填写采购数量' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.isPrice(form.amountStr)) {
      this.setData({ errorMsg2: '采购数量格式不正确' });
      this.ohShitfadeOut();
      return false;
    } else if (form.amountStr.toString().length > 14) {
      this.setData({ errorMsg2: '最多输入12位数字(含小数点)' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.unit)) {
      this.setData({ errorMsg2: '请填写计量单位' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.latitude) || validater.isEmpty(form.longitude)) {
      this.setData({ errorMsg2: '请点击定位' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.address)) {
      this.setData({ errorMsg2: '请填写详细地址' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.maxLength(form.address, 128)) {
      this.setData({ errorMsg2: '详细地址最多输入64个字' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.telephone)) {
      this.setData({ errorMsg2: '请填写手机号码' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.isTel(form.telephone)) {
      this.setData({ errorMsg2: '手机号码格式不正确' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.isEmpty(form.comment) && !validater.maxLength(form.comment, 2000)) {
      return false;
    } else{
      this.setData({ errorMsg2: '' });
      return true;
    }
  },
  //供应提交按钮
  supplySubmit(e) {
    var that = this;
    if (!this.validateSupply()) {
      return false;
    }

    wx.showToast({
      title: '商品提交中',
      mask: true,
      icon: 'loading',
      duration: 100000
    });
    
    setTimeout(function () {
      that.data.supplySubmitLoading = true;
      var form = that.data.supply_Form;
      var imgFiles = that.data.supply_Form.imgs;
      //补丁...后台字段名称跟前台不一致
      form.properties = JSON.stringify(form.attrs);
      //添加供应
      if(wx.showLoading()){
        wx.showLoading({ title: '提交中' })
      }
      wk.post({
        url:'/supplies',
        data: form,
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        }, // 设置请求的 header
        success: function (res) {
          if (res.data.status == -2) {
            wx.hideToast();
            that.setData({ errorMsg1: '相同标题已存在，请重新修改' });
            return false;
          }
          if (res.data.msg == "success") {
            //清空表单
            form.title = "";
            form.minPrice = "";
            form.minPriceStr = "";
            form.unit = "";
            form.description = "";
            form.attrs = [];
            form.address = "";
            form.latitude = null;
            form.longitude = null;
            that.setData({ supply_Form: form });
            //修改用户，保存手机号
            wk.put({
              url:  '/users/' + form.userId,
              data: { id: form.userId, telephone: form.telephone },
              method: 'GET'
            });
            //保存图片
            var supId = res.data.supplyId;
            if (supId > 0) {
              that.uploadSupplyImg(supId);
              
            }
            that.setData({ supId: supId || 0 });
            // that.showShareImg1();
          } else {
            wx.hideToast();
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
          if (wx.hideLoading()) {
            wx.hideLoading();
          }
        }
      });
    }, 100);

  },
  //递归上传供应图片，因为部分安卓机型不支持并行。。

  uploadSupplyImg(supId, index) {
   
    
    index = index || 0;
    var imgFiles = this.data.supply_Form.imgs;
    if (!imgFiles || imgFiles.length <= 0 || index >= imgFiles.length) {
      var supply_Form = this.data.supply_Form;
      supply_Form.imgs = []; //清空图片
      this.setData({ supply_Form: supply_Form });

      var supplyShowCount = this.data.supplyShowCount;
      var type = supplyShowCount < 5 ? 'show' : 'preview';
      wx.hideToast();
      wx.navigateTo({ url: '../supplyDetail/supplyDetail?supplyId=' + supId + '&type=' + type });
      return false;
    }
    var next = index + 1;
    var imgUrl = imgFiles[index].imgUrl;
    var isMain = imgFiles[index].isMain == 1 ? 1 : parseInt(index) + 2;
    wk.uploadFile({
      url: '/supplies/imgs',
      filePath: imgUrl,
      name: 'file',
      header: { 'content-type': 'multipart/form-data' },
      formData: { supplyId: supId, isMain: isMain },
      success: (res) => {  
      },
      fail: (res) => {
      },
      complete: () => {
        uploadImg(supId, index);
      }
    });


  },
  //选择采购单图片
  choosePurchasePic(e) {
    var that = this;
    var form = this.data.purchase_Form;
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
          return { imgUrl: item, isMain: isInit && (index == 0) };
        }));
        that.setData({ purchase_Form: form });
      }
    });
  },
  //删除采购单图片
  deletePurchasePic(e) {
    var index = e.target.dataset.index;
    var form = this.data.purchase_Form;
    var isMain = form.imgs[index].isMain;
    form.imgs.splice(index, 1); //删除图片
    if (isMain && form.imgs.length > 0) { //如果删除了主图，设置第一张为主图
      form.imgs[0].isMain = true;
    }
    this.setData({ purchase_Form: form });
  },
  //提交表单
  purchaseSubmit(e) {
    var that = this;
    if (!this.validatePurchase()) {
      return false;
    }

    wx.showToast({
      title: '采购单提交中',
      mask: true,
      icon: 'loading',
      duration: 100000
    });

    setTimeout(function () {
      that.data.purchaseSubmitLoading = true;
      var form = that.data.purchase_Form;
      var imgFiles = form.imgs;
      //保存采购单
      form.title = utf16toEntities(form.title);
      if (wx.showLoading) {
        wx.showLoading({ title: '提交中' })
      }
      wk.post({
        url: '/supplies',
        data: form,
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        }, // 设置请求的 header
        success: function (res) {
          if (res.data.status == -2) {
            wx.hideToast();
            that.setData({ errorMsg2: '相同标题已存在，请重新修改' });
            return false;
          }
          if (res.data.msg == "success") {
            //清空表单
            form.title = "";
            form.comment = "";
            form.deadLineStr = getDeadLine();
            form.deadLine = form.deadLineStr + ' 00:00:00';
            form.address = "";
            form.latitude = null;
            form.longitude = null;
            form.amount = "";
            form.amountStr = "";
            form.unit = "";
            form.categoryId = null;
            form.categoryIndex = null;
            that.setData({ purchase_Form: form });

            //修改用户，保存手机号
            let userRequestUrl = '/users/' + form.userId;
            wk.put({
              url: userRequestUrl,
              data: { id: form.userId, telephone: form.telephone },
            });
            //保存图片
            var buyId = res.data.buyId;
            if (buyId > 0) {
              that.uploadPurchaseImg(buyId);
            }
            that.setData({ buyId: buyId || 0 });
            // that.showShareImg2();
          } else {
            wx.hideToast();
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
          if (wx.hideLoading) {
            wx.hideLoading();
          }
        }
      });
    }, 100);
  },
  //递归上传采购图片，因为部分安卓机型不支持并行。。
  uploadPurchaseImg(buyId, index) {
    var that = this;
    index = index || 0;
    var imgFiles = this.data.purchase_Form.imgs;
    if (!imgFiles || imgFiles.length <= 0 || index >= imgFiles.length) {
      var purchase_Form = this.data.purchase_Form;
      purchase_Form.imgs = []; //清空图片
      this.setData({ purchase_Form: purchase_Form });

      var purchaseShowCount = this.data.purchaseShowCount;
      var type = purchaseShowCount < 5 ? 'show' : 'preview';
      wx.hideToast();
      wx.navigateTo({ url: '../purchaseDetail/purchaseDetail?buyId=' + buyId + "&type=" + type });
      return false;
    }
    var next = index + 1;
    var imgUrl = imgFiles[index].imgUrl;
    var isMain = imgFiles[index].isMain == 1 ? 1 : parseInt(index) + 2;
    wx.uploadFile({
      url: domain + '/buy/upload',
      filePath: imgUrl,
      name: 'file',
      header: { 'content-type': 'multipart/form-data' },
      formData: { buyId: buyId, isMain: isMain },
      success: function (res) {
        // console.log("上传第" + index + "张成功");
      },
      fail: function (res) {
        // console.log("上传第" + index + "张失败");
        // console.log(res);
      },
      complete: function () {
        that.uploadPurchaseImg(buyId, next);
      }
    });
  },
  onShow: function (options) {
    //授权验证
    auth('userLocation');
    var publishType;
    try {
      publishType = wx.getStorageSync('publishType');
      wx.removeStorageSync('publishType');
      if (!!publishType) {
        console.log("publishType is not empty");
        this.setData({ switch_selNum: publishType == 'supply' ? 0 : 1 });
      }
    } catch (e) {
    }

    var that = this;
    var userId = wx.getStorageSync('login_key').split("_")[2];
    //获取用户
    if (!!userId) {
      wk.get({
        url: '/users/' + userId,
        success: function (res) {
          var { msg, user} = res.data;
          if (msg == "success" && !!user) {
            var supply_Form = that.data.supply_Form;
            var purchase_Form = that.data.purchase_Form;
            supply_Form.telephone = user.telephone || "";
            purchase_Form.telephone = user.telephone || "";
            that.setData({ supply_Form: supply_Form, purchase_Form: purchase_Form });
          }
        }
      });
      wk.get({
        url: '/supplies/publishcount',
        data: { userId: userId },
        method: 'GET',
        success: (res) => {
          var { status, msg, showCount, waitCount } = res.data;
          if (msg == 'success') {
            this.setData({ supplyShowCount: showCount, supplyWaitCount: waitCount });
          }
        }
      });
      wk.get({
        url: '/buys/publishcount',
        data: { userId: userId },
        success: (res) => {
          var { status, msg, showCount, waitCount } = res.data;
          if (msg == 'success') {
            this.setData({ purchaseShowCount: showCount, purchaseWaitCount: waitCount });
          }
        }
      });
    }
    
  },
  onLoad: function () {
    var switchs = new Switch(this);
    switchs.bindEvents();
    var that = this;

    var userId = wx.getStorageSync("login_key").split("_")[2] || 0;

    var purchase_Form = this.data.purchase_Form;
    purchase_Form.deadLineStr = getDeadLine();
    purchase_Form.deadLine = purchase_Form.deadLineStr + ' 00:00:00';
    purchase_Form.userId = userId;
    var supply_Form = this.data.supply_Form;
    supply_Form.userId = userId;
    this.setData({
      dateStart: formatDate(new Date()),
      purchase_Form: purchase_Form,
      supply_Form: supply_Form
    });

    wk.get({
      url: '/buycategories/',
      data: {},
      success: (res) => {
        var { status, msg, list } = res.data;
        if (msg == 'success') {
          this.setData({ purchaseCategoryList: list });
        }
      }
    });
  },
  onShareAppMessage: function () {

  },
  showShareInterval: null,
  showShareImg1() {
    var that = this;
    this.setData({ showShare1: true, shareCloseSeconds: 3 });
    this.showShareInterval = setInterval(function () {
      var shareCloseSeconds = that.data.shareCloseSeconds;
      if (shareCloseSeconds > 0) {
        that.setData({ shareCloseSeconds: shareCloseSeconds - 1 });
      } else {
        that.previewShareImg1();
        clearInterval(that.showShareInterval);
      }
    }, 1000);
  },
  previewShareImg1() {
    this.setData({ showShare1: false });
    clearInterval(this.showShareInterval);
    var id = this.data.supId;
    if (!id) {
      return false;
    }
    var url = domain + '/supply/shareimg?id=' + id + "&t=" + new Date().getTime();
    wx.previewImage({
      urls: [url],
      success: function () {
        wx.navigateTo({ url: '../supplyManage/supplyManage' });
      }
    });
  },
  closeShareImg1() {
    this.setData({ showShare1: false });
    clearInterval(this.showShareInterval);
    wx.navigateTo({ url: '../supplyManage/supplyManage' });
  },
  showShareImg2() {
    var that = this;
    this.setData({ showShare2: true, shareCloseSeconds: 3 });
    this.showShareInterval = setInterval(function () {
      var shareCloseSeconds = that.data.shareCloseSeconds;
      if (shareCloseSeconds > 0) {
        that.setData({ shareCloseSeconds: shareCloseSeconds - 1 });
      } else {
        that.previewShareImg2();
        clearInterval(that.showShareInterval);
      }
    }, 1000);
  },
  previewShareImg2() {
    this.setData({ showShare2: false });
    clearInterval(this.showShareInterval);
    var id = this.data.buyId;
    if (!id) {
      return false;
    }
    var url = domain + '/buy/shareimg?id=' + id + "&t=" + new Date().getTime();
    wx.previewImage({
      urls: [url],
      success: function () {
        wx.navigateTo({ url: '../purchaseManage/purchaseManage' });
      }
    });
  },
  closeShareImg2() {
    this.setData({ showShare2: false });
    clearInterval(this.showShareInterval);
    wx.navigateTo({ url: '../purchaseManage/purchaseManage' });
  },
  //打开供应标题提示弹窗
  showSupplyTitleTip() {
    this.setData({ supplyTitleTip: true });
  },
  //关闭供应标题提示弹窗
  closeSupplyTitleTip() {
    this.setData({ supplyTitleTip: false });
  },
  //打开采购标题提示弹窗
  showPurchaseTitleTip() {
    this.setData({ purchaseTitleTip: true });
  },
  //关闭采购标题提示弹窗
  closePurchaseTitleTip() {
    this.setData({ purchaseTitleTip: false });
  }

});
//根据当前时间后的第30天计算为截止日期
function getDeadLine() {
  var deadLine = new Date();
  deadLine.setDate(new Date().getDate() + 30);
  return formatDate(deadLine);
}

function utf16toEntities(str) {
  var patt = /[\ud800-\udbff][\udc00-\udfff]/g; // 检测utf16字符正则  
  str = str.replace(patt, function (char) {
    var H, L, code;
    if (char.length === 2) {
      H = char.charCodeAt(0); // 取出高位  
      L = char.charCodeAt(1); // 取出低位  
      code = (H - 0xD800) * 0x400 + 0x10000 + L - 0xDC00; // 转换算法  
      return "&#" + code + ";";
    } else {
      return char;
    }
  });
  return str;
}  