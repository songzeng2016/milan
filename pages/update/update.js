import { formatDate } from '../../utils/util';
import { formatCent } from '../../utils/moneyUtil';
import { Touches } from '../../utils/Touches';
import { domain } from '../../utils/domain';
var app = getApp();
var validater = app.validater;
var gps_longitude = 0;
var gps_latitude = 0;
Page({
  Touches: new Touches(),
  data: {
    supply_Form: {
      id: "",
      userId: wx.getStorageSync("login_key").split("_")[2] || 0,
      title: "",
      minPrice: "",
      telephone: "",
      description: "",
      longitude: 0,
      latitude: 0,
      imgs: [],
      originProvince: "",
      originCity: "",
      attrs: [],
      unit: ""
    },
    delImgs: [],
    isAttrPopOpen: false,  //选择属性的弹窗是否打开
    supplyLocateError: false,
    showSupplyDesc: false,
    supplyDesc: "",
    //记录商品详情的内容
    areaSupply: "",
    areaPurchase: "",
    //日期初始值为当前的日期
    date: "2017-11-08",
    //开始日期
    dateStart: "2017-03-08",
    //截止日期
    dateEnd: "2017-11-08",
    //默认规格属性的提示
    defaultAttrs: [
      { key: "例：品牌", value: "例：红富士" }, { key: "例：产地", value: "例：陕西安塞" }
    ],
    //临时属性
    attrs: [],
    supplyLetterCount: 1000,
    supplyTitleTip: false,
    scrollTop: 100,
  },
  //弹出属性编辑窗口
  editAttrs: function (e) {
    this.setData({ isAttrPopOpen: true });
    var attrs = this.data.supply_Form.attrs;
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
      this.setData({ popErrorMsg: '' });
      clearTimeout(fadeOutTimeout);
    }, 3000);
  },
  //确认编辑过的属性
  confirmAttrEdit(e) {
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
    var form = this.data.purchase_form;
    form[key] = value;
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
          return { imgUrl: item, isMain: isInit && (index == 0), isNew: true };
        }));
        that.setData({ supply_Form: form });
      }
    });
  },
  //删除供应单图片
  deleteSupplyPic(e) {
    var index = e.target.dataset.index;
    var form = this.data.supply_Form;
    var img = form.imgs[index];
    if(!!img.id){ //删除已保存图片
      var delImgs = this.data.delImgs;
      delImgs.push(img);
    }
    form.imgs.splice(index, 1); //删除图片
    if(img.isMain && form.imgs.length > 0){ //如果删除了主图，设置第一张为主图
      form.imgs[0].isMain = true;
    }
    this.setData({ supply_Form: form });

  },
  //打开供应标题提示弹窗
  showSupplyTitleTip() {
    this.setData({ supplyTitleTip: true });
  },
  //关闭供应标题提示弹窗
  closeSupplyTitleTip() {
    this.setData({ supplyTitleTip: false });
  },
  //清空手机号码
  resetSupplyTelephone() {
    var form = this.data.supply_Form;
    form.telephone = '';
    this.setData({ supply_Form: form, telerrorMsg: '' });
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
  //简介字数控制 
  supplyLetterCountFn(e) {
    var length = 1000 - (e.detail.value).length;
    this.data.supplyDesc = e.detail.value;
    this.setData({ supplyLetterCount: length });
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
  //验证供应表单
  validateSupply() {
    var form = this.data.supply_Form;
    var attrs = form.attrs.filter(item => {
      return !!item.key || !!item.value;
    });
    if (validater.isEmpty(form.title)) {
      this.setData({ errorMsg: '请填写商品标题' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.hasTel(form.title)) {
      this.setData({ errorMsg: '内容中不能包含手机号，请重新修改' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.maxLength(form.title, 96)) {
      this.setData({ errorMsg: '商品标题最多输入48个字' });
      this.ohShitfadeOut();
      return false;
    } else if (form.imgs.length <= 0) {
      this.setData({ errorMsg: '请上传商品图片' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.minPriceStr)) {
      this.setData({ errorMsg: '请填写商品单价' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.isPrice(form.minPriceStr)) {
      this.setData({ errorMsg: '最多输入两位小数' });
      this.ohShitfadeOut();
      return false;
    } else if (form.minPriceStr.toString().length > 14) {
      this.setData({ errorMsg: '最多输入12位数字(含小数点)' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.unit)) {
      this.setData({ errorMsg: '请填写商品单位' });
      this.ohShitfadeOut();
      return false;
    } else if (!attrs || attrs.length <= 0) {
      this.setData({ errorMsg: '请选择属性规格' });
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
    } else if (!validater.isEmpty(form.description) && !validater.maxLength(form.description, 2000)) {
      return false;
    } else {
      this.setData({ errorMsg: '' });
      return true;
    }
  },
  //供应提交按钮
  supplySubmit: function (e) {
    var that = this;
    if (!this.validateSupply()) {
      return false;
    }
    wx.showToast({
      title: '修改提交中',
      mask: true,
      icon: 'loading',
      duration: 100000
    });
    setTimeout(function () {
      var form = that.data.supply_Form;
      var imgFiles = that.data.supply_Form.imgs;
      that.setData({ supply_Form: form });
      //补丁。。。后台字段名称跟前台不一致
      form.properties = JSON.stringify(form.attrs);
      //未通过的修改后变成待审核
      if(form.status == 3){
        form.status = 0;
      }
      //保存供应
      wx.request({
        url: domain + '/supply/update',
        data: form,
        method: 'POST',
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        success: function (res) {
          if (res.data.status == -2) {
            that.setData({ errorMsg: '相同标题已存在，请重新修改' });
            return false;
          }
          if (res.data.msg == "success") {
            var supId = res.data.supplyId;
            if (supId > 0) {
              //保存图片
              that.uploadSupplyImg(supId);
              //删除图片
              var delImgs = that.data.delImgs;
              for (var index in delImgs) {
                var id = delImgs[index].id;
                if(!id){ continue; }
                wx.request({
                  url: domain + '/supply/delimg',
                  data: { id: id },
                  method: 'GET',
                  complete: function(res) {
                    console.log(res);
                  }
                });
              }
            }
            wx.showModal({
              title: '提示',
              content: '修改成功',
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
          wx.showModal({
            title: '提示',
            content: '提交失败，请稍后再试',
            showCancel: false
          });
        },
        complete: function(){
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
  //递归上传供应图片，因为部分安卓机型不支持并行。。
  uploadSupplyImg(supId, index) {
    var that = this;
    index = index || 0;
    var imgFiles = this.data.supply_Form.imgs;
    if(!imgFiles || imgFiles.length <= 0 || index >= imgFiles.length){
      var supply_Form = this.data.supply_Form;
      supply_Form.imgs = []; //清空图片
      this.setData({ supply_Form: supply_Form });
      return false;
    }
    var next = index + 1;

    var img = imgFiles[index];
    var imgUrl = img.imgUrl;
    var isMain = img.isMain == 1 ? 1 : parseInt(index) + 2;
    var isNew = img.isNew;
    if(isNew){ //保存新增图片
      wx.uploadFile({
      url: domain + '/supply/upload',
        filePath: imgFiles[index].imgUrl,
        name: 'file',
        header: { 'content-type': 'multipart/form-data' },
        formData: { supplyId: supId, isMain: isMain },
        success: function (res) {
          // console.log(res);
        },
        fail: function (res) {
          // console.log(res);
        },
        complete: function(res){
          that.uploadSupplyImg(supId, next);
        }
      });
    }else{ //保存修改图片
      wx.request({
        url: domain + '/supply/updateimg',
        data: { id: img.id, isMain: isMain },
        method: 'GET',
        success: function (res) {
          // console.log(res);
        },
        fail: function (res) {
          // console.log(res);
        },
        complete: function(res){
          that.uploadSupplyImg(supId, next);
        }
      });
    }
  },
  onLoad: function (options) {
    var id = options.id;
    var that = this;
    wx.request({
      url: domain + '/supply/selectById',
      data: { id: id },
      method: 'GET',
      success: function (res) {
        var { msg, supply, imgMap, user } = res.data;
        imgMap = imgMap.map(item => {
          var random = ~~(Math.random() * 5);
          if(random == 0) random = '';
          item.imgUrl = 'http://img' + random + '.99114.com' + item.imgUrl;
          item.isMain = item.isMain == 1;
          return item;
        });
        var form = that.data.supply_Form;
        form.title = supply.title;
        form.minPrice = supply.minPrice;
        form.minPriceStr = supply.minPrice / 100.0;
        form.unit = supply.unit;
        form.longitude = supply.longitude;
        form.latitude = supply.latitude;
        form.userId = wx.getStorageSync("login_key").split("_")[2] || 0;
        form.description = supply.description;
        form.originCity = supply.originCity;
        form.originProvince = supply.originProvince;
        form.address = supply.address;
        form.imgs = imgMap;
        form.id = supply.id;
        form.status = supply.status;
        form.telephone = supply.telephone;
        try {
          form.attrs= JSON.parse(supply.properties);
        } catch (e) {
          form.attrs = [];
        }
        that.setData({
          supply_Form: form
        });
      }
    });
    
    this.setData({
      dateStart: formatDate(new Date())
    });

  }
});