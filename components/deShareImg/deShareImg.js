class ShareImg {
  constructor(page) {
    this.page = page;
  }
  //绑定事件
  bindEvents() {
    var page = this.page;
    this.initData();
    //保存图片
    page.saveImg = (e) => {
      var shareImgUrl = page.data.shareImgUrl;
      //微信版本有保存图片到相册的接口
      if (!!wx.saveImageToPhotosAlbum){
        wx.downloadFile({
          url: shareImgUrl,
          success: (res) => {
            var tempFilePath = res.tempFilePath;
            console.log(tempFilePath);
            wx.saveImageToPhotosAlbum({
              filePath: tempFilePath,
              success: (res) => {
                wx.showToast({
                  title: '保存分享图片成功',
                  icon: 'success',
                  image: '../../image/icon_ok.png',
                  mask: true,
                  duration: 1000,
                  success: (res) => {
                    this.setData({ showShareImg: false });
                  }
                });
              },
              fail: (res) => {
                console.log(res);
                var errMsg = res.errMsg;
                if (/^[\s\S]*fail auth deny$/.test(errMsg)) {
                  wx.openSetting({});
                }
                wx.showToast({
                  title: '保存分享图片失败',
                  icon: 'loading',
                  image: '../../image/icon_fail.png',
                  mask: true,
                  duration: 1000
                });
              }
            });
          },
          fail: (res) => {
            wx.showToast({
              title: '下载分享图片失败',
              icon: 'loading',
              image: '../../image/icon_fail.png',
              mask: true,
              duration: 1000
            });
          }
        });
      }
      //没有接口，预览图片，手动保存
      else {
        wx.previewImage({
          urls: [shareImgUrl]
        });
      }
    }
    //关闭分享图片的弹层
    page.closeShareImg = (e) => {
      console.log(e);
      page.setData({ showShareImg: false });
    }
  }
  //初始化数据
  initData() {
    var page = this.page;
    if (!!wx.saveImageToPhotosAlbum) {
      page.setData({
        shareTip: '保存图片',
        shareBtnTip: '分享至朋友圈、好友、QQ空间',
        showShareImg: false
      });
    } else {
      page.setData({
        shareTip: '点击预览',
        shareBtnTip: '预览后，长按图片或右上角[···]保存图片\n分享至朋友圈、好友、QQ空间',
        showShareImg: false
      });
    }
  }
}
//导出组件类
module.exports.ShareImg = ShareImg;


