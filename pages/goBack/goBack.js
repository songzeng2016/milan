Page({
  data:{
    type: '',
    typeMap:{
      buy: {
        name: '采购',
        link: '../queryList/queryList?type=1',
        content1: '该信息已下架或过期，请返回采购列表页',
        content2: '查看更多采购信息',
      },
      supply: {
        name: '供应',
        link: '../queryList/queryList?type=0',
        content1: '该商品已下架或过期，请返回供应列表页',
        content2: '查看更多采购信息'
      },
      exhibition: {
        name: '展厅',
        link: '../index/index',
        content1: '该展厅已关闭，请返回首页',
        content2: '查看其它展厅'
      },
      activity: {
        name: '活动',
        link: '../queryList/queryList?type=2',
        content1: '该活动已下架，请返回活动列表页查看',
        content2: '其它活动'
      }
    }
  },
  onLoad(options){
    var type = options.type || 'buy';
    this.setData({ type: type });
  }
})