// pages/serviceProcess/serviceProcess.js
//组件的引入
import { Switch } from '../../components/switch/switch.js';
import { domain } from '../../utils/domain';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    switch_selNum: 0,
    switch_selTypes: ["认证流程", "采购流程", "全国基地"],
    swicth_selTitles: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //switch组件的调用
   this.setData({domain:domain});
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var switchs = new Switch(this);
    switchs.bindEvents();
  
  }
})