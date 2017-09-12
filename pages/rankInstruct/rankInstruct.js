// pages/rankList/rankList.js
import { Switch } from '../../components/switch/switch.js';
Page({
  data: {
    switch_selNum: 0,
    sup_SelNum:0,
    switch_selTypes: ["本周展厅排行榜", "本周商家排行榜"],
  
    //dataEnd
  },
  //fn //顶部的选择 sel

  sup_swichtConFn: function (e) {
    var ind = e.detail.current
    this.setData({
      sup_SelNum: e.detail.current,
      //点开 搜索按钮 没有关闭 但是 又切换页面的话 直接设置搜索弹窗为隐藏
      isExhibitSortOpen: false,
      isBusSortOpen: false
    });
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var switchs = new Switch(this);
    switchs.bindEvents();

  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }
})