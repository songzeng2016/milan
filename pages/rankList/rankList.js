import { domain } from '../../utils/domain';

// 组件的引入
import { Switch } from '../../components/switch/switch.js';   //顶部切换组件
// pages/rankList/rankList.js
Page({
  data: {
    switch_selNum: 0,
    switch_selTypes: ["本周展厅排行榜", "本周商家排行榜"],
    //展厅排行 Top 10
    exhibitTop_lists: [],
    //展厅历史风云榜
    exhibitBill_lists: [ ],
    //商家排行  数据
    busTop_lists: [],
    //商家排行 风云榜
    busBill_lists: [],

    //加载状态
    exhibitionWeekLoading:true,
    exhibitionHistoryLoading:true,
    userWeekLoading:true,
    userHistoryLoading:true,  

    //判断 是否在刷新
    isrefresh: false,
    //判断 是否已经到底部
    isToLower: false,
    //展厅排行 ==================================
    //展厅排行  判断的排序 模拟下拉 是否显示
    isExhibitSortOpen: false,
    //展厅排行  筛选条件 默认 默认选中第一个
    exhibitSortSelect: "本周综合指数前10名",
    // 展厅排行  记录选中元素的 id
    exhibitSortSelectId: 100,
    //展厅 排行 展示的是Top0 还是 风云榜
    exhibitDisplayType: 0,
    //展厅排行 筛选条件 默认选中 第一个 根据type判断显示Top 还是历史风云榜
    exhibitSortData: [
      { id: 100, name: '本周综合指数前10名', checked: 'true', displayType: 0 },
      { id: 101, name: '历史风云榜', displayType: 1 }
    ],

    //商家排行 ==================================
    //采购列表 判断的排序 模拟下拉 是否显示
    isBusSortOpen: false,
    //商家排行 筛选条件 默认 默认选中第一个
    busSortSelect: "本周热门前10名",
    // 商家排行 记录选中元素的 id
    busSortSelectId: 100,
    busDisplayType: 0,
    //商家排行 筛选条件 默认选中 第一个
    busSortData: [
      { id: 100, name: '本周热门前10名', checked: 'true', displayType: 0 },
      { id: 101, name: '历史风云榜', displayType: 1 }
    ],
    //dataEnd
  },
  //fn //顶部的选择 sel
  // sup_swichFn: function (e) {
  //   var index = e.target.dataset.current;
  //   this.setData({
  //     switch_selNum: index
  //   });
  // },
  sup_swichtConFn: function (e) {
    var ind = e.detail.current
    this.setData({
      switch_selNum: e.detail.current,
      //点开 搜索按钮 没有关闭 但是 又切换页面的话 直接设置搜索弹窗为隐藏
      isExhibitSortOpen: false,
      isBusSortOpen: false
    });
  },
  //下拉  刷新效果
  onPullDownRefresh: function () {
    var _this = this;
    _this.setData({
      isrefresh: true
    });
    var switch_selNum = this.data.switch_selNum;//上方tab切换的值 0、展厅 1、商家
    if (switch_selNum == 0){//展厅排行榜
      var exhibitDisplayType = this.data.exhibitDisplayType;
      if (exhibitDisplayType == 0){//刷新本周风云榜
        wx.request({
          url: domain +'/exhibitionstatistics/week',
          data: { pageSize: 20},
          success: (res) => {
            if (res.data.status == 1) {
              this.setData({
                exhibitTop_lists: formatExhibitionWeek(res.data.list)
              });
            }
          },
          complete:(res)=>{
            this.setData({
              isrefresh: false
            });
            wx.stopPullDownRefresh();
          }
        })
      }else{ //刷新历史风云榜
        wx.request({
          url: domain +'/exhibitionstatistics/history',
          data: { pageSize: 20},
          success: (res) => {
            //      console.log(res.data.list);
            if (res.data.status == 1) {
              this.setData({
                exhibitBill_lists: formatExhibitionHistory(res.data.list)
              });
            }
          },
          complete: (res) => {
            this.setData({
              isrefresh: false
            });
            wx.stopPullDownRefresh();
          }
        })
      }
    }else{ //商家排行榜
      var busDisplayType = this.data.busDisplayType;
      if (busDisplayType == 0){//刷新商家周排行榜
        wx.request({
          url: domain+'/userstatistics/weekrank',
          data: { pageSize: 20},
          success: (res) => {
            //      console.log(res.data.list);
            if (res.data.status == 1) {
              this.setData({
                busTop_lists: formatUserWeek(res.data.list)
              });
            }
          },
          complete: (res) => {
            this.setData({
              isrefresh: false
            });
            wx.stopPullDownRefresh();
          }
        })
      }else{ //刷新商家历史排行榜
        wx.request({
          url: domain +'/userstatistics/history',
          data: { pageSize: 20},
          success: (res) => {
            //        console.log(res.data.list);
            if (res.data.status == 1) {
              this.setData({
                busBill_lists: formatUserHistory(res.data.list)
              });
            }
          },
          complete: (res) => {
            this.setData({
              isrefresh: false
            });
          }
        })
      }
    }

    // tip :后台人可以  在这里写请求成功之前 改变  isrefresh：false
    setTimeout(function () {
      _this.setData({
        isrefresh: false
      });
    }, 1000);
  },
  //上拉  判断是否到 页面底部了
  toLowerFn: function (e) {
    var _this = this;
    _this.setData({
      isToLower: true
    });
    // tip :后台人可以  在这里写请求成功之前 改变  isToLower：false
    setTimeout(function () {
      _this.setData({
        isToLower: false
      });
    }, 1000);
  },
  //展厅排行 ==================================
  // 展厅排行 筛选条件  change value
  exhibitSortChangeFn: function (e) {
    let val = e.detail.value;
    this.setData({
      exhibitSortSelect: val
    });
    //console.log('radio发生change事件，携带value值为：', e.detail.value)
  },
  // 展厅排行  筛选条件 change item
  exhibitSortChangeItemFn: function (e) {
    //必须 用currentTarget 
    var curItem = e.currentTarget.dataset.item;
    //console.log(curItem);
    this.setData({
      exhibitSortSelectId: curItem.id,
      exhibitDisplayType: curItem.displayType
    });
  },
  // 展厅排行  筛选条件 展开收起
  exhibitSortTapFn: function (e) {
    this.setData({
      isExhibitSortOpen: !this.data.isExhibitSortOpen
    });
  },
  //商家排行 ==================================
  // 商家排行 筛选条件  change value
  busSortChangeFn: function (e) {
    let val = e.detail.value;
    this.setData({
      busSortSelect: val
    });
    //console.log('radio发生change事件，携带value值为：', e.detail.value)
  },
  // 商家排行  筛选条件 change item
  busSortChangeItemFn: function (e) {
    //必须 用currentTarget 
    var curItem = e.currentTarget.dataset.item;
    //console.log(curItem);
    this.setData({
      busSortSelectId: curItem.id,
      busDisplayType: curItem.displayType
    });
  },
  // 商家排行  筛选条件 展开收起
  busSortTapFn: function (e) {
    this.setData({
      isBusSortOpen: !this.data.isBusSortOpen
    });
  },

  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    //组件 顶部的切换
    var switchs = new Switch(this);
    switchs.bindEvents();

    wx.request({
      url: domain +'/exhibitionstatistics/week',
      data: { pageSize:20},
      success:(res) =>{
 //       console.log(res.data.list);
        if(res.data.status == 1){
          this.setData({
            exhibitTop_lists:formatExhibitionWeek(res.data.list)
          });
        }
      },
      complete:(res)=>{
        this.setData({ exhibitionWeekLoading:false});
      }
    })
    wx.request({
      url: domain +'/exhibitionstatistics/history',
      data: { pageSize: 20},
      success: (res) => {
//        console.log(res.data.list);
        if (res.data.status == 1) {
          this.setData({
            exhibitBill_lists: formatExhibitionHistory(res.data.list)
          });
        }
      },
      complete: (res) => {
        this.setData({ exhibitionHistoryLoading: false });
      }
    })
    wx.request({
      url: domain +'/userstatistics/week',
      data: { pageSize: 20},
      success: (res) => {
//       console.log(res.data.list);
        if (res.data.status == 1) {
          this.setData({
            busTop_lists: formatUserWeek(res.data.list)
          });
        }
      },
      complete: (res) => {
        this.setData({ userWeekLoading: false });
      }
    })
    wx.request({
      url: domain +'/userstatistics/history',
      data: { pageSize: 20},
      success: (res) => {
        console.log(res.data.list);
        if (res.data.status == 1) {
          this.setData({
            busBill_lists: formatUserHistory(res.data.list)
          });
        }
      },
      complete: (res) => {
        this.setData({ userHistoryLoading: false });
      }
    })
  },
  onShow: function () {
    // 页面显示
  }
})
function formatExhibitionWeek(list) {
  console.log("本周展厅排行 前10 ================================");
  console.log(list);
  var rank = 1;
  var current = {}; 
  for (var key in list) {
    if (rank > 9 && list[key].marks != current.marks) {
      list = list.splice(0,key);
      break;
    }
    if (parseInt(key) == 0 || list[key].marks == current.marks){
      list[key].rank = rank;
    }else{
        list[key].rank = rank +1;
        rank = rank +1;
    }
    list[key].imgUrl = !!(domain + '/image/exhibition/' + list[key].fkId + '_236_177') ? (domain + '/image/exhibition/' + list[key].fkId + '_236_177') : '../../image/noPhoto.jpg';

    current = list[key];
  }
  return list;
}
function formatExhibitionHistory(list) {
  console.log("222历史排行 ================================");
  console.log(list);
  var rank = 1;
  var current = {};
  for (var key in list) {
    if (rank > 9 && !(list[k].firstRank == current.firstRank && list[key].secondRank == current.secondRank && list[key].thirdRank == current.thirdRank) ){
      list = list.splice(0, key);
      return list;
    }
    if (parseInt(key) == 0 || (list[key].firstRank == current.firstRank && list[key].secondRank == current.secondRank && list[key].thirdRank == current.thirdRank)){
      list[key].rank = rank;
    }else{
      list[key].rank = rank +1;
      rank = rank + 1; 
    }
    list[key].imgUrl = !!(domain + '/image/exhibition/' + list[key].fkId + '_236_177') ? (domain + '/image/exhibition/' + list[key].fkId + '_236_177') : '../../image/noPhoto.jpg';

    current = list[key];
  }
  return list;
}
function formatUserWeek(list){
  console.log("333 商家排行 本周热门 ================================");
  console.log(list);
  var rank = 1;
  var current = {};
  for (var key in list) {
    
    if (rank > 9 && list[key].marks != (current.marks||0 -100)) {
      list = list.splice(0,key);
      return list;
    }
    if (parseInt(key) == 0 || list[key].marks == (current.marks - 100)) {
      
      list[key].rank = rank;
    } else {
      list[key].rank = rank + 1;
      rank = rank + 1;
    }
    list[key].marks = list[key].marks + 100;
    current = list[key];
  }
  return list;
}
function formatUserHistory(list){
  console.log("444 商家排行 历史风云榜 ================================");
  console.log(list);
  var rank = 1;
  var current = {};
  for (var key in list) {
    if (rank > 10 && !(list[k].firstRank == current.firstRank && list[key].secondRank == current.secondRank && list[key].thirdRank == current.thirdRank)) {
      break;
    }
    if (parseInt(key) == 0 || (list[key].firstRank == current.firstRank && list[key].secondRank == current.secondRank && list[key].thirdRank == current.thirdRank)) {
      list[key].rank = rank;
    } else {
      list[key].rank = rank + 1;
      rank = rank + 1;
    }
    current = list[key];
  }
  return list;
}