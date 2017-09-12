/*
1、构造函数 说明
    参数   var banner1= new  Banner(this);
    参数1：执行上下文 
2、组件使用：
   页面调用组件的话需要有变量(必须同名)
   data{
     bannerImgs:[]
   }
*/
import { domain } from '../../utils/domain';
class Banner {
  // 构造
  constructor(page) {
    this.page = page;
  }

  bindEvents() {
    var page = this.page;
    //event 图片预览
    page.previewImgs=(e)=>{
      var bannerImgs = page.data.bannerImgs;
      if (!bannerImgs || bannerImgs.length <= 0) {
        return false;
      }
      console.log(bannerImgs);
      var urls = bannerImgs.map(item => {
        var random=~~(Math.random()*5);
        var curUrl='';
        if(random==0){
          random='';
        }
        curUrl = 'http://img' + random + '.99114.com' + item.imgUrl ;
        return curUrl;
      });
      console.log(urls);
      wx.previewImage({
        urls: urls
      });
    }
    //其它事件
  }
  //bindEvents :end;




}

//导出组件类
module.exports.Banner = Banner;
