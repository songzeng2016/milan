
import { domain } from '../../utils/domain';
import { wk } from '../../utils/wk';
import { auth } from '../../utils/auth';
//  组件的引入
import { Switch } from '../../components/switch/switch.js';
var app = getApp();
var validater = app.validater;
Page({
  data: {
    telephone: '010-64429077-7778',
    //data提交类型
    //当前切换页页
    switch_selNum: 0,
    switch_selTypes:["上报展厅","加盟展厅","入驻展厅"],
    //入驻展厅 默认不显示弹层
    exhibitShowMul: false,
    //展厅 默认不显示弹层
    exhibitShow: false,
    //基地名称列表
    baseList: [],
    //input和view模拟textarea
    isEdit: false,
    isEdit2: false,
    //保存表单数据
    form: {
      userId: 0,
      name: "",
      baseId: 0,
      coordinate: "",
      address: "",
      longitude: 0,
      latitude: 0,
      operator: "",
      telephone: "",
      description: "",
      imgs: [],
      type: 0,
      status: 0
    },
    productForm:{
      corporation:"",
      telephone:"",
      backup:"",
      name:[],
      nameStr:"",
      id:[]
    },
    shareCloseSeconds: 3,
    showShare: false
  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },
  //event上报展厅
  upReportTxtAreaFn:function(e){
    var description = e.detail.value;
    var form = this.data.form;
    form.description = description;
    this.setData({ form: form });
  },
  //event入驻展厅
  exhibitTxtAreaFn: function(e){
    var backup = e.detail.value;
    var productForm = this.data.productForm;
    productForm.backup = backup;
    this.setData({ productForm: productForm });
  },
  //event展厅名称 获得焦点
  exhibitNameFocus: function(e) {
    this.setData({ exhibitShow: true });
  },
  //绑定表单数据到page.data
  bindFormData(e){
    var key = e.target.dataset.key;
    var value = e.detail.value;
    var form = this.data.form;
    form[key] = value;
    this.setData({ form: form });
  },
  finishInput(e){
    var key = e.target.dataset.key;
    var value = e.detail.value;
    var productForm = this.data.productForm;
    productForm[key] = value;
    this.setData({ productForm: productForm })
  },
  showInput(e) {
    this.setData({ isEdit: true });
  },
  hideInput(e) {
    this.setData({ isEdit: false });
  },
  showInput2(e) {
    this.setData({ isEdit2: true });
  },
  hideInput2(e) {
    this.setData({ isEdit2: false });
  },
  //切换
  switchTab(e){
    var current = e.target.dataset.index || e.detail.current || 0;
    this.setData({ switch_selNum: current });
    if(current == 0){
      wx.setNavigationBarTitle({
        title: '上报展厅'
      });
    }else if(current == 1){
      wx.setNavigationBarTitle({
        title: '加盟展厅'
      });
    }else{
      wx.setNavigationBarTitle({
        title: '入驻展厅'
      });
    }
  },
  //选择展厅图片
  choosePic(e){
    var that = this;
    var form = this.data.form;
    var isInit = false;
    if(form.imgs.length >= 9){ //最多9张
      return false;
    }
    if(form.imgs.length <= 0){ //默认第一张为主图
      isInit = true;
    }
    wx.chooseImage({
      count: 9 - form.imgs.length,
      success: function(res){
        form.imgs = form.imgs.concat(res.tempFilePaths.map((item, index) => {
          return { imgUrl: item, isMain: isInit && (index == 0) };
        }));
        that.setData({ form : form });
      }
    });
  },
  //删除展厅图片
  deletePic(e){
    var index = e.target.dataset.index;
    var form = this.data.form;
    var isMain = form.imgs[index].isMain;
    form.imgs.splice(index,1); //删除图片
    if(isMain && form.imgs.length > 0){ //如果删除了主图，设置第一张为主图
      form.imgs[0].isMain = true;
    }
    this.setData({ form: form });
  },
  //选择主图
  changeMainPic(e) {
    var index = e.target.dataset.index;
    var form = this.data.form;
    form.imgs.map((item, i) => {
      item.isMain = i == index;
      return item;
    });
    this.setData({ form: form });
  },
  chooseBase(e){
    var id = e.target.dataset.id;
    var name = e.target.dataset.name;
    var form = this.data.form;
    form.name = name;
    form.baseId = id;
    this.setData({ form: form });
  },
  confirmBase(e){
    this.setData({ exhibitShow: false });
  },
  //入驻展厅  获得焦点出现弹窗 可以多选
  exhibitNameFocusMul:function(){
      this.setData({ exhibitShowMul: true });
  },
  //入驻展厅弹窗 确定
  exhibitOkMulFn:function(e){
      this.setData({ exhibitShowMul: false });
  },
  //入驻展厅  获得焦点出现弹窗 可以多选 
  exhibitSelNumMulFn:function(e){
      var selected = e.target.dataset.selected > 0 ? 0 : 1;
      var id = e.target.dataset.id;
      var name = e.target.dataset.name;
      var baseList = this.data.baseList;
      var productForm = this.data.productForm;
      for(var i = 0; i < baseList.length; i++){
        var one = baseList[i].base;
        for(var j = 0; j < one.length; j++){
          if(one[j].id == id){
            if(one[j].selected > 0){
                //已经存在，删除元素
                var productForm = this.data.productForm;
                for(var k = 0; k < productForm.id.length; k++){
                  if(productForm.id[k] == one[j].id){
                    productForm.id.splice(k,1);
                    productForm.name.splice(k,1);
                  }
                }
            }else{//新增选中的处理办法
                productForm.id.push(one[j].id);
                productForm.name.push(one[j].name);
            }
            productForm.nameStr = productForm.name.join(",");
            this.setData({ productForm: productForm });
            one[j].selected = 1 - parseInt(one[j].selected);
          }
        }
      }
      this.setData({ baseList: baseList });
  
  },
  locateUser(e){
    var that = this;
    var form = this.data.form;
    wx.getLocation({
      type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function(res){
        form.longitude = res.longitude;
        form.latitude = res.latitude;
        form.coordinate = res.longitude + "°, " + res.latitude + "°";
        that.setData({ form: form });
      },
      fail: function(res) {
        console.log(res);
        wx.showModal({
          title: '提示',
          content: '无法确定您当前的位置，请检查您的手机',
          showCancel: false
        });
      }
    })
  },
  ohShitfadeOut() {
    var fadeOutTimeout = setTimeout(() => {
      this.setData({ errorMsg1: '', errorMsg2: '' });
      clearTimeout(fadeOutTimeout);
    }, 3000);
  },
  validate() {
    var form = this.data.form;
    if (validater.isEmpty(form.coordinate)) {
      this.setData({ errorMsg1: '请定位展厅' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.address)) {
      this.setData({ errorMsg1: '请填写展厅地址' });
      this.ohShitfadeOut();
      return false;
    } else if (form.imgs.length <= 0) {
      this.setData({ errorMsg1: '请上传展厅图片' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.name)) {
      this.setData({ errorMsg1: '请选择基地' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.operator)) {
      this.setData({ errorMsg1: '请填写操作人' });
      this.ohShitfadeOut();
      return false;
    } else if (validater.isEmpty(form.telephone)) {
      this.setData({ errorMsg1: '请填写操作人手机号码' });
      this.ohShitfadeOut();
      return false;
    } else if (!validater.isTel(form.telephone)) {
      this.setData({ errorMsg1: '手机号码格式不正确' });
      this.ohShitfadeOut();
      return false;
    } else {
      this.setData({ errorMsg1: '' });
      return true;
    }
  },
  submit(e){
    var that = this;
    var form = this.data.form;
    var imgFiles = this.data.form.imgs;
    form.userId = wx.getStorageSync("login_key").split("_")[2] || 0
    this.setData({ form: form });
    if (!this.validate()){
      return false;
    }
   
    if(wx.showLoading){
      wx.showLoading({ title: '提交中'})
    }
    wk.post({
      url: '/exhibitions/',
      data: form,
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res){
        if(res.data.msg == "success"){
          //清空表单
          form.address = "";
          form.locateAddress ="";
          form.telephone = "";
          form.operator = "";
          form.description = "";
          form.imgs = [];
          form.name="";
          that.setData({ form: form });
          //保存图片
          var exhibitionId = res.data.exhibitionId;
          that.setData({ exhibitionId: exhibitionId || 0 });
          that.showShareImg();
          if(exhibitionId > 0){
            for(var index in imgFiles){
              var isMain = imgFiles[index].isMain == 1 ? 1 : parseInt(index) + 2;
              wx.uploadFile({
                url: domain + '/exhibition/upload',
                filePath: imgFiles[index].imgUrl,
                name: 'file',
                header: { 'content-type': 'multipart/form-data' },
                formData: { exhibitionId: exhibitionId, isMain: isMain },
                success: function(res){
                  console.log(res);
                },
                fail: function(res) {
                  console.log(res);
                }
              });
            }
          }
        }else{
          wx.showModal({
            title: '提示',
            content: '提交失败，请稍后再试',
            showCancel: false,
            success: function(){
              if(res.data.msg == "success"){
                wx.switchTab({
                  url: '../index/index'
                });
              }
            }
          });
        }

      },
      fail: function() {
        wx.showModal({
          title: '提示',
          content: '提交失败，请稍后再试',
          showCancel: false
        });
      },
      complete: function(){
        if(wx.hideLoading){
          wx.hideLoading();
        }
      }
    })
  },
  submitHall:function(){
      var _this = this;
      var productForm = _this.data.productForm;
      if(validater.isEmpty(productForm.corporation)){
         wx.showModal({
            title: '提示',
            content: '公司名称是必填项啊',
            showCancel: false
        });
        return false;
      }
      if(validater.isEmpty(productForm.telephone)){
         wx.showModal({
            title: '提示',
            content: '手机号是必填项啊',
            showCancel: false
          });
          return false;
      }
      if(!validater.isTel(productForm.telephone)){
        wx.showModal({
            title: '提示',
            content: '请输入正确的11位手机号码',
            showCancel: false
          });
          return false;
      }
      if(productForm.id.length <= 0){
         wx.showModal({
            title: '提示',
            content: '展厅是必填项啊',
            showCancel: false
        });
        return false;
      }
      if(!!productForm.backup && !validater.maxLength(productForm.backup, 128)){
         wx.showModal({
            title: '提示',
            content: '咱控制在128个字符内哈',
            showCancel: false
        });
        return false;
      }
      wx.request({
        url: domain + '/settled/add',
        data: {corporationName:productForm.corporation,telephone:productForm.telephone,exhibitionName:productForm.nameStr,backup:productForm.backup},
        method: 'POST',
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        }, // 设置请求的 header
        success: function(res){
          var data = res.data;
          if(data.status == 1){
              wx.showModal({
                title: '提示',
                content: '入驻申请成功',
                showCancel: false
              });
              productForm.corporation = "";
              productForm.telephone = "";
              productForm.nameStr = "";
              productForm.backup = "";
              productForm.id = [];
              productForm.name = [];
              _this.setData({ productForm: productForm });
              var baseList = _this.data.baseList;
              for(var i = 0; i < baseList.length; i++){
                var region = baseList[i].base;
                for(var j = 0; j < region.length; j++){
                  region[j].selected = 0;
                }
              }
              _this.setData({baseList:baseList});
          }else{//数据插入有问题，sql执行结果出错，需要检查出错原因
            wx.showModal({
              title: '提示',
              content: '入驻申请失败,请联系客服咨询',
              showCancel: false
            });
          }
        },
        fail: function() {
          wx.showModal({
            title: '提示',
            content: '入驻申请异常,请稍后重试!',
            showCancel: false
          });
        }
      });
  },
  callus(e){
    var telephone = this.data.telephone;
    wx.makePhoneCall({
      phoneNumber: telephone.slice(0, 12)
    });
  },
  onLoad: function(option) {

    //组件引用
    var switchs = new Switch(this);
    switchs.bindEvents();

    var switch_selNum = option.type || 0;
    this.setData({ switch_selNum: switch_selNum });
  },
  onShow: function(){
    //授权验证
    auth("userLocation",()=>{
      var that = this;
      wx.request({
        url: domain + '/bases',
        success: function (res) {
          var baseList = [];
          var area = {};
          var data = res.data;
          for (var index in data) {
            if (index == 0 || data[index].area != data[index - 1].area) {
              index > 0 && baseList.push(area);
              area = { name: data[index].area, base: [] };
            }
            data[index].selected = 0;
            area.base.push(data[index]);
          }
          that.setData({ baseList: baseList });
        }
      })
    })

  },
  onShareAppMessage: function(){
    
  },
  showShareInterval: null,
  showShareImg(){
    var that = this;
    this.setData({ showShare: true, shareCloseSeconds: 3 });
    this.showShareInterval = setInterval(function(){
      var shareCloseSeconds = that.data.shareCloseSeconds;
      if(shareCloseSeconds > 0){
        that.setData({ shareCloseSeconds: shareCloseSeconds - 1});
      }else{
        that.previewShareImg();
        clearInterval(that.showShareInterval);
      }
    }, 1000);
  },
  previewShareImg(){
    this.setData({ showShare: false });
    clearInterval(this.showShareInterval);
    var id = this.data.exhibitionId;
    if(!id){
      return false;
    }
    wx.previewImage({
      urls: [domain + '/exhibition/shareimg?id=' + id],
      success: function(){
        wx.switchTab({ url: '../index/index' });
      }
    });
  },
  closeShareImg(){
    this.setData({ showShare: false });
    clearInterval(this.showShareInterval);
    wx.switchTab({ url: '../index/index' });
  }
})