import { auth } from '../../utils/auth';
import { domain } from '../../utils/domain';
var app = getApp();
var validater = app.validater;
Page({
   data: {
    resonLists: [ ],
    //提交 表单的内容
    report_Form: {},
    letterCount: 256, //文本框字符个数
  },
  checkboxChange: function(e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
  },
  checkIconchage:function(e){
    var _this = this;
    var curItem = e.target.dataset.item;
    var curResonList = this.data.resonLists;
    curResonList.forEach(function(item,ind){
      if(item.id==curItem.id){
        item.checked=!item.checked;
      }
    });
    this.setData({
      resonLists:curResonList
    });
  },
  letterCountFn:function(e){
    var _len = 256 - (e.detail.value).length;
    if(_len <= 10){
      this.setData({
        tips:true
      });
    }else{
       this.setData({
        tips:false 
      });
    }
    this.setData({
      letterCount:_len
    });
  },
  formSubmit: function(e){
    var report_Form = this.data.report_Form;
    var _this = this;

    var resonLists = _this.data.resonLists;
    var typeArray = [];
    for(var i=0;i<resonLists.length;i++){
      if(resonLists[i].checked==true){
          typeArray.push(resonLists[i].id);
      }
    }
    if(typeArray.length == 0){
      wx.showModal({
        title: '提示',
        content: '请至少选择一条投诉理由',
        showCancel: false
      });
      return false;
    }
    report_Form.typeArray = typeArray.join(",");

    var phone = e.detail.value.phone;
    if(!validater.isTel(phone)){
      wx.showModal({
          title: '提示',
          content: '手机号格式不正确',
          showCancel: false
        });
        return false;
    }

    report_Form.telephone = phone;
    var content = e.detail.value.content;
    report_Form.content = content;

    var user = wx.getStorageSync('user_info');
    if(!!user){
      report_Form.userId = user.id;
      report_Form.nickName = user.nickName;
      report_Form.avatarUrl = user.avatarUrl;
    }
    //保存投诉内容
    wx.request({
      url: domain + '/usercomplain/insert',
      data: report_Form,
      method: 'GET', 
      success: function(res){
        if(res.data.status==1){
          var complain = wx.getStorageSync('complain');
          var now = new Date();
          if(complain.length == 0){
            wx.setStorageSync('complain', [now.getFullYear(),now.getMonth()+1,now.getDate()].join("-")+"_1");
          }else{
              var storeDateStr = complain.split("_")[0];
              var storeYear = storeDateStr.split("-")[0];
              var storeMonth = storeDateStr.split("-")[1];
              var storeDay = storeDateStr.split("-")[2];
              if(storeYear==now.getFullYear()&&storeMonth==(now.getMonth()+1)&&storeDay==now.getDate()){
                 var num = parseInt(complain.split("_")[1]);
                 wx.setStorageSync('complain', storeDateStr+"_"+(num+1));
              }else{
                 wx.setStorageSync('complain', [now.getFullYear(),now.getMonth()+1,now.getDate()].join("-")+"_"+1);
              }
          }
          wx.showToast({
            title: '提交成功',
            image: '../../image/icon_ok.png',
            duration: 2000,
            success:function(){
              setTimeout(function(){
                wx.navigateBack();
                },1000);
            }
          });
        }else{
          wx.showToast({
            title: '提交失败',
            image: '../../image/icon_fail.png',
            duration: 2000
          });
        }
      },
      fail: function(res) {
        wx.showToast({
          title: '提交异常,请检查网络后重试',
          image: '../../image/icon_fail.png',
          duration: 2000
        });
      },
      complete: function(){
        var complain = {};
        complain.phone = "";
        complain.content = "";
        for(var i=0;i<resonLists.length;i++){
          resonLists[i].checked = false;
        }
        _this.setData({
          complain: complain,
          letterCount:256,
          resonLists:resonLists,
          tips:false
        });
      }
    })
  },
  onLoad:function(options){
    var _this = this;
    var fkId = options.fkId;
    var type =  options.type;
    var userId = options.userId;
    var report_Form = _this.data.report_Form;
    report_Form.fkId = parseInt(fkId);
    report_Form.fkUserId = userId;
    report_Form.type = type;
    _this.setData({
      report_Form : report_Form
    });
    wx.request({
      url: domain + '/complaintype/list',
      data: {type:type},
      method: 'GET',
      success: function(res){
        if(res.data.status == 1){
          var list = res.data.list;
          _this.setData({ resonLists: list });
        }
      }
    })
  }
});