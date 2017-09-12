import { domain } from '../../utils/domain';
var app = getApp();
Page({
  data: {
    num: 0,
    add_SelNum: false,
    orientationList: [],
    baseList: [],
    toView: '',
  },
  clickNum: function (e) {
    console.log(e.target.dataset.num)
    this.setData({
      num: e.target.dataset.num
    })
  },
  scrollToViewFn: function (e) {
    var id = e.target.dataset.id;
    this.setData({ toView: 'inToView' + id });

  },
  addCity: function () {
    this.setData({
      add_SelNum: true
    })
  },
  chooseExhibition(e) {
    var { id, name } = e.target.dataset;
    if(!!id){
      app.globalData.chooseExhibition = { id, name };
      wx.navigateBack({});
    }
  },
  onLoad(options) {
    var { latitude, longitude } = app.globalData.position;
    wx.request({
      url: domain + '/exhibition/selectActivityBelongs',
      data: { latitude, longitude },
      success: (res) => {
        var { status, msg, list, quickList } = res.data;
        if(status == 1){
          var orientationList = [];
          var baseList = [];
          var area = {};
          var data = res.list;
          for (var index in list) {
            if (index == 0 || list[index].area != list[index - 1].area) {
              if(index > 0){
                baseList.push(area);
                orientationList.push({ id: area.id, name: area.name.replace('地区', '') });
              }
              area = { id: baseList.length + 1, name: list[index].area, base: [] };
            }
            list[index].selected = 0;
            area.base.push(list[index]);
          }
          this.setData({ baseList: baseList, orientationList: orientationList, quickList: quickList });
        }
      }
    });
  }
});