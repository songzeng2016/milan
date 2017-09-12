/*
js需要参数
  isShareOpen

*/ 

class Share{
  constructor(page) {
    this.page = page;
  }
  bindEvents() {
    var page = this.page;
    //关闭弹窗
    page.close = (e) => {
      page.setData({ isShareOpen: false });
    }
    this.initData();
  }
  initData(){
    var page = this.page;
    page.setData({ isShareOpen: false })
  }
}

//导出组件类
module.exports.Share = Share;