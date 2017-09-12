/**
 * 由于微信小程序目前可以连续点击，所以对所有接口进行了一次封装
 * 在调取接口时，展示loading，接口的complete关闭loading
 * openLoading: 控制是否展示loading，默认展示
 * loadingTitle: 设置loading标题，默认值为“请稍等”
 */
import { domain } from '/domain';
//const domain = 'https://p.youpin114.com';
const wk = {
  author: 'songwei'
};
/** 
 * 将wx的方法重新封装进wk
 * 接口的参数与wx自带的参数一致，没有做任何改动
 */
function initApi() {
  for (var key in wx) {
    //闭包，否则所有的key都是最后一个是值
    (function (key) {
      let fn = wx[key];
      //判断属性类型是否是函数
      if (typeof fn !== 'function') {
        return false;
      }
      //网络请求接口，文件上传接口后面处理
      if (key == 'request' || key == 'uploadFile') {
        return false;
      }
      Object.defineProperty(wk, key, {
        enumerable: true,
        writable: false,
        configurable: false,
        value: function (options) {
          //部分接口不需要加遮罩
          if (key == 'showLoading' || key == 'hideLoading' || key == 'showToast' || key == 'hideToast' || key == 'showModal') {
            options.openLoading = false;
          } else {
            options.openLoading = typeof options.openLoading === 'undefined' ? true : options.openLoading;
          }
          //默认开启遮罩，阻止连点
          if (options.openLoading) {
            wx.showLoading({
              title: options.loadingTitle || '请稍等',
              mark: true
            });
            //接口调用完成关闭遮罩
            let complete = options.complete;
            options.complete = res => {
              wx.hideLoading();
              typeof complete === 'function' && complete(res);
            }
          }
          let fail = options.fail;
          options.fail = res => {
            let errMsg = res.errMsg;
            //失败原因是因为没有授权，跳转到授权页面
            if (/^[\s\S]*fail auth deny$/.test(errMsg)) {
              wx.openSetting({});
            } else {
              typeof fail === 'function' && fail(res);
            }
          }
          fn(options);
        }
      });
    })(key);
  }
}
/**
 * 封装http请求
 * 不需要填写method，以及header，只传递url，data和回调函数即可
 * openLoading: 控制是否展示loading，默认展示
 * loadingTitle: 设置loading标题，默认值为“请稍等”
 */
function initRequest() {
  let methods = ['get', 'post', 'put', 'delete'];
  for (let i in methods) {
    //闭包，否则所有的key都是最后一个是值
    (function (i) {
      let key = methods[i];
      Object.defineProperty(wk, key, {
        enumerable: true,
        writable: false,
        configurable: false,
        value: function (options) {
          let url = options.url;
          if (!url) {
            return false;
          }
          //默认开启遮罩，阻止连点
          options.openLoading = typeof options.openLoading === 'undefined' ? true : options.openLoading;
          if (options.openLoading) {
            wx.showLoading({
              title: options.loadingTitle || '请稍等',
              mark: true
            });
          }
          wx.request({
            url: domain + url,
            method: key.toUpperCase(),
            data: options.data || {},
            success: (res) => {
              typeof options.success === 'function' && options.success(res);
            },
            fail: (res) => {
              typeof options.fail === 'function' && options.fail(res);
            },
            complete: (res) => {
              wx.hideLoading();
              typeof options.complete === 'function' && options.complete(res);
            }
          });
        }
      });
    })(i);
  }
}
/**
 * 封装图片上传
 * imgs: 图片地址数组
 * type: 上传图片类型 exhibition-展厅 activity-活动 supply-供应 buy-采购
 * id: 关联的主体的id
 * success: 成功的回调函数
 * fail: 失败的回调函数
 * openLoading: 控制是否展示loading，默认展示
 * loadingTitle: 设置loading标题，默认值为“请稍等”
 */
function initUpload() {
  Object.defineProperty(wk, 'upload', {
    enumerable: true,
    writable: false,
    configurable: false,
    value: function (options) {
      let { imgs, type, id } = options;
      if (!type || !id || !imgs || imgs.length == 0) {
        return false;
      }
      //默认开启遮罩，阻止连点
      options.openLoading = typeof options.openLoading === 'undefined' ? true : options.openLoading;
      if (options.openLoading) {
        wx.showLoading({
          title: options.loadingTitle || '请稍等',
          mark: true
        });
      }
      uploadImg(options);
    }
  });
}
//图片上传类型映射
const uploadTypeMap = {
  "exhibition": "exhibitions",
  "activity": "activities",
  "supply": "supplies",
  "buy": "buys"
}
/**
 * 递归上传图片，部分安卓机不支持多文件同时上传
 */
function uploadImg(options, index) {
  index = index || 0;
  let { imgs, type, id, success, fail } = options;
  //退出递归的条件
  if (!imgs || imgs.length <= 0 || index >= imgs.length) {
    wx.hideLoading();
    typeof options.success === 'function' && options.success();
    return false;
  }
  let next = index + 1;
  let formData = {};
  formData['isMain'] = imgs[index].isMain ? 1 : parseInt(index) + 2;
  formData[type + 'Id'] = id;
  let imgUrl = imgs[index].imgUrl;

  wx.uploadFile({
    url: domain + '/' + uploadTypeMap[type] + '/imgs',
    filePath: imgUrl,
    name: 'file',
    header: { 'content-type': 'multipart/form-data' },
    formData: formData,
    success: function (res) {
      var { status, msg } = res.data;
      if (status != 1) {
        console.log(msg);
      }
    },
    fail: function (res) {
      typeof options.fail === 'function' && options.fail(res);
    },
    complete: function (res) {
      //继续上传下一张图片
      uploadImg(options, next);
    }
  });
}

initApi();
initRequest();
initUpload();

module.exports.wk = wk;