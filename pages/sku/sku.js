Page({
  data:{
    telephone: '4001899114'
  },
  callus(){
    var telephone = this.data.telephone;
    wx.makePhoneCall({
      phoneNumber: telephone
    });
  },
  onLoad:function(options){
  },
  onShareAppMessage: function(){
    
  }
})