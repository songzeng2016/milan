class Switch {
  //构造函数，page为页面对象Page的实例
  constructor(page) {
    this.page = page;
  }
  bindEvents() {
    var page = this.page;
    var switch_selNum = page.data.switch_selNum;
    var swicth_selTitles = page.data.swicth_selTitles;  //顶部的 title 切换
    //初始
    page.setData({
      switch_selNum: switch_selNum
    });
    //点击切换
    page.switchFn = (e) => {
      var curIndex = e.target.dataset.current;
      page.setData({
        switch_selNum: curIndex
      });

      //如果存在 顶部要切换标题
      if (swicth_selTitles && swicth_selTitles.length>=1){
        swicth_selTitles.forEach((item, index) => {
          var curItem;
          if (curIndex == index) {
            curItem = item;
            wx.setNavigationBarTitle({
              title: curItem
            });
          }
        });
      }
      //:end 
    }
  }
}
//导出组件类
module.exports.Switch = Switch;